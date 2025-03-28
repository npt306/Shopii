import { useEffect, useRef, useState } from "react";
import axios from 'axios';
import { useParams, useNavigate } from "react-router-dom";
import OrangeButton from "../../../components/common/OrangeButton";
import { Search, ChevronDown } from "lucide-react";

import All from "./All";
import AllActived from "./AllActived";
import Restock from "./Restock";
import Reviewing from "./Reviewing";
import Need_optimized from "./Need_optimized";
import Banned from "./Banned";
import Deboosted from "./Deboosted";
import Deleted from "./Deleted";
import Unlisted from "./Unlisted";
import Draft from "./Draft";

interface Dimension {
    weight: string;
    length: string;
    width: string;
    height: string;
}

interface ProductDetail {
    type_id: number;
    type_1: string;
    type_2: string;
    image: string;
    price: number;
    quantity: number;
    dimension: Dimension;
}

interface Classification {
    classTypeName: string;
    level: number;
}

interface Product {
    productID: number;
    name: string;
    description: string;
    categories: string[];
    images: string[];
    soldQuantity: number;
    rating: string;
    coverImage: string;
    video: string;
    quantity: number;
    reviews: number;
    classifications: Classification[];
    details: ProductDetail[];
}


const AllProduct = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchText, setSearchText] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);


    const { type: currentType = "live" } = useParams<{ type: string }>();
    const { param: currentParam = "all" } = useParams<{ param: string }>();


    const navigate = useNavigate();

    const [inkBarStyle, setInkBarStyle] = useState({ width: 0, left: 0 }); // Vị trí và kích thước ink bar
    const [inkBarStyleC, setInkBarStyleC] = useState({ width: 0, left: 0 }); // Vị trí và kích thước ink bar
    const [inkBarStyleB, setInkBarStyleB] = useState({ width: 0, left: 0 }); // Vị trí và kích thước ink bar
    const [inkBarStyleP, setInkBarStyleP] = useState({ width: 0, left: 0 }); // Vị trí và kích thước ink bar

    const [selectedType, setSelectedType] = useState("");
    const [selectedContent, setSelectedContent] = useState("");
    const [selectedIssue, setSelectedIssue] = useState("");



    const typeRefs = useRef<HTMLButtonElement[]>([]); // Tham chiếu đến các tab type
    const contentRefs = useRef<HTMLButtonElement[]>([]); // Tham chiếu đến các tab content
    const banRefs = useRef<HTMLButtonElement[]>([]); // Tham chiếu đến các tab ban
    const postRefs = useRef<HTMLButtonElement[]>([]); // Tham chiếu đến các tab post



    const types = [
        { key: "all", label: "Tất cả" },
        { key: "live", label: "Đang hoạt động(0)" },
        { key: "violation", label: "Vi phạm(0)" },
        { key: "reviewing", label: "Chờ duyệt bởi Shopee(0)" },
        { key: "unpublished", label: "Chưa được đăng(0)" },
    ];

    const contents = [
        { key: "all", label: "Tất cả" },
        { key: "restock", label: "Cần bổ sung hàng (0)" },
        { key: "need_optimized", label: "Cần Cải Thiện Nội Dung (0)" },
    ];

    const bans = [
        { key: "banned", label: "Đã tạm khóa (0)" },
        { key: "deboosted", label: "Hạn chế hiển thị (0)" },
        { key: "deleted", label: "Đã xóa bởi Shopee (0)" },
    ];

    const posts = [
        { key: "unlisted", label: "Đã ẩn (0)" },
        { key: "draft", label: "Bản nháp (0)" },
    ];

    const fetchProducts = async () => {
        try {
            const response = await axios.get<Product[]>('http://34.58.241.34:3001/product/seller/1');
            setProducts(response.data);
            setFilteredProducts(response.data);
            setLoading(false);
        } catch (err) {
            if (err instanceof Error) {
                setError('Error fetching products: ' + err.message);
            } else {
                setError('An unknown error occurred');
            }
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://34.58.241.34:3001/categories/names');
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    };

    useEffect(() => {
        fetchProducts();

        const getCategories = async () => {
            const categoryNames = await fetchCategories();
            setCategories(categoryNames);
        };

        getCategories();

        const activeType = typeRefs.current.find(
            (type) => type?.getAttribute("data-key") === currentType
        );

        if (activeType) {
            const { offsetWidth, offsetLeft } = activeType;
            setInkBarStyle({ width: offsetWidth, left: offsetLeft });
        }

        const activeContent = contentRefs.current.find(
            (content) => content?.getAttribute("data-key") === currentParam
        );

        if (activeContent) {
            const { offsetWidth, offsetLeft } = activeContent;
            setInkBarStyleC({ width: offsetWidth, left: offsetLeft });
        }

        const activeBan = banRefs.current.find(
            (ban) => ban?.getAttribute("data-key") === currentParam
        );

        if (activeBan) {
            const { offsetWidth, offsetLeft } = activeBan;
            setInkBarStyleB({ width: offsetWidth, left: offsetLeft });
        }

        const activePost = postRefs.current.find(
            (post) => post?.getAttribute("data-key") === currentParam
        );

        if (activePost) {
            const { offsetWidth, offsetLeft } = activePost;
            setInkBarStyleP({ width: offsetWidth, left: offsetLeft });
        }
        applyFilters();
    }, [currentType, currentParam]);

    const handleTypeChange = (type: string) => {
        navigate(`/portal/product/list/${type}`);
        resetFilters();
    };

    const handleParamChange = (type: string, param: string) => {
        navigate(`/portal/product/list/${type}/${param}`);
        resetFilters();
    };

    const handleClick = () => {
        navigate('/portal/product/new');
        resetFilters();
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(e.target.value);
    };

    // Handle category selection change
    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategory(e.target.value);
    };

    // Apply filters
    const applyFilters = () => {
        let result = [...products];

        // Filter by search text (product name, type_1, type_2)
        if (searchText.trim() !== '') {
            const searchLower = searchText.toLowerCase();
            result = result.filter(product =>
                // Search by product name
                product.name.toLowerCase().includes(searchLower) ||
                // Search by type_1 and type_2 in product details
                product.details.some(detail =>
                    (detail.type_1 && detail.type_1.toLowerCase().includes(searchLower)) ||
                    (detail.type_2 && detail.type_2.toLowerCase().includes(searchLower))
                )
            );
        }

        // Filter by category
        if (selectedCategory !== '') {
            result = result.filter(product =>
                product.categories.includes(selectedCategory)
            );
        }
        setFilteredProducts(result);
    };

    // Reset filters
    const resetFilters = () => {
        setSearchText('');
        setSelectedCategory('');
        setFilteredProducts(products);
    };

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

    return (
        <div className="p-2 pt-4">
            {/* Hàng trên cùng với chữ Tất cả và các nút */}
            <div className="relative mb-4 flex items-center justify-between">
                <span className="px-3 py-2 text-2xl text-black">Sản phẩm</span>
                <div className="px-4 py-2 flex space-x-4">
                    <OrangeButton
                        className="eds-button--normal" onClick={handleClick}
                        label={
                            <>
                                <svg viewBox="0 0 32 32" fill="currentColor" className="w-5 h-5 mr-2">
                                    <path d="M17.5 2.5h-3v12h-12v3h12v12h3v-12h12v-3h-12v-12z"></path>
                                </svg>
                                <span>Thêm một sản phẩm mới</span>
                            </>
                        }
                    />

                </div>
            </div>

            {/* Tabs button */}
            <div className="relative mb-4 flex items-center justify-between">
                {/* Tabs */}
                <div className="flex">
                    {types.map((type, index) => (
                        <button
                            key={type.key}
                            ref={(el) => (typeRefs.current[index] = el!)} // Lưu tham chiếu vào mảng
                            data-key={type.key}
                            onClick={() => handleTypeChange(type.key)}
                            className={`px-4 py-2 relative bg-gray-100 ${currentType === type.key
                                ? "font-bold text-orange-500"
                                : "text-gray-600 hover:text-orange-500"
                                }`}
                            style={{
                                outline: "none", // Loại bỏ viền đen khi chọn
                                border: "none", // Loại bỏ viền mặc định
                            }}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
                {/* Ink Bar */}
                <div
                    className="absolute bottom-0 h-[3px] bg-orange-500 transition-all duration-300"
                    style={{
                        width: `${inkBarStyle.width}px`,
                        left: `${inkBarStyle.left}px`,
                    }}
                />
            </div>

            <div className="m-3 bg-white p-4 rounded shadow">

                {currentType === "live" && (
                    <>
                        {/* Tabs button */}
                        <div className="relative mb-4 flex items-center justify-between">
                            {/* Tabs */}
                            <div className="flex border border-gray-300 rounded">
                                {contents.map((content, index) => (
                                    <button
                                        key={content.key}
                                        ref={(el) => (contentRefs.current[index] = el!)} // Lưu tham chiếu vào mảng
                                        data-key={content.key}
                                        onClick={() => handleParamChange(currentType, content.key)}
                                        className={`px-4 py-2 relative bg-gray-100 ${currentParam === content.key
                                            ? "font-bold text-orange-500"
                                            : "text-gray-600 hover:text-orange-500"
                                            }`}
                                        style={{
                                            outline: "none", // Loại bỏ viền đen khi chọn
                                            border: "none", // Loại bỏ viền mặc định
                                            borderRadius: "0", // Loại bỏ bo tròn góc
                                        }}
                                    >
                                        {content.label}
                                    </button>
                                ))}
                            </div>
                            {/* Ink Bar */}
                            <div
                                className="absolute bottom-0 h-[3px] bg-orange-500 transition-all duration-300"
                                style={{
                                    width: `${inkBarStyleC.width}px`,
                                    left: `${inkBarStyleC.left}px`,
                                }}
                            />
                        </div>
                    </>
                )}

                {currentType === "violation" && (
                    <>
                        {/* Tabs button */}
                        <div className="relative mb-4 flex items-center justify-between">
                            {/* Tabs */}
                            <div className="flex border border-gray-300 rounded">
                                {bans.map((ban, index) => (
                                    <button
                                        key={ban.key}
                                        ref={(el) => (banRefs.current[index] = el!)} // Lưu tham chiếu vào mảng
                                        data-key={ban.key}
                                        onClick={() => handleParamChange(currentType, ban.key)}
                                        className={`px-4 py-2 relative bg-gray-100 ${currentParam === ban.key
                                            ? "font-bold text-orange-500"
                                            : "text-gray-600 hover:text-orange-500"
                                            }`}
                                        style={{
                                            outline: "none", // Loại bỏ viền đen khi chọn
                                            border: "none", // Loại bỏ viền mặc định
                                            borderRadius: "0", // Loại bỏ bo tròn góc
                                        }}
                                    >
                                        {ban.label}
                                    </button>
                                ))}
                            </div>
                            {/* Ink Bar */}
                            <div
                                className="absolute bottom-0 h-[3px] bg-orange-500 transition-all duration-300"
                                style={{
                                    width: `${inkBarStyleB.width}px`,
                                    left: `${inkBarStyleB.left}px`,
                                }}
                            />

                        </div>
                    </>
                )}

                {currentType === "unpublished" && (
                    <>
                        {/* Tabs button */}
                        <div className="relative mb-4 flex items-center justify-between">
                            {/* Tabs */}
                            <div className="flex border border-gray-300 rounded">
                                {posts.map((post, index) => (
                                    <button
                                        key={post.key}
                                        ref={(el) => (postRefs.current[index] = el!)} // Lưu tham chiếu vào mảng
                                        data-key={post.key}
                                        onClick={() => handleParamChange(currentType, post.key)}
                                        className={`px-4 py-2 relative bg-gray-100 ${currentParam === post.key
                                            ? "font-bold text-orange-500"
                                            : "text-gray-600 hover:text-orange-500"
                                            }`}
                                        style={{
                                            outline: "none", // Loại bỏ viền đen khi chọn
                                            border: "none", // Loại bỏ viền mặc định
                                            borderRadius: "0", // Loại bỏ bo tròn góc
                                        }}
                                    >
                                        {post.label}
                                    </button>
                                ))}
                            </div>
                            {/* Ink Bar */}
                            <div
                                className="absolute bottom-0 h-[3px] bg-orange-500 transition-all duration-300"
                                style={{
                                    width: `${inkBarStyleP.width}px`,
                                    left: `${inkBarStyleP.left}px`,
                                }}
                            />
                        </div>
                    </>
                )}

                {currentParam === "restock" && (
                    <>
                        {/* Lọc nhanh */}
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="text-gray-700 text-sm font-medium">Lọc nhanh</span>
                            <button
                                className={`px-3 py-1 border rounded bg-white ${selectedType === "not" ? "border-orange-500 text-orange-500" : "border-gray-300 text-black"}`}
                                onClick={() => {
                                    setSelectedType("not");
                                    let result = [...products];
                                    result = result.filter(product =>
                                        product.details.some(detail => detail.quantity === 0)
                                    );
                                    setFilteredProducts(result);
                                }}
                            >
                                Hết hàng (0)
                            </button>
                            <button
                                className={`px-3 py-1 border rounded bg-white ${selectedType === "notyet" ? "border-orange-500 text-orange-500" : "border-gray-300 text-black"}`}
                                onClick={() => {
                                    setSelectedType("notyet");
                                    let result = [...products];
                                    result = result.filter(product =>
                                        product.details.some(detail => detail.quantity > 0 && detail.quantity <= 20)
                                    );
                                    setFilteredProducts(result);
                                }}
                            >
                                Sắp hết hàng (0)
                            </button>
                        </div>
                    </>
                )}

                {currentParam === "need_optimized" && (
                    <>
                        {/* Chất Lượng Nội Dung */}
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="text-gray-700 text-sm font-medium">Chất Lượng Nội Dung</span>
                            <button
                                className={`px-3 py-1 border rounded bg-white ${selectedContent === "need" ? "border-orange-500 text-orange-500" : "border-gray-300 text-black"
                                    }`}
                                onClick={() => setSelectedContent("need")}
                            >
                                Cần Cải thiện (0)
                            </button>
                            <button
                                className={`px-3 py-1 border rounded bg-white ${selectedContent === "Qualified" ? "border-orange-500 text-orange-500" : "border-gray-300 text-black"
                                    }`}
                                onClick={() => setSelectedContent("Qualified")}
                            >
                                Đạt chuẩn (0)
                            </button>
                        </div>

                        {/* Vấn đề	*/}
                        <div className="flex items-center space-x-2 mb-4">
                            <span className="text-gray-700 text-sm font-medium">Vấn đề
                            </span>
                            <button
                                className={`px-3 py-1 border rounded bg-white ${selectedIssue === "fail" ? "border-orange-500 text-orange-500" : "border-gray-300 text-black"
                                    }`}
                                onClick={() => setSelectedIssue("fail")}
                            >
                                Sai Thông tin sản phẩm (0)
                            </button>
                            <button
                                className={`px-3 py-1 border rounded bg-white ${selectedIssue === "picture" ? "border-orange-500 text-orange-500" : "border-gray-300 text-black"
                                    }`}
                                onClick={() => setSelectedIssue("picture")}
                            >
                                Hình ảnh (0)
                            </button>
                            <button
                                className={`px-3 py-1 border rounded bg-white ${selectedIssue === "notFull" ? "border-orange-500 text-orange-500" : "border-gray-300 text-black"
                                    }`}
                                onClick={() => setSelectedIssue("notFull")}
                            >
                                Thiếu Thông tin quan trọng (0)
                            </button>
                            <button
                                className={`px-3 py-1 border rounded bg-white ${selectedIssue === "another" ? "border-orange-500 text-orange-500" : "border-gray-300 text-black"
                                    }`}
                                onClick={() => setSelectedIssue("another")}
                            >
                                Thông tin khác (0)
                            </button>
                        </div>
                    </>
                )}


                <div className="flex flex-col mb-4 gap-4 w-full max-w-7xl bg-white rounded shadow">
                    <div className="flex gap-4">
                        {/* Product Search Input */}
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm Tên sản phẩm"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-400 text-black bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500"
                                    value={searchText}
                                    onChange={handleSearchChange}
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <Search size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Category Search */}
                        <div className="w-80">
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-2 border border-gray-400 text-black bg-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 appearance-none"
                                    value={selectedCategory}
                                    onChange={handleCategoryChange}
                                >
                                    <option value="">Chọn ngành hàng</option>
                                    {categories.map((category, index) => (
                                        <option key={index} value={category}>{category}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 pointer-events-none">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>


                {/* Buttons */}
                <div className="flex gap-4 mt-4">
                    <button
                        type="button"
                        className="text-sm text-white bg-blue-500 px-4 py-2 border border-blue-500 hover:bg-blue-600 transition rounded"
                        onClick={applyFilters}
                    >
                        Áp dụng
                    </button>
                    <button
                        type="button"
                        className="text-sm text-black bg-gray-100 px-4 py-2 border border-gray-300 hover:bg-gray-200 transition rounded"
                        onClick={resetFilters}
                    >
                        Đặt lại
                    </button>
                </div>
            </div>

            {/* Nội dung tab */}
            <div className="m-3 bg-white p-4 rounded shadow">
                {currentType === "all" && <All products={filteredProducts} />}
                {currentType === "live" && currentParam === "all" && <AllActived products={filteredProducts} />}
                {currentType === "live" && currentParam === "restock" && <Restock products={filteredProducts} />}
                {currentType === "live" && currentParam === "need_optimized" && <Need_optimized />}
                {currentType === "violation" && currentParam === "banned" && <Banned />}
                {currentType === "violation" && currentParam === "deboosted" && <Deboosted />}
                {currentType === "violation" && currentParam === "deleted" && <Deleted />}
                {currentType === "reviewing" && <Reviewing />}
                {currentType === "unpublished" && currentParam === "unlisted" && <Unlisted />}
                {currentType === "unpublished" && currentParam === "draft" && <Draft />}
            </div>
        </div>
    );
};

export default AllProduct;