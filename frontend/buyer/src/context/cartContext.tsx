import { createContext, useContext, useState, useEffect } from "react";
import { BasicSellerCart, BasicCart } from "../types/basicCart";
import axios from "axios";
import { EnvValue } from "../env-value/envValue";
import { Account } from "../types/account";

type CartContextType = {
  cartData: any[];
  numberItem: number;
  loading: boolean;
  res: Account;
  updateCart: () => void; // Hàm để cập nhật giỏ hàng
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartData, setCartData] = useState<BasicSellerCart[]>([]);
  const [numberItem, setNumberItem] = useState(0);
  const [loading, setLoading] = useState(true);

  const res: Account = localStorage.getItem("userProfile")
    ? JSON.parse(localStorage.getItem("userProfile")!)
    : null;

  const updateCart = async () => {
    if (res) {
      console.log("update basic cart.");
      try {
        setLoading(true);
        const response = await axios.get<BasicCart>(
          `${EnvValue.API_GATEWAY_URL}/order/carts/basic/${res?.accountId}`
        );
        setCartData(response.data.res);
        setNumberItem(response.data.numberItem);
      } catch (error) {
        console.error("Error fetching product detail:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  //   useEffect(() => {
  //     console.log(cartData, numberItem, loading, res);
  //     updateCart(); // Khi component mount, lấy dữ liệu giỏ hàng
  //   }, []);

  return (
    <CartContext.Provider
      value={{ cartData, numberItem, loading, res, updateCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook để sử dụng Context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
