import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ClientGrpc } from '@nestjs/microservices';
import { SellerGrpcService } from './interfaces/seller.interface';

@Injectable()
export class SellerService implements OnModuleInit {
  private sellerGrpcService: SellerGrpcService;

  constructor(
    private readonly httpService: HttpService,
    @Inject('SELLER_PACKAGE') private client: ClientGrpc,
  ) {}
 
  onModuleInit() {
    // Khi module khởi tạo, lấy service client từ gRPC
    this.sellerGrpcService = this.client.getService<SellerGrpcService>('SellerService');
  }

  // Phương thức mới sử dụng gRPC để lấy thông tin seller
  async getSellerById(id: number): Promise<any> {
    try {
      // Gọi phương thức getSeller qua gRPC
      return await firstValueFrom(this.sellerGrpcService.getSeller({ id }));
    } catch (error) {
      console.error('gRPC call failed:', error);
      throw error;
    }
  }
}
