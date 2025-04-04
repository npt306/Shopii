import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/page/orderPage.css";
import { HeaderOrder } from "../components/layout/headerOrder";
import { Footer } from "../components/layout/footer";

import { formatPrice } from "../helpers/utility/formatPrice";
import { Address } from "../types/address";
import { FormatPhoneNumber } from "../helpers/utility/phoneFormat";

import { VoucherShopeeModal } from "../components/features/voucherShopeeModal";
import { AddressListInOrderModal } from "../components/features/addressListInOrder";
import { AddAdressInOrderModal } from "../components/features/addAddressInOrderModal";
import { UpdateAdressInOrderModal } from "../components/features/updateAddresInOrderModal";
import { AddDefaultAdressInOrderModal } from "../components/features/addDefaultAddressInOrder";

export const OrderPage = () => {
  const { id } = useParams<{ id: string }>();

  const [openAddressModal, setOpenAddressModal] = useState(false);
  const [openAddAddressModal, setOpenAddAddressModal] = useState(false);
  const [openUpdateAddressModal, setOpenUpdateAddressModal] = useState(false);
  const [openAddDefaultAddressModal, setOpenAddDefaultAddressModal] =
    useState(false); // add address default if not have any address

  const [openDeliveryModal, setOpenDeliveryModal] = useState(false);

  const [openVoucherModal, setOpenVoucherModal] = useState(false);
  const [openShopVoucherModal, setShopVoucherModal] = useState(false);

  const [paymentMethodChoice, setPaymentMethodChoice] = useState<Number | null>(
    1
  );
  const [paymentChoiceModal, setPaymentChoiceModal] = useState(false);

  useEffect(() => {
    document.title = "Thanh toán";
  }, []);

  const [selectedAddress, setSelectedAddress] = useState<Address>();
  const [selectedUpdateAddress, setSelectedUpdateAddress] =
    useState<Address | null>(null);

  const handleDataFromModal = (data: any) => {
    setSelectedAddress(data); // Lưu dữ liệu từ modal vào state
    setOpenAddressModal(false); // Đóng modal
  };

  const handleUpdateDataFromModal = (data: any) => {
    // console.log(data);
    setSelectedUpdateAddress(data); // Lưu dữ liệu từ modal vào state
    setOpenAddressModal(false); // Đóng modal
  };

  const fetchDefaultAddress = async () => {
    try {
      const response = await axios.get<any>(
        `http://localhost:3005/address/account/default/${id}`
      );
      if (response.data != "") {
        let defaultAddress: Address = {
          AddressId: response.data.id,
          FullName: response.data.fullName,
          PhoneNumber: response.data.phoneNumber,
          Province: response.data.province,
          District: response.data.district,
          Ward: response.data.ward,
          SpecificAddress: response.data.specificAddress,
          isDefault: response.data.isDefault,
        };
        setSelectedAddress(defaultAddress);
        setOpenAddDefaultAddressModal(false); // test
      } else {
        setOpenAddDefaultAddressModal(true); // test
      }
    } catch (error) {
      console.error("Error fetching default address:", error);
    }
  };

  // check if no address default
  const [isAddressDefault, setIsAddressDefault] = useState(false);

  const handleAddressDefault = () => {
    setIsAddressDefault((prev) => !prev); // Toggle để kích hoạt useEffect
  };

  useEffect(() => {
    const storedAddress = sessionStorage.getItem("selectedAddress");
    if (storedAddress) {
      const selectedAddressInSession = JSON.parse(storedAddress);
      setSelectedAddress(selectedAddressInSession);
    } else {
      fetchDefaultAddress();
    }
  }, [id, isAddressDefault]);

  return (
    <div className="App">
      <VoucherShopeeModal
        open={openVoucherModal}
        setOpen={setOpenVoucherModal}
      />
      <AddDefaultAdressInOrderModal
        open={openAddDefaultAddressModal}
        setOpen={setOpenAddDefaultAddressModal}
        handleAddressDefault={handleAddressDefault}
      />
      <AddressListInOrderModal
        open={openAddressModal}
        setOpen={setOpenAddressModal}
        setOpenModalAdd={setOpenAddAddressModal}
        setOpenModalUpdate={setOpenUpdateAddressModal}
        onSelectAddress={handleDataFromModal}
        onSelectUpdateAddress={handleUpdateDataFromModal} // Truyền handleDataFromModal vào prop
      />
      <AddAdressInOrderModal
        open={openAddAddressModal}
        setOpen={setOpenAddAddressModal}
        setOpenModal={setOpenAddressModal}
      />
      <UpdateAdressInOrderModal
        open={openUpdateAddressModal}
        setOpen={setOpenUpdateAddressModal}
        setOpenModal={setOpenAddressModal}
        updateAddress={selectedUpdateAddress}
      />
      <HeaderOrder></HeaderOrder>
      <div className="flex-1 mx-30">
        <div className="order-main">
          {/* ADDRESS-CONTAINER */}
          <div className="order-address">
            <div className="address-decor" />
            <div className="p-7">
              <div className="items-center flex">
                <div className="address-title">
                  <div className="flex mr-3">
                    <svg
                      height={16}
                      viewBox="0 0 12 16"
                      width={12}
                      className="shopee-svg-icon icon-location-marker"
                    >
                      <path
                        d="M6 3.2c1.506 0 2.727 1.195 2.727 2.667 0 1.473-1.22 2.666-2.727 2.666S3.273 7.34 3.273 5.867C3.273 4.395 4.493 3.2 6 3.2zM0 6c0-3.315 2.686-6 6-6s6 2.685 6 6c0 2.498-1.964 5.742-6 9.933C1.613 11.743 0 8.498 0 6z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h2>Địa chỉ nhận hàng</h2>
                </div>
              </div>
              <div className="flex items-center">
                <div>
                  <div className="items-center flex text-base">
                    {selectedAddress ? (
                      <>
                        <div className="font-semibold flex flex-col w-auto min-w-[15rem]">
                          <div>{selectedAddress?.FullName}</div>
                          <div>
                            (+84){" "}
                            {FormatPhoneNumber(
                              selectedAddress ? selectedAddress.PhoneNumber : ""
                            )}
                          </div>
                        </div>
                        <div className="">
                          {selectedAddress?.SpecificAddress},{" "}
                          {selectedAddress?.Ward}, {selectedAddress?.District},{" "}
                          {selectedAddress?.Province}
                        </div>
                        {selectedAddress?.isDefault && (
                          <div className="address-default-tag">Mặc định</div>
                        )}
                        <button
                          className="change-button"
                          onClick={() => setOpenAddressModal(true)}
                        >
                          <div className="text-sky-700 text-[0.9rem]">
                            Thay đổi
                          </div>
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="px-7">
                          <div className="text-sky-700 text-[0.9rem]">
                            Thay đổi
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div />
            </div>
          </div>
          {/* ORDER-ITEMS */}
          <div className="order-list">
            <div className="order-list-bg">
              <div className="order-list-tag grid grid-cols-6">
                <div className=" col-span-3">
                  <h2 className="items-center text-xl">Sản phẩm</h2>
                </div>
                <div className="text-end">Đơn giá</div>
                <div className="text-end">Số lượng</div>
                <div className="text-end">Thành tiền</div>
              </div>
            </div>
            <div>
              {/* SHOP-ITEMS */}
              <div className="shop-items">
                <div className="shop-title">
                  <div className="mall-icon">
                    <svg viewBox="0 0 24 11" height={11} width={24}>
                      <g fill="#fff" fillRule="evenodd">
                        <path d="M19.615 7.143V1.805a.805.805 0 0 0-1.611 0v5.377H18c0 1.438.634 2.36 1.902 2.77V9.95c.09.032.19.05.293.05.444 0 .805-.334.805-.746a.748.748 0 0 0-.498-.69v-.002c-.59-.22-.885-.694-.885-1.42h-.002zm3 0V1.805a.805.805 0 0 0-1.611 0v5.377H21c0 1.438.634 2.36 1.902 2.77V9.95c.09.032.19.05.293.05.444 0 .805-.334.805-.746a.748.748 0 0 0-.498-.69v-.002c-.59-.22-.885-.694-.885-1.42h-.002zm-7.491-2.985c.01-.366.37-.726.813-.726.45 0 .814.37.814.742v5.058c0 .37-.364.73-.813.73-.395 0-.725-.278-.798-.598a3.166 3.166 0 0 1-1.964.68c-1.77 0-3.268-1.456-3.268-3.254 0-1.797 1.497-3.328 3.268-3.328a3.1 3.1 0 0 1 1.948.696zm-.146 2.594a1.8 1.8 0 1 0-3.6 0 1.8 1.8 0 1 0 3.6 0z" />
                        <path
                          d="M.078 1.563A.733.733 0 0 1 .565.89c.423-.15.832.16 1.008.52.512 1.056 1.57 1.88 2.99 1.9s2.158-.85 2.71-1.882c.19-.356.626-.74 1.13-.537.342.138.477.4.472.65a.68.68 0 0 1 .004.08v7.63a.75.75 0 0 1-1.5 0V3.67c-.763.72-1.677 1.18-2.842 1.16a4.856 4.856 0 0 1-2.965-1.096V9.25a.75.75 0 0 1-1.5 0V1.648c0-.03.002-.057.005-.085z"
                          fillRule="nonzero"
                        />
                      </g>
                    </svg>
                  </div>
                  <h3 className="pl-2">Guzado Official</h3>
                  <button className="chat-button">
                    <svg
                      viewBox="0 0 16 16"
                      height={15}
                      width={20}
                      className="shopee-svg-icon ml-3 mr-1"
                    >
                      <g className="text-[#00bfa5]" fillRule="evenodd">
                        <path d="M15 4a1 1 0 01.993.883L16 5v9.932a.5.5 0 01-.82.385l-2.061-1.718-8.199.001a1 1 0 01-.98-.8l-.016-.117-.108-1.284 8.058.001a2 2 0 001.976-1.692l.018-.155L14.293 4H15zm-2.48-4a1 1 0 011 1l-.003.077-.646 8.4a1 1 0 01-.997.923l-8.994-.001-2.06 1.718a.5.5 0 01-.233.108l-.087.007a.5.5 0 01-.492-.41L0 11.732V1a1 1 0 011-1h11.52zM3.646 4.246a.5.5 0 000 .708c.305.304.694.526 1.146.682A4.936 4.936 0 006.4 5.9c.464 0 1.02-.062 1.608-.264.452-.156.841-.378 1.146-.682a.5.5 0 10-.708-.708c-.185.186-.445.335-.764.444a4.004 4.004 0 01-2.564 0c-.319-.11-.579-.258-.764-.444a.5.5 0 00-.708 0z" />
                      </g>
                    </svg>
                    Chat ngay
                  </button>
                </div>
                <div className="border-b border-black/10 pb-5">
                  {/* ONE ITEM CONTAINER */}
                  <div className="item-container grid grid-cols-6">
                    <div className="col-span-2 item-container-col">
                      <picture className="contents">
                        <source
                          srcSet="https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lk7xq5jxlgac94@resize_w40_nl.webp 1x, https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lk7xq5jxlgac94@resize_w80_nl.webp 2x"
                          type="image/webp"
                          className="contents"
                        />
                        <img
                          width={40}
                          loading="lazy"
                          className="align-bottom"
                          srcSet="https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lk7xq5jxlgac94@resize_w40_nl 1x, https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lk7xq5jxlgac94@resize_w80_nl 2x"
                          src="https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lk7xq5jxlgac94"
                          height={40}
                          alt="product image"
                          style={{}}
                        />
                      </picture>
                      <span className="item-name">
                        <span className="overflow-hidden overflow-ellipsis whitespace-nowrap">
                          Áo thể thao nam Guzado Vải Coolmax dệt lỗ kim thoáng
                          khí mau khô Co Giãn Vận Động Thoải Mái GTS04
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-end items-center">
                      <span className="overflow-hidden overflow-ellipsis whitespace-nowrap text-gray-500">
                        Loại: GTS04 Đen,L
                      </span>
                    </div>
                    <div className="item-container-col ">₫500.000</div>
                    <div className="item-container-col">1</div>
                    <div className="item-container-col">₫500.000</div>
                  </div>
                </div>
                {/* SHOP VOUCHER  */}
                <div className="border-b border-black/10 grid grid-cols-10 p-7 ml-8 items-center">
                  <div className="col-span-4 bg-red-200"></div>
                  <div className="whitespace-nowrap col-span-5">
                    <div className="text-2xl items-center flex">
                      <svg
                        fill="none"
                        viewBox="0 0 23 22"
                        width={10}
                        height={10}
                        className="shopee-svg-icon icon-voucher-applied-line"
                      >
                        <rect
                          x={13}
                          y={9}
                          width={10}
                          height={10}
                          rx={5}
                          fill="#EE4D2D"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M20.881 11.775a.54.54 0 00-.78.019l-2.509 2.765-1.116-1.033a.542.542 0 00-.74.793l1.5 1.414a.552.552 0 00.844-.106l2.82-3.109a.54.54 0 00-.019-.743z"
                          fill="#fff"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M6.488 16.178h.858V14.57h-.858v1.607zM6.488 13.177h.858v-1.605h-.858v1.605zM6.488 10.178h.858V8.572h-.858v1.606zM6.488 7.178h.858V5.572h-.858v1.606z"
                          fill="#EE4D2D"
                        />
                        <g filter="url(#voucher-filter1_d)">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1 4v2.325a1.5 1.5 0 01.407 2.487l-.013.012c-.117.103-.25.188-.394.251v.65c.145.063.277.149.394.252l.013.012a1.496 1.496 0 010 2.223l-.013.012c-.117.103-.25.188-.394.251v.65c.145.063.277.149.394.252l.013.012A1.5 1.5 0 011 15.876V18h12.528a6.018 6.018 0 01-.725-1H2v-.58c.55-.457.9-1.147.9-1.92a2.49 2.49 0 00-.667-1.7 2.49 2.49 0 00.667-1.7 2.49 2.49 0 00-.667-1.7A2.49 2.49 0 002.9 7.7c0-.773-.35-1.463-.9-1.92V5h16v.78a2.494 2.494 0 00-.874 2.283 6.05 6.05 0 011.004-.062A1.505 1.505 0 0119 6.325V4H1z"
                            fill="#EE4D3D"
                          />
                        </g>
                        <defs>
                          <filter
                            id="voucher-filter1_d"
                            x={0}
                            y={3}
                            width={20}
                            height={16}
                            filterUnits="userSpaceOnUse"
                            colorInterpolationFilters="sRGB"
                          >
                            <feFlood
                              floodOpacity={0}
                              result="BackgroundImageFix"
                            />
                            <feColorMatrix
                              in="SourceAlpha"
                              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            />
                            <feOffset />
                            <feGaussianBlur stdDeviation=".5" />
                            <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0" />
                            <feBlend
                              in2="BackgroundImageFix"
                              result="effect1_dropShadow"
                            />
                            <feBlend
                              in="SourceGraphic"
                              in2="effect1_dropShadow"
                              result="shape"
                            />
                          </filter>
                        </defs>
                      </svg>
                      <div className="text-base">Voucher của Shop</div>
                    </div>
                  </div>
                  <div className="whitespace-nowrap">
                    <div className="items-center flex justify-end">
                      <div className="shop-voucher-sale mr-3">
                        <span>-₫25k</span>
                        <div className="sale-svg right-[0] rotate-180">
                          <svg
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 1 5 35"
                            style={{ fill: "rgb(238, 77, 45)" }}
                          >
                            <path d="M0 0v2.27a2 2 0 010 3.46v2.54a2 2 0 010 3.46v2.54a2 2 0 010 3.46V19h2v-1h-.76A2.99 2.99 0 001 13.76v-1.52a3 3 0 000-4.48V6.24a3 3 0 000-4.48V1h1V0H0z" />
                          </svg>
                        </div>
                        <div className="sale-svg left-0">
                          <svg
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 1 5 35"
                            style={{ fill: "rgb(238, 77, 45)" }}
                          >
                            <path d="M0 0v2.27a2 2 0 010 3.46v2.54a2 2 0 010 3.46v2.54a2 2 0 010 3.46V19h2v-1h-.76A2.99 2.99 0 001 13.76v-1.52a3 3 0 000-4.48V6.24a3 3 0 000-4.48V1h1V0H0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex justify-center items-center">
                        <div>
                          <button className="!text-sky-700 flex justify-center items-center">
                            <span>Chọn Voucher khác</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div />
                  </div>
                </div>

                <div className="order-shop-settings">
                  <div className="flex flex-col text-sm p-6">
                    <div className="flex ">
                      <span className="pt-2 items-center justify-center">
                        Lời nhắn:
                      </span>
                      <div className="flex-1">
                        <div className="relative ml-4">
                          <div className="shop-note-input">
                            <input
                              className=" px-3 py-1 w-full"
                              type="text"
                              placeholder="Lưu ý cho Người bán..."
                              defaultValue=""
                            />
                          </div>
                          <div />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col text-sm">
                    <div className="shipping-container">
                      <div className="">Phương thức vận chuyển:</div>
                      <div className="col-start-2 whitespace-nowrap">
                        <div>Nhanh</div>
                      </div>
                      <div className="col-end-2 col-start-1" />
                      <div className="col-end-5 col-start-2 text-teal-500">
                        <div className="content-center flex flex-wrap">
                          <img src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/checkout/a714965e439d493ba00c.svg" />
                          <div className="pl-2">
                            Đảm bảo nhận hàng từ 11 Tháng 3 - 13 Tháng 3
                          </div>
                        </div>
                        <div className="voucher-note">
                          <div>
                            Nhận Voucher trị giá ₫15.000 nếu đơn hàng được giao
                            đến bạn sau ngày 13 Tháng 3 2025.
                          </div>
                          <div>
                            <svg
                              enableBackground="new 0 0 15 15"
                              viewBox="0 0 15 15"
                              x={0}
                              y={0}
                              className="shopee-svg-icon icon-help"
                            >
                              <g>
                                <circle
                                  cx="7.5"
                                  cy="7.5"
                                  fill="none"
                                  r="6.5"
                                  strokeMiterlimit={10}
                                />
                                <path
                                  d="m5.3 5.3c.1-.3.3-.6.5-.8s.4-.4.7-.5.6-.2 1-.2c.3 0 .6 0 .9.1s.5.2.7.4.4.4.5.7.2.6.2.9c0 .2 0 .4-.1.6s-.1.3-.2.5c-.1.1-.2.2-.3.3-.1.2-.2.3-.4.4-.1.1-.2.2-.3.3s-.2.2-.3.4c-.1.1-.1.2-.2.4s-.1.3-.1.5v.4h-.9v-.5c0-.3.1-.6.2-.8s.2-.4.3-.5c.2-.2.3-.3.5-.5.1-.1.3-.3.4-.4.1-.2.2-.3.3-.5s.1-.4.1-.7c0-.4-.2-.7-.4-.9s-.5-.3-.9-.3c-.3 0-.5 0-.7.1-.1.1-.3.2-.4.4-.1.1-.2.3-.3.5 0 .2-.1.5-.1.7h-.9c0-.3.1-.7.2-1zm2.8 5.1v1.2h-1.2v-1.2z"
                                  stroke="none"
                                />
                              </g>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setOpenDeliveryModal(true)}
                        className="row-end-2 cursor-pointer col-end-4 capitalize !text-sky-700"
                      >
                        Thay đổi
                      </button>
                      <div className="row-start-1 col-start-4 text-right">
                        {/* {" "} */}
                        <span>₫32.700</span>
                      </div>
                    </div>
                    <div className="border-b border-black/10 pb-5" />
                    <div className="items-center flex px-7 py-2.5">
                      <div className="">Được đồng kiểm.</div>
                      <svg
                        enableBackground="new 0 0 15 15"
                        viewBox="0 0 15 15"
                        x={0}
                        y={0}
                        className="shopee-svg-icon cursor-pointer icon-help-1"
                      >
                        <g>
                          <circle
                            cx="7.5"
                            cy="7.5"
                            fill="none"
                            r="6.5"
                            strokeMiterlimit={10}
                          />
                          <path
                            d="m5.3 5.3c.1-.3.3-.6.5-.8s.4-.4.7-.5.6-.2 1-.2c.3 0 .6 0 .9.1s.5.2.7.4.4.4.5.7.2.6.2.9c0 .2 0 .4-.1.6s-.1.3-.2.5c-.1.1-.2.2-.3.3-.1.2-.2.3-.4.4-.1.1-.2.2-.3.3s-.2.2-.3.4c-.1.1-.1.2-.2.4s-.1.3-.1.5v.4h-.9v-.5c0-.3.1-.6.2-.8s.2-.4.3-.5c.2-.2.3-.3.5-.5.1-.1.3-.3.4-.4.1-.2.2-.3.3-.5s.1-.4.1-.7c0-.4-.2-.7-.4-.9s-.5-.3-.9-.3c-.3 0-.5 0-.7.1-.1.1-.3.2-.4.4-.1.1-.2.3-.3.5 0 .2-.1.5-.1.7h-.9c0-.3.1-.7.2-1zm2.8 5.1v1.2h-1.2v-1.2z"
                            stroke="none"
                          />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="shop-total">
                  <div className="flex items-center">
                    <h3 className="title-total">
                      <div className="text-[0.9rem]">
                        Tổng số tiền (2 sản phẩm):
                      </div>
                    </h3>
                    <div className="title-total text-[1.3rem] pl-2.5 pr-6  font-weight-500 !text-[#ee4d2d]">
                      ₫{formatPrice(507700)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* SHOPEE VOUCHER */}
          <div className="!mt-[20px]">
            <div className="shopee-voucher-container">
              <div className="flex-grow">
                <div className="title">
                  <svg
                    fill="none"
                    viewBox="0 -2 23 22"
                    className="shopee-svg-icon icon-voucher-line"
                  >
                    <g filter="url(#voucher-filter0_d)">
                      <mask id="a" fill="#fff">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M1 2h18v2.32a1.5 1.5 0 000 2.75v.65a1.5 1.5 0 000 2.75v.65a1.5 1.5 0 000 2.75V16H1v-2.12a1.5 1.5 0 000-2.75v-.65a1.5 1.5 0 000-2.75v-.65a1.5 1.5 0 000-2.75V2z"
                        />
                      </mask>
                      <path
                        d="M19 2h1V1h-1v1zM1 2V1H0v1h1zm18 2.32l.4.92.6-.26v-.66h-1zm0 2.75h1v-.65l-.6-.26-.4.91zm0 .65l.4.92.6-.26v-.66h-1zm0 2.75h1v-.65l-.6-.26-.4.91zm0 .65l.4.92.6-.26v-.66h-1zm0 2.75h1v-.65l-.6-.26-.4.91zM19 16v1h1v-1h-1zM1 16H0v1h1v-1zm0-2.12l-.4-.92-.6.26v.66h1zm0-2.75H0v.65l.6.26.4-.91zm0-.65l-.4-.92-.6.26v.66h1zm0-2.75H0v.65l.6.26.4-.91zm0-.65l-.4-.92-.6.26v.66h1zm0-2.75H0v.65l.6.26.4-.91zM19 1H1v2h18V1zm1 3.32V2h-2v2.32h2zm-.9 1.38c0-.2.12-.38.3-.46l-.8-1.83a2.5 2.5 0 00-1.5 2.29h2zm.3.46a.5.5 0 01-.3-.46h-2c0 1.03.62 1.9 1.5 2.3l.8-1.84zm.6 1.56v-.65h-2v.65h2zm-.9 1.38c0-.2.12-.38.3-.46l-.8-1.83a2.5 2.5 0 00-1.5 2.29h2zm.3.46a.5.5 0 01-.3-.46h-2c0 1.03.62 1.9 1.5 2.3l.8-1.84zm.6 1.56v-.65h-2v.65h2zm-.9 1.38c0-.2.12-.38.3-.46l-.8-1.83a2.5 2.5 0 00-1.5 2.29h2zm.3.46a.5.5 0 01-.3-.46h-2c0 1.03.62 1.9 1.5 2.3l.8-1.84zM20 16v-2.13h-2V16h2zM1 17h18v-2H1v2zm-1-3.12V16h2v-2.12H0zm1.4.91a2.5 2.5 0 001.5-2.29h-2a.5.5 0 01-.3.46l.8 1.83zm1.5-2.29a2.5 2.5 0 00-1.5-2.3l-.8 1.84c.18.08.3.26.3.46h2zM0 10.48v.65h2v-.65H0zM.9 9.1a.5.5 0 01-.3.46l.8 1.83A2.5 2.5 0 002.9 9.1h-2zm-.3-.46c.18.08.3.26.3.46h2a2.5 2.5 0 00-1.5-2.3L.6 8.65zM0 7.08v.65h2v-.65H0zM.9 5.7a.5.5 0 01-.3.46l.8 1.83A2.5 2.5 0 002.9 5.7h-2zm-.3-.46c.18.08.3.26.3.46h2a2.5 2.5 0 00-1.5-2.3L.6 5.25zM0 2v2.33h2V2H0z"
                        mask="url(#a)"
                      />
                    </g>
                    <path
                      clipRule="evenodd"
                      d="M6.49 14.18h.86v-1.6h-.86v1.6zM6.49 11.18h.86v-1.6h-.86v1.6zM6.49 8.18h.86v-1.6h-.86v1.6zM6.49 5.18h.86v-1.6h-.86v1.6z"
                    />
                    <defs>
                      <filter
                        id="voucher-filter0_d"
                        x={0}
                        y={1}
                        width={20}
                        height={16}
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                      >
                        <feFlood floodOpacity={0} result="BackgroundImageFix" />
                        <feColorMatrix
                          in="SourceAlpha"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        />
                        <feOffset />
                        <feGaussianBlur stdDeviation=".5" />
                        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0" />
                        <feBlend
                          in2="BackgroundImageFix"
                          result="effect1_dropShadow"
                        />
                        <feBlend
                          in="SourceGraphic"
                          in2="effect1_dropShadow"
                          result="shape"
                        />
                      </filter>
                    </defs>
                  </svg>
                  <h2 className="text-[18px] font-normal mx-2">
                    Shopee Voucher
                  </h2>
                </div>
              </div>
              <div className="">
                <button
                  className="!text-sky-700"
                  onClick={() => setOpenVoucherModal(true)}
                >
                  Chọn Voucher
                </button>
              </div>
            </div>
          </div>
          {/* ALL TOTAL */}
          <div className="">
            <div className="bg-white mt-[20px]">
              <div className="items-center flex min-h-[90px] px-8 ">
                {paymentChoiceModal ? (
                  <>
                    <div className="text-lg mr-3">Phương thức thanh toán</div>
                    <div className="flex flex-row gap-2">
                      <div
                        onClick={() => setPaymentMethodChoice(0)}
                        className={
                          paymentMethodChoice == 0
                            ? "py-3 px-3 border border-[#ee4d2d] text-[#ee4d2d]"
                            : "py-3 px-3 border border-gray-300 hover:border-[#ee4d2d] hover:text-[#ee4d2d]"
                        }
                      >
                        VN Pay
                      </div>
                      <div
                        onClick={() => setPaymentMethodChoice(1)}
                        className={
                          paymentMethodChoice == 1
                            ? "py-3 px-3 border border-[#ee4d2d] text-[#ee4d2d]"
                            : "py-3 px-3 border border-gray-300 hover:border-[#ee4d2d] hover:text-[#ee4d2d]"
                        }
                      >
                        Thanh toán khi nhận hàng
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-lg flex-1">Phương thức thanh toán</div>
                    <div className="">Thanh toán khi nhận hàng</div>
                    <button
                      onClick={() => setPaymentChoiceModal(true)}
                      className="!text-sky-700 cursor-pointer !ml-[110px] !uppercase"
                    >
                      Thay đổi
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="total-total-bg ">
              <h3 className="title-total">Tổng tiền hàng</h3>
              <div className="title-total total-total">₫932.000</div>
              <h3 className="title-total">Tổng tiền phí vận chuyển</h3>
              <div className="title-total total-total">₫83.800</div>
              <h3 className="title-total">Tổng cộng Voucher giảm giá</h3>
              <div className="title-total total-total">-₫25.000</div>
              <h3 className="title-total">Tổng thanh toán</h3>
              <div className="title-total total-total !text-[#ee4d2d] text-3xl font-medium">
                ₫990.800
              </div>
            </div>
            <div className="total-total-bg px-2">
              <div className="order-button-out">
                <button className="bg-[#ee4d2d] !text-white">
                  <p className="text-[0.9rem] px-20 ">Đặt hàng</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {openDeliveryModal && (
        <>
          <div>
            <div className="address-modal">
              <div className="z-10">
                <div className="address-container">
                  <div className="flex flex-col h-[auto] w-[45rem] px-10 pt-6 pb-3">
                    <div className="flex flex-col mb-3 gap-3">
                      <div className="text-xl">Chọn phương thức vận chuyển</div>
                      <div className="text-gray-400 text-[1rem] flex gap-2">
                        PHƯƠNG THỨC VẬN CHUYỂN LIÊN KẾT VỚI SHOPEE
                        <img src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/checkout/d4652868e23e6d6226ef.svg"></img>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="h-[7rem] w-full">
                        <div className="flex flex-row h-full bg-[#fafafa] items-center">
                          <div className="flex-8 p-5 flex flex-col gap-2">
                            <div className="flex flex-row gap-5">
                              <div>Nhanh</div>
                              <div className="row-start-1 col-start-4 text-right">
                                <span>₫{formatPrice(16500)}</span>
                              </div>
                            </div>
                            <div className="text-[0.75rem] text-gray-700">
                              Đảm bảo nhận hàng từ 3 Tháng 4 - 5 Tháng 4
                            </div>
                            <div className="text-[0.7rem] text-gray-400">
                              Nhận Voucher trị giá ₫15.000 nếu đơn hàng được
                              giao đến bạn sau ngày 5 Tháng 4 2025.
                            </div>
                          </div>
                          <div className="flex-2 justify-end items-center flex pr-5">
                            <img src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/checkout/382c89bba1676189e9eb.svg" />
                          </div>
                        </div>
                      </div>

                      <div className="h-[8rem] w-full">
                        <div className="flex flex-row h-full bg-[#fafafa] items-center">
                          <div className="flex-8 p-5 flex flex-col gap-1">
                            <div className="flex flex-row gap-5">
                              <div>Hỏa Tốc</div>
                              <div className="row-start-1 col-start-4 text-right">
                                <span>₫{formatPrice(112600)}</span>
                              </div>
                            </div>
                            <div className="content-center flex flex-wrap">
                              <img src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/checkout/a714965e439d493ba00c.svg" />
                              <div className="pl-2 text-[#26aa99]">
                                Đảm bảo nhận hàng vào ngày mai
                              </div>
                              <svg
                                enableBackground="new 0 0 15 15"
                                viewBox="0 0 15 15"
                                x={0}
                                y={0}
                                className="shopee-svg-icon cursor-pointer icon-help-1"
                              >
                                <g>
                                  <circle
                                    cx="7.5"
                                    cy="7.5"
                                    fill="none"
                                    r="6.5"
                                    strokeMiterlimit={10}
                                  />
                                  <path
                                    d="m5.3 5.3c.1-.3.3-.6.5-.8s.4-.4.7-.5.6-.2 1-.2c.3 0 .6 0 .9.1s.5.2.7.4.4.4.5.7.2.6.2.9c0 .2 0 .4-.1.6s-.1.3-.2.5c-.1.1-.2.2-.3.3-.1.2-.2.3-.4.4-.1.1-.2.2-.3.3s-.2.2-.3.4c-.1.1-.1.2-.2.4s-.1.3-.1.5v.4h-.9v-.5c0-.3.1-.6.2-.8s.2-.4.3-.5c.2-.2.3-.3.5-.5.1-.1.3-.3.4-.4.1-.2.2-.3.3-.5s.1-.4.1-.7c0-.4-.2-.7-.4-.9s-.5-.3-.9-.3c-.3 0-.5 0-.7.1-.1.1-.3.2-.4.4-.1.1-.2.3-.3.5 0 .2-.1.5-.1.7h-.9c0-.3.1-.7.2-1zm2.8 5.1v1.2h-1.2v-1.2z"
                                    stroke="none"
                                  />
                                </g>
                              </svg>
                            </div>
                            <div className="text-[0.75rem] text-gray-700">
                              Nhận Voucher trị giá ₫15.000 nếu đơn hàng được
                              giao đến bạn sau ngày 2 Tháng 4 2025.
                            </div>
                            <div className="text-[0.7rem] text-gray-400">
                              (Kênh Hỏa Tốc không hỗ trợ chương trình Shopee
                              Đồng Kiểm)
                            </div>
                          </div>
                          <div className="flex-2 justify-end items-center flex pr-5">
                            <img src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/checkout/382c89bba1676189e9eb.svg" />
                          </div>
                        </div>
                      </div>
                      <div className="h-[7rem] w-full">
                        <div className="flex flex-row h-full bg-[#fafafa] items-center">
                          <div className="flex-8 p-5 flex flex-col gap-2">
                            <div className="flex flex-row gap-5">
                              <div>Tiết kiệm</div>
                              <div className="row-start-1 col-start-4 text-right">
                                <span>₫{formatPrice(14175)}</span>
                              </div>
                            </div>
                            <div className="text-[0.75rem] text-gray-700">
                              Đảm bảo nhận hàng từ 3 Tháng 4 - 4 Tháng 4
                            </div>
                            <div className="text-[0.7rem] text-gray-400">
                              Nhận Voucher trị giá ₫15.000 nếu đơn hàng được
                              giao đến bạn sau ngày 4 Tháng 4 2025.
                            </div>
                          </div>
                          <div className="flex-2 justify-end items-center flex pr-5">
                            <img src="https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/checkout/382c89bba1676189e9eb.svg" />
                          </div>
                        </div>
                      </div>
                      <div className="h-[7rem] w-full bg-orange-200">
                        <div className="flex flex-row h-full bg-[#fafafa] items-center">
                          <div className="p-5 flex flex-col gap-2">
                            <div className="flex flex-row gap-5 text-gray-300">
                              <div>Hàng Cồng Kềnh</div>
                              <div className="row-start-1 col-start-4 text-right">
                                <span>₫{formatPrice(0)}</span>
                              </div>
                            </div>
                            <div className="text-[0.75rem] text-red-500">
                              Dưới giới hạn kích thước tối thiểu
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-5">
                      <button
                        className="!mr-2 px-5 py-3 text-[1.2rem] border border-black hover:bg-gray-200"
                        onClick={() => setOpenDeliveryModal(false)}
                      >
                        Trở Lại
                      </button>
                      <button
                        className="px-5 py-3 text-[1.2rem] bg-[#ee4d2d] hover:bg-orange-700"
                        onClick={() => setOpenDeliveryModal(false)}
                      >
                        <div className="text-white">Xác nhận</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="modal-bg"
                onClick={() => setOpenDeliveryModal(false)}
              />
            </div>
          </div>
        </>
      )}
      <Footer></Footer>
    </div>
  );
};
