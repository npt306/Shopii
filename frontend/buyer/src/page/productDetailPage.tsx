import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaFacebookMessenger,
  FaRegHeart,
  FaHeart,
} from "react-icons/fa";

import { ProductDetail } from "../types/productDetail";
import { HomeLayout } from "../layout/home";
import AddToCartNotification from "../components/features/addToCartNotification";

import { RatingStars } from "../helpers/utility/calculateRatingStars";
import { formatPrice } from "../helpers/utility/formatPrice";

import { Account } from "../types/account";

import { useCart } from "../context/cartContext";

import { API_GATEWAY_URL } from "../config/url";

import {
  PRODUCT_SERVICE_LOCALHOST,
  ORDER_SERVICE_LOCALHOST,
} from "../config/url";

export const ProductDetailPage = () => {
  const res: Account = localStorage.getItem("userProfile")
    ? JSON.parse(localStorage.getItem("userProfile")!)
    : null;

  const { updateCart } = useCart();
  const { id } = useParams<{ id: string }>();
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(
    null
  );
  const [stateVoucherShopDialog, setStateVoucherShopDialog] = useState(false);
  const [liked, setLiked] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  // set quantity selector
  const [quantity, setQuantity] = useState(1);
  const increase = () => {
    if (selectedDetail != null) {
      if (quantity < selectedDetail?.quantity) setQuantity(quantity + 1);
    }
  };

  const decrease = () => {
    if (selectedDetail != null) {
      if (quantity >= 2) setQuantity(quantity - 1);
    }
  };

  // set product image
  const productThumbnails = [
    productDetail?.video,
    ...(productDetail?.images || []),
  ].filter(Boolean);

  const [selectedMedia, setSelectedMedia] = useState<string | null>(
    productThumbnails[0] || null
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  const showNextThumbnails = () => {
    if (currentIndex < productThumbnails.length - 5) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const showPrevThumbnails = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // set classification
  const [selectedType1, setSelectedType1] = useState("");
  const [selectedType2, setSelectedType2] = useState("");

  // Determine if both types are available
  const hasType1 =
    productDetail?.classifications[0] &&
    productDetail?.details.some((detail) => detail.type_1);
  const hasType2 =
    productDetail?.classifications[1] &&
    productDetail?.details.some((detail) => detail.type_2);

  // Find the selected product detail based on selected types
  const selectedDetail = productDetail?.details.find(
    (detail) =>
      (hasType1 ? detail.type_1 === selectedType1 : true) &&
      (hasType2 ? detail.type_2 === selectedType2 : true)
  );

  const isType1Disabled = (type_1: string) => {
    return !productDetail?.details.some(
      (detail) => detail.type_1 === type_1 && detail.quantity > 0
    );
  };

  const isType2Disabled = (type_2: string) => {
    return !productDetail?.details.some(
      (detail) =>
        detail.type_1 === selectedType1 &&
        detail.type_2 === type_2 &&
        detail.quantity > 0
    );
  };

  // fetch product detail
  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await axios.get(
          // `${PRODUCT_SERVICE_LOCALHOST}/product/classifications/${id}`
          `${API_GATEWAY_URL}/detail/${id}`
        );
        setProductDetail(response.data);
        // console.log(response.data);
      } catch (error) {
        console.error("Error fetching product detail:", error);
      }
    };

    if (id) {
      fetchProductDetail();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!productDetail?.details || productDetail.details.length === 0) return;

    const { classifications, details } = productDetail;
    let matchedDetail;

    if (classifications?.[0] != null && classifications?.[1] != null) {
      matchedDetail = details.find(
        (detail) =>
          detail.type_1 === selectedType1 && detail.type_2 === selectedType2
      );
    } else if (classifications?.[0] != null && classifications?.[1] == null) {
      matchedDetail = details.find((detail) => detail.type_1 === selectedType1);
    } else if (classifications?.[0] == null && classifications?.[1] == null) {
      matchedDetail = details[0]; // Chọn phần tử đầu tiên
    }

    if (matchedDetail) {
      let data = {
        customerId: res?.accountId,
        productTypeId: matchedDetail.type_id,
        quantity: quantity,
        productId: id,
      };

      try {
        const response = await axios.post(
          // `${ORDER_SERVICE_LOCALHOST}/carts/add-to-cart/`,
          `${API_GATEWAY_URL}/order/carts/add-to-cart/`,
          data
        );
        setOpenDialog(true);
      } catch (error) {
        console.error("Error add product to cart:", error);
      }
      updateCart();
    }
  };

  useEffect(() => {
    if (quantity > Number(selectedDetail?.quantity)) {
      setQuantity(Number(selectedDetail?.quantity));
    }
  }, [quantity, selectedDetail]);

  return (
    <>
      <HomeLayout>
        <AddToCartNotification open={openDialog} setOpen={setOpenDialog} />
        <br />
        {(productDetail?.categories ?? []).map((item, index, array) => (
          <span className="text-blue-700" key={index}>
            {item}
            {index < array.length && (
              <span className="mx-1 text-black"> &gt; </span>
            )}
          </span>
        ))}
        {productDetail?.name}
        {/*Product Detail*/}
        <div className="flex flex-1 w-full mx-auto my-5">
          <div className="w-2/5 bg-white p-5">
            <div className="flex flex-col">
              {selectedMedia && selectedMedia.endsWith(".mp4") ? (
                <video
                  src={selectedMedia}
                  className="w-[450px] h-[450px] object-cover"
                  autoPlay
                  controls
                />
              ) : (
                <img
                  src={selectedMedia || ""}
                  alt="Product"
                  className="w-[450px] h-[450px] object-cover"
                />
              )}

              <div className="flex flex-row mt-2 w-[450px] items-center relative">
                {/* Nút Previous - luôn hiển thị và position absolute */}
                <button
                  onClick={showPrevThumbnails}
                  className={`absolute left-3 z-10 p-2 bg-white/50 rounded hover:bg-white/80 transition-all
                                ${
                                  currentIndex === 0
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-gray-600 hover:text-[#ee4d2d] cursor-pointer"
                                }`}
                  disabled={currentIndex === 0}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Thumbnails */}
                <div className="flex flex-row justify-between w-full">
                  {productThumbnails
                    .slice(currentIndex, currentIndex + 5)
                    .map((media, index) => {
                      if (!media) return null;
                      const isImage =
                        media.endsWith(".jpg") ||
                        media.endsWith(".png") ||
                        media.endsWith(".webp"); // Add other image extensions as needed
                      return isImage ? (
                        <img
                          key={currentIndex + index}
                          src={media}
                          alt={`Thumbnail ${currentIndex + index}`}
                          className="w-auto h-[82px] cursor-pointer mx-1"
                          onMouseEnter={() => setSelectedMedia(media)}
                        />
                      ) : (
                        <video
                          key={currentIndex + index}
                          src={media}
                          className="w-auto h-[82px] cursor-pointer mx-1"
                          onMouseEnter={() => setSelectedMedia(media)}
                        />
                      );
                    })}
                </div>

                {/* Nút Next - luôn hiển thị và position absolute */}
                <button
                  onClick={showNextThumbnails}
                  className={`absolute right-3.5 z-10 p-2 bg-white/50 rounded hover:bg-white/80 transition-all
                                ${
                                  currentIndex >= productThumbnails.length - 5
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-gray-600 hover:text-[#ee4d2d] cursor-pointer"
                                }`}
                  disabled={currentIndex >= productThumbnails.length - 5}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex flex-row items-center justify-center mt-5">
              <div className="flex flex-row justify-between items-center gap-1">
                Chia sẻ:
                <FaFacebookMessenger
                  size={30}
                  className="text-blue-500 cursor-pointer"
                />
                <FaFacebook
                  size={30}
                  className="text-blue-500 cursor-pointer"
                />
                <FaInstagram
                  size={30}
                  className="text-pink-500 cursor-pointer"
                />
                <FaTwitter size={30} className="text-blue-500 cursor-pointer" />
              </div>

              <div className="h-6 w-[1px] bg-gray-400 mx-10"></div>

              <div className="flex flex-row justify-center items-center">
                <button onClick={() => setLiked(!liked)}>
                  {liked ? (
                    <FaHeart className="text-[#ee4d2d] w-6 h-6" />
                  ) : (
                    <FaRegHeart className="text-[#ee4d2d] w-6 h-6" />
                  )}
                </button>
                <div className="text-sm ml-2">Đã thích (764)</div>
              </div>
            </div>
          </div>

          <div className="w-3/5 bg-white overflow-auto p-5">
            <div className="text-xl">{productDetail?.name}</div>
            <div className="flex flex-row justify-between w-full mt-2">
              <div className="flex flex-row">
                <div
                  id="star"
                  className="flex flex-row gap-1 justify-center items-center"
                >
                  <div className="underline underline-offset-4">
                    {productDetail?.rating}
                  </div>
                  <RatingStars rating={productDetail?.rating ?? 0} />
                </div>

                <div className="h-6 w-[1px] bg-gray-400 mx-5"></div>

                <div
                  id="review"
                  className="flex flex-row gap-1 justify-center items-center"
                >
                  <div className="underline underline-offset-4">
                    {productDetail?.reviews}
                  </div>
                  Đánh giá
                </div>

                <div className="h-6 w-[1px] bg-gray-400 mx-5"></div>

                <div
                  id="sold"
                  className="flex flex-row gap-1 justify-center items-center"
                >
                  <div className="underline underline-offset-4">
                    {productDetail?.soldQuantity}
                  </div>
                  Đã bán
                </div>
              </div>
              <div className="cursor-pointer text-gray-500 mr-5">Tố cáo</div>
            </div>

            <div className="bg-gray-100 p-5 mt-5 flex flex-row gap-2">
              <div className="flex flex-row gap-1 text-3xl items-center text-[#ee4d2d]">
                <div className="underline underline-offset-2 text-xl">đ</div>
                <div className="">
                  {formatPrice(Number(productDetail?.details[0].price))}
                </div>
              </div>

              <div className="flex flex-row gap-1 items-center text-gray-400 line-through ml-1">
                <div className="underline underline-offset-2 text-xs">đ</div>
                <div className="text-base">
                  {formatPrice(Number(productDetail?.details[0].price))}
                </div>
              </div>

              <div className="flex flex-row items-center text-[#ee4d2d] font-medium bg-red-100 px-2">
                <div className="text-xs">-30%</div>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex flex-row items-center gap-3">
                <p className="text-gray-500">Combo Khuyến Mãi:</p>
                <div className="p-1 border border-[#ee4d2d] text-[#ee4d2d] text-xs">
                  Mua 2 & giảm 1%
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex flex-row items-center gap-3">
                <p className="text-gray-500">Vận Chuyển:</p>
                <p className="text-gray-500 text-xs">
                  Nhận từ 9 Th02 - 14 Th02, phí giao ₫0
                </p>
              </div>
            </div>

            {productDetail?.classifications[0] && (
              <div className="mt-5">
                <div className="flex flex-row items-start">
                  <p className="text-gray-500 w-1/6">
                    {productDetail?.classifications[0].classTypeName}
                  </p>
                  <div className="flex flex-wrap w-5/6 gap-3">
                    {[
                      ...new Map(
                        productDetail?.details.map((detail) => [
                          detail.type_1,
                          detail,
                        ])
                      ).entries(),
                    ].map(([uniqueType, detail], index) => (
                      <div
                        key={index}
                        className={`p-2 border text-xs flex flex-row items-center gap-1 transition-all duration-300 
                                        ${
                                          selectedType1 === uniqueType
                                            ? "border-[#ee4d2d] text-black"
                                            : "border-gray-300 text-gray-500 hover:border-orange-400"
                                        }
                                        ${
                                          isType1Disabled(uniqueType)
                                            ? "opacity-50 cursor-not-allowed"
                                            : "cursor-pointer"
                                        }`}
                        onClick={() =>
                          !isType1Disabled(uniqueType) &&
                          setSelectedType1(uniqueType)
                        }
                      >
                        <img
                          src={detail.image}
                          alt={uniqueType}
                          className="w-[24px] h-[24px] object-cover rounded"
                        />
                        {uniqueType}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {productDetail?.classifications[1] && (
              <div className="mt-5">
                <div className="flex flex-row items-start">
                  <p className="text-gray-500 w-1/6">
                    {productDetail?.classifications[1].classTypeName}
                  </p>
                  <div className="flex flex-wrap w-5/6 gap-3">
                    {[
                      ...new Map(
                        productDetail?.details.map((detail) => [
                          detail.type_2,
                          detail,
                        ])
                      ).entries(),
                    ].map(([uniqueType, detail], index) => (
                      <div
                        key={index}
                        className={`border text-xs flex flex-row items-center gap-1 transition-all duration-300 
                                        ${
                                          selectedType2 === uniqueType
                                            ? "border-[#ee4d2d] text-black"
                                            : "border-gray-300 text-gray-500 hover:border-orange-400"
                                        }
                                        ${
                                          isType2Disabled(uniqueType)
                                            ? "opacity-50 cursor-not-allowed"
                                            : "cursor-pointer"
                                        }`}
                        onClick={() =>
                          !isType2Disabled(uniqueType) &&
                          setSelectedType2(uniqueType)
                        }
                      >
                        <div className="px-3 py-2">{uniqueType}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-row gap-2 justify-center items-center">
              <div className="text-gray-500 w-1/6">Số Lượng</div>
              <div className="flex flex-row items-center gap-3 w-5/6">
                <div className="flex items-center">
                  <button
                    className={`bg-gray-100 border border-gray-400 hover:bg-gray-100 transition px-4 py-3 w-10 h-8 flex justify-center items-center`}
                    onClick={decrease}
                  >
                    <div className="text-base pb-4">_</div>
                  </button>

                  {/* <div className="flex justify-center items-center px-4 py-2 w-10 h-10 text-xl">
                    {quantity}
                  </div> */}

                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      let inputValue = Number(e.target.value);
                      if (inputValue == 0) {
                        inputValue = 1;
                        e.target.value = "1";
                      }
                      setQuantity(inputValue);
                    }}
                    className="text-center border border-gray-400 w-15 h-8 no-spinner focus:border-black"
                  />

                  <button
                    className={`bg-gray-100 border border-gray-400 hover:bg-gray-100 transition px-4 py-3 w-10 h-8 flex justify-center items-center`}
                    onClick={increase}
                  >
                    <div className="text-xl">+</div>
                  </button>
                </div>
                {selectedDetail && (
                  <div className="flex flex-row items-center text-base">
                    ({selectedDetail.quantity})
                  </div>
                )}
              </div>
            </div>

            {quantity + 1 > Number(selectedDetail?.quantity) ? (
              <>
                <div className="mt-5 flex flex-row ustify-center items-center">
                  <div className="text-gray-500 w-1/6"></div>
                  <div className="w-5/6 text-[#ee4d2d] text-[0.9rem]">
                    Số lượng bạn chọn đã đạt mức tối đa của sản phẩm này
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mt-5 flex flex-row ustify-center items-center h-auto">
                  <div className="text-gray-500 w-1/6"></div>
                  <div className="w-5/6"></div>
                </div>
              </>
            )}

            <div className="mt-5 flex flex-row gap-2">
              <div
                onClick={() => handleAddToCart()}
                className="border border-[#ee4d2d] p-3 text-[#ee4d2d] bg-orange-100 cursor-pointer hover:bg-orange-200"
              >
                Thêm Vào Giỏ Hàng
              </div>
              <div className="border border-[#ee4d2d] p-3 w-36 text-white bg-[#ee4d2d] text-center cursor-pointer">
                Mua Ngay
              </div>
            </div>
          </div>
        </div>
        {/* Shop Information */}
        <div className="mt-5 p-5 flex flex-1 bg-white">
          <div className="w-2/5">
            <div className="flex flex-row items-center justify-start">
              <img
                src="https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lp09rsokn9e6e7@resize_w450_nl.webp"
                alt="Shop Avatar"
                className="w-25 h-25 object-cover p-3 rounded-full"
              />
              <div className="flex flex-col justify-items-start">
                <div id="shop_name">okmua.com.vn</div>
                <div className="text-gray-500 text-xs">
                  Online 13 phút trước
                </div>
                <div className="flex flex-row gap-2 mt-2">
                  <div className="border border-[#ee4d2d] px-3 h-10 flex items-center justify-center text-[#ee4d2d] bg-orange-100 cursor-pointer hover:bg-orange-200 transition">
                    Chat ngay
                  </div>
                  <div className="border border-[#ee4d2d] px-3 h-10 flex items-center justify-center text-[#ee4d2d] bg-orange-100 cursor-pointer hover:bg-orange-200 transition">
                    Xem shop
                  </div>
                  <div
                    className="border border-[#ee4d2d] px-3 h-10 flex items-center justify-center text-white bg-[#ee4d2d] cursor-pointer hover:bg-red-600 transition"
                    onClick={() => setStateVoucherShopDialog(true)}
                  >
                    Xem voucher
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-[1px] h-auto bg-gray-400 ml-[-5px]"></div>

          <div className="w-3/5 overflow-auto p-5 flex">
            <div className="flex-1 p-3 text-center">
              <div className="flex flex-col">
                <label className="text-gray-500">Đánh giá:</label>
                <p className="text-[#ee4d2d]">87.7k</p>
              </div>
            </div>
            <div className="flex-1 p-3 text-center">
              <div className="flex flex-col">
                <label className="text-gray-500">Sản phẩm:</label>
                <p className="text-[#ee4d2d]">77</p>
              </div>
            </div>
            <div className="flex-1 p-3 text-center">
              <div className="flex flex-col">
                <label className="text-gray-500">Người theo dõi:</label>
                <p className="text-[#ee4d2d]">40.3k</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-5 flex flex-col bg-white mt-5">
          <div className="p-3 bg-gray-200 font-medium text-xl">
            CHI TIẾT SẢN PHẨM
          </div>

          <div className="flex flex-col gap-2 mt-5 ml-1">
            <div className="flex flex-row items-center">
              <p className="font-medium w-28">Danh mục</p>
              <p className="text-gray-600">Nội thất văn phòng</p>
            </div>
            <div className="flex flex-row items-center">
              <p className="font-medium w-28">Kho</p>
              <p className="text-gray-600">1899</p>
            </div>
            <div className="flex flex-row items-center">
              <p className="font-medium w-28">Gửi từ</p>
              <p className="text-gray-600">TP Hồ Chí Minh</p>
            </div>
          </div>

          <div className="p-3 bg-gray-200 font-medium text-xl mt-5">
            MÔ TẢ SẢN PHẨM
          </div>

          <div className="h-[100vh] w-full bg-red-200">
            <p>
              🔰🔰🔰 LAM DIGITAL XIN KÍNH CHÀO QUÍ KHÁCH🔰🔰🔰 LAM Digital là
              nhà nhập khẩu và phân phối chuyên nghiệp các sản phẩm phụ kiện,
              cáp sạc, đầu chuyển, thiết bị âm thanh, ánh sáng... Chúng tôi mong
              muốn cung cấp sản phẩm chất lượng tốt, với dịch vụ hậu mãi online
              '\n' uy tín và đi kèm giá cả phải chăng. Các sản phẩm của shop
              được dán nhãn bảo hành uy tín và mặc định bảo hành 1 đổi 1 đối với
              lỗi của nhà sản xuất trong vòng ít nhất 3 tháng.
              _______________________________ ✅ CHI TIẾT SẢN PHẨM Cáp chuyển
              USB Type C sang USB 3.0 và HDMI được sử dụng để kết nối các thiết
              bị có hỗ trợ cổng kết nối USB Type C sang các thiết bị trình chiếu
              như màn hình máy chiếu hoặc Tivi có hỗ trợ cổng kết nối HDMI. Cáp
              chuyển đổi USB type C có độ phân giải lên đến 4K và tương thích
              tốt với các thiết bị của Apple. Tên sản phẩm : HUB Chuyển Mở Rộng
              Type-C Sang HDMI, USB 3.0 và Type-C Màu sắc : Đen + Nhôm Phay
              Nguyên Khối Chất liệu : Hợp Kim Nhôm Đầu Vào : USB Type-C Đầu Ra :
              - HDMI 4K @ 30 Hz - USB 3.0 high speed 5Gbps/ - USB Type C - PD
              100W Tương Thích: Quý Khách Kiểm Tra Thiết Bị Có Cỗng Type C Hỗ
              Trợ Thunderbolt Hoặc DisplayPort. - Các thiết bị Windows có tương
              thích tốt. - Các thiết bị MacOS (Macbook, iPad, iPhone 15 v.v...)
              có tương thích tốt. - Các thiết bị Samsung có hỗ trợ Samsung Dex.
              - Các thiết bị Android khác nên kiểm tra với nhà sản xuất. Kích
              thước sản phẩm : 12 x 59 x 54 mm Nguồn pin cấp : Tương thích với
              sạc nhanh 100 Watt. Tặng kèm: Đèn Ngủ USB Siêu Sáng 1W. Bảo Hành:
              Bao hành 6 tháng 1 gửi đổi 1 do lỗi nhà sản xuất (không áp dụng
              với sản phẩm cáp sạc). Tem nhãn sẽ được dán trên sản phẩm trước
              khi gửi hàng. Công ty TNHH LAM Digital hoạt động với phương châm
              Uy Tín – Minh Bạch - Chất Lượng. Chúng tôi cố gắng từng ngày để
              đạt được sự tín nhiệm của quý khách hàng. Rất mong được sự ủng hộ
              của quý khách!
            </p>
          </div>
        </div>
        {stateVoucherShopDialog && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 shadow-lg w-96">
              <h2 className="text-lg font-semibold mb-4">Voucher của Shop</h2>
              <div className="flex flex-col justify-center items-center gap-3">
                <div className="flex flex-row justify-center items-center gap-2">
                  <p className="text-xs border w-auto flex items-center justify-center text-white bg-[#ee4d2d] px-2 py-1 rounded">
                    50% Giảm
                  </p>
                  <p className="text-gray-600 text-sm">
                    Giảm 50% cho đơn hàng trên 500K!
                  </p>
                </div>

                <div className="w-full border-t border-gray-300"></div>

                <div className="flex flex-row justify-center items-center gap-2">
                  <p className="text-xs border w-auto flex items-center justify-center text-white bg-[#ee4d2d] px-2 py-1 rounded">
                    50% Giảm
                  </p>
                  <p className="text-gray-600 text-sm">
                    Giảm 50% cho đơn hàng trên 500K!
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  className="bg-[#ee4d2d] text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  onClick={() => setStateVoucherShopDialog(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </HomeLayout>
    </>
  );
};
