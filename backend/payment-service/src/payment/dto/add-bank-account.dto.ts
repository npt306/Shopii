import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional, MaxLength, IsInt } from 'class-validator';

export class AddBankAccountDto {
  @IsNotEmpty()
  @IsInt()
  sellerId: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  bankName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  accountNumber: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  accountHolderName: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
