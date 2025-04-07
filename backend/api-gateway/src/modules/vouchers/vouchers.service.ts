import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VouchersService {
  constructor(private readonly httpService: HttpService) {}

  async createVoucher(createVoucherDto: any): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post('/vouchers', createVoucherDto),
    );
    return response.data;
  }

  async getAllVouchersPaginated(
    page?: string,
    limit?: string,
    search?: string,
    status?: string,
  ): Promise<any> {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const queryString = params.toString();
    const url = queryString ? `/vouchers?${queryString}` : '/vouchers';

    const response = await firstValueFrom(this.httpService.get(url));
    return response.data;
  }

  async getVoucherById(id: number): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/vouchers/${id}`),
    );
    return response.data;
  }

  async updateVoucher(id: number, updateVoucherDto: any): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.patch(`/vouchers/${id}`, updateVoucherDto),
    );
    return response.data;
  }

  async deleteVoucher(id: number): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`/vouchers/${id}`),
      );
      return response.data;
    } catch (error: any) {
      console.error(
        'Error deleting voucher via gateway:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async getActiveVouchers(userId: number): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/vouchers/all/${userId}`),
    );
    return response.data;
  }

  async getUserVouchers(userId: number): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/vouchers/user-vouchers/${userId}`),
    );
    return response.data;
  }

  async getUserSellerVouchers(userId: number): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/vouchers/user-sellervouchers/${userId}`),
    );
    return response.data;
  }
  async getUserVoucherHistory(userId: number): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/vouchers/history/${userId}`),
    );
    return response.data;
  }
  async userUseVoucher(dto: any): Promise<any> {
    const response = await firstValueFrom(this.httpService.post('/use', dto));
    return response.data;
  }
  async userClaimVoucher(dto: any): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post('/vouchers/claim', dto),
    );
    return response.data;
  }

  async findAllSellerVouchers(shopId: number): Promise<any> {
    console.log('shopId', shopId);
    const response = await firstValueFrom(
      this.httpService.get(`/vouchers/seller-vouchers/all/${shopId}`),
    );
    return response.data;
  }

  async findOneSellerVoucher(id: number): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/vouchers/seller-vouchers/${id}`),
    );
    return response.data;
  }
  async findActiveSellerVoucher(id: number): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get(`/vouchers/seller-vouchers/active/${id}`),
    );
    return response.data;
  }
  async createSellerVoucher(dto: any): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post('/vouchers/seller-vouchers/', dto),
    );
    return response.data;
  }

  async updateSellerVoucher(id: number, dto: any): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.put(`/vouchers/seller-vouchers/${id}`, dto),
    );
    return response.data;
  }

  async deleteSellerVoucher(id: number): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.delete(`/vouchers/seller-vouchers/${id}`),
    );
    return response.data;
  }
}
