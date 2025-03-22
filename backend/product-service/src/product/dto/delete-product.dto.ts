import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteProductDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}