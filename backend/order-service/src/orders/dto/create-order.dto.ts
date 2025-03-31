import { IsNotEmpty, IsNumber, IsString, IsArray, ValidateNested, IsEnum, IsOptional, Min, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../common/enums';

class CreateOrderItemDto {
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @IsNotEmpty()
  @IsInt()
  productTypeId: number;

  @IsNotEmpty()
  @IsString()
  productName: string; // Include name for storage

  @IsOptional()
  @IsString()
  variation1?: string;

  @IsOptional()
  @IsString()
  variation2?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  priceAtTime: number; // Price per item

  @IsOptional()
  @IsString()
  productImage?: string;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsInt()
  customerId: number;

  @IsNotEmpty()
  @IsString() // Store address as string/JSON for simplicity, or use addressId
  shippingAddress: string;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalAmount: number; // Frontend should calculate and send final total

  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingFee?: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number = 0;

  @IsOptional()
  @IsString()
  voucherCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}