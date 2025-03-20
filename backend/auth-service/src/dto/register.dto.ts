import { IsEmail } from 'class-validator';

export class MinimalRegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}
