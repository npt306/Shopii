import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { SellerService } from './seller.service';
import { Seller } from './graphql/seller.types';

@Resolver(() => Seller)
export class SellerResolver {
  constructor(private readonly sellerService: SellerService) {}

  @Query(() => Seller, { nullable: true })
  async getSeller(@Args('id', { type: () => Int }) id: number): Promise<Seller> {
    return this.sellerService.getSellerById(id);
  }
}