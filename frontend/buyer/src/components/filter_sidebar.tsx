import { FaFilter, FaStar, FaRegStar } from 'react-icons/fa';
import { CiFilter } from "react-icons/ci";
import { useState } from 'react';
const ratings = [
    { stars: 5, label: "" },
    { stars: 4, label: "trở lên" },
    { stars: 3, label: "trở lên" },
    { stars: 2, label: "trở lên" },
    { stars: 1, label: "trở lên" }
];
interface PriceRange {
    min: number | null;
    max: number | null;
}
interface FilterSidebarFilters {
    categories: string[];
    priceRange: PriceRange;
}
interface FilterSidebarProps {
    onFilterChange: (filters: FilterSidebarFilters) => void;
    availableCategories: string[];
  }



export const FilterSidebar = ({ onFilterChange, availableCategories }: FilterSidebarProps) => {

    
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const getPriceRange = (): PriceRange => ({
        min: minPrice.trim() ? parseFloat(minPrice) : null,
        max: maxPrice.trim() ? parseFloat(maxPrice) : null
    });

    const updateFilters = (newCategories: string[] = selectedCategories) => {
        onFilterChange({ categories: newCategories, priceRange: getPriceRange() });
    };

    const handleCategoryChange = (category: string) => {
        const newCategories = selectedCategories.includes(category)
        ? selectedCategories.filter(c => c !== category)
        : [...selectedCategories, category];
        console.log(category);
        
        setSelectedCategories(newCategories);
        updateFilters(newCategories);
    };
    const handlePriceApply = () => {
        // onFilterChange is called with the current selected categories plus the new price range
        updateFilters();
    };
  
    const handleClearAll = () => {
        setSelectedCategories([]);
        setMinPrice('');
        setMaxPrice('');
        onFilterChange({ categories: [], priceRange: { min: null, max: null } });
    };



    return (
        <>
            <div className="flex flex-col items-start justify-center">
                <div className="flex flex-row items-center justify-center">
                    <CiFilter className="text-black mr-1" />
                    <p className='font-bold  '>BỘ LỌC TÌM KIẾM</p>
                </div>
                
                <div className="mt-3">
                    <p>Theo Danh Mục</p>
                    <div className="flex flex-col mt-1">
                        {availableCategories.map((category, index) => (
                            <label key={index} className="flex items-center space-x-2 cursor-pointer !mb-0.5">
                            <input
                                type="checkbox"
                                className="w-3 h-3 accent-white !text-orange-600 border-gray-300 shadow-xs"
                                checked={selectedCategories.includes(category)}
                                onChange={() => handleCategoryChange(category)}
                            />
                            <span className='pl-1'>{category}</span>
                            </label>
                        ))}
                    </div>
                    <div className="w-[218px] border-b-1 border-gray-300 mt-3"></div>
                </div>

                <div className="mt-3">
                    <p>Nơi Bán</p>
                    <div className="flex flex-col mt-1">
                        {["TP Hồ Chí Minh", "TP Hồ Chí Minh", "TP Hồ Chí Minh"].map((item, index) => (
                            <label key={index} className="flex items-center space-x-2 cursor-pointer !mb-0.5">
                                <input type="checkbox" className="w-3 h-3 accent-white !text-orange-600 border-gray-300 shadow-xs" />
                                <span className='pl-1'>{item}</span>
                            </label>
                        ))}
                    </div>
                    <div className="w-[218px] border-b-1 border-gray-300 mt-3"></div>
                </div>

                <div className="mt-3">
                    <p>Đơn Vị Vận Chuyển</p>
                    <div className="flex flex-col mt-1">
                        {["Nhanh", "Hỏa tốc", "Tiết kiệm"].map((item, index) => (
                            <label key={index} className="flex items-center space-x-2 cursor-pointer !mb-0.5">
                                <input type="checkbox" className="w-3 h-3 accent-white !text-orange-600 border-gray-300 shadow-xs" />
                                <span className='pl-1'>{item}</span>
                            </label>
                        ))}
                    </div>
                    <div className="w-[218px] border-b-1 border-gray-300 mt-3"></div>
                </div>

                <div className="mt-3">
                    <p>Thương Hiệu</p>
                    <div className="flex flex-col mt-1">
                        {["HCMUS", "HCMUS", "HCMUS"].map((item, index) => (
                            <label key={index} className="flex items-center space-x-2 cursor-pointer !mb-0.5">
                                <input type="checkbox" className="w-3 h-3 accent-white !text-orange-600 border-gray-300 shadow-xs" />
                                <span className='pl-1'>{item}</span>
                            </label>
                        ))}
                    </div>
                    <div className="w-[218px] border-b-1 border-gray-300 mt-3"></div>
                </div>

                <div className="mt-3">
                    <p className='!mb-0'>Khoảng giá</p>
                    <div className='flex flex-row items-center justify-center'>
                        <input
                            type="text"
                            placeholder="₫ TỪ"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-1/2 h-9 px-4 py-2 bg-white border border-gray-300 rounded-xs focus:outline"
                        />
                        <p className='!my-3 text-3xl px-3 text-gray-300'>-</p>
                        <input
                            type="text"
                            placeholder="₫ ĐẾN"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-1/2 h-9 px-4 py-2 bg-white border border-gray-300 rounded-xs focus:outline"
                        />
                    </div>
                    <button 
                        className="mt-2 flex justify-center items-center rounded-xs shadow-xs bg-orange-600 w-full mx-auto my-5 py-2 border border-orange-600 !text-white hover:bg-orange-300 transition duration-300 cursor-pointer"
                        onClick={handlePriceApply}
                    >
                        ÁP DỤNG
                    </button>
                    <div className="w-[218px] border-b-1 border-gray-300 mt-3"></div>
                </div>

                <div className="mt-3">
                    <p>Loại Shop</p>
                    <div className="flex flex-col mt-1">
                        {["Shopee Mall", "Shopee Mall", "Shopee Mall"].map((item, index) => (
                            <label key={index} className="flex items-center space-x-2 cursor-pointer !mb-0.5">
                                <input type="checkbox" className="w-3 h-3 accent-white !text-orange-600 border-gray-300 shadow-xs" />
                                <span className='pl-1'>{item}</span>
                            </label>
                        ))}
                    </div>
                    <div className="w-[218px] border-b-1 border-gray-300 mt-3"></div>
                </div>

                <div className="mt-3">
                    <p>Tình trạng</p>
                    <div className="flex flex-col mt-1">
                        {["Đã sử dụng", "Mới"].map((item, index) => (
                            <label key={index} className="flex items-center space-x-2 cursor-pointer !mb-0.5">
                                <input type="checkbox" className="w-3 h-3 accent-white !text-orange-600 border-gray-300 shadow-xs" />
                                <span className='pl-1'>{item}</span>
                            </label>
                        ))}
                    </div>
                    <div className="w-[218px] border-b-1 border-gray-300 mt-3"></div>
                </div>

                <div className="mt-3">
                    <p>Các lựa chọn thanh toán</p>
                    <div className="flex flex-col mt-1">
                        {["0% TRẢ GÓP"].map((item, index) => (
                            <label key={index} className="flex items-center space-x-2 cursor-pointer !mb-0.5">
                                <input type="checkbox" className="w-3 h-3 accent-white !text-orange-600 border-gray-300 shadow-xs" />
                                <span className='pl-1'>{item}</span>
                            </label>
                        ))}
                    </div>
                    <div className="w-[218px] border-b-1 border-gray-300 mt-3"></div>
                </div>

                <div className="mt-3">
                    <p>Đánh giá</p>
                    <div className="flex flex-col space-y-1 mt-1">
                        {ratings.map((rating, index) => (
                            <div key={index} className="flex items-center space-x-2 cursor-pointer">
                                {[...Array(5)].map((_, i) =>
                                    i < rating.stars ? (
                                        <FaStar key={i} className="text-yellow-500" />
                                    ) : (
                                        <FaRegStar key={i} className="text-yellow-500" />
                                    )
                                )}
                                <span className="text-sm">{rating.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="w-[218px] border-b-1 border-gray-300 mt-3"></div>
                </div>

                <div className="mt-3">
                    <p>Dịch Vụ & Khuyến Mãi</p>
                    <div className="flex flex-col mt-1">
                        {["Đang giảm giá", "Gì cũng rẻ", "Hàng có sẵn", "Mua giá bán buôn/ bán sĩ"].map((item, index) => (
                            <label key={index} className="flex items-center space-x-2 cursor-pointer !mb-0.5">
                                <input type="checkbox" className="w-3 h-3 accent-white !text-orange-600 border-gray-300 shadow-xs" />
                                <span className='pl-1'>{item}</span>
                            </label>
                        ))}
                    </div>
                    <div className="w-[218px] mt-3"></div>
                </div>

                <button 
                    className="mb-3 mt-3 flex justify-center items-center rounded-xs shadow-xs bg-orange-600  !w-full mx-auto my-5 py-2 border border-orange-600 !text-white hover:bg-orange-300 transition duration-300 cursor-pointer"
                    onClick={handleClearAll}
                >
                    XÓA TẤT CẢ
                </button>
            </div>
        </>
    );
}