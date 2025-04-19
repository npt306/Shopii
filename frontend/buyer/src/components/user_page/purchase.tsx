import "../../css/user/my_purchase.css";
import React, { useState, useEffect } from "react";
import { MdOutlineSearch } from "react-icons/md";
import { IoIosHelpCircleOutline } from "react-icons/io";
import axios from "axios";
import { EnvValue } from "../../env-value/envValue";
import { set } from "date-fns";
interface PurchaseProps {
  userId: number;
}
interface OrderItem {
  id: number;
  orderId: number;
  productTypeId: number;
  image: string;
  type_1: string;
  type_2: string;
  quantity: number;
  price: number;
  name: string;
}

interface Order {
  orderId: number;
  customerId: number;
  shopId: number;
  shopName: string;
  message: string;
  totalPrice: number;
  paymentMethod: string;
  paymentStatus: boolean;
  orderStatus:
    | "Pending Payment"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled"
    | "Return Requested"
    | "Returned"
    | "Failed Delivery"
    | string;
  addressShipping: string;
  orderItems: OrderItem[];
}
export const Purchase: React.FC<PurchaseProps> = ({ userId }) => {
  const [selectedTab, setSelectedTab] = useState("Tất cả");
  const [hasPurchase, setHasPurchase] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showOrders, setShowOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const response = await axios.get(
          `${EnvValue.API_GATEWAY_URL}/order/checkout/user-orders/${userId}`
        );
        setHasPurchase(response.data.message || response.data.data.length > 0);
        console.log(response.data.data);
        setOrders(response.data.data);
        setShowOrders(response.data.data);
      } catch (error) {
        console.error("Error fetching product detail:", error);
      }
    };

    if (userId) {
      fetchUserDetail();
    }
  }, [userId]);

  // List of tabs
  const tabs = [
    "Tất cả",
    "Chờ thanh toán",
    "Vận chuyển",
    "Chờ giao hàng",
    "Hoàn thành",
    "Đã hủy",
    "Trả hàng/Hoàn tiền",
  ];

  // Function to handle tab click
  const handleTabClick = (tabName: string) => {
    setSelectedTab(tabName);
  };
  useEffect(() => {
    let filtered = [...orders];

    // Filter by tab
    if (selectedTab !== "Tất cả") {
      filtered = filtered.filter((order) => {
        switch (selectedTab) {
          case "Chờ thanh toán":
            return !order.paymentStatus;

          case "Vận chuyển":
            return (
              order.orderStatus === "Processing" ||
              order.orderStatus === "Shipped"
            );

          case "Chờ giao hàng":
            return order.orderStatus === "Shipped";

          case "Hoàn thành":
            return order.orderStatus === "Delivered";

          case "Đã hủy":
            return order.orderStatus === "Cancelled";

          case "Trả hàng/Hoàn tiền":
            return (
              order.orderStatus === "Return Requested" ||
              order.orderStatus === "Returned"
            );

          default:
            return true;
        }
      });
    }

    // Filter by search keyword
    if (searchTerm.trim()) {
      filtered = filtered.filter((order) => {
        const keyword = searchTerm.toLowerCase();
        const matchShop = order.shopName.toLowerCase().includes(keyword);
        const matchItem = order.orderItems.some(
          (item) =>
            item.type_1.toLowerCase().includes(keyword) ||
            item.type_2.toLowerCase().includes(keyword)
        );
        return matchShop || matchItem;
      });
    }

    setShowOrders(filtered);
    setHasPurchase(filtered.length > 0);
  }, [searchTerm, selectedTab, orders]);
  return (
    <div style={{ display: "contents" }}>
      <div className="bg-neutral-100 min-h-screen">
        <div />
        <section className="tab-bar" role="tablist">
          {tabs.map((tab) => (
            <div
              key={tab}
              className={`tab-item ${
                selectedTab === tab
                  ? "!text-orange-600  !border-orange-600"
                  : ""
              }`}
              role="tab"
              onClick={() => handleTabClick(tab)}
            >
              <span className="">{tab}</span>
            </div>
          ))}
        </section>
        <section>
          <div className="search-bar">
            <MdOutlineSearch className="w-[25px] h-[25px] my-3.5 fill-[#bbb]" />
            <input
              placeholder="Bạn có thể tìm kiếm theo tên Shop hoặc Tên Sản phẩm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </section>
        <section>
          {/* NO ORDER */}
          {!hasPurchase ? (
            <div className="h-[600px] text-center w-full mt-3.5">
              <div className="items-center bg-white flex flex-col h-full justify-center">
                <div className="no-order-img" />
                <h2 className="text-xl mt-5">Không có đơn hàng</h2>
              </div>
            </div>
          ) : (
            // YES ORDER
            <>
              {showOrders.map((order, index) => (
                <div
                  key={order.orderId || index}
                  className="rounded-sm shadow-sm mx-0 my-3"
                >
                  <div className="order-card">
                    <section>
                      <div className="flex !justify-between pb-[12px]">
                        <div className="whitespace-nowrap items-center flex">
                          <svg width="17" height="16" viewBox="0 0 17 16">
                            <title>Shop Icon</title>
                            <path
                              d="M1.95 6.6c.156.804.7 1.867 1.357 1.867.654 0 1.43 0 1.43-.933h.932s0 .933 1.155.933c1.176 0 1.15-.933 1.15-.933h.984s-.027.933 1.148.933c1.157 0 1.15-.933 1.15-.933h.94s0 .933 1.43.933c1.368 0 1.356-1.867 1.356-1.867H1.95zm11.49-4.666H3.493L2.248 5.667h12.437L13.44 1.934zM2.853 14.066h11.22l-.01-4.782c-.148.02-.295.042-.465.042-.7 0-1.436-.324-1.866-.86-.376.53-.88.86-1.622.86-.667 0-1.255-.417-1.64-.86-.39.443-.976.86-1.643.86-.74 0-1.246-.33-1.623-.86-.43.536-1.195.86-1.895.86-.152 0-.297-.02-.436-.05l-.018 4.79zM14.996 12.2v.933L14.984 15H1.94l-.002-1.867V8.84C1.355 8.306 1.003 7.456 1 6.6L2.87 1h11.193l1.866 5.6c0 .943-.225 1.876-.934 2.39v3.21z"
                              strokeWidth=".3"
                              stroke="#333"
                              fill="#333"
                              fillRule="evenodd"
                            ></path>
                          </svg>

                          <div className="shop-name" tabIndex={0}>
                            {order.shopName}
                          </div>
                          <button className="chat-btn stardust-button stardust-button-primary !border-orange-600">
                            <svg
                              viewBox="0 0 17 17"
                              className="shopee-svg-icon icon-btn-chat mr-0.5"
                              style={{ fill: "white" }}
                            >
                              <g fillRule="evenodd">
                                <path
                                  d="M13.89 0C14.504 0 15 .512 15 1.144l-.003.088-.159 2.117.162.001c.79 0 1.46.558 1.618 1.346l.024.15.008.154v9.932a1.15 1.15 0 01-1.779.963l-.107-.08-1.882-1.567-7.962.002a1.653 1.653 0 01-1.587-1.21l-.036-.148-.021-.155-.071-.836h-.01L.91 13.868a.547.547 0 01-.26.124L.556 14a.56.56 0 01-.546-.47L0 13.429V1.144C0 .512.497 0 1.11 0h12.78zM15 4.65l-.259-.001-.461 6.197c-.045.596-.527 1.057-1.106 1.057L4.509 11.9l.058.69.01.08a.35.35 0 00.273.272l.07.007 8.434-.001 1.995 1.662.002-9.574-.003-.079a.35.35 0 00-.274-.3L15 4.65zM13.688 1.3H1.3v10.516l1.413-1.214h10.281l.694-9.302zM4.234 5.234a.8.8 0 011.042-.077l.187.164c.141.111.327.208.552.286.382.131.795.193 1.185.193s.803-.062 1.185-.193c.225-.078.41-.175.552-.286l.187-.164a.8.8 0 011.042 1.209c-.33.33-.753.579-1.26.753A5.211 5.211 0 017.2 7.4a5.211 5.211 0 01-1.706-.28c-.507-.175-.93-.424-1.26-.754a.8.8 0 010-1.132z"
                                  fillRule="nonzero"
                                />
                              </g>
                            </svg>
                            <span>chat</span>
                          </button>
                          <a
                            className="shop-btn cursor-pointer"
                            // href=""
                          >
                            <div className="stardust-button flex items-center !text-neutral-600">
                              <svg
                                enableBackground="new 0 0 15 15"
                                viewBox="0 0 15 15"
                                x={0}
                                y={0}
                                className="shopee-svg-icon !fill-neutral-600 mr-0.5"
                              >
                                <path d="m15 4.8c-.1-1-.8-2-1.6-2.9-.4-.3-.7-.5-1-.8-.1-.1-.7-.5-.7-.5h-8.5s-1.4 1.4-1.6 1.6c-.4.4-.8 1-1.1 1.4-.1.4-.4.8-.4 1.1-.3 1.4 0 2.3.6 3.3l.3.3v3.5c0 1.5 1.1 2.6 2.6 2.6h8c1.5 0 2.5-1.1 2.5-2.6v-3.7c.1-.1.1-.3.3-.3.4-.8.7-1.7.6-3zm-3 7c0 .4-.1.5-.4.5h-8c-.3 0-.5-.1-.5-.5v-3.1c.3 0 .5-.1.8-.4.1 0 .3-.1.3-.1.4.4 1 .7 1.5.7.7 0 1.2-.1 1.6-.5.5.3 1.1.4 1.6.4.7 0 1.2-.3 1.8-.7.1.1.3.3.5.4.3.1.5.3.8.3zm.5-5.2c0 .1-.4.7-.3.5l-.1.1c-.1 0-.3 0-.4-.1s-.3-.3-.5-.5l-.5-1.1-.5 1.1c-.4.4-.8.7-1.4.7-.5 0-.7 0-1-.5l-.6-1.1-.5 1.1c-.3.5-.6.6-1.1.6-.3 0-.6-.2-.9-.8l-.5-1-.7 1c-.1.3-.3.4-.4.6-.1 0-.3.1-.3.1s-.4-.4-.4-.5c-.4-.5-.5-.9-.4-1.5 0-.1.1-.4.3-.5.3-.5.4-.8.8-1.2.7-.8.8-1 1-1h7s .3.1.8.7c.5.5 1.1 1.2 1.1 1.8-.1.7-.2 1.2-.5 1.5z" />
                              </svg>
                              <span>Xem Shop</span>
                            </div>
                          </a>
                        </div>
                        <div className="flex pl-2.5 items-center">
                          <div className="ship-success-icon">
                            <a
                              className="items-center inline-flex m-0 align-middle  cursor-pointer"
                              // href=""
                            >
                              <span className="text-[#26AA99]">
                                <svg
                                  enableBackground="new 0 0 15 15"
                                  viewBox="0 0 15 15"
                                  x={0}
                                  y={0}
                                  className="shopee-svg-icon text-lg mr-[4px] mb-px stroke-[#26aa99]"
                                >
                                  <g>
                                    <line
                                      fill="none"
                                      strokeLinejoin="round"
                                      strokeMiterlimit={10}
                                      x1="8.6"
                                      x2="4.2"
                                      y1="9.8"
                                      y2="9.8"
                                    />
                                    <circle
                                      cx={3}
                                      cy="11.2"
                                      fill="none"
                                      r={2}
                                      strokeMiterlimit={10}
                                    />
                                    <circle
                                      cx={10}
                                      cy="11.2"
                                      fill="none"
                                      r={2}
                                      strokeMiterlimit={10}
                                    />
                                    <line
                                      fill="none"
                                      strokeMiterlimit={10}
                                      x1="10.5"
                                      x2="14.4"
                                      y1="7.3"
                                      y2="7.3"
                                    />
                                    <polyline
                                      fill="none"
                                      points="1.5 9.8 .5 9.8 .5 1.8 10 1.8 10 9.1"
                                      strokeLinejoin="round"
                                      strokeMiterlimit={10}
                                    />
                                    <polyline
                                      fill="none"
                                      points="9.9 3.8 14 3.8 14.5 10.2 11.9 10.2"
                                      strokeLinejoin="round"
                                      strokeMiterlimit={10}
                                    />
                                  </g>
                                </svg>{" "}
                                Giao hàng thành công
                              </span>
                            </a>
                            <div className="shopee-drawer">
                              <IoIosHelpCircleOutline className="w-5 h-5 fill-teal-600" />
                            </div>
                          </div>
                          <div
                            className="text-orange-600 uppercase"
                            tabIndex={0}
                          >
                            {order.orderStatus === "Pending"
                              ? "Chờ giao hàng"
                              : "Hoàn thành"}
                          </div>
                        </div>
                      </div>
                    </section>
                    <div className="border-b border-gray-200" />
                    <section>
                      <a
                        className=" cursor-pointer"
                        aria-label=""
                        // href=""
                      >
                        <div>
                          <div className="shop-order-container">
                            {order.orderItems.map((item) => (
                              <section key={item.id}>
                                <div className="flex items-center flex-nowrap pt-3 text-black/90 break-words">
                                  <div className="items-start flex-1 flex-nowrap pr-3	flex">
                                    <img
                                      src={item.image}
                                      className="product-img-container"
                                    />
                                    <div className="flex items-start flex-1 flex-col min-w-0 pl-3 break-words">
                                      <div className="overflow-hidden text-ellipsis text-base leading-5.5 mb-1.5 max-h-12">
                                        <span
                                          className="align-middle"
                                          tabIndex={0}
                                        >
                                          {item.name}
                                        </span>
                                      </div>

                                      {(item.type_1 || item.type_2) && (
                                        <div
                                          className="mb-1.25 text-gray-500"
                                          tabIndex={0}
                                        >
                                          Phân loại hàng: {item.type_1}{" "}
                                          {item.type_2}
                                        </div>
                                      )}

                                      <div className="mb-1.25" tabIndex={0}>
                                        x{item.quantity}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right" tabIndex={0}>
                                    <div className="ml-3">
                                      {/* <span className="before-sale">₫9.000</span> */}
                                      <span className="after-sale">
                                        ₫
                                        {(
                                          item.quantity * item.price
                                        ).toLocaleString("de-DE")}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </section>
                            ))}
                          </div>
                        </div>
                      </a>
                    </section>
                  </div>
                  <div className="dotted-line">
                    <div className="dot right-0 translate-x-1/2 -translate-y-1/2 transform">
                      {" "}
                    </div>
                    <div className="dot left-0 -translate-x-1/2 -translate-y-1/2 transform">
                      {" "}
                    </div>
                  </div>
                  <div className="bg-[#fffefb] pt-6 px-6 pb-3">
                    <div className="items-center flex justify-end">
                      <label className="mr-2.5 ">Thành tiền:</label>
                      <div className="text-orange-600 text-2xl">
                        ₫{order.totalPrice.toLocaleString("de-DE")}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-nowrap justify-between bg-[#fffefb] content-center px-6 pt-3 pb-6">
                    <div className="flex flex-col justify-center gap-1 text-black/60 text-xs">
                      <div>
                        <span className="inline-flex">
                          Đánh giá sản phẩm trước{" "}
                          <div className="shopee-drawer">
                            <u className="cursor-pointer relative select-none ml-1">
                              21-02-2025
                            </u>
                          </div>
                        </span>
                      </div>
                      <span className="text-orange-600">
                        Đánh giá ngay và nhận 200 Xu
                      </span>
                    </div>
                    <section className="flex">
                      <div className="btn-row-btn">
                        <div>
                          <button className="stardust-button stardust-button-primary btns">
                            Đánh giá
                          </button>
                        </div>
                      </div>
                      <div className="btn-row-btn">
                        <div>
                          <button className="stardust-button stardust-button-secondary btns">
                            Liên hệ Người bán
                          </button>
                        </div>
                      </div>
                      <div className="btn-row-btn">
                        <div>
                          <button className="stardust-button stardust-button-secondary btns">
                            Mua lại
                          </button>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              ))}
            </>
          )}
        </section>
      </div>
    </div>
  );
};
