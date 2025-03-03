import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsEnum,
  ValidateIf,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { VoucherConditionType } from '../../common/enums/voucher-condition-type.enum';
import { VoucherActionType } from '../../common/enums/voucher-action-type.enum';

export class CreateVoucherDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  starts_at: string;

  @IsDateString()
  @IsNotEmpty()
  ends_at: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  per_customer_limit?: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  total_usage_limit?: number = 100;

  @IsEnum(VoucherConditionType)
  @IsOptional()
  condition_type?: VoucherConditionType = VoucherConditionType.NONE;

  @IsInt()
  @Min(0)
  @ValidateIf((o) => o.condition_type === VoucherConditionType.MIN_ORDER)
  min_order_amount?: number;

  @IsInt()
  @Min(1)
  @ValidateIf((o) => o.condition_type === VoucherConditionType.MIN_PRODUCTS)
  min_products?: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @ValidateIf((o) => o.condition_type === VoucherConditionType.SPECIFIC_PRODUCTS)
  product_ids?: number[]; // IDs of specific products

  @IsEnum(VoucherActionType)
  @IsOptional()
  action_type?: VoucherActionType = VoucherActionType.FIXED_AMOUNT;

  @IsInt()
  @Min(0)
  @ValidateIf((o) => o.action_type === VoucherActionType.FIXED_AMOUNT)
  discount_amount?: number;

  @IsInt()
  @Min(0)
  @Max(100)
  @ValidateIf((o) =>
    o.action_type === VoucherActionType.PERCENTAGE ||
    o.action_type === VoucherActionType.PRODUCT_PERCENTAGE
  )
  discount_percentage?: number;

  @IsInt()
  @Min(0)
  @ValidateIf((o) => o.action_type === VoucherActionType.FREE_SHIPPING)
  free_shipping_max?: number;  // Maximum shipping amount to be discounted

  @IsInt()
  @Min(1)
  @ValidateIf((o) => o.action_type === VoucherActionType.BUY_X_GET_Y)
    buy_x_amount?: number;

  @IsInt()
  @Min(1)
  @ValidateIf((o) => o.action_type === VoucherActionType.BUY_X_GET_Y)
    get_y_amount?: number;
}