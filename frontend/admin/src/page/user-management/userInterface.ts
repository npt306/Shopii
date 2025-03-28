export default interface User {
  AccountId: number;
  Email: string;
  Username: string;
  Avatar?: string | null;
  DoB: string;
  PhoneNumber: string;
  Sex: boolean;
  roles: string[];
  Status: 'active' | 'inactive' | 'pending' | string;
  CreatedAt: string;
  UpdatedAt: string;
  seller?: {
    id: number;
    ShopName: string;
    TaxCode: number;
    SellerType: string;
    Email: string[];
    Followers: number;
    CreatedAt: string;
    UpdatedAt: string;
  };
  address?: {
    AddressId: number;
    Fullname: string;
    PhoneNumber: string;
    Province: string;
    District: string;
    Ward: string;
    SpecificAddress: string;
    CreatedAt: string;
    UpdatedAt: string;
    AccountId: number;
    IsDefault: boolean;
  };
}