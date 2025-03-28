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

export interface VoucherHistory {
  id: number;
  VoucherId: number;
  voucher: Voucher;
  UserId: number;
  UseDate?: string;
}
