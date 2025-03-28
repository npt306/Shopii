export class AdminProductListItemDto {
    id: number;
    name: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    minPrice: number;
    maxPrice: number;
  }
  
  export class AdminProductListDto {
    products: AdminProductListItemDto[];
    total: number;
    page: number;
    limit: number;
  }