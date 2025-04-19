import {
  FaFacebook,
  FaInstagram,
  FaBell,
  FaGlobe,
  FaQuestionCircle,
  FaChevronDown,
} from "react-icons/fa";
import { useState } from "react";
import avatarDefault from "../../assets/avatar_default.png";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/authStore"; // Adjust the path to where your store is defined
import { userService } from "../../services/userService";
import { ProtectedExternalLink } from "../protectedRoute/protectedLink";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [language, setLanguage] = useState("Tiếng Việt");
  const auth = useSelector((state: RootState) => state.auth);
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setIsLanguageOpen(false);
  };

  return (
    <div className="flex flex-col bg-[#ee4d2d] text-white">
      <div className="mx-30 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* <a
            href={`${import.meta.env.VITE_SELLER_URL}/portal/settings/shop/profile/`}
            className="cursor-pointer hover:opacity-80"
          >
            Kênh người bán
          </a> */}

          <ProtectedExternalLink
            to={`${import.meta.env.VITE_SELLER_URL}/portal/settings/shop/profile/`}
            // to={`http://localhost:8001/portal/settings/shop/profile/`}
            className="cursor-pointer hover:opacity-80"
          >
            Kênh người bán
          </ProtectedExternalLink>
          <div>Dowload app</div>
          <div className="flex items-center gap-2">
            <p>Kết nối</p>
            <div className="flex flex-row justify-center gap-1">
              <FaFacebook size={15} />
              <FaInstagram size={15} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="relative mr-1.5">
              <FaBell size={15} />
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[9px] px-1 py-0 rounded-full ">
                3
              </span>
            </div>
            <span>Thông báo</span>
          </div>

          <div className="flex items-center gap-1">
            <FaQuestionCircle size={15} />
            <span>Hỗ trợ</span>
          </div>

          <div className="relative">
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            >
              <FaGlobe size={15} />
              <span>{language}</span>
              <FaChevronDown
                size={12}
                className={`transition-transform duration-300 ${isLanguageOpen ? "rotate-180" : ""
                  }`}
              />
            </div>

            {isLanguageOpen && (
              <div className="absolute right-0 mt-2 w-30 bg-white text-black shadow-lg rounded-lg z-50">
                <ul className="py-2">
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleLanguageChange("Tiếng Việt")}
                  >
                    Tiếng Việt
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleLanguageChange("English")}
                  >
                    English
                  </li>
                </ul>
              </div>
            )}
          </div>
          <div className="relative">
            {auth && auth.user ? (
              <>
                <div
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <img
                    src={JSON.parse(localStorage.getItem("userProfile") || "{}").avatar || avatarDefault}
                    alt="Avatar"
                    className="w-7 h-7 rounded-full"
                  />
                  <span className="">{auth.user.name}</span>
                </div>

                {isOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white text-black shadow-lg rounded-lg z-50">
                    <ul className="py-2">
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        {/* <a href="/user">Tài khoản của tôi</a> */}
                        <ProtectedExternalLink
                          to={`/user`}
                          className="cursor-pointer hover:opacity-80"
                        >
                          Tài khoản của tôi
                        </ProtectedExternalLink>
                      </li>
                      <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        <ProtectedExternalLink
                          to={`/home`}
                          className="cursor-pointer hover:opacity-80"
                        >
                          Đơn mua
                        </ProtectedExternalLink>
                      </li>
                      <li
                        className="px-4 py-2 text-red-500 hover:bg-gray-100 cursor-pointer"
                        onClick={async () => {
                          try {
                            const response = await userService.logout();
                            window.location.assign("/home");
                          } catch (error) {
                            console.error("Logout failed:", error);
                          }
                        }}
                      >
                        Đăng xuất
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3">
                <a
                  href={`${import.meta.env.VITE_BUYER_URL}/login`}
                  className="hover:opacity-80"
                >
                  Đăng nhập
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
