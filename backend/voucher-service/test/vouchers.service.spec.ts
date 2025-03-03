import { Test, TestingModule } from '@nestjs/testing';
import { VouchersService } from './vouchers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { Repository } from 'typeorm';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { VoucherConditionType } from '../../common/enums/voucher-condition-type.enum';
import { VoucherActionType } from '../../common/enums/voucher-action-type.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateVoucherDto } from './dto/update-voucher.dto';


const mockVoucherRepository = () => ({
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
});

type MockType<T> = {
  [P in keyof T]?: jest.Mock;
};

describe('VouchersService', () => {
  let service: VouchersService;
  let repositoryMock: MockType<Repository<Voucher>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VouchersService,
        {
          provide: getRepositoryToken(Voucher),
          useFactory: mockVoucherRepository,
        },
      ],
    }).compile();

    service = module.get<VouchersService>(VouchersService);
    repositoryMock = module.get(getRepositoryToken(Voucher));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a voucher', async () => {
      const createVoucherDto: CreateVoucherDto = {
        name: 'Test Voucher',
        code: 'TESTCODE',
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        condition_type: VoucherConditionType.NONE,
        action_type: VoucherActionType.FIXED_AMOUNT,
        discount_amount: 10000,
      };

      const savedVoucher = { id: 1, ...createVoucherDto };
      repositoryMock.save.mockResolvedValue(savedVoucher);
      repositoryMock.findOne.mockResolvedValue(null); // Simulate no existing voucher
      repositoryMock.create.mockReturnValue(createVoucherDto);

      expect(await service.create(createVoucherDto)).toEqual(savedVoucher);
      expect(repositoryMock.save).toHaveBeenCalledWith(createVoucherDto);
    });

    it('should throw BadRequestException if voucher code already exists', async () => {
      const createVoucherDto: CreateVoucherDto = {
        name: 'Test Voucher',
        code: 'TESTCODE',
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 86400000).toISOString(),
      };

      repositoryMock.findOne.mockResolvedValue({ id: 1, ...createVoucherDto }); // Simulate existing voucher

      await expect(service.create(createVoucherDto)).rejects.toThrow(
        BadRequestException,
      );
    });
    it('should throw BadRequestException for invalid input', async () => {
        const invalidDto: CreateVoucherDto = {
          name: '', // Invalid: Empty name
          code: 'TESTCODE',
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 86400000).toISOString(),
        };
        repositoryMock.create.mockReturnValue(invalidDto);

        await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of vouchers', async () => {
      const mockVouchers: Voucher[] = [
        {
          id: 1,
          name: 'Voucher 1',
          code: 'CODE1',
          starts_at: new Date(),
          ends_at: new Date(),
          per_customer_limit: 1,
          total_usage_limit: 100,
          condition_type: VoucherConditionType.NONE,
          action_type: VoucherActionType.FIXED_AMOUNT,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: 'Voucher 2',
          code: 'CODE2',
          starts_at: new Date(),
          ends_at: new Date(),
          per_customer_limit: 2,
          total_usage_limit: 200,
          condition_type: VoucherConditionType.MIN_ORDER,
          min_order_amount: 50,
          action_type: VoucherActionType.PERCENTAGE,
          discount_percentage: 10,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      repositoryMock.find.mockResolvedValue(mockVouchers);
      expect(await service.findAll()).toEqual(mockVouchers);
    });
  });

  describe('findOne', () => {
    it('should retrieve a voucher by id', async () => {
      const mockVoucher: Voucher = {
        id: 1,
        name: 'Test Voucher',
        code: 'TESTCODE',
        starts_at: new Date(),
        ends_at: new Date(),
        per_customer_limit: 1,
        total_usage_limit: 100,
        condition_type: VoucherConditionType.NONE,
        action_type: VoucherActionType.FIXED_AMOUNT,
        created_at: new Date(),
        updated_at: new Date(),
      };
      repositoryMock.findOneBy.mockResolvedValue(mockVoucher);
      expect(await service.findOne(1)).toEqual(mockVoucher);
    });

    it('should throw NotFoundException if voucher is not found', async () => {
      repositoryMock.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a voucher', async () => {
        const voucherId = 1;
        const updateVoucherDto: UpdateVoucherDto = {
            name: 'Updated Voucher Name',
        };
        const existingVoucher: Voucher = {
            id: voucherId,
            name: 'Original Voucher Name',
            code: 'ORIGINALCODE',
            starts_at: new Date(),
            ends_at: new Date(),
            per_customer_limit: 1,
            total_usage_limit: 100,
            condition_type: VoucherConditionType.NONE,
            action_type: VoucherActionType.FIXED_AMOUNT,
            created_at: new Date(),
            updated_at: new Date(),
        };

        const updatedVoucher = { ...existingVoucher, ...updateVoucherDto };

        repositoryMock.findOneBy.mockResolvedValue(existingVoucher);
        repositoryMock.findOne.mockResolvedValue(null); //For check duplicate code
        repositoryMock.save.mockResolvedValue(updatedVoucher);

        const result = await service.update(voucherId, updateVoucherDto);
        expect(result).toEqual(updatedVoucher);
        expect(repositoryMock.save).toHaveBeenCalledWith(updatedVoucher);
    });

    it('should throw NotFoundException if voucher to update is not found', async () => {
        repositoryMock.findOneBy.mockResolvedValue(null);
        await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if updated code already exists', async () => {
        const voucherId = 1;
        const updateVoucherDto: UpdateVoucherDto = {
            code: 'DUPLICATECODE',
        };
        const existingVoucher: Voucher = { ...new Voucher(), id: voucherId, code: 'ORIGINAL' };
        const duplicateVoucher: Voucher = { ...new Voucher(), id: 2, code: 'DUPLICATECODE' };

        repositoryMock.findOneBy.mockResolvedValue(existingVoucher);
        repositoryMock.findOne.mockResolvedValue(duplicateVoucher); // Simulate another voucher with the same code

        await expect(service.update(voucherId, updateVoucherDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete an existing voucher', async () => {
      repositoryMock.delete.mockResolvedValue({ affected: 1 });
      await service.remove(1);
      expect(repositoryMock.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if voucher to delete is not found', async () => {
      repositoryMock.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});