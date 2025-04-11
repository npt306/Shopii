import { ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { FilterSidebar } from "../filter_sidebar";
import { FilterTop } from "../filter_top";

interface PriceRange {
    min: number | null;
    max: number | null;
}
interface FilterSidebarFilters {
    categories: string[];
    priceRange: PriceRange;
}

interface SearchProductLayoutProps {
    children: ReactNode;
    onFilterChange: (filters: FilterSidebarFilters) => void;
    
}
export const SearchProductLayout = ({ children, onFilterChange  }: SearchProductLayoutProps) => {


    const availableCategories: string[] = [
        'Electronics',
        'Audio',
        'Category 3'
    ];

    return (
        <div className="flex flex-col h-screen w-full">
            <Header />

            <div className="flex flex-1 w-full mx-auto my-5">
                <div className="w-1/5 bg-gray-100 pl-30">
                    <FilterSidebar 
                        onFilterChange={onFilterChange}
                        availableCategories={availableCategories}
                    />
                </div>

                <div className="w-4/5 bg-gray-100 overflow-auto px-20">
                    <FilterTop></FilterTop>
                    {children}
                </div>
            </div>

            <Footer />
        </div>
    );
};

