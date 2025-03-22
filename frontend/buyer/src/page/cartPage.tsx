import { HeaderCart } from "../components/headerCart";
import { Footer } from "../components/footer";
import { FaCommentDots, FaChevronDown, FaTicketAlt } from "react-icons/fa";
import { useState } from "react";
// import { QuantitySelector } from "./common/quantitySelector";

const products = [
  {
    type: "Ghế văn phòng 1",
    img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lp09rsokn9e6e7@resize_w450_nl.webp",
  },
  {
    type: "Ghế văn phòng 2",
    img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lowegop2zgb2be@resize_w450_nl.webp",
  },
  {
    type: "Ghế văn phòng 3",
    img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lowegop2zgb2be@resize_w450_nl.webp",
  },
];

export const CartPage = () => {
  const [isDnTypeProductOpen, setIsDnTypeProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(products[0]);

  const selectedItem = {
    quantity: 100,
  };

  // set quantity selector
  const [quantity, setQuantity] = useState(1);
  const increase = () => {
    if (selectedItem != null) {
      if (quantity < selectedItem?.quantity) setQuantity(quantity + 1);
    }
  };

  const decrease = () => {
    if (selectedItem != null) {
      if (quantity >= 2) setQuantity(quantity - 1);
    }
  };

  const handleConfirmSelection = () => {
    setIsDnTypeProductOpen(false); // Đóng dropdown
  };
  return (
    <>
      <HeaderCart />
      <div className="mx-30 p-5 mt-5 bg-white flex flex-row items-center justify-between ">
        <div className="flex flex-row items-center justify-items-center gap-5">
          <input
            type="checkbox"
            className="w-4 h-4 appearance-none border border-black checked:bg-orange-500 checked:border-orange-500 relative
             before:content-['✔'] before:absolute before:inset-0 before:flex before:items-center before:justify-center
             before:text-white before:opacity-0 checked:before:opacity-100"
          />
        </div>
        <div className="flex flex-row pl-5 items-center w-[40%]">
          <p className="">Sản phẩm</p>
        </div>
        <div className="relative flex flex-row justify-evenly items-center w-[60%]">
          <p className="absolute left-29 text-center">Đơn giá</p>
          <p className="absolute left-74.5 text-center">Số lượng</p>
          <p className="absolute right-58 text-center">Số tiền</p>
          <p className="absolute right-12 text-center">Thao tác</p>
        </div>
      </div>

      <div className="mx-30 mt-5 bg-white flex flex-col">
        <div className="">
          <div className="flex flex-row items-center gap-3 px-5 py-1">
            <input
              type="checkbox"
              className="w-4 h-4 appearance-none border border-black checked:bg-orange-500 checked:border-orange-500 relative
             before:content-['✔'] before:absolute before:inset-0 before:flex before:items-center before:justify-center
             before:text-white before:opacity-0 checked:before:opacity-100"
            />
            <p className="font-bold text-base">Qing Qing</p>
            <div className="text-orange-500 cursor-pointer">
              <FaCommentDots className="text-[1.2rem]" />
            </div>
          </div>

          <div className="w-full h-0.5 bg-gray-200"></div>

          <div className="p-5 flex flex-row items-center justify-items-center">
            <input
              type="checkbox"
              className="w-4 h-4 appearance-none border border-black checked:bg-orange-500 checked:border-orange-500 relative
             before:content-['✔'] before:absolute before:inset-0 before:flex before:items-center before:justify-center
             before:text-white before:opacity-0 checked:before:opacity-100"
            />

            <div className="flex flex-row justify-around items-center w-[40%]">
              <img src={selectedProduct.img} className="w-35 h-30" />
              <p className="">{selectedProduct.type}</p>

              <div className="relative">
                <div
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => setIsDnTypeProductOpen(!isDnTypeProductOpen)}
                >
                  <div className="flex flex-col">
                    <span>Phân loại hàng:</span>
                    <span>{selectedProduct.type}</span>
                  </div>
                  <FaChevronDown
                    size={12}
                    className={`transition-transform duration-300 ${
                      isDnTypeProductOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {isDnTypeProductOpen && (
                  <div className="absolute flex flex-wrap gap-x-4 border w-100 bg-white p-2 shadow-md">
                    <div>Loại ghế</div>
                    {products.map((product) => (
                      <div
                        key={product.type}
                        className={`p-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-100 transition ${
                          selectedProduct.type === product.type
                            ? "bg-gray-200"
                            : ""
                        }`}
                        onClick={() => setSelectedProduct(product)}
                      >
                        {product.type}
                      </div>
                    ))}
                    <button
                      className="mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={handleConfirmSelection}
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-row justify-between items-center w-[60%] pl-20">
              <div className="flex flex-row justify-center items-center">
                <div className="flex flex-row items-center text-gray-400 line-through mr-1">
                  <div className="underline underline-offset-2">đ</div>
                  <div className="">748.500</div>
                </div>

                <div className="flex flex-row items-center text-black">
                  <div className="underline underline-offset-2">đ</div>
                  <div className="">480.000</div>
                </div>
              </div>

              {/* <QuantitySelector size="small" /> */}
              <div className="flex flex-row items-center gap-3">
                <div className="flex justify-items-center items-center">
                  <button
                    className={`bg-gray-200 border border-gray-400 hover:bg-gray-200 transition px-4 py-3 w-5 h-6 flex justify-center items-center`}
                    onClick={decrease}
                  >
                    <div className="text-base">-</div>
                  </button>

                  <div className="flex justify-center items-center px-4 py-2 w-10 h-10">
                    {quantity}
                  </div>

                  <button
                    className={`bg-gray-200 border border-gray-400 transition px-4 py-3 w-5 h-6 flex justify-center items-center`}
                    onClick={increase}
                  >
                    <div className="text-base">+</div>
                  </button>
                </div>
              </div>

              <div className="flex flex-row items-center text-orange-500">
                <div className="underline underline-offset-2">đ</div>
                <div className="">480.0000000</div>
              </div>

              <div className="flex flex-col p-3">
                <p className="text-center">Xoá</p>
                <div className="text-orange-500 flex flex-row justify-center items-center w-30 text-center">
                  Tìm sản phẩm tương tự
                  <FaChevronDown
                    size={12}
                    className={`transition-transform duration-300 ${
                      isDnTypeProductOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-0.5 bg-gray-200"></div>

        <div className="p-5 flex flex-row gap-7 justify-start items-center">
          <FaTicketAlt size={20} className="text-orange-500" />
          <p className="text-blue-500">Thêm Shop Voucher</p>
        </div>

        <div className="w-full h-0.5 bg-gray-200"></div>
      </div>

      <div className="mx-30 mt-5 bg-white flex flex-col">
        <div className="flex flex-row gap-7 justify-between items-center h-auto">
          <div className="flex flex-row items-center gap-3 p-5">
            <input
              type="checkbox"
              className="w-4 h-4 accent-white text-orange-500"
            />
            <p>Chọn tất cả (5)</p>
            <p>Xóa</p>
          </div>

          <div className="flex flex-row items-center gap-3 p-5">
            <p>Tổng thanh toán (1 sản phẩm):</p>
            <div className="flex flex-row">
              <div className="flex flex-col gap-1 items-center text-orange-500 mt-5">
                <div className="flex flex-row items-center gap-1">
                  <div className="underline underline-offset-2 text-xs">đ</div>
                  <div className="text-2xl text-center">480.000</div>
                </div>
                <div className="flex flex-row items-center">
                  <div className="text-xs text-black mr-2">Tiết kiệm</div>
                  <div className="underline underline-offset-2 text-xs mr-0.5">
                    đ
                  </div>
                  <div className="text-xs text-orange-500">34k</div>
                </div>
              </div>
            </div>
            <button className="w-30 h-10 bg-orange-500 text-white">
              Mua hàng
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
