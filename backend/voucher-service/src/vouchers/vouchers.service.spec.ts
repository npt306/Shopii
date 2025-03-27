import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { VouchersService } from './vouchers.service';
import { Voucher } from './entities/voucher.entity';
import { VoucherHistory } from './entities/voucher-history.entity';
import { UserVoucher } from './entities/user-voucher.entity';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VoucherActionType } from '../common/enums/voucher-action-type.enum';
import { VoucherConditionType } from '../common/enums/voucher-condition-type.enum';

export type MockRepository<T extends ObjectLiteral> = {
  findOne: jest.Mock<Promise<T | null>, [any]>;
  findOneBy: jest.Mock<Promise<T | null>, [any]>;
  find: jest.Mock<Promise<T[]>, [any?]>;
  create: jest.Mock<T, [any]>;
  save: jest.Mock<Promise<T>, [any]>;
  merge: jest.Mock<T, [T, any]>;
  delete: jest.Mock<Promise<{ affected?: number | null }>, [any]>;
};

const createMockRepository = <T extends ObjectLiteral>(): MockRepository<T> => ({
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  merge: jest.fn(),
  delete: jest.fn(),
});

describe('VouchersService', () => {
  let service: VouchersService;
  let repository: MockRepository<Voucher>;
  let voucherHistoryRepository: MockRepository<VoucherHistory>;
  let userVoucherRepository: MockRepository<UserVoucher>;

  const mockVoucher: Voucher = {
    id: 1,
    name: 'Test Voucher',
    code: 'TEST10',
    starts_at: new Date('2024-01-01T00:00:00Z'),
    ends_at: new Date('2024-12-31T23:59:59Z'),
    per_customer_limit: 1,
    total_usage_limit: 100,
    condition_type: VoucherConditionType.NONE,
    action_type: VoucherActionType.FIXED_AMOUNT,
    discount_amount: 10,
    created_at: new Date(),
    updated_at: new Date(),
    description: undefined,
    min_order_amount: undefined,
    min_products: undefined,
    product_ids: undefined,
    discount_percentage: undefined,
    free_shipping_max: undefined,
    buy_x_amount: undefined,
    get_y_amount: undefined,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VouchersService,
        {
          provide: getRepositoryToken(Voucher),
          useValue: createMockRepository<Voucher>(),
        },
        {
          provide: getRepositoryToken(VoucherHistory),
          useValue: createMockRepository<VoucherHistory>(),
        },
         {
          provide: getRepositoryToken(UserVoucher),
          useValue: createMockRepository<UserVoucher>(),
        },

      ],
    }).compile();

    service = module.get<VouchersService>(VouchersService);
    repository = module.get<MockRepository<Voucher>>(getRepositoryToken(Voucher));
    voucherHistoryRepository = module.get<MockRepository<VoucherHistory>>(getRepositoryToken(VoucherHistory));
    userVoucherRepository = module.get<MockRepository<UserVoucher>>(getRepositoryToken(UserVoucher));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Test create() ---
  describe('create', () => {
    const createDto: CreateVoucherDto = {
      name: 'New Voucher',
      code: 'NEW15',
      starts_at: '2025-01-01T00:00:00Z',
      ends_at: '2025-12-31T23:59:59Z',
      action_type: VoucherActionType.PERCENTAGE,
      discount_percentage: 15,
    };
     // Define a more complete mock result for save, matching Voucher structure
     const savedVoucherMock = {
        ...mockVoucher, // Base properties
        ...createDto,   // Overwrite with DTO properties
        id: 2,          // Assign a new ID
        starts_at: new Date(createDto.starts_at), // Convert date strings
        ends_at: new Date(createDto.ends_at),
        created_at: new Date(), // Simulate DB timestamps
        updated_at: new Date(),
      };

    it('should successfully create a voucher', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(createDto as unknown as Voucher);
      repository.save.mockResolvedValue(savedVoucherMock);

      const result = await service.create(createDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { code: createDto.code } });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(createDto as unknown as Voucher);
      expect(result).toEqual(savedVoucherMock);
    });

    it('should throw BadRequestException if voucher code already exists', async () => {
      repository.findOne.mockResolvedValue(mockVoucher);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { code: createDto.code } });
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  // --- Test findAll() ---
  describe('findAll', () => {
    it('should return an array of vouchers', async () => {
      const vouchers = [mockVoucher, { ...mockVoucher, id: 2, code: 'TEST20' }];
      repository.find.mockResolvedValue(vouchers);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(vouchers);
    });

    it('should return an empty array if no vouchers exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  // --- Test findOne() ---
  describe('findOne', () => {
    const voucherId = 1;

    it('should return a single voucher if found', async () => {
      repository.findOneBy.mockResolvedValue(mockVoucher);

      const result = await service.findOne(voucherId);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: voucherId });
      expect(result).toEqual(mockVoucher);
    });

    it('should throw NotFoundException if voucher is not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(voucherId)).rejects.toThrow(NotFoundException);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: voucherId });
    });
  });

  // --- Test update() ---
  describe('update', () => {
    const voucherId = 1;
    const updateDto: UpdateVoucherDto = { description: 'Updated description' };

    it('should successfully update a voucher', async () => {
      const originalVoucher = { ...mockVoucher }; // Clone to avoid mutation issues

      const expectedSavedVoucher: Voucher = {
          ...originalVoucher, // Start with original state
          ...updateDto,       // Apply updates from DTO
          starts_at: updateDto.starts_at ? new Date(updateDto.starts_at) : originalVoucher.starts_at,
          ends_at: updateDto.ends_at ? new Date(updateDto.ends_at) : originalVoucher.ends_at,
          updated_at: new Date() // Simulate updated timestamp by DB
      };

      repository.findOneBy.mockResolvedValue(originalVoucher);
      repository.findOne.mockResolvedValue(null);
      repository.merge.mockImplementation((entity, dto) => {
        Object.assign(entity, dto);
        return entity as Voucher;
      });
      repository.save.mockResolvedValue(expectedSavedVoucher);

      const result = await service.update(voucherId, updateDto);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: voucherId });
      expect(repository.merge).toHaveBeenCalledWith(originalVoucher, updateDto);
      expect(repository.save).toHaveBeenCalledWith(originalVoucher);
      expect(result).toEqual(expectedSavedVoucher);
    });

    it('should successfully update a voucher with a new unique code', async () => {
        const updateCodeDto: UpdateVoucherDto = { code: 'NEWCODE' };
        const originalVoucher = { ...mockVoucher };

        const expectedSavedVoucherWithCode: Voucher = {
            ...originalVoucher,
            ...updateCodeDto,
            starts_at: updateCodeDto.starts_at ? new Date(updateCodeDto.starts_at) : originalVoucher.starts_at,
            ends_at: updateCodeDto.ends_at ? new Date(updateCodeDto.ends_at) : originalVoucher.ends_at,
            updated_at: new Date()
        };

        repository.findOneBy.mockResolvedValue(originalVoucher);
        repository.findOne.mockResolvedValue(null);
        repository.merge.mockImplementation((entity, dto) => {
             Object.assign(entity, dto);
             return entity as Voucher;
        });
        repository.save.mockResolvedValue(expectedSavedVoucherWithCode);

        const result = await service.update(voucherId, updateCodeDto);

        expect(repository.findOneBy).toHaveBeenCalledWith({ id: voucherId });
        expect(repository.findOne).toHaveBeenCalledWith({ where: { code: updateCodeDto.code } });
        expect(repository.merge).toHaveBeenCalledWith(originalVoucher, updateCodeDto);
        expect(repository.save).toHaveBeenCalledWith(originalVoucher);
        expect(result).toEqual(expectedSavedVoucherWithCode);
      });


    it('should throw NotFoundException if voucher to update is not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.update(voucherId, updateDto)).rejects.toThrow(NotFoundException);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: voucherId });
      expect(repository.merge).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if updated code already exists for another voucher', async () => {
      const updateCodeDto: UpdateVoucherDto = { code: 'EXISTINGCODE' };
      const existingVoucherWithCode = { ...mockVoucher, id: 2, code: 'EXISTINGCODE' };
      const originalVoucher = { ...mockVoucher };

      repository.findOneBy.mockResolvedValue(originalVoucher);
      repository.findOne.mockResolvedValue(existingVoucherWithCode);

      await expect(service.update(voucherId, updateCodeDto)).rejects.toThrow(BadRequestException);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: voucherId });
      expect(repository.findOne).toHaveBeenCalledWith({ where: { code: updateCodeDto.code } });
      expect(repository.merge).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  // --- Test remove() ---
  describe('remove', () => {
    const voucherId = 1;

    it('should successfully remove a voucher', async () => {
      repository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove(voucherId)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(voucherId);
    });

    it('should throw NotFoundException if voucher to remove is not found', async () => {
      repository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(voucherId)).rejects.toThrow(NotFoundException);
      expect(repository.delete).toHaveBeenCalledWith(voucherId);
    });
  });
});