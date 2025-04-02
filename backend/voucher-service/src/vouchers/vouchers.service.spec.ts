import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral, FindManyOptions, ILike, LessThanOrEqual, MoreThanOrEqual, MoreThan, LessThan, Not, In } from 'typeorm';
import { VouchersService } from './vouchers.service';
import { Voucher } from './entities/voucher.entity';
import { VoucherHistory } from './entities/voucher-history.entity';
import { UserVoucher } from './entities/user-voucher.entity';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VoucherActionType } from '../common/enums/voucher-action-type.enum';
import { VoucherConditionType } from '../common/enums/voucher-condition-type.enum';
import { QueryVoucherDto, VoucherStatusQuery } from './dto/query-voucher.dto';

export type MockRepository<T extends ObjectLiteral> = {
  findOne: jest.Mock<Promise<T | null>, [any]>;
  findOneBy: jest.Mock<Promise<T | null>, [any]>;
  find: jest.Mock<Promise<T[]>, [any?]>;
  create: jest.Mock<T, [any]>;
  save: jest.Mock<Promise<T>, [any]>;
  merge: jest.Mock<T, [T, any]>;
  delete: jest.Mock<Promise<{ affected?: number | null }>, [any]>;
  findAndCount: jest.Mock<Promise<[T[], number]>, [FindManyOptions<T>?]>;
  count: jest.Mock<Promise<number>, [any?]>;
};

const createMockRepository = <T extends ObjectLiteral>(): MockRepository<T> => ({
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  merge: jest.fn(),
  delete: jest.fn(),
  findAndCount: jest.fn(),
  count: jest.fn(),
});

// Helper to get current date without time for comparisons
const today = new Date();
today.setHours(0, 0, 0, 0);
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);
const lastWeek = new Date(today);
lastWeek.setDate(today.getDate() - 7);

// --- Mock Data ---
const mockVoucherActive: Voucher = {
  id: 1, name: 'Active Voucher', code: 'ACTIVE10',
  starts_at: lastWeek, ends_at: nextWeek,
  per_customer_limit: 1, total_usage_limit: 100, total_uses_left: 100, // Added total_uses_left
  condition_type: VoucherConditionType.NONE, action_type: VoucherActionType.FIXED_AMOUNT, discount_amount: 10,
  created_at: new Date(), updated_at: new Date(),
  description: undefined, min_order_amount: undefined, min_products: undefined, product_ids: undefined,
  discount_percentage: undefined, free_shipping_max: undefined, buy_x_amount: undefined, get_y_amount: undefined,
};
const mockVoucherUpcoming: Voucher = {
  id: 2, name: 'Upcoming Sale', code: 'UPCOMING',
  starts_at: tomorrow, ends_at: nextWeek,
  per_customer_limit: 1, total_usage_limit: 50, total_uses_left: 50, // Added total_uses_left
  condition_type: VoucherConditionType.NONE, action_type: VoucherActionType.PERCENTAGE, discount_percentage: 15,
  created_at: new Date(), updated_at: new Date(),
  description: undefined, min_order_amount: undefined, min_products: undefined, product_ids: undefined,
  discount_amount: undefined, free_shipping_max: undefined, buy_x_amount: undefined, get_y_amount: undefined,
};
const mockVoucherExpired: Voucher = {
  id: 3, name: 'Expired Deal', code: 'EXPIRED',
  starts_at: lastWeek, ends_at: yesterday,
  per_customer_limit: 1, total_usage_limit: 200, total_uses_left: 200, // Added total_uses_left
  condition_type: VoucherConditionType.MIN_ORDER, min_order_amount: 50000, action_type: VoucherActionType.FIXED_AMOUNT, discount_amount: 5,
  created_at: new Date(), updated_at: new Date(),
  description: undefined, min_products: undefined, product_ids: undefined,
  discount_percentage: undefined, free_shipping_max: undefined, buy_x_amount: undefined, get_y_amount: undefined,
};
const allMockVouchers = [mockVoucherActive, mockVoucherUpcoming, mockVoucherExpired];

// Mock data for UserVoucher and VoucherHistory
const mockUserId = 123;
const mockUserVoucherClaimedActive: UserVoucher = {
  id: 10, VoucherId: mockVoucherActive.id, OwnerId: mockUserId, ExpDate: mockVoucherActive.ends_at,
  UsingTimeLeft: 0, CreatedAt: new Date(), UpdatedAt: new Date(), voucher: mockVoucherActive
};
const mockUserVoucherClaimedUpcoming: UserVoucher = {
  id: 11, VoucherId: mockVoucherUpcoming.id, OwnerId: mockUserId, ExpDate: mockVoucherUpcoming.ends_at,
  UsingTimeLeft: 1, CreatedAt: new Date(), UpdatedAt: new Date(), voucher: mockVoucherUpcoming
};
const mockVoucherHistoryEntry: VoucherHistory = {
  id: 20, VoucherID: mockVoucherExpired.id, UserID: mockUserId, UseDate: new Date(yesterday.getTime() - 86400000), // Used one day before expiry
  CreatedAt: new Date(), UpdatedAt: new Date()
};



describe('VouchersService', () => {
  let service: VouchersService;
  let repository: MockRepository<Voucher>;
  let voucherHistoryRepository: MockRepository<VoucherHistory>;
  let userVoucherRepository: MockRepository<UserVoucher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VouchersService,
        { provide: getRepositoryToken(Voucher), useValue: createMockRepository<Voucher>() },
        { provide: getRepositoryToken(VoucherHistory), useValue: createMockRepository<VoucherHistory>() },
        { provide: getRepositoryToken(UserVoucher), useValue: createMockRepository<UserVoucher>() },
      ],
    }).compile();

    service = module.get<VouchersService>(VouchersService);
    repository = module.get(getRepositoryToken(Voucher));
    voucherHistoryRepository = module.get(getRepositoryToken(VoucherHistory));
    userVoucherRepository = module.get(getRepositoryToken(UserVoucher));

    // Reset mocks before each test
    Object.values(repository).forEach(mockFn => mockFn.mockReset());
    Object.values(voucherHistoryRepository).forEach(mockFn => mockFn.mockReset());
    Object.values(userVoucherRepository).forEach(mockFn => mockFn.mockReset());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Test create() ---
  describe('create', () => {
    const createDto: CreateVoucherDto = {
      name: 'New Voucher', code: 'NEW15', starts_at: tomorrow.toISOString(), ends_at: nextWeek.toISOString(),
      action_type: VoucherActionType.PERCENTAGE, discount_percentage: 15, total_usage_limit: 50
    };
    // Ensure mock includes total_uses_left, initialized from total_usage_limit
    const savedVoucherMock = { ...createDto, id: 4, code: 'NEW15', starts_at: tomorrow, ends_at: nextWeek, total_uses_left: 50, created_at: new Date(), updated_at: new Date() } as Voucher;

    it('should successfully create a voucher (and uppercase code)', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockImplementation((dto) => ({ ...dto, total_uses_left: dto.total_usage_limit } as Voucher)); // Simulate create and init total_uses_left
      repository.save.mockResolvedValue(savedVoucherMock);

      const result = await service.create(createDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { code: 'NEW15' } });
      // Check that create is called with the DTO and the code uppercased
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ ...createDto, code: 'NEW15' }));
      // Check that save is called with the created object, including the initialized total_uses_left
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ ...createDto, code: 'NEW15', total_uses_left: 50 }));
      expect(result).toEqual(savedVoucherMock);
    });

    it('should throw BadRequestException if voucher code already exists', async () => {
        const existingVoucher = { ...mockVoucherActive, code: 'NEW15' };
        repository.findOne.mockResolvedValue(existingVoucher);

        await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
        expect(repository.findOne).toHaveBeenCalledWith({ where: { code: 'NEW15' } });
        expect(repository.create).not.toHaveBeenCalled();
        expect(repository.save).not.toHaveBeenCalled();
    });
  });

  // --- Test findAll() ---
  describe('findAll', () => {
     beforeEach(() => {
        repository.findAndCount.mockResolvedValue([allMockVouchers, allMockVouchers.length]);
     });

    it('should return paginated vouchers with default options', async () => {
      const queryDto = new QueryVoucherDto();
      const expectedOptions: FindManyOptions<Voucher> = {
        skip: 0, take: 10, order: { created_at: 'DESC' }, where: {},
      };
      const result = await service.findAll(queryDto);
      expect(repository.findAndCount).toHaveBeenCalledWith(expectedOptions);
      expect(result.data).toEqual(allMockVouchers);
      expect(result.total).toEqual(allMockVouchers.length);
    });

    it('should return correct page and limit', async () => {
      const queryDto: QueryVoucherDto = { page: 2, limit: 1 };
       repository.findAndCount.mockResolvedValue([[mockVoucherUpcoming], allMockVouchers.length]);
       const expectedOptions: FindManyOptions<Voucher> = {
        skip: 1, take: 1, order: { created_at: 'DESC' }, where: {},
      };
      const result = await service.findAll(queryDto);
      expect(repository.findAndCount).toHaveBeenCalledWith(expectedOptions);
      expect(result.data).toEqual([mockVoucherUpcoming]);
      expect(result.total).toEqual(allMockVouchers.length);
    });

    it('should search by name or code (case-insensitive)', async () => {
        const searchTerm = 'active';
        const queryDto: QueryVoucherDto = { search: searchTerm };
        repository.findAndCount.mockResolvedValue([[mockVoucherActive], 1]);
        const expectedOptions: FindManyOptions<Voucher> = {
            skip: 0, take: 10, order: { created_at: 'DESC' },
            where: [ { name: ILike(`%${searchTerm}%`) }, { code: ILike(`%${searchTerm}%`) } ],
        };
        const result = await service.findAll(queryDto);
        expect(repository.findAndCount).toHaveBeenCalledWith(expectedOptions);
        expect(result.data).toEqual([mockVoucherActive]);
        expect(result.total).toEqual(1);
    });

    it('should filter by status: active', async () => {
        const queryDto: QueryVoucherDto = { status: VoucherStatusQuery.ACTIVE };
        repository.findAndCount.mockResolvedValue([[mockVoucherActive], 1]);
        const expectedOptions: FindManyOptions<Voucher> = {
            skip: 0, take: 10, order: { created_at: 'DESC' },
            where: { starts_at: LessThanOrEqual(expect.any(Date)), ends_at: MoreThanOrEqual(expect.any(Date)) },
        };
        const result = await service.findAll(queryDto);
        expect(repository.findAndCount).toHaveBeenCalledWith(expectedOptions);
        expect(result.data).toEqual([mockVoucherActive]);
        expect(result.total).toEqual(1);
    });

    it('should filter by status: upcoming', async () => {
        const queryDto: QueryVoucherDto = { status: VoucherStatusQuery.UPCOMING };
        repository.findAndCount.mockResolvedValue([[mockVoucherUpcoming], 1]);
         const expectedOptions: FindManyOptions<Voucher> = {
            skip: 0, take: 10, order: { created_at: 'DESC' },
            where: { starts_at: MoreThan(expect.any(Date)) },
        };
        const result = await service.findAll(queryDto);
        expect(repository.findAndCount).toHaveBeenCalledWith(expectedOptions);
        expect(result.data).toEqual([mockVoucherUpcoming]);
        expect(result.total).toEqual(1);
    });

    it('should filter by status: expired', async () => {
        const queryDto: QueryVoucherDto = { status: VoucherStatusQuery.EXPIRED };
        repository.findAndCount.mockResolvedValue([[mockVoucherExpired], 1]);
         const expectedOptions: FindManyOptions<Voucher> = {
            skip: 0, take: 10, order: { created_at: 'DESC' },
            where: { ends_at: LessThan(expect.any(Date)) },
        };
        const result = await service.findAll(queryDto);
        expect(repository.findAndCount).toHaveBeenCalledWith(expectedOptions);
        expect(result.data).toEqual([mockVoucherExpired]);
        expect(result.total).toEqual(1);
    });

     it('should combine search and status filters', async () => {
        const searchTerm = 'sale';
        const queryDto: QueryVoucherDto = { search: searchTerm, status: VoucherStatusQuery.UPCOMING };
        repository.findAndCount.mockResolvedValue([[mockVoucherUpcoming], 1]);
         const expectedOptions: FindManyOptions<Voucher> = {
            skip: 0, take: 10, order: { created_at: 'DESC' },
            where: [
                { name: ILike(`%${searchTerm}%`), starts_at: MoreThan(expect.any(Date)) },
                { code: ILike(`%${searchTerm}%`), starts_at: MoreThan(expect.any(Date)) },
            ],
        };
        const result = await service.findAll(queryDto);
        expect(repository.findAndCount).toHaveBeenCalledWith(expectedOptions);
        expect(result.data).toEqual([mockVoucherUpcoming]);
        expect(result.total).toEqual(1);
    });
  });

  // --- Test findOne() ---
  describe('findOne', () => {
    it('should return a single voucher if found', async () => {
      repository.findOneBy.mockResolvedValue(mockVoucherActive);
      const result = await service.findOne(mockVoucherActive.id);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockVoucherActive.id });
      expect(result).toEqual(mockVoucherActive);
    });

    it('should throw NotFoundException if voucher is not found', async () => {
      repository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });
  });

  // --- Test update() ---
   describe('update', () => {
    const voucherId = 1;
    const updateDto: UpdateVoucherDto = { description: 'Updated description' };

    it('should successfully update a voucher', async () => {
      const originalVoucher = { ...mockVoucherActive };
      const expectedSavedVoucher = { ...originalVoucher, ...updateDto, updated_at: new Date() } as Voucher;

      repository.findOneBy.mockResolvedValue(originalVoucher);
      repository.findOne.mockResolvedValue(null); // Mock for code check
      repository.merge.mockImplementation((entity, dto) => Object.assign(entity, dto));
      repository.save.mockResolvedValue(expectedSavedVoucher);

      const result = await service.update(voucherId, updateDto);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: voucherId });
      expect(repository.merge).toHaveBeenCalledWith(originalVoucher, updateDto);
      expect(repository.save).toHaveBeenCalledWith(originalVoucher);
      expect(result).toEqual(expectedSavedVoucher);
    });

    it('should successfully update a voucher with a new unique code (and uppercase it)', async () => {
        const updateCodeDto: UpdateVoucherDto = { code: 'newcode' };
        const originalVoucher = { ...mockVoucherActive };
        const expectedSavedVoucher = { ...originalVoucher, code: 'NEWCODE', updated_at: new Date() } as Voucher;

        repository.findOneBy.mockResolvedValue(originalVoucher);
        repository.findOne.mockResolvedValue(null); // Mock for code check - no existing code found
        repository.merge.mockImplementation((entity, dto) => Object.assign(entity, dto));
        repository.save.mockResolvedValue(expectedSavedVoucher);

        const result = await service.update(voucherId, updateCodeDto);

        expect(repository.findOneBy).toHaveBeenCalledWith({ id: voucherId });
        expect(repository.findOne).toHaveBeenCalledWith({
            where: { code: 'NEWCODE', id: Not(voucherId) }
        });
        expect(repository.merge).toHaveBeenCalledWith(originalVoucher, expect.objectContaining({ code: 'NEWCODE' }));
        expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ code: 'NEWCODE' }));
        expect(result).toEqual(expectedSavedVoucher);
    });

    it('should throw NotFoundException if voucher to update is not found', async () => {
      repository.findOneBy.mockResolvedValue(null);
      await expect(service.update(voucherId, updateDto)).rejects.toThrow(NotFoundException);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: voucherId });
    });

    it('should throw BadRequestException if updated code already exists for another voucher', async () => {
        const updateCodeDto: UpdateVoucherDto = { code: 'EXISTING' };
        const existingVoucherWithCode = { ...mockVoucherUpcoming, code: 'EXISTING' }; // ID 2
        const originalVoucher = { ...mockVoucherActive }; // ID 1

        repository.findOneBy.mockResolvedValue(originalVoucher);
        repository.findOne.mockResolvedValue(existingVoucherWithCode); // Mock for code check - found existing

        await expect(service.update(voucherId, updateCodeDto)).rejects.toThrow(BadRequestException);

        expect(repository.findOneBy).toHaveBeenCalledWith({ id: voucherId });
        expect(repository.findOne).toHaveBeenCalledWith({
            where: { code: 'EXISTING', id: Not(voucherId) }
        });
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

  // --- Test getActiveVouchers ---
  describe('getActiveVouchers', () => {
    it('should return active/upcoming vouchers not claimed by the user', async () => {
      const claimedVoucher = mockVoucherActive; 
      const availableVoucher = mockVoucherUpcoming; 
      const expiredVoucher = mockVoucherExpired; 

      userVoucherRepository.find.mockResolvedValue([mockUserVoucherClaimedActive]);

      repository.find.mockResolvedValue([availableVoucher]); 

      const result = await service.getActiveVouchers(mockUserId);

      expect(userVoucherRepository.find).toHaveBeenCalledWith({ where: { OwnerId: mockUserId } });

      expect(repository.find).toHaveBeenCalledWith({
          where: {
              id: Not(In([claimedVoucher.id])), 
              ends_at: MoreThan(expect.any(Date)), 
          },
      });

      expect(result).toEqual([availableVoucher]);
    });

    it('should return all active/upcoming vouchers if user claimed none', async () => {
        userVoucherRepository.find.mockResolvedValue([]); 

        repository.find.mockResolvedValue([mockVoucherActive, mockVoucherUpcoming]);

        const result = await service.getActiveVouchers(mockUserId);

        expect(userVoucherRepository.find).toHaveBeenCalledWith({ where: { OwnerId: mockUserId } });

        expect(repository.find).toHaveBeenCalledWith({
            where: {
                id: Not(In([])), 
                ends_at: MoreThan(expect.any(Date)), 
            },
        });

        expect(result).toEqual([mockVoucherActive, mockVoucherUpcoming]);
    });

     it('should return an empty array if no active/upcoming vouchers exist', async () => {
        userVoucherRepository.find.mockResolvedValue([]); 

        repository.find.mockResolvedValue([]);

        const result = await service.getActiveVouchers(mockUserId);

        expect(userVoucherRepository.find).toHaveBeenCalledWith({ where: { OwnerId: mockUserId } });

        expect(repository.find).toHaveBeenCalledWith({
            where: {
                id: Not(In([])), 
                ends_at: MoreThan(expect.any(Date)), 
            },
        });

        expect(result).toEqual([]);
    });
  });
  // --- Test getUserVouchers ---
  describe('getUserVouchers', () => {
    it('should return vouchers claimed by the user with remaining uses', async () => {
        const userVouchers = [mockUserVoucherClaimedActive, mockUserVoucherClaimedUpcoming];
        const correspondingVouchers = [mockVoucherActive, mockVoucherUpcoming];

        userVoucherRepository.find.mockResolvedValue(userVouchers);
        repository.find.mockResolvedValue(correspondingVouchers);

        const result = await service.getUserVouchers(mockUserId);

        expect(userVoucherRepository.find).toHaveBeenCalledWith({ where: { OwnerId: mockUserId } });
        expect(repository.find).toHaveBeenCalledWith({ where: { id: In([mockVoucherActive.id, mockVoucherUpcoming.id]) } });

        // Check if the result contains the vouchers and the added 'using_time_left' property
        expect(result).toHaveLength(2);
        expect(result).toContainEqual(expect.objectContaining({ ...mockVoucherActive, using_time_left: mockUserVoucherClaimedActive.UsingTimeLeft }));
        expect(result).toContainEqual(expect.objectContaining({ ...mockVoucherUpcoming, using_time_left: mockUserVoucherClaimedUpcoming.UsingTimeLeft }));
    });

     it('should return an empty array if user has claimed no vouchers', async () => {
        userVoucherRepository.find.mockResolvedValue([]);
        repository.find.mockResolvedValue([]); // Should not find any vouchers if no IDs passed

        const result = await service.getUserVouchers(mockUserId);

        expect(userVoucherRepository.find).toHaveBeenCalledWith({ where: { OwnerId: mockUserId } });
        expect(repository.find).toHaveBeenCalledWith({ where: { id: In([]) } }); // Called with empty In array
        expect(result).toEqual([]);
    });
  });

  // --- Test getUserVoucherHistory ---
  describe('getUserVoucherHistory', () => {
    it('should return voucher history with associated voucher details', async () => {
        const historyEntries = [mockVoucherHistoryEntry];
        const correspondingVouchers = [mockVoucherExpired]; // Voucher associated with the history

        voucherHistoryRepository.find.mockResolvedValue(historyEntries);
        repository.find.mockResolvedValue(correspondingVouchers);

        const result = await service.getUserVoucherHistory(mockUserId);

        expect(voucherHistoryRepository.find).toHaveBeenCalledWith({ where: { UserID: mockUserId } });
        expect(repository.find).toHaveBeenCalledWith({ where: { id: In([mockVoucherExpired.id]) } });

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(expect.objectContaining({
            ...mockVoucherHistoryEntry,
            voucher: mockVoucherExpired, // Ensure the voucher detail is nested
        }));
    });

     it('should return an empty array if user has no history', async () => {
        voucherHistoryRepository.find.mockResolvedValue([]);
        repository.find.mockResolvedValue([]);

        const result = await service.getUserVoucherHistory(mockUserId);

        expect(voucherHistoryRepository.find).toHaveBeenCalledWith({ where: { UserID: mockUserId } });
        expect(repository.find).toHaveBeenCalledWith({ where: { id: In([]) } });
        expect(result).toEqual([]);
    });
  });

  // --- Test userClaimVoucher ---
  describe('userClaimVoucher', () => {
    it('should claim voucher by CODE successfully if not already claimed', async () => {
        const dto = { OwnerId: mockUserId, VoucherCode: mockVoucherUpcoming.code, VoucherId: 0, ExpDate: '', UsingTimeLeft: 0 }; // Provide code
        const voucherToClaim = mockVoucherUpcoming;
        const expectedUserVoucher = {
            VoucherId: voucherToClaim.id,
            OwnerId: mockUserId,
            ExpDate: voucherToClaim.ends_at,
            UsingTimeLeft: voucherToClaim.per_customer_limit,
        };

        repository.findOne.mockResolvedValue(voucherToClaim); // Find by code
        userVoucherRepository.findOne.mockResolvedValue(null); // Not claimed yet
        userVoucherRepository.create.mockImplementation((data) => data as UserVoucher);
        userVoucherRepository.save.mockResolvedValue({ ...expectedUserVoucher, id: 12 } as UserVoucher);

        const result = await service.userClaimVoucher(dto);

        expect(repository.findOne).toHaveBeenCalledWith({ where: { code: dto.VoucherCode } });
        expect(userVoucherRepository.findOne).toHaveBeenCalledWith({ where: { VoucherId: voucherToClaim.id } });
        expect(userVoucherRepository.create).toHaveBeenCalledWith(expectedUserVoucher);
        expect(userVoucherRepository.save).toHaveBeenCalledWith(expectedUserVoucher);
        expect(result).toBe(true);
    });

    it('should claim voucher by ID successfully if not already claimed', async () => {
        const dto = { OwnerId: mockUserId, VoucherId: mockVoucherUpcoming.id, VoucherCode: '', ExpDate: '', UsingTimeLeft: 0 }; // Provide ID
        const voucherToClaim = mockVoucherUpcoming;
         const expectedUserVoucher = {
            VoucherId: voucherToClaim.id,
            OwnerId: mockUserId,
            ExpDate: voucherToClaim.ends_at,
            UsingTimeLeft: voucherToClaim.per_customer_limit,
        };

        repository.findOne.mockResolvedValue(voucherToClaim); // Find by ID
        userVoucherRepository.findOne.mockResolvedValue(null); // Not claimed yet
        userVoucherRepository.create.mockImplementation((data) => data as UserVoucher);
        userVoucherRepository.save.mockResolvedValue({ ...expectedUserVoucher, id: 13 } as UserVoucher);

        const result = await service.userClaimVoucher(dto);

        expect(repository.findOne).toHaveBeenCalledWith({ where: { id: dto.VoucherId } }); // Called with ID
        expect(userVoucherRepository.findOne).toHaveBeenCalledWith({ where: { VoucherId: voucherToClaim.id } });
        expect(userVoucherRepository.create).toHaveBeenCalledWith(expectedUserVoucher);
        expect(userVoucherRepository.save).toHaveBeenCalledWith(expectedUserVoucher);
        expect(result).toBe(true);
    });

    it('should return false if voucher code does not exist', async () => {
        const dto = { OwnerId: mockUserId, VoucherCode: 'NONEXISTENT', VoucherId: 0, ExpDate: '', UsingTimeLeft: 0 };
        repository.findOne.mockResolvedValue(null); // Voucher not found

        const result = await service.userClaimVoucher(dto);

        expect(repository.findOne).toHaveBeenCalledWith({ where: { code: dto.VoucherCode } });
        expect(userVoucherRepository.findOne).not.toHaveBeenCalled();
        expect(userVoucherRepository.create).not.toHaveBeenCalled();
        expect(userVoucherRepository.save).not.toHaveBeenCalled();
        expect(result).toBe(false);
    });

    it('should return false if voucher ID does not exist', async () => {
        const dto = { OwnerId: mockUserId, VoucherId: 999, VoucherCode: '', ExpDate: '', UsingTimeLeft: 0 };
        repository.findOne.mockResolvedValue(null); // Voucher not found

        const result = await service.userClaimVoucher(dto);

        expect(repository.findOne).toHaveBeenCalledWith({ where: { id: dto.VoucherId } });
        expect(userVoucherRepository.findOne).not.toHaveBeenCalled();
        expect(userVoucherRepository.create).not.toHaveBeenCalled();
        expect(userVoucherRepository.save).not.toHaveBeenCalled();
        expect(result).toBe(false);
    });

     it('should return false if voucher is already claimed by the user', async () => {
        const dto = { OwnerId: mockUserId, VoucherId: mockVoucherActive.id, VoucherCode: '', ExpDate: '', UsingTimeLeft: 0 };
        const voucherToClaim = mockVoucherActive;

        repository.findOne.mockResolvedValue(voucherToClaim); // Found voucher
        userVoucherRepository.findOne.mockResolvedValue(mockUserVoucherClaimedActive); // Already claimed

        const result = await service.userClaimVoucher(dto);

        expect(repository.findOne).toHaveBeenCalledWith({ where: { id: dto.VoucherId } });
        expect(userVoucherRepository.findOne).toHaveBeenCalledWith({ where: { VoucherId: voucherToClaim.id } });
        expect(userVoucherRepository.create).not.toHaveBeenCalled();
        expect(userVoucherRepository.save).not.toHaveBeenCalled();
        expect(result).toBe(false);
    });
  });
});