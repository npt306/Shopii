import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateProductDetailTypeDto {
    @IsOptional()
    @IsNumber()
    ProductID?: number;

    @IsOptional()
    @IsString()
    Type_1?: string;

    @IsOptional()
    @IsString()
    Type_2?: string;

    @IsString()
    Image: string;

    @IsNumber()
    Price: number;

    @IsNumber()
    Quantity: number;

    @IsOptional()
    @IsNumber()
    Dimension?: number;
}