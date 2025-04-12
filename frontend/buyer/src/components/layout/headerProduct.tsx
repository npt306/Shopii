// import classNames from "classnames";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { FaShoppingCart, FaSearch } from "react-icons/fa";

import { Header } from "./header";

import logoShopee from "../../assets/logo_shopee_1.png";
import "../../css/page/cartPage.css";

import { formatPrice } from "../../helpers/utility/formatPrice";

import { useCart } from "../../context/cartContext";

import { BasicItem } from "../../types/basicCart";

import { mockProducts } from "./mockdata/product_data";
import { EnvValue } from "../../env-value/envValue";
export const HeaderProduct = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { cartData, numberItem, loading, res, updateCart } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ id: number; Name: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  let navigate = useNavigate();



  useEffect(() => {
    updateCart(); // Khi component mount, lấy dữ liệu giỏ hàng
  }, []);

  const handleMoveToProduct = (productId: number) => {
    navigate(`/detail-product/${productId}`);
  };

  // const customClass = classNames(
  //   "p-3 absolute left-[-10rem] -translate-x-1/2 top-[2rem] bg-grey-100 mt-2 text-black bg-white shadow-lg w-[25rem] h-[26.5rem] flex justify-center",
  //   {
  //     "items-center": numberItem >= 5, // Nếu number >= 5 thì thêm class "items-center"
  //     "items-start": numberItem < 5, // Nếu number < 5 thì thêm class "items-start"
  //   }
  // );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
            setShowSuggestions(false);
        }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (value: string , selectedCategory?: string) => {
    setSearchTerm(value);
    if (value.trim()) {
        try {
            console.log("Fetching search results from backend...");
            let url = `${EnvValue.API_GATEWAY_URL}/api/search?q=${encodeURIComponent(value)}`;
            if (selectedCategory) {
                url += `&category=${encodeURIComponent(selectedCategory)}`;
            }
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // Transform the Elasticsearch response into an array similar to mockProducts
            const transformedResults = data.$.map((item: any) => ({
                id: item._source.id,
                Name: item._source.Name,
            }));
            setSuggestions(transformedResults.slice(0, 10));
        } catch (error) {
            console.error("Error fetching search results:", error);
            setSuggestions([]);
        }
    } else {
        console.log("Attempting to fetch search results from Elasticsearch...");

        setSuggestions(mockProducts.slice(0, 10)); // Show top 10 products when search term is empty
    }
    setShowSuggestions(true);
  };

  const navigateToSearchPage = (searchTerm: string) => {
    navigate(`api/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    navigateToSearchPage(suggestion);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
        navigateToSearchPage(searchTerm);
    }
};

  return (
    <>
      <Header></Header>
      <div className="bg-[#ee4d2d] px-30 flex justify-center items-center text-white">
        <div
          onClick={() => navigate("/home")}
          className="flex justify-center items-center cursor-pointer mr-10"
        >
          <img
            src={logoShopee}
            alt="Avatar"
            className="w-15 h-15 rounded-full pb-1"
          />
          <span className="text-3xl">Shopee</span>
        </div>

        <div className="relative w-[1024px] text-black">
          <input
            // type="text"
            // placeholder="Tìm kiếm sản phẩm"
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => handleSearch(searchTerm)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm kiếm"
            className="w-[95%] h-[2.8rem] px-4 py-2 bg-white border border-white rounded-md focus:border-black focus:outline-hidden"
          />
          <button 
            className="absolute w-[4rem] h-[2.3rem] right-14 top-1/2 -translate-y-1/2 bg-[#ee4d2d] px-3 py-2 cursor-pointer flex justify-center items-center rounded-md"
            onClick={() => navigateToSearchPage(searchTerm)}
          >
            <FaSearch className="text-white text-[1.1rem]" />
          </button>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg z-50">
                {suggestions.map((product) => (
                    <div
                        key={product.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSuggestionClick(product.Name)}
                    >
                        {product.Name}
                    </div>
                ))}
            </div>
          )}

        </div>

        <div
          className="relative cursor-pointer group"
          onMouseEnter={() => setIsVisible(true)}
        >
          <div onClick={() => navigate(`/cart/${res?.accountId}`)}>
            <FaShoppingCart size={24} />
            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              {numberItem}
            </span>
          </div>

          {isVisible && (
            <div
              className="p-3 absolute left-[-10rem] -translate-x-1/2 top-[2rem] bg-grey-100 mt-2 text-black bg-white shadow-lg w-[25rem] h-auto
              flex items-center justify-center z-30"
              onMouseEnter={() => setIsVisible(true)}
              onMouseLeave={() => setIsVisible(false)}
            >
              <div
                className="absolute -top-2 right-5
                border-l-8 border-l-transparent 
                border-r-8 border-r-transparent 
                border-b-8 border-b-white"
              ></div>
              {loading ? (
                <>
                  <div
                    className="h-[60vh] flex justify-center items-center"
                    role="status"
                  >
                    <svg
                      aria-hidden="true"
                      className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                  </div>
                </>
              ) : (
                <>
                  {cartData.length != 0 ? (
                    <>
                      <div className="flex flex-col">
                        <div className="text-black">Sản Phẩm Mới Thêm</div>
                        {cartData.map((item) =>
                          item.items.map((product: BasicItem) => (
                            <div
                              key={product.productTypeId} // 🔹 Thêm key để tránh cảnh báo React
                              onClick={() =>
                                handleMoveToProduct(product.productId)
                              }
                              className="flex flex-row justify-around items-center w-full h-[4rem] hover:bg-orange-100"
                            >
                              <img
                                className="p-2 w-[4rem] h-full border-0.5 border-black"
                                src={product.image} // 🔹 Sử dụng ảnh từ dữ liệu
                                alt={product.productName} // 🔹 Thêm alt để cải thiện SEO
                              />
                              <p className="max-w-[14rem] one-line-ellipsis">
                                {product.productName} // 🔹 Hiển thị tên sản
                                phẩm từ dữ liệu
                              </p>
                              <div className="flex items-center justify-center">
                                <div className="flex flex-row items-center text-[#ee4d2d]">
                                  <div className="underline underline-offset-2">
                                    đ
                                  </div>
                                  <div className="">
                                    {formatPrice(product.price)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                        <div className="flex flex-row justify-between items-center w-full h-[4rem]">
                          {numberItem > 5 ? (
                            <>
                              <div>{numberItem - 5} Thêm hàng vào giỏ</div>
                            </>
                          ) : (
                            <>
                              <div></div>
                            </>
                          )}

                          <button
                            onClick={() => navigate(`/cart/${res?.accountId}`)}
                            className="px-3 bg-[#ee4d2d]"
                          >
                            <p className="text-white">Xem Giỏ Hàng</p>
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col justify-center items-center gap-4">
                        <img
                          className="object-contain flex items-center h-[10rem] w-[7rem]"
                          src="https://www.stickstuff.com/public/images/empty-cart.png"
                          alt=""
                        />
                        <div className="font-bold text-gray-400">
                          Giỏ hàng của bạn còn trống
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
