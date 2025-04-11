import { useState } from "react";
import { VoucherTable } from "./VoucherTable/VoucherTable";
import { AddVoucherPage } from "./AddVoucherForm/AddVoucherPage";
import { ToastContainer } from "react-toastify";

export const ShopVoucherPage = () => {
  const [selectedTab, setSelectedTab] = useState("Danh sách mã giảm giá");
  const handleTabClick = (tab: string) => {
    setSelectedTab(tab);
  };

  return (
    <div className="shop-voucher-container min-h-[120vh]">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="start-container flex bg-white rounded m-5 pl-10 py-6 pr-2">
        <div className="flex flex-col text-black gap-1 pr-9">
          <div className="text-3xl font-semibold mb-3">
            Tạo ngay Voucher ngay để tăng đơn hàng cho Shop của bạn!
          </div>
          <div className="">
            Cơ hội tăng đến <span className="text-orange-600">43%</span> đơn
            hàng và <span className="text-orange-600">28%</span> doanh thu khi
            tạo Voucher ưu đãi cho Khách hàng.
          </div>
          <button
            className=" flex bg-orange-600 items-center justify-center text-white text-xl font-normal rounded"
            onClick={() => handleTabClick("Tạo Voucher")}
          >
            Tạo Voucher ngay!{" "}
            <svg
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="ml-1 w-[26px]"
            >
              <path
                d="M3.333 14C3.333 8.12 8.12 3.333 14 3.333S24.667 8.12 24.667 14 19.88 24.667 14 24.667 3.333 19.88 3.333 14zM.667 14C.667 21.36 6.64 27.333 14 27.333S27.333 21.36 27.333 14 21.36.667 14 .667.667 6.64.667 14zM14 12.667H8.667v2.666H14v4L19.333 14 14 8.667v4z"
                fill="#fff"
              ></path>
            </svg>
          </button>
        </div>
        <div className="flex">
          <img src="https://deo.shopeemobile.com/shopee/shopee-seller-live-sg/mmf_portal_seller_root_dir/static/modules/vouchers/image/create-now.86f9b13.png" />
        </div>
      </div>
      <div className="voucher-container flex flex-col bg-white rounded m-5 p-3">
        {/* Folder-like Tabs */}
        <div className="flex text-nowrap">
          <button
            className={`flex-1 p-2 bg-white focus:outline-none focus:ring-0 border-b-0 hover:border-orange-600 rounded-none ${
              selectedTab === "Danh sách mã giảm giá"
                ? "border border-gray-200 text-orange-600"
                : "text-gray-400"
            }`}
            onClick={() => handleTabClick("Danh sách mã giảm giá")}
          >
            Danh sách mã giảm giá
          </button>

          <button
            className={`flex-1 p-2 bg-white focus:outline-none focus:ring-0 border-b-0 hover:border-orange-600 rounded-none ${
              selectedTab === "Tạo Voucher"
                ? "border border-gray-200 text-orange-600"
                : "text-gray-400"
            }`}
            onClick={() => handleTabClick("Tạo Voucher")}
          >
            Tạo Voucher
          </button>
        </div>

        <hr className=""></hr>

        {/* Content Area */}
        <div className="p-4">
          {selectedTab === "Danh sách mã giảm giá" ? (
            <VoucherTable />
          ) : (
            <AddVoucherPage />
          )}
        </div>
      </div>
    </div>
  );
};
