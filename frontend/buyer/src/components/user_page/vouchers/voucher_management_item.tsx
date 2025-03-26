import "../../../css/user/vouchers.css";
import { format, parseISO } from "date-fns";
import { Voucher} from "./vouchers_interfaces"


export const VoucherItem: React.FC<{ voucher: Voucher; state: string }> = ({
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
        <div className="voucher-badge">x{voucher.per_customer_limit}</div>
      )}

      <div className="voucher-img">
        <img
          src="https://down-vn.img.susercontent.com/file/e6a3b7beffa95ca492926978d5235f79"
          alt="Voucher"
        />
      </div>
      <div className="voucher-content">
        <div className="text-lg font-medium">{voucher.name}</div>
        <div className="text-base font-normal">{voucher.code}</div>
        <div className="text-sm font-normal">{voucher.description}</div>
        {state === "Đã Sử Dụng" && (
          <div className="text-xs text-gray-500">
            Ngày sử dụng:{" "}
            {voucher.UseDate &&
              format(parseISO(voucher.UseDate), "dd/MM/yyyy HH:mm")}
          </div>
        )}
        {state !== "Đã Sử Dụng" && (
          <div className="text-xs text-gray-500">HSD: {format(parseISO(voucher.ends_at), "dd/MM/yyyy HH:mm")}</div>
        )}
      </div>
    </div>
  );
};