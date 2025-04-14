import "../../../../css/user/vouchers.css";
// import { useState } from "react";
import { CiClock2 } from "react-icons/ci";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";
import {SellerVoucher} from "../vouchers_interfaces"

export const SellerVoucherItem: React.FC<{ voucher: SellerVoucher; userId: number }> = ({
    voucher,
    userId,
  }) => {
    // const formattedEndsAt = format(parseISO(voucher.ends_at), "dd/MM/yyyy HH:mm");
    const formattedStartsAt = format(
      parseISO(voucher.starts_at),
      "dd/MM/yyyy HH:mm"
    );
    const usedPercentage = Math.floor(
      (voucher.used /
        voucher.max_usage) *
        100
    );
    const handleClaimVoucher = async () => {
      toast.info("Đã nhận voucher, không thể nhận lại");
      
    };
    return (
      <div className={`voucher-item w-full pr-1`}>
        <div className="voucher-badge">x{voucher.usage_per_user}</div>
        <div className="voucher-img w-[120px] flex flex-col">
          <img
            width={56}
            // height={80}
            src="https://down-vn.img.susercontent.com/file/e6a3b7beffa95ca492926978d5235f79"
            alt="Voucher"
          />
          <div className="text-xs text-white">TÊN SHOP</div>
        </div>
        <div className="voucher-content">
          <div className="text-lg font-medium"> Giảm {voucher.discount_value}{voucher.discount_type === 'percentage' ? "%" : "₫"}</div>
          <div className="text-base font-normal">Đơn tối thiểu {voucher.min_order}₫</div>
          <div className="text-sm font-normal">{voucher.voucher_type === 'shop_wide' ? "Tất cả sản phẩm" : "Sản phẩm nhát định"}</div>
          <div className="progress-bar border border-orange-300 rounded-2xl">
            <div
              className="progress-fill text-center !text-xs text-white items-center "
              style={{ width: `${usedPercentage}%` }}
            >
              {/* {usedPercentage}% */}
            </div>
          </div>
          <div className="text-xs text-gray-500 flex items-center">
            <CiClock2 className="mr-1 font-medium" /> Có hiệu lực từ:{" "}
            {formattedStartsAt}
          </div>
          {/* <div className="text-xs text-gray-500">HSD: {formattedEndsAt}</div> */}
        </div>
        <button
          className="border border-orange-600 !text-orange-600 leading-[0.875rem] mr-4 w-14 px-2 py-0.75 !text-xs rounded-xs shadow"
          onClick={() => handleClaimVoucher()}
        >
          Dùng Sau
        </button>
      </div>
    );
  };