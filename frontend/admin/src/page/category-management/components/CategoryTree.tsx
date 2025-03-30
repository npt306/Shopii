import { useState } from 'react';

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
}

export const CategoryTree = ({
    categories,
    selectedCategory,
    onSelectCategory,
    onEditCategory,
    onNewChild,
    onDeleteCategory,
    onToggleActive,
    level = 0
}: CategoryTreeProps) => {
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

    const toggleExpand = (categoryId: number) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const isExpanded = (categoryId: number) => expandedCategories.includes(categoryId);

    return (
        <div className={level === 0 ? 'divide-y' : ''}>
            {categories.map(category => (
                <div key={category.CategoryID}>
                    <div
                        className={`grid grid-cols-3 py-2 px-4 hover:bg-gray-50 ${selectedCategory?.CategoryID === category.CategoryID
                                ? 'bg-blue-50'
                                : ''
                            }`}
                        onClick={() => onSelectCategory(category)}
                    >
                        <div className="flex items-center">
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
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                                    </svg>
                                </span>
                                <span className={category.isActive === false ? 'text-gray-400' : ''}>
                                    {category.CategoryName}
                                </span>
                            </div>
                        </div>

                        {/* Items count */}
                        <div>0</div>

                        {/* Images count */}
                        <div>0</div>
                    </div>

                    {/* Render children if expanded */}
                    {isExpanded(category.CategoryID) && category.children && category.children.length > 0 && (
                        <CategoryTree
                            categories={category.children}
                            selectedCategory={selectedCategory}
                            onSelectCategory={onSelectCategory}
                            onEditCategory={onEditCategory}
                            onNewChild={onNewChild}
                            onDeleteCategory={onDeleteCategory}
                            onToggleActive={onToggleActive}
                            level={level + 1}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};