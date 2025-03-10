import { ClassificationDto } from './classification.dto';
import { ProductDetailDto } from './product-detail.dto';

export class ProductDto {
    name: string;
    description: string;
    categories: string[];
    images: string[];
    soldQuantity: number;
    rating: number;
    coverImage: string;
    video: string;
    quantity: number;
    reviews: number;
    classifications: ClassificationDto[];
    details: ProductDetailDto[];
  }
  