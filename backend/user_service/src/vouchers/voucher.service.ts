import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Voucher } from './entities/voucher.entity';
import { UserVoucher } from './entities/user-voucher.entity';
import { VoucherHistory } from './entities/voucher-history.entity';
import { Not, MoreThan } from 'typeorm';
import { CreateUserVoucherDto } from './dto/user-voucher.dto';

@Injectable()
export class VoucherService {
  constructor(
  
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,

    @InjectRepository(VoucherHistory)
    private voucherHistoryRepository: Repository<VoucherHistory>,

    @InjectRepository(UserVoucher)
    private userVoucherRepository: Repository<UserVoucher>,
    
  ) {}


  async getActiveVouchers(userId: number): Promise<Voucher[]> {
    const currentDate = new Date();
    // console.log("INSIDE");
    const userVouchers = await this.userVoucherRepository.find({
      where: { OwnerId: userId },
    });
    
    // Extract voucher IDs from userVouchers
    const userVoucherIds = userVouchers.map(uv => uv.VoucherId);
    
    const vouchers = await this.voucherRepository.find({
      where: {
        id: Not(In(userVoucherIds)), 
        ends_at: MoreThan(currentDate), 
      },
    });

    return vouchers;
  }
  
  async getUserVouchers(userId: number): Promise<Voucher[]> {
    const userVouchers = await this.userVoucherRepository.find({
      where: { OwnerId: userId },
    });
    
    // Extract voucher IDs from userVouchers
    const userVoucherIds = userVouchers.map(uv => uv.VoucherId);
    
    const vouchers = await this.voucherRepository.find({
      where: { id: In(userVoucherIds) },
    });
    // Map vouchers and attach UsingTimeLeft from userVouchers
    return vouchers.map(voucher => {
      const userVoucher = userVouchers.find(uv => uv.VoucherId === voucher.id);
      return {
        ...voucher,
        using_time_left: userVoucher?.UsingTimeLeft ?? 0, // Attach UsingTimeLeft or default to 0
      };
    });
  }
  

  async getUserVoucherHistory(userId: number): Promise<any[]> {
    const histories = await this.voucherHistoryRepository.find({
      where: { UserID:  userId  },
    });
  
    const voucherIds = histories.map(history => history.VoucherID);
  
    const vouchers = await this.voucherRepository.find({
      where: {
        id: In(voucherIds), 
      },
    });  
    return histories.map(history => ({
      ...history,
      voucher: vouchers.find(v => v.id === history.VoucherID),
    }));
  }

  async userClaimVoucher(dto: CreateUserVoucherDto): Promise<boolean> {
    console.log("OUTTTTTTTT", dto);
    let voucher; // Declare outside the block to maintain scope

    if (dto.VoucherCode) {
      voucher = await this.voucherRepository.findOne({
        where: { code: dto.VoucherCode },
      });
    } else {
      voucher = await this.voucherRepository.findOne({
        where: { id: dto.VoucherId },
      });
    }

    console.log("Found Voucher:", voucher);
  
    if (voucher) {
      const exist_voucher = await this.userVoucherRepository.findOne({
        where: { VoucherId: voucher.id },
      });
      if(exist_voucher){
        return false;
      }
      const newVoucher = await this.userVoucherRepository.create({
        VoucherId: voucher.id,
        OwnerId: dto.OwnerId,
        ExpDate: voucher.ends_at,
        UsingTimeLeft: voucher.per_customer_limit,

      });
      // console.log("ppoopopo",newVoucher);
      await this.userVoucherRepository.save(newVoucher);
      return true;
    }
  
    return false;
  }

}
