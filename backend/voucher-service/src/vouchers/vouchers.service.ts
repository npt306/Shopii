import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  In,
  Not,
  MoreThan,
  LessThan,
  MoreThanOrEqual,
  LessThanOrEqual,
  FindManyOptions,
  ILike
} from 'typeorm';
import { QueryVoucherDto, VoucherStatusQuery } from './dto/query-voucher.dto';
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

  async findAll(queryDto: QueryVoucherDto): Promise<{ data: Voucher[], total: number }> {
    const { page = 1, limit = 10, search, status } = queryDto;
    const skip = (page - 1) * limit;
    const currentDate = new Date();

    const queryOptions: FindManyOptions<Voucher> = {
      skip,
      take: limit,
      order: { created_at: 'DESC' },
      where: {},
    };

    let whereConditions: any[] = [];

    // --- Search ---
    if (search) {
      whereConditions.push(
        { name: ILike(`%${search}%`) },
        { code: ILike(`%${search}%`) }
      );
      queryOptions.where = whereConditions;
    }

    // --- Status ---
    let statusWhereClause: any = {};
    if (status) {
      switch (status) {
        case VoucherStatusQuery.ACTIVE:
          statusWhereClause = {
            starts_at: LessThanOrEqual(currentDate),
            ends_at: MoreThanOrEqual(currentDate),
          };
          break;
        case VoucherStatusQuery.UPCOMING:
          statusWhereClause = {
            starts_at: MoreThan(currentDate),
          };
          break;
        case VoucherStatusQuery.EXPIRED:
          statusWhereClause = {
            ends_at: LessThan(currentDate),
          };
          break;
      }
    }

     // --- Combine Search and Status ---
     if (whereConditions.length > 0 && Object.keys(statusWhereClause).length > 0) {
        // If both search and status filters are present, apply status filters to each search condition
        queryOptions.where = whereConditions.map(condition => ({
            ...condition,
            ...statusWhereClause,
        }));
     } else if (Object.keys(statusWhereClause).length > 0) {
        // If only status filter is present
        queryOptions.where = statusWhereClause;
     }
     // If only search is present, queryOptions.where is already set
     // If neither is present, queryOptions.where remains empty {}

    const [data, total] = await this.vouchersRepository.findAndCount(queryOptions);

    return { data, total };
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

    let codeToCheck: string | undefined = undefined;
    if (updateVoucherDto.code) {
        codeToCheck = updateVoucherDto.code.toUpperCase();
        updateVoucherDto.code = codeToCheck;
    }
    
    if (codeToCheck && codeToCheck !== voucher.code) {
        const existingVoucher = await this.vouchersRepository.findOne({
            where: {
                code: codeToCheck,
                id: Not(id)
            },
        });
        if (existingVoucher) {
            throw new BadRequestException(
            'A voucher with this code already exists.',
            );
        }
    }

    // Merge and save (updateVoucherDto now has uppercase code if it was provided)
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
