import "../css/page/userPage.css";
import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import { EnvValue } from "../env-value/envValue.ts";

import { HeaderProduct } from "../components/layout/headerProduct.tsx";
import { DropdownItem } from "../components/user_page/dropdown_item.tsx";

// Notifications
import { OrderUpdate } from "../components/user_page/notifications/order_updates.tsx";
import { Promotions } from "../components/user_page/notifications/promotions.tsx";
import { WalletUpdate } from "../components/user_page/notifications/wallet_updates.tsx";
import { ShopeeUpdate } from "../components/user_page/notifications/shopee_updates.tsx";

// My account
import { Profile } from "../components/user_page/my_account/profile.tsx";
import { BanksAndCards } from "../components/user_page/my_account/banks_and_cards.tsx";
// import { Addresses } from "../components/user_page/my_account/addresses.tsx";
import { ChangePasswords } from "../components/user_page/my_account/change_passwords.tsx";
import { NotificationSettings } from "../components/user_page/my_account/notifications_settings.tsx";
import { PrivacySettings } from "../components/user_page/my_account/privacy_settings.tsx";

// Vouchers
import { VoucherWallet } from "../components/user_page/vouchers/voucher_wallet.tsx";
import { VoucherManagement } from "../components/user_page/vouchers/voucher_management.tsx";

// Others
import { Purchase } from "../components/user_page/purchase.tsx";
import { ShopeeCoin } from "../components/user_page/shopee_coin.tsx";
import { Addressesupdate } from "../components/user_page/my_account/addresses.tsx";

export const UserPage = () => {
  const [userData, setUserData] = useState<{
    AccountId: number;
    Username: string;
    Email: string;
    Avatar: string | null;
  }>({
    AccountId: 9,
    Username: "username",
    Email: "user@example.com",
    Avatar:
      "https://storage.googleapis.com/shopii-image/user_avatar/c4f96264-90f0-4dda-a6bb-ebe4b502a9a7_avatar_default.png",
  });

  const [activeComponent, setActiveComponent] = useState<React.ReactNode>(null);

  useEffect(() => {
    const fetchUserDetail = async () => {
      const storedItems = localStorage.getItem("userProfile");
      console.log("Stored items:", storedItems);

      if (storedItems) {
        const parsedData = JSON.parse(storedItems);
        setActiveComponent(<Profile userId={parsedData.accountId} />);
        try {
          const response = await axios.get(
            `${EnvValue.API_GATEWAY_URL}/api/users/${parsedData.accountId}`
          );
          if (response.data) {
            setUserData((prevState) => ({
              ...prevState, // Keep previous data
              ...response.data, // Update with new data
            }));
            console.log("Fetched Data:", response.data);
          }
        } catch (error) {
          console.error("Error fetching user detail:", error);
        }
      }
    };

    document.title = "Hồ sơ";
    fetchUserDetail();
  }, []);

  // ✅ This ensures Profile updates with the latest userData
  useEffect(() => {
    // setActiveComponent(<Profile userId={userData.AccountId} />);
  }, [userData]); // Runs whenever userData updates

  const [isOpen, setIsOpen] = useState<number | null>(1);
  const toggleDropdown = (index: number) => {
    setIsOpen(isOpen === index ? null : index);
    console.log(isOpen);
  };

  return (
    <>
      <HeaderProduct />
      <div className="flex-grow min-h-screen">
        <div className="user-menu-container">
          <div className="block flex-shrink-0 w-[180px]">
            {/* HEADER */}
            <div className="user-header">
              <div className="user-header-avatar">
                <div className="user-header-avatar-placeholder">
                  <svg
                    enableBackground="new 0 0 15 15"
                    viewBox="0 0 15 15"
                    x={0}
                    y={0}
                    className="shopee-svg-icon icon-headshot"
                  >
                    <g>
                      <circle
                        cx="7.5"
                        cy="4.5"
                        fill="none"
                        r="3.8"
                        strokeMiterlimit={10}
                      />
                      <path
                        d="m1.5 14.2c0-3.3 2.7-6 6-6s6 2.7 6 6"
                        fill="none"
                        strokeLinecap="round"
                        strokeMiterlimit={10}
                      />
                    </g>
                  </svg>
                </div>
                <img
                  className="user-header-avatar-img"
                  src={
                    userData.Avatar ||
                    "https://storage.googleapis.com/shopii-image/user_avatar/c4f96264-90f0-4dda-a6bb-ebe4b502a9a7_avatar_default.png"
                  }
                />
              </div>
              <div className="user-header-name">
                <div className="username-holder">
                  {userData.Username || "N/A"}
                </div>
                <div>
                  <a
                    className="flex text-decoration-none text-[#888]"
                    href="/user"
                  >
                    <svg
                      width={12}
                      height={12}
                      viewBox="0 0 12 12"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ marginRight: 4 }}
                    >
                      <path
                        d="M8.54 0L6.987 1.56l3.46 3.48L12 3.48M0 8.52l.073 3.428L3.46 12l6.21-6.18-3.46-3.48"
                        fill="#9B9B9B"
                        fillRule="evenodd"
                      />
                    </svg>
                    Sửa hồ sơ
                  </a>
                </div>
              </div>
            </div>

            {/* MENU */}
            <div className="cursor-pointer mt-4">
              {/* THÔNG BÁO */}
              <DropdownItem
                title="Thông báo"
                imageSrc="https://down-vn.img.susercontent.com/file/e10a43b53ec8605f4829da5618e0717c"
                links={[
                  { text: "Cập nhật đơn hàng", component: <OrderUpdate /> },
                  { text: "Khuyến mãi", component: <Promotions /> },
                  { text: "Cập nhật Ví", component: <WalletUpdate /> },
                  { text: "Cập nhật Shopee", component: <ShopeeUpdate /> },
                ]}
                setActiveComponent={setActiveComponent}
                isOpen={isOpen === 2}
                onToggle={() => toggleDropdown(2)}
              />

              {/* TÀI KHOẢN CỦA TÔI */}
              <DropdownItem
                title="Tài khoản của tôi"
                imageSrc="https://down-vn.img.susercontent.com/file/ba61750a46794d8847c3f463c5e71cc4"
                links={[
                  {
                    text: "Hồ sơ",
                    component: <Profile userId={userData.AccountId} />,
                  },
                  { text: "Ngân hàng", component: <BanksAndCards /> },
                  { text: "Địa chỉ", component: <Addressesupdate accountId={userData.AccountId} /> },
                  { text: "Đổi mật khẩu", component: <ChangePasswords /> },
                  {
                    text: "Cài đặt thông báo",
                    component: <NotificationSettings />,
                  },
                  {
                    text: "Những thiết lập riêng tư",
                    component: <PrivacySettings />,
                  },
                ]}
                setActiveComponent={setActiveComponent}
                isOpen={isOpen === 1}
                onToggle={() => toggleDropdown(1)}
              />

              {/* ĐƠN MUA */}
              <div
                className="stardust-dropdown"
                onClick={() => {
                  setActiveComponent(<Purchase />);
                  document.title = "Đơn mua";
                }}
              >
                <div className="stardust-dropdown-item-header">
                  <div className="user-menu-header">
                    <div className="user-menu-header-icon">
                      <img
                        src="https://down-vn.img.susercontent.com/file/f0049e9df4e536bc3e7f140d071e9078"
                        alt="Đơn Mua"
                      />
                    </div>
                    <div className="leading-4">
                      <span className="mr-2">Đơn Mua</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TÀI KHOẢN CỦA TÔI */}
              <DropdownItem
                title="Voucher"
                imageSrc="https://down-vn.img.susercontent.com/file/84feaa363ce325071c0a66d3c9a88748"
                links={[
                  {
                    text: "Kho Voucher",
                    component: <VoucherWallet userId={userData.AccountId} />,
                  },
                  {
                    text: "Quản lý Voucher",
                    component: (
                      <VoucherManagement userId={userData.AccountId} />
                    ),
                  },
                ]}
                setActiveComponent={setActiveComponent}
                isOpen={isOpen === 3}
                onToggle={() => toggleDropdown(3)}
              />

              {/* SHOPEE XU */}
              <div
                className="stardust-dropdown"
                onClick={() => {
                  setActiveComponent(<ShopeeCoin />);
                  document.title = "Shoppe Xu";
                }}
              >
                <div className="stardust-dropdown-item-header">
                  <div className="user-menu-header">
                    <div className="user-menu-header-icon">
                      <img
                        src="https://down-vn.img.susercontent.com/file/a0ef4bd8e16e481b4253bd0eb563f784"
                        alt="Shopee Xu"
                      />
                    </div>
                    <div className="leading-4">
                      <span className="mr-2">Shopee Xu</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COMPONENT */}

          <div className="active-component">
            <ToastContainer position="top-right" autoClose={2000} />
            {activeComponent}
          </div>
        </div>
      </div>
    </>
  );
};
