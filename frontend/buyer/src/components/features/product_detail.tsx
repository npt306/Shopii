import { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaTwitter, FaFacebookMessenger, FaRegHeart, FaHeart } from 'react-icons/fa';
import { RatingStars } from "../../helpers/utility/calc_ratingstar";
import { QuantitySelector } from "../common/quantitySelector";
import { useParams } from "react-router-dom";
import axios from "axios";

interface ProductType {
    full_name: string;
    thumbnails: string[];
    price: string;
    oldPrice: string;
    discount: string;
    rating_count: number;
    review_count: number;
    sold_count: number;
    type_1?: {
        name_type: string;
        items: {
            name: string;
            img: string;
        }[];
    };
    type_2?: {
        name_type: string;
        items: {
            name: string;
            img: string;
        }[];
    };
}

interface ProductDetail {
    name: string;
    description: string;
    categories: string[];
    images: string[];
    soldQuantity: number;
    rating: string;
    coverImage: string;
    video: string;
    quantity: number | null;
    reviews: number;
    classifications: {
        classTypeName: string;
        level: number;
    }[];
    details: {
        type_1: string;
        type_2: string;
        image: string;
        price: number;
        quantity: number;
    }[];
}

export const DetailProduct = () => {
    const { id } = useParams<{ id: string }>();
    const [productDetail, setProductDetail] = useState<ProductDetail | null>(null);

    const productThumbnails = [
        productDetail?.video,
        ...(productDetail?.images || []),
    ].filter(Boolean);

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/product/detail/${id}`);
                setProductDetail(response.data);
            } catch (error) {
                console.error("Error fetching product detail:", error);
            }
        };

        if (id) {
            fetchProductDetail();
        }
    }, [id]);

    const product: ProductType = {
        full_name: "Ghế Xoay Văn Phòng Tựa Đầu, Ghế Văn Phòng Chân Xoay Lưng xương cá, ngả lưng gật gù, thư giãn êm ái",
        thumbnails: [
            "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lp09rsokn9e6e7@resize_w450_nl.webp",
            "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lowegop2zgb2be@resize_w450_nl.webp",
            "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lpx5x7nf30luf8@resize_w450_nl.webp",
            "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lowegop352kuc8@resize_w450_nl.webp",
            "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lowegop36h5aca@resize_w450_nl.webp",
            "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lp09rsokn9e6e7@resize_w450_nl.webp",
            "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lpx5x7nf30luf8@resize_w450_nl.webp"
        ],
        price: "480.000",
        oldPrice: "748.500",
        discount: "36%",

        rating_count: 4.6,
        review_count: 1200,
        sold_count: 4700,

        type_1: {
            name_type: "Loai 1",
            items: [
                {
                    name: "Ghế văn phòng",
                    img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lp09rsokn9e6e7@resize_w450_nl.webp"
                },
                {
                    name: "Phiên bản dày",
                    img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lowegop2zgb2be@resize_w450_nl.webp"
                }
            ]
        },

        type_2: {
            name_type: "Loai 2",
            items: [
                {
                    name: "Ghế văn phòng 2",
                    img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lp09rsokn9e6e7@resize_w450_nl.webp"
                },
                {
                    name: "Phiên bản dày 2",
                    img: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lowegop2zgb2be@resize_w450_nl.webp"
                }
            ]
        },
    }

    const [selectedMedia, setSelectedMedia] = useState<string | null>(productThumbnails[0] || null);
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
    const hasType1 = productDetail?.classifications[0] && productDetail?.details.some(detail => detail.type_1);
    const hasType2 = productDetail?.classifications[1] && productDetail?.details.some(detail => detail.type_2);

    // Find the selected product detail based on selected types
    const selectedDetail = productDetail?.details.find(detail =>
        (hasType1 ? detail.type_1 === selectedType1 : true) &&
        (hasType2 ? detail.type_2 === selectedType2 : true)
    );

    return (
        <div className="flex flex-1 w-full mx-auto my-5" >
            <div className="w-2/5 bg-white p-5" >
                <div className="flex flex-col">
                    {selectedMedia && selectedMedia.endsWith('.mp4') ? (
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
                                ${currentIndex === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-orange-500 cursor-pointer'}`}
                            disabled={currentIndex === 0}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Thumbnails */}
                        <div className="flex flex-row justify-between w-full">
                            {productThumbnails
                                .slice(currentIndex, currentIndex + 5)
                                .map((media, index) => {
                                    if (!media) return null;
                                    const isImage = media.endsWith('.jpg') || media.endsWith('.png') || media.endsWith('.webp'); // Add other image extensions as needed
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
                                ${currentIndex >= productThumbnails.length - 5 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-orange-500 cursor-pointer'}`}
                            disabled={currentIndex >= productThumbnails.length - 5}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex flex-row items-center justify-center mt-5">
                    <div className="flex flex-row justify-between items-center gap-1">
                        Chia sẻ:
                        <FaFacebookMessenger size={30} className="text-blue-500 cursor-pointer" />
                        <FaFacebook size={30} className="text-blue-500 cursor-pointer" />
                        <FaInstagram size={30} className="text-pink-500 cursor-pointer" />
                        <FaTwitter size={30} className="text-blue-500 cursor-pointer" />
                    </div>

                    <div className="h-6 w-[1px] bg-gray-400 mx-10"></div>

                    <div className="flex flex-row justify-center items-center">
                        <button onClick={() => setLiked(!liked)}>
                            {liked ? <FaHeart className="text-red-500 w-6 h-6" /> : <FaRegHeart className="text-red-500 w-6 h-6" />}
                        </button>
                        <div className="text-sm ml-2">Đã thích (764)</div>
                    </div>
                </div>
            </div>

            <div className="w-3/5 bg-white overflow-auto p-5" >
                <div className="text-xl">{productDetail?.name}</div>
                <div className="flex flex-row justify-between w-full mt-2">
                    <div className="flex flex-row">
                        <div id='star' className="flex flex-row gap-1 justify-center items-center">
                            <div className="underline underline-offset-4">{product.rating_count}</div>
                            <RatingStars rating={product.rating_count} />
                        </div>

                        <div className="h-6 w-[1px] bg-gray-400 mx-5"></div>

                        <div id='review' className="flex flex-row gap-1 justify-center items-center">
                            <div className="underline underline-offset-4">{productDetail?.reviews}</div>
                            Đánh giá
                        </div>

                        <div className="h-6 w-[1px] bg-gray-400 mx-5"></div>

                        <div id='sold' className="flex flex-row gap-1 justify-center items-center">
                            <div className="underline underline-offset-4">{productDetail?.soldQuantity}</div>
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

                    <div className="flex flex-row gap-1 items-center text-gray-400 line-through ml-1">
                        <div className="underline underline-offset-2 text-xs">đ</div>
                        <div className="text-base">{product.oldPrice}</div>
                    </div>

                    <div className="flex flex-row items-center text-red-500 font-medium bg-red-100 px-2 ml-1 border rounded-sm">
                        <div className="text-xs">{product.discount}</div>
                    </div>
                </div>

                <div className="mt-5">
                    <div className="flex flex-row items-center gap-3">
                        <p className="text-gray-500">Combo Khuyến Mãi:</p>
                        <div className="p-1 border border-orange-500 text-red-500 text-xs">Mua 2 & giảm 1%</div>
                    </div>
                </div>

                <div className="mt-5">
                    <div className="flex flex-row items-center gap-3">
                        <p className="text-gray-500">Vận Chuyển:</p>
                        <p className="text-gray-500 text-xs">Nhận từ 9 Th02 - 14 Th02, phí giao ₫0</p>
                    </div>
                </div>

                {productDetail?.classifications[0] && (
                    <div className="mt-5">
                        <div className="flex flex-row items-start">
                            <p className="text-gray-500 w-1/6">{productDetail?.classifications[0].classTypeName}</p>
                            <div className="flex flex-wrap w-5/6 gap-3">
                                {[...new Map(productDetail?.details.map(detail => [detail.type_1, detail])).entries()].map(([uniqueType, detail], index) => (
                                    <div
                                        key={index}
                                        className={`p-2 border text-xs flex flex-row items-center gap-1 transition-all duration-300 
                                        ${selectedType1 === uniqueType ? "border-orange-500 bg-orange-100 text-black" : "border-gray-300 text-gray-500 hover:border-orange-400"}
                                        ${detail.quantity === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                        onClick={() => detail.quantity > 0 && setSelectedType1(uniqueType)}
                                    >
                                        <img src={detail.image} alt={uniqueType} className="w-[24px] h-[24px] object-cover rounded" />
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
                            <p className="text-gray-500 w-1/6">{productDetail?.classifications[1].classTypeName}</p>
                            <div className="flex flex-wrap w-5/6 gap-3">
                                {[...new Map(productDetail?.details.map(detail => [detail.type_2, detail])).entries()].map(([uniqueType, detail], index) => (
                                    <div
                                        key={index}
                                        className={`border text-xs flex flex-row items-center gap-1 transition-all duration-300 
                                        ${selectedType2 === uniqueType ? "border-orange-500 bg-orange-100 text-black" : "border-gray-300 text-gray-500 hover:border-orange-400"}
                                        ${detail.quantity === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                        onClick={() => detail.quantity > 0 && setSelectedType2(uniqueType)}
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
        </div >
    );
};
