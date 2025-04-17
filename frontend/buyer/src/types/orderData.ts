export type ProductOrderData = {
  productTypeId: string;
  image: string;
  name: string;
  type_1?: string;
  type_2?: string;
  quantity: number;
  price: number;
};

export type OrderData = {
  shopId: string;
  shopName: string;
  message: string;
  totalPrice?: number;
  isPaid: boolean;
  products: ProductOrderData[];
};
