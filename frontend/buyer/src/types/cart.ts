type Classification = {
  type_id: number;
  type_1?: string;
  type_2?: string;
  image: string;
  price: number;
  quantity: number;
};

type Product = {
  productId: number;
  productName: string;
  productTypeId: number;
  type1?: string;
  type2?: string;
  image: string;
  price: number;
  quantity: number;
  availableQuantity: number;
  details?: Classification[];
};

export type Cart = {
  shopName: string;
  sellerId: number;
  items: Product[];
};
