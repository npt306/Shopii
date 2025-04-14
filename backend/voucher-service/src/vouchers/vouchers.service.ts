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
  ILike,
} from 'typeorm';
import { QueryVoucherDto, VoucherStatusQuery } from './dto/query-voucher.dto';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { CreateUserVoucherDto } from './dto/user-voucher.dto';
import { SellerVoucherDto } from './dto/seller-voucher.dto';
import { CreateVoucherHistoryDto } from './dto/voucher-history.dto';
import { Voucher } from './entities/voucher.entity';
import { UserVoucher } from './entities/user-voucher.entity';
import { VoucherHistory } from './entities/voucher-history.entity';
import { SellerVoucher } from './entities/seller-voucher.entity';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(Voucher)
    private vouchersRepository: Repository<Voucher>,

    @InjectRepository(VoucherHistory)
    private voucherHistoryRepository: Repository<VoucherHistory>,

    @InjectRepository(UserVoucher)
    private userVoucherRepository: Repository<UserVoucher>,

    @InjectRepository(SellerVoucher)
    private sellerVoucherRepository: Repository<SellerVoucher>,
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

  async findAll(
    queryDto: QueryVoucherDto,
  ): Promise<{ data: Voucher[]; total: number }> {
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
        { code: ILike(`%${search}%`) },
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
    if (
      whereConditions.length > 0 &&
      Object.keys(statusWhereClause).length > 0
    ) {
      // If both search and status filters are present, apply status filters to each search condition
      queryOptions.where = whereConditions.map((condition) => ({
        ...condition,
        ...statusWhereClause,
      }));
    } else if (Object.keys(statusWhereClause).length > 0) {
      // If only status filter is present
      queryOptions.where = statusWhereClause;
    }
    // If only search is present, queryOptions.where is already set
    // If neither is present, queryOptions.where remains empty {}

    const [data, total] =
      await this.vouchersRepository.findAndCount(queryOptions);

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
          id: Not(id),
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


  // USER VOUCHERS
  async getActiveVouchers(userId: number): Promise<Voucher[]> {
    const currentDate = new Date();
    const userVouchers = await this.userVoucherRepository.find({
      where: { OwnerId: userId, isfromshop: false },
    });

    // Extract voucher IDs from userVouchers
    const userVoucherIds = userVouchers.map((uv) => uv.VoucherId);

    const vouchers = await this.vouchersRepository.find({
      where: {
        id: Not(In(userVoucherIds)),
        ends_at: MoreThan(currentDate),
        total_uses_left: MoreThan(0),
      },
    });

    return vouchers;
  }

  async getUserVouchers(userId: number): Promise<Voucher[]> {
    const userVouchers = await this.userVoucherRepository.find({
      where: { OwnerId: userId, isfromshop: false },
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

  async getUserSellerVouchers(userId: number): Promise<SellerVoucher[]> {
    const userVouchers = await this.userVoucherRepository.find({
      where: { OwnerId: userId, isfromshop: true }, // Only SellerVoucher
    });

    const userVoucherIds = userVouchers.map((uv) => uv.VoucherId);

    return this.sellerVoucherRepository.find({
      where: {
        id: In(userVoucherIds),
      },
    });
  }

  async getUserVoucherHistory(userId: number): Promise<any[]> {
    const histories = await this.voucherHistoryRepository.find({
      where: { UserID: userId },
    });

    const voucherIds = histories
      .filter((history) => !history.isfromshop)
      .map((history) => history.VoucherID);
    const sellerVoucherIds = histories
      .filter((history) => history.isfromshop)
      .map((history) => history.VoucherID);

    const [vouchers, sellerVouchers] = await Promise.all([
      this.vouchersRepository.find({
        where: { id: In(voucherIds) },
      }),
      this.sellerVoucherRepository.find({
        where: { id: In(sellerVoucherIds) },
      }),
    ]);

    return histories.map((history) => ({
      ...history,
      voucher: history.isfromshop
        ? sellerVouchers.find((v) => v.id === history.VoucherID)
        : vouchers.find((v) => v.id === history.VoucherID),
    }));
  }

  async userClaimVoucher(dto: CreateUserVoucherDto): Promise<boolean> {
    const { VoucherCode, VoucherId, OwnerId, isfromshop } = dto;

    if (VoucherCode && VoucherId) {
      console.log(
        'Error: Both VoucherCode and VoucherId provided. Please provide only one.',
      );
      return false;
    }

    let voucher: Voucher | null = null;
    let seller_voucher: SellerVoucher | null = null;

    // Fetch voucher(s)
    if (VoucherCode) {
      voucher = await this.vouchersRepository.findOne({
        where: { code: VoucherCode },
      });
      seller_voucher = await this.sellerVoucherRepository.findOne({
        where: { code: VoucherCode },
      });
    } else if (VoucherId) {
      if (isfromshop) {
        seller_voucher = await this.sellerVoucherRepository.findOne({
          where: { id: VoucherId },
        });
      } else {
        voucher = await this.vouchersRepository.findOne({
          where: { id: VoucherId },
        });
      }
    }

    // Not found
    if (!voucher && !seller_voucher) {
      console.log(
        `Voucher not found with ${VoucherCode ? 'code' : 'id'}:`,
        VoucherCode || VoucherId,
      );
      return false;
    }

    // Handle public voucher
    if (voucher) {
      const existingVoucher = await this.userVoucherRepository.findOne({
        where: { VoucherId: voucher.id, OwnerId, isfromshop: false },
      });

      if (existingVoucher) {
        console.log(
          `User ${OwnerId} has already claimed voucher ${voucher.id}.`,
        );
        return false;
      }

      const newVoucher = this.userVoucherRepository.create({
        VoucherId: voucher.id,
        OwnerId,
        ExpDate: voucher.ends_at,
        isfromshop: false,
        UsingTimeLeft: voucher.per_customer_limit,
      });

      await this.userVoucherRepository.save(newVoucher);

      console.log(
        `User ${OwnerId} successfully claimed voucher ${voucher.id}.`,
      );
      return true;
    }

    // Handle seller voucher
    if (seller_voucher) {
      const existingVoucher = await this.userVoucherRepository.findOne({
        where: { VoucherId: seller_voucher.id, OwnerId, isfromshop: true },
      });

      if (existingVoucher) {
        console.log(
          `User ${OwnerId} has already claimed seller voucher ${seller_voucher.id}.`,
        );
        return false;
      }

      const newVoucher = this.userVoucherRepository.create({
        VoucherId: seller_voucher.id,
        OwnerId,
        ExpDate: seller_voucher.ends_at,
        isfromshop: true,
        UsingTimeLeft: seller_voucher.usage_per_user,
      });

      await this.userVoucherRepository.save(newVoucher);

      console.log(
        `User ${OwnerId} successfully claimed seller voucher ${seller_voucher.id}.`,
      );
      return true;
    }

    return false; // fallback, should never reach here
  }

  async userUseVoucher(dto: CreateVoucherHistoryDto): Promise<VoucherHistory> {
    if (dto.isfromshop) {
      // 🔹 Handle shop-owned voucher
      const seller_voucher = await this.sellerVoucherRepository.findOne({
        where: { id: dto.VoucherID },
      });

      if (!seller_voucher || seller_voucher.used >= seller_voucher.max_usage) {
        throw new NotFoundException('Cannot find or use shop voucher');
      }

      seller_voucher.used += 1;
      await this.sellerVoucherRepository.save(seller_voucher);
    } else {
      // 🔹 Handle platform-wide voucher
      const voucher = await this.vouchersRepository.findOne({
        where: {
          id: dto.VoucherID,
          total_uses_left: MoreThan(0),
        },
      });

      if (!voucher) {
        throw new NotFoundException('Cannot find or use platform voucher');
      }
      if (voucher.total_uses_left) {
        voucher.total_uses_left -= 1;
        await this.vouchersRepository.save(voucher);
      }
    }

    // 🔸 Create usage history
    const newHistory = this.voucherHistoryRepository.create({
      VoucherID: dto.VoucherID,
      UserID: dto.UserID,
      UseDate: dto.UseDate ? new Date(dto.UseDate) : new Date(),
      isfromshop: dto.isfromshop,
    });

    return this.voucherHistoryRepository.save(newHistory);
  }

  // SELLER VOUCHERS

  async findAllSellerVoucher(id: number): Promise<SellerVoucher[]> {
    return this.sellerVoucherRepository.find({
      where: { sellerid: id },
    });
  }
  async findAllActiveSellerVoucher(id: number): Promise<SellerVoucher[]> {
    const currentDate = new Date();
    const vouchers = await this.sellerVoucherRepository.find({
      where: { sellerid: id, ends_at: MoreThan(currentDate) },
    });
    return vouchers.filter((voucher) => voucher.used < voucher.max_usage);
  }

  // Find a seller voucher by ID
  async findOneSellerVoucher(id: number): Promise<SellerVoucher> {
    const sellerVoucher = await this.sellerVoucherRepository.findOneBy({ id });
    if (!sellerVoucher) {
      throw new NotFoundException(`SellerVoucher with ID ${id} not found`);
    }
    return sellerVoucher;
  }

  // Create a new seller voucher
  async createSellerVoucher(sellerVoucherDto: SellerVoucherDto): Promise<any> {
    console.log('sellerVoucherDto', sellerVoucherDto);
    const existingVoucher = await this.sellerVoucherRepository.findOne({
      where: { code: sellerVoucherDto.code },
    });
    if (existingVoucher) {
      throw new BadRequestException('A voucher with this code already exists.');
    }
    if (sellerVoucherDto.voucher_type === 'shop_wide') {
      sellerVoucherDto.product_id = [];
    }
    if (sellerVoucherDto.voucher_type === 'product_specific') {
      if (
        !sellerVoucherDto.product_id ||
        sellerVoucherDto.product_id.length === 0
      ) {
        throw new BadRequestException(
          'Product IDs must be provided for product-specific vouchers.',
        );
      }
    }
    const sellerVoucher = this.sellerVoucherRepository.create(sellerVoucherDto);
    return this.sellerVoucherRepository.save(sellerVoucher);
  }

  // Update an existing seller voucher
  async updateSellerVoucher(
    id: number,
    sellerVoucherDto: SellerVoucherDto,
  ): Promise<SellerVoucher> {
    const sellerVoucher = await this.sellerVoucherRepository.preload({
      id,
      ...sellerVoucherDto,
    });
    if (!sellerVoucher) {
      throw new NotFoundException(`SellerVoucher with ID ${id} not found`);
    }
    return this.sellerVoucherRepository.save(sellerVoucher);
  }

  // Remove a seller voucher
  async removeSellerVoucher(id: number): Promise<void> {
    const sellerVoucher = await this.findOneSellerVoucher(id);
    await this.sellerVoucherRepository.remove(sellerVoucher);
  }
}
