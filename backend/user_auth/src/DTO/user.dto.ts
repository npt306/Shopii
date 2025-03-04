import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
    IsDateString,
    IsPhoneNumber,
  } from 'class-validator';

export class UserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsDateString()
    date_of_birth?: string;

    @IsPhoneNumber()
    phoneNumber?: string;

    @IsString()
    status?: string;

    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsString()
    sex?: string;
  }