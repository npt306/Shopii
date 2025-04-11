import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { SearchProductLayout } from "../layout/search_product";
import { SearchProductDisplay } from "../components/features/search_product_display";
import { FaChevronLeft, FaChevronRight, FaInfoCircle } from 'react-icons/fa';
import { EnvValue } from "../env-value/envValue.ts";
interface Product {
    id: number;
    Name: string;
    image: string;
    Price: number;
    discount: number;
    sales: number;
}

interface PriceRange {
    min: number | null;
    max: number | null;
}
interface FilterParams {
    categories: string[];
    priceRange: PriceRange;
}

export const SearchProductPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchKeyword = queryParams.get('q') || '';
    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(5);
    //const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [filters, setFilters] = useState<FilterParams>({
        categories: [],
        priceRange: { min: null, max: null },
    });
    
    

    const fetchProducts = async (filterParams: FilterParams) => {
        try {
            setProducts([]);
            const baseUrl = `${import.meta.env.VITE_SEARCH_SERVICE_URL}/search`;
            const params = new URLSearchParams({
                q: searchKeyword,
                Categories: filterParams.categories.join(','),
                page: currentPage.toString(),
            });

            // Append price filtering if set
            if (filterParams.priceRange.min !== null) {
                params.append('minPrice', filterParams.priceRange.min.toString());
            }
            if (filterParams.priceRange.max !== null) {
                params.append('maxPrice', filterParams.priceRange.max.toString());
            }

            const url = `${baseUrl}?${params.toString()}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const transformedResults = data.$.map((item: any) => ({
                id: item._source.id,
                Name: item._source.Name,
                image: item._source.image,
                Price: item._source.Price || 699000,
                discount: item._source.discount || 7,
                sales: item._source.sales || 2500
            }));
            setProducts(transformedResults);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error("Error fetching search results:", error);
            setProducts([]);
        }
    };
    


    useEffect(() => {
        fetchProducts(filters);
    }, [searchKeyword, currentPage, filters]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) {
            setCurrentPage(1);
            return;
        }
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
    const handleFilterChange = (newFilters: FilterParams) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    return (
        <SearchProductLayout onFilterChange={handleFilterChange} >
            <div className="flex flex-row mt-5 items-center">
                <FaInfoCircle className="text-orange-500 mr-1" size={22} />
                Kết quả tìm kiếm cho từ khóa
                <div className="text-orange-500 ml-1">'{searchKeyword}'</div>
            </div>
            <SearchProductDisplay products={products}></SearchProductDisplay>
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