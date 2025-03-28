import {
  IsInt,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsPhoneNumber,
  IsBoolean,
} from 'class-validator';

export class UserDto {
  @IsInt()
  AccountId: number;

  @IsEmail()
  @IsNotEmpty()
  Email: string;

  @IsString()
  @IsNotEmpty()
  Username: string;

  @IsOptional()
  @IsString()
  Avatar?: string;

  @IsOptional()
  @IsDateString()
  DoB?: Date;

  @IsOptional()
  @IsPhoneNumber()
  PhoneNumber?: string;

  @IsOptional()
  @IsBoolean()
  Sex?: boolean;

  @IsString()
  @IsNotEmpty()
  Status: string;
  
}