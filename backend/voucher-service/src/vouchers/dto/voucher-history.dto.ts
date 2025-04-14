import { IsInt, IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class CreateVoucherHistoryDto {
  @IsInt()
  VoucherID?: number;

  @IsInt()
  UserID?: number;

  @IsDateString()
  @IsOptional()
  UseDate?: string;

  @IsBoolean()
  isfromshop: boolean;
}
