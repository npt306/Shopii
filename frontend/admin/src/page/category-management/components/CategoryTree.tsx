import { useState, useEffect } from 'react';
import { Edit, PlusCircle, Trash2, Eye, EyeOff } from 'lucide-react';

interface Category {
    CategoryID: number;
    CategoryName: string;
    ParentID: number | null;
    isActive: boolean;
    children?: Category[];
}

interface CategoryTreeProps {
    categories: Category[];
    selectedCategory: Category | null;
    onSelectCategory: (category: Category) => void;
    onEditCategory: (category: Category) => void;
    onNewChild: (category: Category) => void;
    onDeleteCategory: (categoryId: number) => void;
    onToggleActive: (categoryId: number, isActive: boolean) => void;
    level?: number;
    parentIndex?: string;
    sortOrder: 'asc' | 'desc';
    statusFilter: 'all' | 'active' | 'inactive';
}

export const CategoryTree = ({
    categories,
    selectedCategory,
    onSelectCategory,
    onEditCategory,
    onNewChild,
    onDeleteCategory,
    onToggleActive,
    level = 0,
    parentIndex = '',
    sortOrder,
    statusFilter
}: CategoryTreeProps) => {
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
    const [sortedCategories, setSortedCategories] = useState<Category[]>([]);
    const [hoverCategory, setHoverCategory] = useState<number | null>(null);

    useEffect(() => {
        // Apply sorting and filtering
        let filtered = [...categories];

        // Apply status filter
        if (statusFilter === 'active') {
            filtered = filterActiveCategories(filtered, true);
        } else if (statusFilter === 'inactive') {
            filtered = filterActiveCategories(filtered, false);
        }

        // Apply sorting
        const sorted = sortCategories(filtered, sortOrder);
        setSortedCategories(sorted);
    }, [categories, sortOrder, statusFilter]);

    // Filter categories based on active status (recursive)
    const filterActiveCategories = (cats: Category[], isActive: boolean): Category[] => {
        return cats.filter(cat => {
            // Keep this category if it matches the active status
            const matchesStatus = cat.isActive === isActive;

            // For categories with children, we need to recursively filter children too
            if (cat.children && cat.children.length > 0) {
                const filteredChildren = filterActiveCategories(cat.children, isActive);

                // If this category has matching children but doesn't match itself,
                // we still want to keep it but with filtered children
                if (filteredChildren.length > 0) {
                    cat.children = filteredChildren;
                    return true;
                }
            }

            return matchesStatus;
        });
    };

    // Sort categories recursively
    const sortCategories = (cats: Category[], order: 'asc' | 'desc'): Category[] => {
        return [...cats].map(cat => {
            // Recursively sort children if they exist
            if (cat.children && cat.children.length > 0) {
                return {
                    ...cat,
                    children: sortCategories(cat.children, order)
                };
            }
            return cat;
        }).sort((a, b) => {
            // Sort by ID (which affects the display order)
            return order === 'asc'
                ? a.CategoryID - b.CategoryID
                : b.CategoryID - a.CategoryID;
        });
    };

    const toggleExpand = (categoryId: number) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const isExpanded = (categoryId: number) => expandedCategories.includes(categoryId);

    // Function to count the number of direct children for each category
    const getChildCount = (category: Category): number => {
        return category.children ? category.children.length : 0;
    };

    // If no categories after filtering, show a message
    if (sortedCategories.length === 0 && level === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                No categories found with the selected filter.
            </div>
        );
    }

    return (
        <div className={level === 0 ? 'divide-y' : ''} key={`tree-level-${level}-${parentIndex}`}>
            {sortedCategories.map((category, index) => {
                const currentIndex = parentIndex ? `${parentIndex}.${index + 1}` : `${index + 1}`;
                const childCount = getChildCount(category);
                const isHovered = hoverCategory === category.CategoryID;

                return (
                    <div key={`cat-${category.CategoryID}`}>
                        <div
                            className={`grid grid-cols-4 py-2 px-4 hover:bg-gray-50 ${selectedCategory?.CategoryID === category.CategoryID
                                ? 'bg-blue-50'
                                : ''
                                }`}
                            onClick={() => onSelectCategory(category)}
                            onMouseEnter={() => setHoverCategory(category.CategoryID)}
                            onMouseLeave={() => setHoverCategory(null)}
                        >
                            {/* Description column (combined No. and Description) */}
                            <div className="flex items-center col-span-2">
                                {/* Number */}
                                <div className="mr-3 w-8 text-gray-500">
                                    {currentIndex}
                                </div>

                                {/* Indentation based on level */}
                                <div style={{ width: `${level * 24}px` }}></div>

                                {/* Expand/collapse icon if has children */}
                                {(category.children && category.children.length > 0) ? (
                                    <button
                                        className="mr-2 text-gray-500 focus:outline-none"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleExpand(category.CategoryID);
                                        }}
                                    >
                                        {isExpanded(category.CategoryID) ? '▼' : '►'}
                                    </button>
                                ) : (
                                    <div className="mr-2 w-4"></div>
                                )}

                                {/* Category icon and name */}
                                <div className="flex items-center">
                                    <span className="text-orange-500 mr-2">
                                        {/* Magento-style icon */}
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.7L20 9v6l-8 4-8-4V9l8-4.3z" />
                                        </svg>
                                    </span>
                                    <span className={category.isActive === false ? 'text-gray-400' : ''}>
                                        {category.CategoryName}
                                    </span>
                                </div>

                                {/* Action icons - visible on hover */}
                                <div className={`flex ml-3 space-x-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                                    <button
                                        className="text-teal-500 hover:text-teal-700 focus:outline-none"
                                        title="Add child category"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onNewChild(category);
                                        }}
                                    >
                                        <PlusCircle size={16} />
                                    </button>
                                    <button
                                        className="text-blue-500 hover:text-blue-700 focus:outline-none"
                                        title="Edit category"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditCategory(category);
                                        }}
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        className="text-red-500 hover:text-red-700 focus:outline-none"
                                        title="Delete category"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteCategory(category.CategoryID);
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        className={`${category.isActive ? 'text-gray-500 hover:text-gray-700' : 'text-green-500 hover:text-green-700'} focus:outline-none`}
                                        title={category.isActive ? "Deactivate category" : "Activate category"}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleActive(category.CategoryID, !category.isActive);
                                        }}
                                    >
                                        {category.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Items count - now displays the actual number of children */}
                            <div>{childCount}</div>

                            {/* Duyệt column (Status) */}
                            <div>
                                {category.isActive ? (
                                    <span className="text-green-500">Đang hoạt động</span>
                                ) : (
                                    <span className="text-gray-500">Không hoạt động</span>
                                )}
                            </div>
                        </div>

                        {/* Render children if expanded */}
                        {isExpanded(category.CategoryID) && category.children && category.children.length > 0 && (
                            <CategoryTree
                                key={`children-of-${category.CategoryID}`}
                                categories={category.children}
                                selectedCategory={selectedCategory}
                                onSelectCategory={onSelectCategory}
                                onEditCategory={onEditCategory}
                                onNewChild={onNewChild}
                                onDeleteCategory={onDeleteCategory}
                                onToggleActive={onToggleActive}
                                level={level + 1}
                                parentIndex={currentIndex}
                                sortOrder={sortOrder}
                                statusFilter={statusFilter}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};