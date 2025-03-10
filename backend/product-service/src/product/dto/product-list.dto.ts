export class ProductListItemDto {
    id: number
    name: string;
    images: string;
    price: number;
    soldQuantity: number;
}

export class ProductListDto {
    products: ProductListItemDto[];
}