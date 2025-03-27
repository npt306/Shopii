import logoShopee from "../assets/logo_shopee_2.png";
import { FaSearch } from "react-icons/fa";
import { Header } from "./header";

export const HeaderCart = () => {
  return (
    <>
      <Header />
      <div className="px-30 flex justify-between items-center text-[#ee4d2d] bg-white">
        <div className="flex justify-center items-center cursor-pointer p-5 text-[#ee4d2d]">
          <img src={logoShopee} alt="Avatar" className="w-15 h-15 pb-1" />
          <span className="text-3xl">Shopee</span>
          <div className="w-[1px] h-10 bg-[#ee4d2d] mx-5"></div>
          <div className="text-2xl">Giỏ hàng</div>
        </div>

        <div className="relative w-1/2 px-2 h-[3rem] text-black border-2 border-[#ee4d2d] flex justify-items-start items-center">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm"
            className="w-[91%] h-[80%] px-4 py-2 bg-white border border-white focus:border-black focus:outline-hidden"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#ee4d2d] px-3 py-2 h-[2rem] cursor-pointer w-12 flex justify-center items-center">
            <FaSearch className="text-white" />
          </button>
        </div>
      </div>
    </>
  );
};
