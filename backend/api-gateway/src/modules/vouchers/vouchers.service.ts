import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VouchersService {
  constructor(private readonly httpService: HttpService) {}

  async createVoucher(createVoucherDto: any): Promise<any> {
    const response = await firstValueFrom(this.httpService.post('/vouchers', createVoucherDto));
    return response.data;
  }

  async getAllVouchersPaginated(page?: string, limit?: string, search?: string, status?: string): Promise<any> {

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
    const response = await firstValueFrom(this.httpService.get(`/vouchers/${id}`));
    return response.data;
  }

  async updateVoucher(id: number, updateVoucherDto: any): Promise<any> {
    const response = await firstValueFrom(this.httpService.patch(`/vouchers/${id}`, updateVoucherDto));
    return response.data;
  }

  async deleteVoucher(id: number): Promise<any> {

    try {
        const response = await firstValueFrom(this.httpService.delete(`/vouchers/${id}`));
        return response.data; 
    } catch (error: any) {

        console.error("Error deleting voucher via gateway:", error.response?.data || error.message);
        throw error;
    }
  }

  async getActiveVouchers(userId: number): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get('/vouchers/all', { params: { userId } })
    );
    return response.data;
  }

  async getUserVouchers(userId: number): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get('/vouchers/user-vouchers', { params: { userId } })
    );
    return response.data;
  }

  async getUserVoucherHistory(userId: number): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.get('/vouchers/history', { params: { userId } })
    );
    return response.data;
  }

  async userClaimVoucher(dto: any): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post('/vouchers/claim', dto)
    );
    return response.data;
  }

}