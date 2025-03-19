import { IsNumber } from 'class-validator';

export class CreateProductDimensionsDto {
    @IsNumber()
    Weight: number;

    @IsNumber()
    Length: number;

    @IsNumber()
    Width: number;

    @IsNumber()
    Height: number;
}