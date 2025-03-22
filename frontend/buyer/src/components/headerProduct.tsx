import { useNavigate } from "react-router";
import logoShopee from "../assets/logo_shopee_1.png";
import { FaShoppingCart, FaSearch } from "react-icons/fa";
import { Header } from "./header";

export const HeaderProduct = () => {
  let navigate = useNavigate();
  return (
    <>
      <Header />
      <div className="bg-orange-500 px-30 flex justify-center items-center text-white">
        <div className="flex justify-center items-center cursor-pointer mr-10">
          <img
            src={logoShopee}
            alt="Avatar"
            className="w-15 h-15 rounded-full pb-1"
          />
          <span className="text-3xl">Shopee</span>
        </div>

        <div className="relative w-[1024px] text-black">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm"
            className="w-[95%] h-[2.8rem] px-4 py-2 bg-white border border-white rounded-md focus:border-black focus:outline-hidden"
          />
          <button className="absolute w-[4rem] h-[2.3rem] right-14 top-1/2 -translate-y-1/2 bg-orange-500 px-3 py-2 cursor-pointer flex justify-center items-center rounded-md">
            <FaSearch className="text-white text-[1.1rem]" />
          </button>
        </div>

        <div
          onClick={() => navigate("/cart")}
          className="relative cursor-pointer"
        >
          <FaShoppingCart size={24} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            3
          </span>
        </div>
      </div>
    </>
  );
};
