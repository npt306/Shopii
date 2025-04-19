import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, MaxLength,IsInt, IsIn, IsUUID } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  checkoutSessionId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(10000)
  amount: number;

  @IsOptional()
  @IsInt()
  sellerId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  orderInfo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  bankCode?: string;

  @IsOptional()
  @IsString()
  @IsIn(['vn', 'en'])
  language?: 'vn' | 'en';
}
