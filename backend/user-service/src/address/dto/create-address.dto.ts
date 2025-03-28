import {
    IsString,
    IsNotEmpty,
    IsBoolean,
    IsOptional,
    IsNumber,
  } from 'class-validator';
  
  export class CreateAddressDto {
    @IsString()
    @IsNotEmpty()
    FullName: string;
  
    @IsString()
    @IsNotEmpty()
    PhoneNumber: string;
  
    @IsString()
    @IsNotEmpty()
    Province: string;
  
    @IsString()
    @IsNotEmpty()
    District: string;
  
    @IsString()
    @IsNotEmpty()
    Ward: string;
  
    @IsString()
    @IsNotEmpty()
    SpecificAddress: string;
  
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean; // optional, defaults to false if not provided
  
    // These are optional because they're usually set automatically
    @IsOptional()
    CreatedAt?: Date;
  
    @IsOptional()
    UpdatedAt?: Date;
  
    @IsNumber()
    AccountId: number;
  }