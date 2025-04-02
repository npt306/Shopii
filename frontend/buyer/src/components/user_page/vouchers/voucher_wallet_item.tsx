import "../../../css/user/vouchers.css";
import { useState } from "react";
import axios from "axios";
import { CiClock2 } from "react-icons/ci";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";
import {Voucher} from "./vouchers_interfaces"
import { EnvValue } from "../../../env-value/envValue";

export const VoucherItem: React.FC<{ voucher: Voucher; userId: number }> = ({
    voucher,
    userId,
  }) => {
    // const formattedEndsAt = format(parseISO(voucher.ends_at), "dd/MM/yyyy HH:mm");
    const formattedStartsAt = format(
      parseISO(voucher.starts_at),
      "dd/MM/yyyy HH:mm"
    );
    const usedPercentage = Math.floor(
      ((voucher.total_usage_limit - voucher.total_uses_left) /
        voucher.total_usage_limit) *
        100
    );
    const [claimed, setClaimed] = useState(false);
    const handleClaimVoucher = async (voucherId: number) => {
      try {
        const response = await axios.post(
          `${EnvValue.API_GATEWAY_URL}/api/vouchers/claim`,
          { OwnerId: userId, VoucherId: voucherId }
        );
        console.log(response.data);
        if (response.data === true) {
          toast.success("Đã nhận đươc voucher");
          setClaimed(true);
        } else {
          toast.error("Chưa nhận được voucher");
          setClaimed(true);
        }
      } catch (error) {
        console.error("Cant claim voucher", error);
      }
    };
    return (
      <div className={`voucher-item w-full ${claimed && "!hidden"} pr-1`}>
        <div className="voucher-badge">x{voucher.per_customer_limit}</div>
        <div className="voucher-img w-[120px] flex flex-col">
          <img
            width={56}
            // height={80}
            src="https://down-vn.img.susercontent.com/file/e6a3b7beffa95ca492926978d5235f79"
            alt="Voucher"
          />
          <div className="text-xs text-white">SHOPEE</div>
        </div>
        <div className="voucher-content">
          <div className="text-lg font-medium">{voucher.name}</div>
          <div className="text-base font-normal">{voucher.code}</div>
          <div className="text-sm font-normal">{voucher.description}</div>
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
          onClick={() => handleClaimVoucher(voucher.id)}
        >
          Dùng Sau
        </button>
      </div>
    );
  };