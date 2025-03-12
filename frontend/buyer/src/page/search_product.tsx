import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { SearchProductLayout } from "../layout/search_product";
import { ProductDisplay } from "../components/features/search_product_display";
import { FaChevronLeft, FaChevronRight, FaInfoCircle } from 'react-icons/fa';

interface Product {
    id: number;
    Name: string;
    image: string;
    price: number;
    discount: number;
    sales: number;
}

export const SearchProductPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchKeyword = queryParams.get('q') || '';
    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(5);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3001/search?q=${encodeURIComponent(searchKeyword)}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const transformedResults = data.$.map((item: any) => ({
                    id: item._source.id,
                    Name: item._source.Name,
                    image: item._source.image,
                    price: item._source.price || 699000,
                    discount: item._source.discount || 7,
                    sales: item._source.sales || 2500
                }));
                setProducts(transformedResults);
                // Assuming the API returns total pages info
                setTotalPages(data.totalPages || 5);
            } catch (error) {
                console.error("Error fetching search results:", error);
                setProducts([]);
            }
        };

        fetchProducts();
    }, [searchKeyword, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const renderPageNumbers = () => {
        let pages = [];
        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 ${i === currentPage ? 'bg-orange-500 text-white' : 'bg-gray-200 hover:bg-gray-300'} cursor-pointer`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <SearchProductLayout>
            <div className="flex flex-row mt-5 items-center">
                <FaInfoCircle className="text-orange-500 mr-1" size={22} />
                Kết quả tìm kiếm cho từ khóa
                <div className="text-orange-500 ml-1">'{searchKeyword}'</div>
            </div>
            <ProductDisplay products={products} />
            <div className="flex justify-center items-center space-x-2 my-5">
                <button 
                    className="p-2 bg-gray-200 hover:bg-gray-300 cursor-pointer"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                >
                    <FaChevronLeft />
                </button>

                <div className="flex space-x-2">
                    {renderPageNumbers()}
                </div>

                <button 
                    className="p-2 bg-gray-200 hover:bg-gray-300 cursor-pointer"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                >
                    <FaChevronRight />
                </button>
            </div>
        </SearchProductLayout>
    );
};