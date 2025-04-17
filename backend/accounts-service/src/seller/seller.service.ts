import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from 'src/entity/Account.entity';
import { Seller } from 'src/entity/seller.entity';

@Injectable()
export class SellerService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
  ) {}

  async getSellerById(sellerId: string): Promise<Seller> {
    const seller = await this.sellerRepository.findOneBy({ id: +sellerId });
    if (!seller) {
      throw new NotFoundException(`Seller with id ${sellerId} not found.`);
    }
    return seller;
  }
}
