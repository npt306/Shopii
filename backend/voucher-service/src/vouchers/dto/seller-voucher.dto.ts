import {
  IsString,
  IsInt,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  MaxLength,
  MinLength,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class SellerVoucherDto {
  @IsString()
  @MinLength(5)
  @MaxLength(5)
  code: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  name: string;

  @IsEnum(['shop_wide', 'product_specific'])
  voucher_type: 'shop_wide' | 'product_specific';

  @IsEnum(['percentage', 'fixed_amount'])
  discount_type: 'percentage' | 'fixed_amount';

  @IsNumber()
  discount_value: number;

  @IsNumber()
  @IsOptional()
  min_order: number;

  @IsInt()
  max_usage: number;

  @IsInt()
  usage_per_user: number;

  @IsDateString()
  starts_at: string;

  @IsDateString()
  ends_at: string;

  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @IsArray()
  // @ArrayNotEmpty()
  @IsInt({ each: true })
  @IsOptional()
  product_id: number[];

  @IsInt()
  sellerid: number;

  @IsInt()
  used: number;
  
}
