import { IsInt, IsISO8601, IsPositive, IsString, IsOptional, IsBoolean } from 'class-validator';
export class CreateUserVoucherDto {
  @IsInt()
  @IsOptional()
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

  @IsBoolean()
  @IsOptional()
  isfromshop: boolean;
}