export type BasicItem = {
  image: string;
  price: number;
  productId: number;
  productName: string;
  productTypeId: number;
};

export type BasicSellerCart = {
  items: BasicItem[];
  sellerId: number;
};

export type BasicCart = {
  res: BasicSellerCart[]; // Danh sách nhiều seller
  numberItem: number;
};
