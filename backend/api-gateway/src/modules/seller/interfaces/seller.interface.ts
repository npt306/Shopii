import { Observable } from 'rxjs';

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
}

export interface SellerGrpcService {
  getSeller(data: GetSellerRequest): Observable<SellerResponse>;
}