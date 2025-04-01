import { IsInt, IsISO8601, IsPositive, IsString, IsOptional } from 'class-validator';
import { Voucher } from '../entities/voucher.entity';

export class CreateUserVoucherDto {
  @IsInt()
  VoucherId: number;

  @IsInt()
  OwnerId: number;

  @IsISO8601()
  @IsOptional()
  ExpDate: string; // ISO 8601 date string

  @IsInt()
  @IsOptional()
//   @IsPositive()
  UsingTimeLeft: number;

  @IsString()
  @IsOptional()
  VoucherCode: string;
}