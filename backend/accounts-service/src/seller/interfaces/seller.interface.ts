export interface GetSellerRequest {
  id: number;
}

export interface SellerResponse {
  id: number;
  shopName: string;
  taxCode: number;
  sellerType: string;
  email: string[];
  followers: number;
  createdAt: string;
  updatedAt: string;
}