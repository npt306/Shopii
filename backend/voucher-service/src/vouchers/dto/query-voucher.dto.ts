import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';

export enum VoucherStatusQuery {
  ACTIVE = 'active',
  UPCOMING = 'upcoming',
  EXPIRED = 'expired',
}

export class QueryVoucherDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // Limit max items per page
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(Object.values(VoucherStatusQuery))
  status?: VoucherStatusQuery;
}