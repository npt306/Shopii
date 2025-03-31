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

import { PaymentTransaction, PaymentStatus, PaymentPayoutStatus } from './entities/payment-transaction.entity';
import { SellerBankAccount } from './entities/seller-bank-account.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VnpayReturnDto } from './dto/vnpay-return.dto';
import { VnpayIpnDto } from './dto/vnpay-ipn.dto';
import { AddBankAccountDto } from './dto/add-bank-account.dto';
import { sortObject } from '../utils/sortObject';

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

  constructor(
    @InjectRepository(PaymentTransaction)
    private paymentTransactionRepository: Repository<PaymentTransaction>,
    @InjectRepository(SellerBankAccount)
    private sellerBankAccountRepository: Repository<SellerBankAccount>,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    // Get config values, throw error if missing required ones
    this.vnp_TmnCode = this.getConfigOrThrow('VNP_TMNCODE');
    this.vnp_HashSecret = this.getConfigOrThrow('VNP_HASHSECRET');
    this.vnp_Url = this.getConfigOrThrow('VNP_URL');
    this.vnp_ReturnUrl = this.getConfigOrThrow('VNP_RETURNURL');
    this.vnp_IpnUrl = this.getConfigOrThrow('VNP_IPNURL');
    this.payoutCronSchedule = this.configService.get<string>('PAYOUT_CRON_SCHEDULE', '0 0 1,15 * *');
    this.payoutSimulationUrl = this.configService.get<string>('PAYOUT_SIMULATION_URL');

    this.logger.log(`VNPay TmnCode: ${this.vnp_TmnCode ? 'Loaded' : 'MISSING!'}`);
    if (process.env.NODE_ENV !== 'production') {
        this.logger.log(`VNPay HashSecret: ${this.vnp_HashSecret ? 'Loaded' : 'MISSING!'}`);
    }
  }

  // Helper to ensure required config exists
  private getConfigOrThrow(key: string): string {
      const value = this.configService.get<string>(key);
      if (!value) {
          this.logger.error(`Missing required environment variable: ${key}`);
          throw new InternalServerErrorException(`Configuration error: ${key} is not defined.`);
      }
      return value;
  }

  async createPaymentUrl(createPaymentDto: CreatePaymentDto): Promise<string> {
    const { orderId, amount, sellerId, orderInfo = 'Order Payment', bankCode, language = 'vn' } = createPaymentDto;

    if (!orderId || !amount || amount <= 0) {
        throw new BadRequestException('Invalid orderId or amount.');
    }
    if (!sellerId) {
        this.logger.warn(`sellerId missing for order ${orderId}. Payout tracking might be affected.`);
    }

    process.env.TZ = 'Asia/Ho_Chi_Minh';
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const vnp_TxnRef = `${orderId}_${moment(date).format('HHmmss')}`;

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

    const transaction = this.paymentTransactionRepository.create({
      orderId: String(orderId),
      sellerId: sellerId,
      vnp_TxnRef: vnp_TxnRef,
      amount: amount,
      status: PaymentStatus.PENDING,
      payoutStatus: PaymentPayoutStatus.PENDING,
      vnp_OrderInfo: orderInfo,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    });
    await this.paymentTransactionRepository.save(transaction);
    this.logger.log(`Created pending transaction for TxnRef: ${vnp_TxnRef}, Seller: ${sellerId}`);

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    const paymentUrl = this.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });

    return paymentUrl;
  }

  async handleVnpayReturn(query: VnpayReturnDto): Promise<{ isValid: boolean; code: string; message: string }> {
    const vnp_Params: any = { ...query }; // Cast to any to allow delete
    const secureHash = vnp_Params['vnp_SecureHash'];

    // Properties are not optional in DTO, but delete requires optional
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

  async handleVnpayIpn(query: VnpayIpnDto): Promise<{ RspCode: string; Message: string }> {
    const vnp_Params: any = { ...query }; // Cast to any to allow delete
    const secureHash = vnp_Params['vnp_SecureHash'];

    // Properties are not optional in DTO, but delete requires optional
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

    try {
        const transaction = await this.paymentTransactionRepository.findOne({ where: { vnp_TxnRef: txnRef } });

        if (!transaction) {
            this.logger.warn(`IPN Order not found for TxnRef: ${txnRef}`);
            return { RspCode: '01', Message: 'Order not found' };
        }

        // Ensure transaction amount is treated as a number for comparison
        if (Number(transaction.amount) !== amount) {
            this.logger.warn(`IPN Amount invalid for TxnRef: ${txnRef}. Expected: ${transaction.amount}, Received: ${amount}`);
            return { RspCode: '04', Message: 'Amount invalid' };
        }

        if (transaction.status !== PaymentStatus.PENDING) {
            this.logger.log(`IPN Order already updated for TxnRef: ${txnRef}. Status: ${transaction.status}`);
            return { RspCode: '00', Message: 'Order already confirmed' };
        }

        if (rspCode === '00') {
            transaction.status = PaymentStatus.SUCCESS;
            transaction.vnp_TransactionNo = vnp_Params['vnp_TransactionNo'];
            transaction.vnp_BankCode = vnp_Params['vnp_BankCode'];
            transaction.vnp_CardType = vnp_Params['vnp_CardType'];
            transaction.vnp_PayDate = vnp_Params['vnp_PayDate'];
            transaction.payoutStatus = PaymentPayoutStatus.PENDING; // Ready for payout
            this.logger.log(`IPN Payment SUCCESS for TxnRef: ${txnRef}`);
        } else {
            transaction.status = PaymentStatus.FAILED;
            transaction.payoutStatus = PaymentPayoutStatus.NOT_APPLICABLE;
            this.logger.warn(`IPN Payment FAILED for TxnRef: ${txnRef}. RspCode: ${rspCode}`);
        }
        transaction.vnp_ResponseCode = rspCode;
        transaction.vnp_TransactionStatus = vnp_Params['vnp_TransactionStatus'];

        await this.paymentTransactionRepository.save(transaction);

        // TODO: Notify Order Service about payment status change
        // this.notifyOrderService(transaction.orderId, transaction.status);

        return { RspCode: '00', Message: 'Success' };

    } catch (dbError) {
        this.logger.error(`IPN Database error for TxnRef: ${txnRef}: ${dbError.message}`, dbError.stack);
        return { RspCode: '99', Message: 'Unknown error' };
    }
  }

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
            // Set this as default, unset others for the same seller
            await this.sellerBankAccountRepository.update({ sellerId, id: Not(existingAccount.id) }, { isDefault: false });
            existingAccount.isDefault = true;
        } else if (!isDefault && existingAccount.isDefault) {
            // Trying to unset the default - check if it's the only one
            const otherAccountsCount = await this.sellerBankAccountRepository.count({ where: { sellerId, id: Not(existingAccount.id) } });
            if (otherAccountsCount === 0) {
                // Prevent unsetting the only account as default
                throw new BadRequestException('Cannot unset the only bank account as default. Add another account first.');
            }
            existingAccount.isDefault = false;
        }
        // If isDefault is true and existingAccount.isDefault is also true, no change needed for default status
        return this.sellerBankAccountRepository.save(existingAccount);
    } else {
         this.logger.log(`Adding new bank account for seller ${sellerId}`);
         if (isDefault) {
            // Ensure only one default when adding a new default account
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

  @Cron(process.env.PAYOUT_CRON_SCHEDULE || '0 0 1,15 * *')
  async handleScheduledPayouts() {
    this.logger.log(`Running scheduled payouts cron job at ${new Date().toISOString()}`);

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
          this.logger.warn(`Transaction ${tx.id} (TxnRef: ${tx.vnp_TxnRef}) missing sellerId, skipping payout.`);
          return acc;
      }
      if (!acc[sellerId]) {
        acc[sellerId] = { totalAmount: 0, transactions: [] };
      }
      acc[sellerId].totalAmount += Number(tx.amount);
      acc[sellerId].transactions.push(tx);
      return acc;
    }, {} as Record<number, { totalAmount: number; transactions: PaymentTransaction[]}>);

    for (const sellerIdStr in payoutsBySeller) {
        const sellerId = parseInt(sellerIdStr, 10);
        const payoutData = payoutsBySeller[sellerId];
        const transactionIds = payoutData.transactions.map(tx => tx.id);

        try {
            // Mark as PROCESSING before attempting payout
            await this.paymentTransactionRepository.update(
                { id: In(transactionIds) },
                { payoutStatus: PaymentPayoutStatus.PROCESSING }
            );
            this.logger.log(`Marked ${transactionIds.length} transactions as PROCESSING for Seller ${sellerId}.`);

            const bankAccount = await this.findDefaultBankAccount(sellerId);

            if (!bankAccount) {
                this.logger.warn(`Seller ${sellerId} has no default bank account configured. Payout failed.`);
                await this.paymentTransactionRepository.update(
                    { id: In(transactionIds) },
                    { payoutStatus: PaymentPayoutStatus.FAILED }
                );
                continue; // Skip to next seller
            }

            this.logger.log(`Processing payout for Seller ${sellerId}: Amount ₫${payoutData.totalAmount} to account ${bankAccount.accountNumber} (${bankAccount.bankName})`);

            // ** SIMULATION / ACTUAL API CALL **
            const payoutSuccess = await this.simulatePayoutApiCall(sellerId, payoutData.totalAmount, bankAccount);
            // ** END SIMULATION **

            if (payoutSuccess) {
                await this.paymentTransactionRepository.update(
                    { id: In(transactionIds) },
                    { payoutStatus: PaymentPayoutStatus.COMPLETED, payoutDate: new Date() }
                );
                this.logger.log(`Payout COMPLETED for ${transactionIds.length} transactions for Seller ${sellerId}.`);
            } else {
                 throw new Error('Simulated Payout API call failed');
            }

        } catch (error) {
            this.logger.error(`Payout FAILED for Seller ${sellerId}: ${error.message}`, error.stack);
            // Ensure status is marked as FAILED if not already completed
            await this.paymentTransactionRepository.update(
                { id: In(transactionIds), payoutStatus: PaymentPayoutStatus.PROCESSING }, // Only update those still processing
                { payoutStatus: PaymentPayoutStatus.FAILED }
            );
        }
    }

    this.logger.log('Finished scheduled payouts cron job.');
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
        // return Math.random() > 0.1; // Simulate occasional failure
        return true;
   }

   // private async notifyOrderService(orderId: string, status: 'SUCCESS' | 'FAILED') {
   //     // Implementation to notify order service
   // }
}
