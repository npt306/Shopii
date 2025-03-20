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
import { RatingStars } from "../helpers/utility/calculateRatingStars";
import { QuantitySelector } from "../components/common/quantitySelector";

const PRODUCT_URL = "http://localhost:3000/product/detail/";

export const ProductDetailPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(
    null
  );

  const productThumbnails = [
    productDetail?.video,
    ...(productDetail?.images || []),
  ].filter(Boolean);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await axios.get(`${PRODUCT_URL}${id}`);
        setProductDetail(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching product detail:", error);
      }
    };

    if (id) {
      fetchProductDetail();
    }
  }, [id]);

  const [selectedMedia, setSelectedMedia] = useState<string | null>(
    productThumbnails[0] || null
  );
  const [selectedType1, setSelectedType1] = useState("");
  const [selectedType2, setSelectedType2] = useState("");

  const [liked, setLiked] = useState(false);

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

  return (
    <>
      <HomeLayout>
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
                                    : "text-gray-600 hover:text-orange-500 cursor-pointer"
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
                                    : "text-gray-600 hover:text-orange-500 cursor-pointer"
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
                    <FaHeart className="text-red-500 w-6 h-6" />
                  ) : (
                    <FaRegHeart className="text-red-500 w-6 h-6" />
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

            <div className="bg-gray-100 p-5 mt-5 flex flex-row">
              <div className="flex flex-row gap-1 text-3xl items-center text-red-500">
                <div className="underline underline-offset-2 text-xl">đ</div>
                <div className="">{productDetail?.details[0].price}</div>
              </div>

              {/* <div className="flex flex-row gap-1 items-center text-gray-400 line-through ml-1">
                <div className="underline underline-offset-2 text-xs">đ</div>
                <div className="text-base">{productDetail.oldPrice}</div>
              </div>

              <div className="flex flex-row items-center text-red-500 font-medium bg-red-100 px-2 ml-1 border rounded-sm">
                <div className="text-xs">{productDetail.discount}</div>
              </div> */}
            </div>

            <div className="mt-5">
              <div className="flex flex-row items-center gap-3">
                <p className="text-gray-500">Combo Khuyến Mãi:</p>
                <div className="p-1 border border-orange-500 text-red-500 text-xs">
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
                                            ? "border-orange-500 bg-orange-100 text-black"
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
                                            ? "border-orange-500 bg-orange-100 text-black"
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

            <div className="mt-5 flex flex-row gap-2">
              <QuantitySelector />
              {selectedDetail && (
                <div className="flex flex-row items-center text-base">
                  ({selectedDetail.quantity})
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-row gap-2">
              <div className="border border-orange-500 p-3 text-orange-500 bg-orange-100 cursor-pointer hover:bg-orange-200">
                Thêm Vào Giỏ Hàng
              </div>
              <div className="border border-orange-500 p-3 w-36 text-white bg-red-500 text-center cursor-pointer">
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
                  <div className="border border-orange-500 px-3 h-10 flex items-center justify-center text-orange-500 bg-orange-100 cursor-pointer hover:bg-orange-200 transition">
                    Chat ngay
                  </div>
                  <div className="border border-orange-500 px-3 h-10 flex items-center justify-center text-orange-500 bg-orange-100 cursor-pointer hover:bg-orange-200 transition">
                    Xem shop
                  </div>
                  <div
                    className="border border-orange-500 px-3 h-10 flex items-center justify-center text-white bg-red-500 cursor-pointer hover:bg-red-600 transition"
                    onClick={() => setIsModalOpen(true)}
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
                <p className="text-orange-500">87.7k</p>
              </div>
            </div>
            <div className="flex-1 p-3 text-center">
              <div className="flex flex-col">
                <label className="text-gray-500">Sản phẩm:</label>
                <p className="text-orange-500">77</p>
              </div>
            </div>
            <div className="flex-1 p-3 text-center">
              <div className="flex flex-col">
                <label className="text-gray-500">Người theo dõi:</label>
                <p className="text-orange-500">40.3k</p>
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

          <div className="p-3 bg-gray-200 font-medium text-xl mt-5 ml-1">
            MÔ TẢ SẢN PHẨM
          </div>

          <div className="div"></div>
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="bg-white p-6 shadow-lg w-96">
              <h2 className="text-lg font-semibold mb-4">Voucher của Shop</h2>
              <div className="flex flex-col justify-center items-center gap-3">
                <div className="flex flex-row justify-center items-center gap-2">
                  <p className="text-xs border w-auto flex items-center justify-center text-white bg-orange-500 px-2 py-1 rounded">
                    50% Giảm
                  </p>
                  <p className="text-gray-600 text-sm">
                    Giảm 50% cho đơn hàng trên 500K!
                  </p>
                </div>

                <div className="w-full border-t border-gray-300"></div>

                <div className="flex flex-row justify-center items-center gap-2">
                  <p className="text-xs border w-auto flex items-center justify-center text-white bg-orange-500 px-2 py-1 rounded">
                    50% Giảm
                  </p>
                  <p className="text-gray-600 text-sm">
                    Giảm 50% cho đơn hàng trên 500K!
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  onClick={() => setIsModalOpen(false)}
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
