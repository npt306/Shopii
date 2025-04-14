export interface ProductDTO {
    id: number;
    Name: string;
    Description: string;
    Categories: string[];
    SellerID: string;
    Images: string[];
    Price: number;
    Address: string;
    SoldQuantity: number;
    StockQuantity: number;
    Review: string;
    Rating: number;
    Status: string;
    CreatedAt: Date;
    UpdatedAt: Date;
  }