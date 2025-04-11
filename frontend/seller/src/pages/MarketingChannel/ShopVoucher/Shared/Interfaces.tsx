export interface SellerProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selected: number[];
  onConfirm: (selectedProductIds: number[]) => void;
}
export interface EditVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherData: SellerVoucher; // Replace `any` with the appropriate type for voucher data
  onSave: () => void; // Callback to refresh the voucher list after saving
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
}

export interface Product {
  productID: number;
  name: string;
  description: string;
  categories: string[];
  images: string[];
  soldQuantity: number;
  rating: string;
  coverImage: string;
  video: string;
  quantity: number;
  reviews: number;
  classifications: Classification[];
  details: ProductDetail[];
}

export interface Dimension {
    weight: string;
    length: string;
    width: string;
    height: string;
}

export interface ProductDetail {
    type_id: number;
    type_1: string;
    type_2: string;
    image: string;
    price: number;
    quantity: number;
    dimension: Dimension;
}

export interface Classification {
    classTypeName: string;
    level: number;
}