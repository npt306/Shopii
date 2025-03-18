import { IsString, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductDimensionsDto } from './create-product-dimensions.dto';

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

    @ValidateNested()
    @Type(() => CreateProductDimensionsDto)
    Dimension: CreateProductDimensionsDto;
}