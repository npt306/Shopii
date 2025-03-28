import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, MoreThan } from 'typeorm';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { CreateUserVoucherDto } from './dto/user-voucher.dto';
import { Voucher } from './entities/voucher.entity';
import { UserVoucher } from './entities/user-voucher.entity';
import { VoucherHistory } from './entities/voucher-history.entity';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(Voucher)
    private vouchersRepository: Repository<Voucher>,

    @InjectRepository(VoucherHistory)
    private voucherHistoryRepository: Repository<VoucherHistory>,

    @InjectRepository(UserVoucher)
    private userVoucherRepository: Repository<UserVoucher>,
  ) {}

  async create(createVoucherDto: CreateVoucherDto): Promise<Voucher> {
    // Check if a voucher with the same code already exists
    const existingVoucher = await this.vouchersRepository.findOne({
      where: { code: createVoucherDto.code },
    });
    if (existingVoucher) {
      throw new BadRequestException('A voucher with this code already exists.');
    }

    const voucher = this.vouchersRepository.create(createVoucherDto); // Use create
    return this.vouchersRepository.save(voucher);
  }

  async findAll(): Promise<Voucher[]> {
    return this.vouchersRepository.find();
  }

  async findOne(id: number): Promise<Voucher> {
    const voucher = await this.vouchersRepository.findOneBy({ id });
    if (!voucher) {
      throw new NotFoundException(`Voucher with ID ${id} not found`);
    }
    return voucher;
  }

  async update(
    id: number,
    updateVoucherDto: UpdateVoucherDto,
  ): Promise<Voucher> {
    const voucher = await this.vouchersRepository.findOneBy({ id });
    if (!voucher) {
      throw new NotFoundException(`Voucher with ID ${id} not found`);
    }

    // Check if the updated code already exists (excluding the current voucher)
    if (updateVoucherDto.code && updateVoucherDto.code !== voucher.code) {
      const existingVoucher = await this.vouchersRepository.findOne({
        where: { code: updateVoucherDto.code },
      });
      if (existingVoucher) {
        throw new BadRequestException(
          'A voucher with this code already exists.',
        );
      }
    }

    this.vouchersRepository.merge(voucher, updateVoucherDto);
    return this.vouchersRepository.save(voucher);
  }

  async remove(id: number): Promise<void> {
    const result = await this.vouchersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Voucher with ID ${id} not found`);
    }
  }

  async getActiveVouchers(userId: number): Promise<Voucher[]> {
    const currentDate = new Date();
    const userVouchers = await this.userVoucherRepository.find({
      where: { OwnerId: userId },
    });

    // Extract voucher IDs from userVouchers
    const userVoucherIds = userVouchers.map((uv) => uv.VoucherId);

    const vouchers = await this.vouchersRepository.find({
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
    const userVoucherIds = userVouchers.map((uv) => uv.VoucherId);

    const vouchers = await this.vouchersRepository.find({
      where: { id: In(userVoucherIds) },
    });
    // Map vouchers and attach UsingTimeLeft from userVouchers
    return vouchers.map((voucher) => {
      const userVoucher = userVouchers.find(
        (uv) => uv.VoucherId === voucher.id,
      );
      return {
        ...voucher,
        using_time_left: userVoucher?.UsingTimeLeft ?? 0, // Attach UsingTimeLeft or default to 0
      };
    });
  }

  async getUserVoucherHistory(userId: number): Promise<any[]> {
    const histories = await this.voucherHistoryRepository.find({
      where: { UserID: userId },
    });

    const voucherIds = histories.map((history) => history.VoucherID);

    const vouchers = await this.vouchersRepository.find({
      where: {
        id: In(voucherIds),
      },
    });
    return histories.map((history) => ({
      ...history,
      voucher: vouchers.find((v) => v.id === history.VoucherID),
    }));
  }

  async userClaimVoucher(dto: CreateUserVoucherDto): Promise<boolean> {
    // console.log("OUTTTTTTTT", dto);
    let voucher; // Declare outside the block to maintain scope

    if (dto.VoucherCode) {
      voucher = await this.vouchersRepository.findOne({
        where: { code: dto.VoucherCode },
      });
    } else {
      voucher = await this.vouchersRepository.findOne({
        where: { id: dto.VoucherId },
      });
    }

    console.log('Found Voucher:', voucher);

    if (voucher) {
      const exist_voucher = await this.userVoucherRepository.findOne({
        where: { VoucherId: voucher.id },
      });
      if (exist_voucher) {
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
