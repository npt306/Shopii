import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import * as moment from 'moment-timezone';
import * as qs from 'qs';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

import { SellerBankAccount } from './entities/seller-bank-account.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VnpayReturnDto } from './dto/vnpay-return.dto';
import { VnpayIpnDto } from './dto/vnpay-ipn.dto';
import { AddBankAccountDto } from './dto/add-bank-account.dto';
import { sortObject } from '../utils/sortObject';

enum PaymentStatus {
  PENDING = 'Pending',
  SUCCESS = 'Success',
  FAILED = 'Failed',
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly vnp_TmnCode: string;
  private readonly vnp_HashSecret: string;
  private readonly vnp_Url: string;
  private readonly vnp_ReturnUrl: string;
  private readonly vnp_IpnUrl: string;
  private readonly payoutCronSchedule: string;
  private readonly payoutSimulationUrl?: string;
  private readonly orderServiceUrl?: string;

  constructor(
    @InjectRepository(SellerBankAccount)
    private sellerBankAccountRepository: Repository<SellerBankAccount>,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.vnp_TmnCode = this.getConfigOrThrow('VNP_TMNCODE');
    this.vnp_HashSecret = this.getConfigOrThrow('VNP_HASHSECRET');
    this.vnp_Url = this.getConfigOrThrow('VNP_URL');
    this.vnp_ReturnUrl = this.getConfigOrThrow('VNP_RETURNURL');
    this.vnp_IpnUrl = this.getConfigOrThrow('VNP_IPNURL');
    this.payoutCronSchedule = this.configService.get<string>('PAYOUT_CRON_SCHEDULE', '0 0 1,15 * *');
    this.payoutSimulationUrl = this.configService.get<string>('PAYOUT_SIMULATION_URL');
    this.orderServiceUrl = this.configService.get<string>('ORDER_SERVICE_URL');

    if (!this.orderServiceUrl) {
        this.logger.warn('ORDER_SERVICE_URL is not defined. Cannot notify Order Service.');
    }

    this.logger.log(`VNPay TmnCode: ${this.vnp_TmnCode ? 'Loaded' : 'MISSING!'}`);
    if (process.env.NODE_ENV !== 'production') {
        this.logger.log(`VNPay HashSecret: ${this.vnp_HashSecret ? 'Loaded' : 'MISSING!'}`);
    }
  }

  private getConfigOrThrow(key: string): string {
      const value = this.configService.get<string>(key);
      if (!value) {
          this.logger.error(`Missing required environment variable: ${key}`);
          throw new InternalServerErrorException(`Configuration error: ${key} is not defined.`);
      }
      return value;
  }

  // --- createPaymentUrl remains the same ---
  async createPaymentUrl(createPaymentDto: CreatePaymentDto): Promise<string> {
    const { checkoutSessionId, amount, sellerId, orderInfo = 'Order Payment', bankCode, language = 'vn' } = createPaymentDto;

    if (!checkoutSessionId || !amount || amount <= 0) {
        throw new BadRequestException('Invalid checkoutSessionId or amount.');
    }
    if (!sellerId) {
        this.logger.warn(`sellerId missing for checkout ${checkoutSessionId}. Payout tracking might be affected.`);
    }

    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const vnp_TxnRef = `${checkoutSessionId}_${moment(date).format('HHmmss')}`;

    const ipAddr = '127.0.0.1'; // Placeholder IP

    let vnp_Params: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.vnp_TmnCode,
      vnp_Locale: language,
      vnp_CurrCode: 'VND',
      vnp_TxnRef: vnp_TxnRef,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: this.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    if (bankCode) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    const paymentUrl = this.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });

    return paymentUrl;
  }

  // --- handleVnpayReturn remains the same ---
  async handleVnpayReturn(query: VnpayReturnDto): Promise<{ isValid: boolean; code: string; message: string }> {
    const vnp_Params: any = { ...query };
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const sortedParams = sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const responseCode = vnp_Params['vnp_ResponseCode'];
    let message = 'Giao dịch không thành công';

    if (secureHash === signed) {
        this.logger.log(`VNPay return checksum valid for TxnRef: ${vnp_Params['vnp_TxnRef']}`);
        if (responseCode === '00') {
            message = 'Giao dịch thành công';
        }
        return { isValid: true, code: responseCode, message };
    } else {
        this.logger.warn(`VNPay return checksum invalid for TxnRef: ${vnp_Params['vnp_TxnRef']}`);
        return { isValid: false, code: '97', message: 'Chữ ký không hợp lệ' };
    }
  }

  // --- handleVnpayIpn updated to call notifyOrderService ---
  async handleVnpayIpn(query: VnpayIpnDto): Promise<{ RspCode: string; Message: string }> {
    const vnp_Params: any = { ...query };
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const sortedParams = sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    if (secureHash !== signed) {
        this.logger.warn(`IPN Checksum failed for TxnRef: ${vnp_Params['vnp_TxnRef']}`);
        return { RspCode: '97', Message: 'Checksum failed' };
    }

    const txnRef = vnp_Params['vnp_TxnRef'];
    const rspCode = vnp_Params['vnp_ResponseCode'];
    const amount = Number(vnp_Params['vnp_Amount']) / 100;
    const checkoutSessionId = txnRef.split('_')[0];

    if (!checkoutSessionId) {
        this.logger.error(`IPN Invalid Checkout Session ID extracted from TxnRef: ${txnRef}`);
        return { RspCode: '01', Message: 'Invalid transaction reference' };
    }

    try {

        let finalStatus: PaymentStatus;
        let orderUpdateStatus: string;

        if (rspCode === '00') {
            finalStatus = PaymentStatus.SUCCESS;
            orderUpdateStatus = 'Paid';
            this.logger.log(`IPN Payment SUCCESS for TxnRef: ${txnRef}`);
        } else {
            finalStatus = PaymentStatus.FAILED;
            orderUpdateStatus = 'Failed';
            this.logger.warn(`IPN Payment FAILED for TxnRef: ${txnRef}. RspCode: ${rspCode}`);
        }

        this.notifyOrderService(checkoutSessionId, orderUpdateStatus, amount)
             .catch(err => this.logger.error(`Failed to notify order service for session ${checkoutSessionId} after IPN: ${err.message}`, err.stack));

        return { RspCode: '00', Message: 'Success' };

    } catch (dbError) {
        this.logger.error(`IPN Database error for TxnRef: ${txnRef}: ${dbError.message}`, dbError.stack);
        return { RspCode: '99', Message: 'Unknown error' };
    }
  }

  // --- addBankAccount and getSellerBankAccounts remain the same ---
  async addBankAccount(dto: AddBankAccountDto): Promise<SellerBankAccount> {
    const { sellerId, bankName, accountNumber, accountHolderName, isDefault = false } = dto;

    if (!/^\d{8,20}$/.test(accountNumber)) {
        throw new BadRequestException('Invalid account number format (8-20 digits required).');
    }
    if (!accountHolderName || accountHolderName.trim().length < 2) {
        throw new BadRequestException('Invalid account holder name.');
    }
    if (!bankName || bankName.trim().length < 2) {
        throw new BadRequestException('Invalid bank name.');
    }

    const existingAccount = await this.sellerBankAccountRepository.findOne({
        where: { sellerId, accountNumber, bankName }
    });

    if (existingAccount) {
        this.logger.log(`Updating existing bank account ID ${existingAccount.id} for seller ${sellerId}`);
        existingAccount.accountHolderName = accountHolderName;
        if (isDefault && !existingAccount.isDefault) {
            await this.sellerBankAccountRepository.update({ sellerId, id: Not(existingAccount.id) }, { isDefault: false });
            existingAccount.isDefault = true;
        } else if (!isDefault && existingAccount.isDefault) {
            const otherAccountsCount = await this.sellerBankAccountRepository.count({ where: { sellerId, id: Not(existingAccount.id) } });
            if (otherAccountsCount === 0) {
                throw new BadRequestException('Cannot unset the only bank account as default. Add another account first.');
            }
            existingAccount.isDefault = false;
        }
        return this.sellerBankAccountRepository.save(existingAccount);
    } else {
         this.logger.log(`Adding new bank account for seller ${sellerId}`);
         if (isDefault) {
            await this.sellerBankAccountRepository.update({ sellerId }, { isDefault: false });
         }
        const newAccount = this.sellerBankAccountRepository.create({
            sellerId,
            bankName,
            accountNumber,
            accountHolderName,
            isDefault,
        });
        return this.sellerBankAccountRepository.save(newAccount);
    }
  }

  async getSellerBankAccounts(sellerId: number): Promise<SellerBankAccount[]> {
      return this.sellerBankAccountRepository.find({
          where: { sellerId },
          order: { isDefault: 'DESC', createdAt: 'ASC' }
      });
  }

  // --- handleScheduledPayouts remains the same ---
  @Cron(process.env.PAYOUT_CRON_SCHEDULE || '0 0 1,15 * *')
  async handleScheduledPayouts() {
    this.logger.log(`Running scheduled payouts cron job at ${new Date().toISOString()}`);
    this.logger.warn('Payout logic needs reimplementation as PaymentTransactions table is removed.');
    /*
    const transactionsToPayout = await this.paymentTransactionRepository.find({
      where: {
        status: PaymentStatus.SUCCESS,
        payoutStatus: PaymentPayoutStatus.PENDING,
      },
    });

    if (transactionsToPayout.length === 0) {
      this.logger.log('No transactions pending payout.');
      return;
    }
    this.logger.log(`Found ${transactionsToPayout.length} transactions pending payout.`);

    const payoutsBySeller = transactionsToPayout.reduce((acc, tx) => {
      const sellerId = tx.sellerId;
      if (!sellerId) {
        this.logger.warn(`Transaction ${tx.vnp_TxnRef} missing sellerId, skipping payout.`);
        return acc;
      }
      if (!acc[sellerId]) {
        acc[sellerId] = { totalAmount: 0, transactions: [] };
      }
      acc[sellerId].totalAmount += tx.amount;
      acc[sellerId].transactions.push(tx);
      return acc;
    }, {} as { [sellerId: number]: { totalAmount: number, transactions: PaymentTransaction[] } });

    for (const sellerIdStr in payoutsBySeller) {
        const sellerId = parseInt(sellerIdStr);
        const payoutData = payoutsBySeller[sellerId];
        this.logger.log(`Processing payout for Seller ${sellerId}, Amount: ${payoutData.totalAmount}`);

        const bankAccount = await this.findDefaultBankAccount(sellerId);
        if (!bankAccount) {
            this.logger.error(`No default bank account found for Seller ${sellerId}. Payout skipped.`);
            // Optionally update transactions to reflect skipped payout
            continue;
        }

        const payoutSuccess = await this.simulatePayout(sellerId, bankAccount.accountNumber, bankAccount.bankName, payoutData.totalAmount);

        if (payoutSuccess) {
            this.logger.log(`Simulated Payout SUCCESS for Seller ${sellerId}`);
            for (const tx of payoutData.transactions) {
                tx.payoutStatus = PaymentPayoutStatus.COMPLETED;
                tx.payoutDate = new Date();
                await this.paymentTransactionRepository.save(tx);
            }
        } else {
            this.logger.error(`Simulated Payout FAILED for Seller ${sellerId}`);
            // Optionally update transactions to reflect failed payout
            for (const tx of payoutData.transactions) {
                tx.payoutStatus = PaymentPayoutStatus.FAILED;
                await this.paymentTransactionRepository.save(tx);
            }
        }
    }
    this.logger.log('Finished scheduled payouts cron job.');
    */
  }

   private async findDefaultBankAccount(sellerId: number): Promise<SellerBankAccount | null> {
        let bankAccount = await this.sellerBankAccountRepository.findOne({ where: { sellerId, isDefault: true } });
        if (!bankAccount) {
            bankAccount = await this.sellerBankAccountRepository.findOne({ where: { sellerId }, order: { createdAt: 'ASC' } });
        }
        return bankAccount;
    }

   private async simulatePayoutApiCall(sellerId: number, amount: number, bankAccount: SellerBankAccount): Promise<boolean> {
        this.logger.log(`[SIMULATING] Payout to Seller ${sellerId}, Bank: ${bankAccount.bankName}, Account: ${bankAccount.accountNumber}, Amount: ${amount}`);

        if (this.payoutSimulationUrl) {
            try {
                const response = await firstValueFrom(
                    this.httpService.post(this.payoutSimulationUrl, {
                        sellerId,
                        amount,
                        bankAccount: bankAccount.accountNumber,
                        bankName: bankAccount.bankName,
                    })
                );
                this.logger.log(`[SIMULATION] Payout API response status: ${response.status}`);
                return response.status === 200 || response.status === 201;
            } catch (error) {
                 this.logger.error(`[SIMULATION] Payout API call failed: ${error.message}`);
                 return false;
            }
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
   }

   private async notifyOrderService(sessionId: string, paymentStatusString: string, amount: number) {
    if (!this.orderServiceUrl) {
        this.logger.warn(`Order Service URL not configured. Skipping notification for session ${sessionId}.`);
        return;
    }
    const endpoint = `${this.orderServiceUrl}/checkout/sessions/${sessionId}/payment-status`;
    const payload = {
        status: paymentStatusString
    };

    try {
        this.logger.log(`Notifying Order Service at ${endpoint} for session ${sessionId} with status ${payload.status}`);
        const response: AxiosResponse = await firstValueFrom(
            this.httpService.patch(endpoint, payload, { timeout: 5000 })
        );
        this.logger.log(`Successfully notified Order Service for session ${sessionId}. Response: ${response.status}`);
    } catch (error) {
         const axiosError = error as AxiosError;
        this.logger.error(`Failed to notify Order Service for session ${sessionId}. Status: ${axiosError.response?.status}, Error: ${axiosError.message}`, axiosError.stack);
    }
}

}