export interface VoucherWalletProps {
  userId: number;
}
export interface Voucher {
  id: number;
  starts_at: string; // ISO date string
  ends_at: string; // ISO date string
  name: string;
  per_customer_limit: string;
  description?: string;
  code: string;
  UseDate?: string;
  total_usage_limit: number;
  total_uses_left: number;
}


export interface SellerVoucher {
  id?: number;
  name: string;
  code: string;
  voucher_type: "shop_wide" | "product_specific";
  discount_type: "percentage" | "fixed_amount";
  discount_value: number;
  min_order: number;
  max_usage: number;
  usage_per_user: number;
  starts_at: string;
  ends_at: string;
  is_public: boolean;
  sellerid: number;
  product_id: number[];
  used: number;
  UseDate?: string;
}
export interface VoucherHistory {
  id: number;
  VoucherId: number;
  voucher: Voucher | SellerVoucher;
  UserId: number;
  UseDate?: string;
  isfromshop: boolean;
}
