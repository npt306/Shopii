import "../../../../css/user/vouchers.css";
import { format, parseISO } from "date-fns";
import { SellerVoucher } from "../vouchers_interfaces";

export const SellerVoucherItem: React.FC<{ voucher: SellerVoucher; state: string }> = ({
  voucher,
  state,
}) => {
  return (
    <div className="voucher-item w-full">
      {state === "Đã Sử Dụng" && <div className="gray-badge">Đã sử dụng</div>}
      {state === "Hết Hiệu Lực" && (
        <div className="gray-badge">Hết lượt sử dụng</div>
      )}
      {state === "Đã Nhận" && (
        <div className="voucher-badge">x{voucher.usage_per_user}</div>
      )}

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
        {state === "Đã Sử Dụng" && (
          <div className="text-xs text-gray-500">
            Ngày sử dụng:{" "}
            {voucher.UseDate &&
              format(parseISO(voucher.UseDate), "dd/MM/yyyy HH:mm")}
          </div>
        )}
        {state !== "Đã Sử Dụng" && (
          <div className="text-xs text-gray-500">
            HSD: {format(parseISO(voucher.ends_at), "dd/MM/yyyy HH:mm")}
          </div>
        )}
      </div>
    </div>
  );
};
