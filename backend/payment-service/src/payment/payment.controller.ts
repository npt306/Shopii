import {
    Controller, Post, Body, Get, Query, Res, Logger, HttpCode, HttpStatus,
    BadRequestException, ValidationPipe, UsePipes, Param, ParseIntPipe,
    NotFoundException
} from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VnpayReturnDto } from './dto/vnpay-return.dto';
import { VnpayIpnDto } from './dto/vnpay-ipn.dto';
import { AddBankAccountDto } from './dto/add-bank-account.dto';
import { ConfigService } from '@nestjs/config';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);
  private readonly frontendBaseUrl: string;

  constructor(
      private readonly paymentService: PaymentService,
      private readonly configService: ConfigService,
    ) {
        this.frontendBaseUrl = this.configService.get<string>('VNP_FRONTEND_BASE_URL', 'http://localhost:8000');
    }

  @Post('create-payment-url')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createPaymentUrl(@Body() createPaymentDto: CreatePaymentDto) {
    this.logger.log(`Received create payment request: ${JSON.stringify(createPaymentDto)}`);
    try {
      const paymentUrl = await this.paymentService.createPaymentUrl(createPaymentDto);
      this.logger.log(`Generated VNPay URL for checkout session ${createPaymentDto.checkoutSessionId}`);
      return { paymentUrl };
    } catch (error) {
      this.logger.error(`Error creating payment URL for checkout session ${createPaymentDto.checkoutSessionId}: ${error.message}`, error.stack);
      // Ensure error is an instance of Error before accessing message
      const message = error instanceof Error ? error.message : 'Failed to create payment URL';
      throw new BadRequestException(message);
    }
  }

  @Get('vnpay_return')
  async handleVnpayReturn(@Query() vnpayReturnDto: VnpayReturnDto, @Res() res: Response) {
    this.logger.log(`Received VNPay return: ${JSON.stringify(vnpayReturnDto)}`);
    const result = await this.paymentService.handleVnpayReturn(vnpayReturnDto);

    const frontendSuccessUrl = `${this.frontendBaseUrl}/payment/success?orderId=${vnpayReturnDto.vnp_TxnRef}&code=${result.code}`;
    const frontendFailUrl = `${this.frontendBaseUrl}/payment/fail?orderId=${vnpayReturnDto.vnp_TxnRef}&code=${result.code}`;

    if (result.isValid && result.code === '00') {
      this.logger.log(`VNPay return successful for TxnRef: ${vnpayReturnDto.vnp_TxnRef}`);
      res.redirect(frontendSuccessUrl);
    } else {
      this.logger.warn(`VNPay return failed or invalid for TxnRef: ${vnpayReturnDto.vnp_TxnRef}. Code: ${result.code}, Valid: ${result.isValid}`);
      res.redirect(frontendFailUrl);
    }
  }

  @Get('vnpay_ipn')
  @HttpCode(HttpStatus.OK)
  async handleVnpayIpn(@Query() vnpayIpnDto: VnpayIpnDto) {
    this.logger.log(`Received VNPay IPN: ${JSON.stringify(vnpayIpnDto)}`);
    try {
      const result = await this.paymentService.handleVnpayIpn(vnpayIpnDto);
      this.logger.log(`IPN processed for TxnRef ${vnpayIpnDto.vnp_TxnRef}: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
       this.logger.error(`Error processing IPN for TxnRef ${vnpayIpnDto.vnp_TxnRef}: ${error.message}`, error.stack);
       return { RspCode: '99', Message: 'Unknown error' };
    }
  }

  @Post('add-bank-account')
  @UsePipes(new ValidationPipe({ transform: true }))
  async addBankAccount(@Body() addBankAccountDto: AddBankAccountDto) {
     this.logger.log(`Received add bank account request for seller: ${addBankAccountDto.sellerId}`);
     try {
        const result = await this.paymentService.addBankAccount(addBankAccountDto);
        this.logger.log(`Bank account added/updated for seller: ${addBankAccountDto.sellerId}`);
        return { success: true, data: result };
     } catch (error) {
         this.logger.error(`Error adding bank account for seller ${addBankAccountDto.sellerId}: ${error.message}`, error.stack);
         // Ensure error is an instance of Error before accessing message
         const message = error instanceof Error ? error.message : 'Failed to add bank account';
         throw new BadRequestException(message);
     }
  }

  @Get('seller/:sellerId/bank-accounts')
  async getSellerBankAccounts(@Param('sellerId', ParseIntPipe) sellerId: number) {
    this.logger.log(`Fetching bank accounts for seller: ${sellerId}`);
    try {
        const accounts = await this.paymentService.getSellerBankAccounts(sellerId);
        return { success: true, data: accounts };
    } catch (error) {
        this.logger.error(`Error fetching bank accounts for seller ${sellerId}: ${error.message}`, error.stack);
        throw new NotFoundException('Could not retrieve bank accounts.'); // Corrected usage
    }
  }

  @Post('trigger-payout')
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerManualPayout() {
      this.logger.log('Manual payout trigger received.');
      this.paymentService.handleScheduledPayouts()
          .catch(err => this.logger.error(`Manual payout trigger failed: ${err.message}`, err.stack));
      return { message: 'Payout process initiated.' };
  }
}
