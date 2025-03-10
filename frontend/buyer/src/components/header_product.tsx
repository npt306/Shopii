import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logoShopee from "../assets/logo_shopee_1.png";
import { FaShoppingCart, FaSearch } from "react-icons/fa";
import { Header } from "./header";
import { mockProducts } from "./mocks/product_data";

export const HeaderProduct = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState<Array<{ id: number; Name: string }>>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = async (value: string) => {
        setSearchTerm(value);
        if (value.trim()) {
            try {
                console.log("Fetching search results from backend...");
                const response = await fetch(`http://localhost:3001/search?q=${encodeURIComponent(value)}`);
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

    const handleSuggestionClick = (suggestion: string) => {
        setSearchTerm(suggestion);
        setShowSuggestions(false);
        navigateToSearchPage(suggestion);
    };

    const navigateToSearchPage = (searchTerm: string) => {
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            navigateToSearchPage(searchTerm);
        }
    };

    return (
        <>
            <Header/>
            <div className="bg-orange-500 px-30 flex justify-between items-center text-white">
                <div className="flex justify-center items-center cursor-pointer">
                    <img src={logoShopee} alt="Avatar" className="w-15 h-15 rounded-full pb-1" />
                    <span className="text-3xl">Shopee</span>
                </div>

                <div className="relative w-[1024px] text-black" ref={suggestionRef}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => handleSearch(searchTerm)}
                        onKeyDown={handleKeyDown}
                        placeholder="Tìm kiếm"
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline"
                    />
                    <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 text-white px-3 py-2 cursor-pointer w-12 flex justify-center items-center"
                        onClick={() => navigateToSearchPage(searchTerm)}
                    >
                        <FaSearch />
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

                <div className="relative cursor-pointer mr-10">
                    <FaShoppingCart size={24} />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        3
                    </span>
                </div>
            </div>
        </>
    );
};