import { Controller, Post, Get, Body, Param, ParseIntPipe, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentGatewayService } from './payment.service';

interface CreatePaymentPayload {
    orderId: string;
    amount: number;
    sellerId?: number;
    orderInfo?: string;
    bankCode?: string;
    language?: 'vn' | 'en';
}

interface AddBankAccountPayload {
    sellerId: number;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
    isDefault?: boolean;
}


@Controller('api/payment')
export class PaymentGatewayController {
  private readonly logger = new Logger(PaymentGatewayController.name);

  constructor(private readonly paymentGatewayService: PaymentGatewayService) {}

  @Post('create_url')
  async createPaymentUrl(@Body() payload: CreatePaymentPayload) {
    this.logger.log(`Gateway: Received request to create payment URL for order ${payload.orderId}`);
    return this.paymentGatewayService.createPaymentUrl(payload);
  }

  @Post('bank-account')
  async addBankAccount(@Body() payload: AddBankAccountPayload) {
    this.logger.log(`Gateway: Received request to add bank account for seller ${payload.sellerId}`);
    return this.paymentGatewayService.addBankAccount(payload);
  }

  @Get('seller/:sellerId/bank-accounts')
  async getSellerBankAccounts(@Param('sellerId', ParseIntPipe) sellerId: number) {
    this.logger.log(`Gateway: Received request to get bank accounts for seller ${sellerId}`);
    return this.paymentGatewayService.getSellerBankAccounts(sellerId);
  }

  @Post('trigger-payout') // For admin/testing
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerManualPayout() {
      this.logger.log('Gateway: Received request to trigger manual payout');
      return this.paymentGatewayService.triggerManualPayout();
  }

  // Note: /vnpay_return and /vnpay_ipn are NOT proxied here.
  // They are handled directly by the payment-service.
}