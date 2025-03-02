import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateProductClassificationTypeDto {
    @IsNumber()
    ProductID: number;

    @IsString()
    ClassTypeName: string;

    @IsOptional()
    @IsNumber()
    Level?: number;
}