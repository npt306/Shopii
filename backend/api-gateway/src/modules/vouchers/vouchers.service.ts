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

  async getAllVouchers(): Promise<any> {
    const response = await firstValueFrom(this.httpService.get('/vouchers'));
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
    const response = await firstValueFrom(this.httpService.delete(`/vouchers/${id}`));
    return response.data;
  }
}