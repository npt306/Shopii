import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductOrderData {
  @IsString()
  productTypeId: string;

  @IsString()
  image: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  type_1?: string;

  @IsOptional()
  @IsString()
  type_2?: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}

export class OrderData {
  @IsString()
  shopId: string;

  @IsString()
  shopName: string;

  @IsString()
  message: string;

  @IsNumber()
  totalPrice: number;

  @IsBoolean()
  isPaid: boolean;

  @IsString()
  paymentMethod: string;
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductOrderData)
  products: ProductOrderData[];
}

// The input is an array of shop orders
export class CreateOrderDto extends Array<OrderData> {
  @ValidateNested({ each: true })
  @Type(() => OrderData)
  items: OrderData[];
}
