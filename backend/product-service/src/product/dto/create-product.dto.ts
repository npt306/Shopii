import { IsString, IsOptional, IsNumber, IsArray, IsEnum, IsDate } from 'class-validator';
import { ProductStatus } from '../../common/productStatus.enum';
import { CreateProductClassificationTypeDto } from './create-productClassificationType.dto';
import { CreateProductDetailTypeDto } from './create-productDetailType.dto';

export class CreateProductDto {
    @IsOptional()
    @IsNumber()
    SellerID?: number;

    @IsOptional()
    @IsString()
    Name?: string;

    @IsOptional()
    @IsString()
    Description?: string;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    Categories?: number[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    Images?: string[];

    @IsOptional()
    @IsNumber()
    SoldQuantity?: number;

    @IsOptional()
    @IsNumber()
    Rating?: number;

    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;

    @IsOptional()
    @IsDate()
    CreatedAt?: Date;

    @IsOptional()
    @IsDate()
    UpdatedAt?: Date;

    @IsOptional()
    @IsString()
    CoverImage?: string;

    @IsOptional()
    @IsString()
    Video?: string;

    @IsOptional()
    @IsNumber()
    Quantity?: number;

    @IsOptional()
    @IsNumber()
    Reviews?: number;

    @IsOptional()
    @IsArray()
    classifications?: CreateProductClassificationTypeDto[];

    @IsOptional()
    @IsArray()
    details?: CreateProductDetailTypeDto[];
}