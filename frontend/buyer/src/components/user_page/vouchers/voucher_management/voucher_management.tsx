// Component
// = My voucher
import "../../../../css/user/vouchers.css";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  VoucherWalletProps,
  Voucher,
  VoucherHistory,
  SellerVoucher,
} from "../vouchers_interfaces";
import { VoucherItem } from "./voucher_management_item";
import { EnvValue } from "../../../../env-value/envValue";
import { SellerVoucherItem } from "./seller_voucher_management_item";

export const VoucherManagement: React.FC<VoucherWalletProps> = ({ userId }) => {
  // TAB
  const [selectedTab, setSelectedTab] = useState("Đã Nhận");
  const tabs = ["Đã Nhận", "Đã Sử Dụng", "Hết Hiệu Lực"];
  const handleTabClick = (tabName: string) => {
    if (selectedTab !== tabName) {
      setSelectedTab(tabName);
    }
  };

  // VOUCHERS
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [showVouchers, setShowVouchers] = useState<Voucher[]>([]);

  const [sellerVouchers, setSellerVouchers] = useState<SellerVoucher[]>([]);
  const [showSellerVouchers, setShowSellerVouchers] = useState<SellerVoucher[]>(
    []
  );

  const [voucherHistory, setVoucherHistory] = useState<VoucherHistory[]>([]);

  // FETCH VOUCHERS
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const [voucherRes, historyRes, sellerVouchersRes] = await Promise.all([
          axios.get(
            `${EnvValue.API_GATEWAY_URL}/api/vouchers/user-vouchers/${userId}`
          ), //Claimed & Expired vouchers
          axios.get(
            `${EnvValue.API_GATEWAY_URL}/api/vouchers/history/${userId}`
          ),
          axios.get(
            `${EnvValue.API_GATEWAY_URL}/api/vouchers/user-sellervouchers/${userId}`
          ), //Claimed & Expired seller vouchers
        ]);
        const updatedHistory = historyRes.data.map(
          (history: VoucherHistory) => {
            const isFromShop = history.isfromshop;
            const voucherData = {
              ...history.voucher,
              UseDate: history.UseDate,
            };

            return {
              ...history,
              voucher: isFromShop
                ? (voucherData as SellerVoucher)
                : (voucherData as Voucher),
            };
          }
        );

        console.log(voucherRes.data);
        console.log(sellerVouchersRes.data);
        console.log(historyRes.data);

        setVouchers(voucherRes.data);
        setSellerVouchers(sellerVouchersRes.data);
        setVoucherHistory(updatedHistory);
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      }
    };

    if (userId) {
      fetchVouchers();
      setShowVouchers(
        vouchers.filter((voucher) => new Date(voucher.ends_at) > new Date())
      );
      setShowSellerVouchers(
        sellerVouchers.filter(
          (voucher) => new Date(voucher.ends_at) > new Date()
        )
      );
    }
  }, [userId]);

  // CHANGE WITH SELECTED TAB
  useEffect(() => {
    const changeShowVouchers = () => {
      if (selectedTab === "Đã Nhận") {
        setShowVouchers(
          vouchers.filter((voucher) => new Date(voucher.ends_at) > new Date())
        );
        setShowSellerVouchers(
          sellerVouchers.filter(
            (voucher) => new Date(voucher.ends_at) > new Date()
          )
        );
        console.log(sellerVouchers, "CLAIMED");

      }

      if (selectedTab === "Đã Sử Dụng") {
        const usedShopVouchers = voucherHistory
          .filter((history) => history.isfromshop)
          .map((history) => ({
            ...history.voucher,
            UseDate: history.UseDate,
          }));

        const usedShopeeVouchers = voucherHistory
          .filter((history) => !history.isfromshop)
          .map((history) => ({
            ...history.voucher,
            UseDate: history.UseDate,
          }));

        setShowVouchers(usedShopeeVouchers as Voucher[]); // Explicit cast to Voucher[]
        setShowSellerVouchers(usedShopVouchers as SellerVoucher[]); // Explicit cast to SellerVoucher[]
        console.log(sellerVouchers, "HISTORY");
      }

      if (selectedTab === "Hết Hiệu Lực") {
        setShowVouchers(
          vouchers.filter((voucher) => new Date(voucher.ends_at) < new Date())
        );
        setShowSellerVouchers(
          sellerVouchers.filter(
            (voucher) => new Date(voucher.ends_at) < new Date()
          )
        );
        console.log(sellerVouchers, "EXPIRED");

      }
    };
    changeShowVouchers();
  }, [selectedTab, vouchers, voucherHistory, sellerVouchers]);

  return (
    <div style={{ display: "contents" }}>
      <div className="px-8">
        <div className="border-b border-gray-200 py-6">
          <div className="items-center flex justify-between">
            <div className="text-xl font-medium capitalize">
              Quản lý Voucher
            </div>
          </div>
        </div>
        {/* MENU */}
        <div className="voucher-manage-menu">
          <nav
            className="stardust-tabs-header-wrapper"
            style={{ height: 46, background: "rgb(255, 255, 255)" }}
          >
            <ul className="stardust-tabs-header">
              {tabs.map((tab) => (
                <li
                  key={tab}
                  className={`stardust-tabs-header__tab ${
                    selectedTab === tab ? "stardust-tabs-header__tabactive" : ""
                  }`}
                  onClick={() => handleTabClick(tab)}
                >
                  <div className="flex flex-grow">
                    <div className="flex flex-grow items-center justify-center">
                      {tab}
                    </div>
                  </div>
                  <i
                    className={`stardust-tabs-header__tab-indicator ${
                      selectedTab === tab ? "" : "invisible"
                    }`}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* VOUCHER LIST */}
        <div className="mt-4">
          <div className=" grid grid-cols-2 gap-4">
            {showVouchers.map((voucher) => (
              <VoucherItem
                key={voucher.id}
                voucher={voucher}
                state={selectedTab}
              />
            ))}
            {showSellerVouchers.map((voucher) => (
              <SellerVoucherItem
                key={voucher.id}
                voucher={voucher}
                state={selectedTab}
              />
            ))}
          </div>
          {/* NO VOUCHER */}
          {showVouchers.length === 0 && showSellerVouchers.length === 0 && (
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
