import { Injectable, Logger, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common'; // Added InternalServerErrorException
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

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

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);
  private readonly paymentServiceUrl: string; // Keep type as string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Get the URL and throw error if it's missing
    const paymentServiceUrl = this.configService.get<string>('PAYMENT_SERVICE_URL');
    if (!paymentServiceUrl) {
        this.logger.error('PAYMENT_SERVICE_URL is not defined in environment variables!');
        // Throw an error to prevent the service from starting incorrectly
        throw new InternalServerErrorException('Configuration Error: Payment Service URL is not defined.');
    }
    this.paymentServiceUrl = paymentServiceUrl; // Assign if found
    this.logger.log(`Payment Service URL configured: ${this.paymentServiceUrl}`);
  }

  private handleHttpError(error: AxiosError, context: string): never {
    this.logger.error(`Error in ${context}: ${error.message}`, error.stack);
    if (error.response) {
      throw new HttpException(
        error.response.data || 'Downstream service error',
        error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else if (error.request) {
      throw new HttpException(
        'No response received from payment service',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else {
      throw new HttpException(
        'Error setting up request to payment service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createPaymentUrl(payload: CreatePaymentPayload): Promise<any> {
    try {
      const url = `${this.paymentServiceUrl}/payment/create-payment-url`;
      this.logger.log(`Forwarding createPaymentUrl request to: ${url}`);
      const response = await firstValueFrom(
        this.httpService.post(url, payload),
      );
      return response.data;
    } catch (error) {
      this.handleHttpError(error as AxiosError, 'createPaymentUrl');
    }
  }

  async addBankAccount(payload: AddBankAccountPayload): Promise<any> {
    try {
       const url = `${this.paymentServiceUrl}/payment/add-bank-account`;
       this.logger.log(`Forwarding addBankAccount request to: ${url} for seller ${payload.sellerId}`);
       const response = await firstValueFrom(
        this.httpService.post(url, payload),
      );
      return response.data;
    } catch (error) {
        this.handleHttpError(error as AxiosError, `addBankAccount for seller ${payload.sellerId}`);
    }
  }

  async getSellerBankAccounts(sellerId: number): Promise<any> {
    try {
        const url = `${this.paymentServiceUrl}/payment/seller/${sellerId}/bank-accounts`;
        this.logger.log(`Forwarding getSellerBankAccounts request to: ${url}`);
        const response = await firstValueFrom(
            this.httpService.get(url),
        );
        return response.data;
    } catch (error) {
        this.handleHttpError(error as AxiosError, `getSellerBankAccounts for seller ${sellerId}`);
    }
  }

  async triggerManualPayout(): Promise<any> {
    try {
        const url = `${this.paymentServiceUrl}/payment/trigger-payout`;
        this.logger.log(`Forwarding triggerManualPayout request to: ${url}`);
        const response = await firstValueFrom(
            this.httpService.post(url, {}), // Empty body for trigger
        );
        return response.data;
    } catch (error) {
        this.handleHttpError(error as AxiosError, 'triggerManualPayout');
    }
  }
}