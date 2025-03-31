// Component
// = My voucher
import "../../../css/user/vouchers.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { EnvValue } from '../../../env-value/envValue';

import { VoucherItem } from "./voucher_wallet_item";
import {VoucherWalletProps, Voucher} from "./vouchers_interfaces"
import { VoucherAdd } from "./add_voucher_with_code";

export const VoucherWallet: React.FC<VoucherWalletProps> = ({ userId }) => {
  const [selectedTab, setSelectedTab] = useState("Tất Cả ");
  const tabs = [
    "Tất Cả ",
    "Shopee ",
    "Shop ",
    "Nạp thẻ & Dịch vụ ",
    "Scan & Pay ",
    "Dịch vụ Tài chính ",
    "Từ đối tác",
  ];
  const handleTabClick = (tabName: string) => {
    setSelectedTab(tabName);
  };

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await axios.get(`${EnvValue.api_gateway_url}/api/vouchers/all`, {
          params: { userId },
        });
        console.log(response.data);
        setVouchers(response.data);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      }
      // console.log("Fetching vouchers...");
    };

    if (userId) fetchVouchers();
  }, [userId]);
  return (
    <div style={{ display: "contents" }}>      
      <div className="voucher-container">
        <div className="items-center flex justify-between">
          <div className="text-xl font-medium capitalize">Kho Voucher</div>
          {/* MENU */}
          <div className="voucher-navbar">
            <div className="bar-item">
              <a
                href="" // /voucher
                className="bar-text"
              >
                Tìm thêm voucher
              </a>
            </div>
            <div className="bar-item">
              <a
                className="bar-text !text-gray-400"
                href="https://help.shopee.vn/vn/s/article/T%E1%BA%A1i-sao-t%C3%B4i-kh%C3%B4ng-d%C3%B9ng-%C4%91%C6%B0%E1%BB%A3c-m%C3%A3-gi%E1%BA%A3m-gi%C3%A1-1542942386648"
              >
                Tìm hiểu
              </a>
            </div>
          </div>
        </div>

        {/* ADD VOUCHER */}
        <VoucherAdd userId={userId} />

        <div className="relative">
          {/* MENU */}
          <div className="voucher-menu">
            <nav
              className="stardust-tabs-header-wrapper"
              style={{ height: 46, background: "rgb(255, 255, 255)" }}
            >
              <ul className="stardust-tabs-header">
                {tabs.map((tab) => (
                  <li
                    key={tab}
                    className={`stardust-tabs-header__tab ${
                      selectedTab === tab
                        ? "stardust-tabs-header__tabactive"
                        : ""
                    }`}
                    onClick={() => handleTabClick(tab)}
                  >
                    <div className="flex flex-grow">
                      <div className="flex flex-grow items-center justify-center">
                        {tab}
                      </div>
                      <hr className="menu-divider" />
                    </div>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* VOUCHER LIST */}
        <div className="mt-4 relative z-0">
          <div className=" grid grid-cols-2 gap-4">
            {vouchers.length > 0 && vouchers.map((voucher) => (
              <VoucherItem key={voucher.id} voucher={voucher} userId={userId} />
            ))}
          </div>
          {/* NO VOUCHER DIV */}
          {vouchers.length < 1 && (
            <div className="flex flex-col items-center py-[5.625rem]">
              <div className="flex flex-col items-center mb-4">
                <img
                  src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/voucher/0e8c07c8449d8d509f72.png"
                  className="w-7/10"
                />
                <div className="text-black/65 text-base font-medium leading-5 mb-1.5 mt-[-8px]">
                  <span>Không tìm thấy voucher</span>
                </div>
                <div className="text-black/54 text-sm leading-4 text-center">
                  <span>Không có voucher nào trong mục này</span>
                </div>
              </div>
            </div>
          )}
          <div></div>
        </div>
      </div>
    </div>
  );
};
