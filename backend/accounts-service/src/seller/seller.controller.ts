import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { SellerService } from './seller.service';
import { GetSellerRequest, SellerResponse } from './interfaces/seller.interface';

@Controller()
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  // Giữ lại REST endpoint nếu cần thiết
  // @Get('accounts/seller/:id')
  // async getSellerRest(@Param('id') id: string) {
  //   return await this.sellerService.getSellerById(id);
  // }

  @GrpcMethod('SellerService', 'GetSeller')
  async getSeller(data: GetSellerRequest): Promise<SellerResponse> {
    const seller = await this.sellerService.getSellerById(data.id.toString());
    
    // Transform to match gRPC interface
    return {
      id: seller.id,
      shopName: seller.ShopName,
      taxCode: seller.TaxCode,
      sellerType: seller.SellerType,
      email: seller.Email || [],
      followers: seller.Followers,
      createdAt: seller.CreatedAt.toISOString(),
      updatedAt: seller.UpdatedAt.toISOString()
    };
  }
}
