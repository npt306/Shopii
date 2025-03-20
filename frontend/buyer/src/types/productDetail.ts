export type ProductDetail = {
  name: string;
  description: string;
  categories: string[];
  images: string[];
  soldQuantity: number;
  rating: number;
  coverImage: string;
  video: string;
  quantity: number | null;
  reviews: number;
  classifications: {
    classTypeName: string;
    level: number;
  }[];
  details: {
    type_1: string;
    type_2: string;
    image: string;
    price: number;
    quantity: number;
  }[];
};
