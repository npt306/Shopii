import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { EnvValue } from "../../env-value/envValue";

type Product = {
  id: number;
  name: string;
  price: number;
  images: string;
  soldQuantity: number;
};

const fetchProductData = async (
  setProductList: React.Dispatch<React.SetStateAction<any[]>>
) => {
  try {
    const response = await axios.get(
      `${EnvValue.API_GATEWAY_URL}/api/product/list`
    );
    setProductList(response.data.products);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const ProductDisplay = () => {
  const [product_list, setProductList] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductData(setProductList);
  }, []);

  // useEffect(() => {
  //     console.log(product_list);
  // }, [product_list]);

  return (
    <div className="relative my-5 flex flex-col items-center">
      <div className="grid grid-cols-5 gap-3 w-full mb-20">
        {product_list.map((product) => (
          <div
            key={product.id}
            className="relative group"
            onClick={() => navigate(`/detail-product/${product.id}`)}
          >
            <div className="bg-white shadow-md flex flex-col h-full justify-between relative transition-all duration-300 ease-in-out border-2 border-transparent hover:border-orange-500 cursor-pointer">
              <div className="flex flex-col justify-start flex-grow">
                <div className="px-2 flex items-center justify-center">
                  <img
                    src={product.images}
                    className="w-full h-[200px] mx-auto object-cover"
                  />
                </div>
                <div className="p-2 text-xs text-left overflow-hidden">
                  {product.name}
                </div>
              </div>

              <div className="flex flex-col px-2">
                <div className="flex gap-1">
                  <p className="text-xs border border-red-500 px-1 text-red-500">
                    Rẻ vô địch
                  </p>
                  <p className="text-xs border w-auto flex justify-center text-white bg-orange-500 px-1">
                    7% Voucher
                  </p>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <div className="flex flex-row justify-items-center items-center text-orange-500">
                    <p className="text-xs">đ: </p>
                    <p className="text-xl">{product.price}</p>
                  </div>
                  <div className="text-xs">Đã bán: {product.soldQuantity}</div>
                </div>
              </div>
            </div>
            <button className="absolute bottom-[-10] left-0 w-full py-2 bg-orange-500 text-xs text-white opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer">
              <div className="text-white">Tìm sản phẩm tương tự</div>
            </button>
          </div>
        ))}
      </div>
      <button className="px-25 py-3 flex justify-center items-center bg-white w-auto border border-gray-300 hover:bg-gray-200 transition duration-300 cursor-pointer">
        Xem Thêm
      </button>
    </div>
  );
};
