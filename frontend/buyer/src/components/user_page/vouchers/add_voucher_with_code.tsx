import { toast } from "react-toastify";
import "../../../css/user/vouchers.css";
import { useState } from "react";
import axios from "axios";
import { EnvValue } from '../../../env-value/envValue';

export const VoucherAdd: React.FC<{ userId: number }> = ({ userId }) => {
    const [voucherCode, setVoucherCode] = useState("");
  
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setVoucherCode(event.target.value);
    };
    const handleAddVoucherWithCode = async () => {
      try {
        const response = await axios.post(
          `${EnvValue.api_gateway_url}/api/vouchers/claim/`,
          {
            OwnerId: userId,
            VoucherCode: voucherCode, // Sending VoucherCode
          }
        );
        console.log(response.data);
        if (response.data === true) {
          toast.success("Đã nhận đươc voucher");
        } else {
          toast.error("Không tìm thấy voucher");
        }
      } catch (error) {
        console.error("Cant claim voucher", error);
      }
    };
    return (
      <div className="voucher-add">
        <div className="text-gray-900 text-base font-medium capitalize">
          Mã Voucher
        </div>
        <div className="input-with-validator-wrapper">
          <div className="input-with-validator">
            <input
              type="text"
              placeholder="Nhập mã voucher tại đây"
              maxLength={255}
              defaultValue=""
              onChange={handleInputChange}
            />
          </div>
        </div>
        <button
          className="voucher-add-btn"
          onClick={() => handleAddVoucherWithCode()}
        >
          Lưu
        </button>
      </div>
    );
  };