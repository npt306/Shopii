import { IsNotEmpty, IsString } from 'class-validator';

export class BlockProductDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}