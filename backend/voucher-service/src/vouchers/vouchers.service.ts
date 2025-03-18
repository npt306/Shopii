import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { Voucher } from './entities/voucher.entity';

@Injectable()
export class VouchersService {
  constructor(
    @InjectRepository(Voucher)
    private vouchersRepository: Repository<Voucher>,
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
    const voucher = await this.vouchersRepository.findOneBy({id});
    if (!voucher) {
      throw new NotFoundException(`Voucher with ID ${id} not found`);
    }
    return voucher;
  }

  async update(id: number, updateVoucherDto: UpdateVoucherDto): Promise<Voucher> {
    const voucher = await this.vouchersRepository.findOneBy({id});
    if (!voucher) {
      throw new NotFoundException(`Voucher with ID ${id} not found`);
    }

    // Check if the updated code already exists (excluding the current voucher)
    if (updateVoucherDto.code && updateVoucherDto.code !== voucher.code) {
      const existingVoucher = await this.vouchersRepository.findOne({
        where: { code: updateVoucherDto.code },
      });
      if (existingVoucher) {
        throw new BadRequestException('A voucher with this code already exists.');
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
}