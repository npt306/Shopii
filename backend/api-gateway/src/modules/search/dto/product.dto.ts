export interface ProductDocument {
    ProductID: number;
    SellerID: number;
    Name: string;
    Description: string;
    Categories: string[];
    Images: string[];
    SoldQuantity: number;
    Rating: number;
    Status: string;
    CreatedAt: Date;
    UpdatedAt: Date;
    CoverImage: string;
    Video?: string;
    Quantity: number;
    Reviews: number;
  }