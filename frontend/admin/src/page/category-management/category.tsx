import { useState, useEffect, useCallback } from 'react';
import { CategoryTree } from './components/CategoryTree';
import { CategoryDialog } from './components/CategoryDialog';
import { CategoryService } from './services/CategoryService';
import { Link } from 'react-router-dom';
import { ChevronRight, Filter, AlertTriangle } from 'lucide-react';
import { toast } from "react-toastify";

interface Category {
    CategoryID: number;
    CategoryName: string;
    ParentID: number | null;
    isActive: boolean;
    children?: Category[];
}

// New interface for the delete confirmation modal
interface DeleteModalProps {
    isOpen: boolean;
    categoryName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

// Delete confirmation modal component
const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({
    isOpen,
    categoryName,
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-brightness-90 backdrop-blur-[2px] flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-md">
                <div className="flex items-center text-amber-500 mb-4">
                    <AlertTriangle className="mr-2" size={24} />
                    <h3 className="text-lg font-medium">Confirm Delete</h3>
                </div>

                <p className="mb-4 text-gray-700">
                    Are you sure you want to delete the category <span className="font-semibold">{categoryName}</span>?
                </p>

                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

function App() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'new' | 'edit' | 'newChild'>('new');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [errorLog, setErrorLog] = useState<string | null>(null);

    // State for delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

    // Tách hàm fetch categories thành một callback để tránh re-render không cần thiết
    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await CategoryService.getCategoryTree();
            setCategories(data);
            setError(null); // Reset error khi fetch thành công
        } catch (err) {
            setError('Failed to load categories');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Tìm và cập nhật category trong cây danh mục
    const updateCategoryInTree = (
        categoryList: Category[],
        categoryId: number,
        updater: (category: Category) => Category
    ): Category[] => {
        return categoryList.map(category => {
            if (category.CategoryID === categoryId) {
                return updater(category);
            }

            if (category.children && category.children.length > 0) {
                return {
                    ...category,
                    children: updateCategoryInTree(category.children, categoryId, updater)
                };
            }

            return category;
        });
    };

    // Xóa category khỏi cây danh mục
    const removeCategoryFromTree = (
        categoryList: Category[],
        categoryId: number
    ): Category[] => {
        return categoryList
            .filter(category => category.CategoryID !== categoryId)
            .map(category => {
                if (category.children && category.children.length > 0) {
                    return {
                        ...category,
                        children: removeCategoryFromTree(category.children, categoryId)
                    };
                }
                return category;
            });
    };

    // Thêm category mới vào cây danh mục
    const addCategoryToTree = (
        categoryList: Category[],
        newCategory: Category,
        parentId: number | null = null
    ): Category[] => {
        if (parentId === null) {
            return [...categoryList, newCategory];
        }

        return categoryList.map(category => {
            if (category.CategoryID === parentId) {
                return {
                    ...category,
                    children: category.children
                        ? [...category.children, newCategory]
                        : [newCategory]
                };
            }

            if (category.children && category.children.length > 0) {
                return {
                    ...category,
                    children: addCategoryToTree(category.children, newCategory, parentId)
                };
            }

            return category;
        });
    };

    const handleNewCategory = () => {
        setDialogMode('new');
        setSelectedCategory(null);
        setShowDialog(true);
    };

    const handleNewChildCategory = (parentCategory: Category) => {
        setDialogMode('newChild');
        setSelectedCategory(parentCategory);
        setShowDialog(true);
    };

    const handleEditCategory = (category: Category) => {
        setDialogMode('edit');
        setSelectedCategory(category);
        setShowDialog(true);
    };

    // Modified to show custom modal instead of window.confirm
    const handleDeleteCategory = (categoryId: number) => {
        const category = findCategoryById(categories, categoryId);
        if (category) {
            setCategoryToDelete(categoryId);
            setShowDeleteModal(true);
        }
    };

    // Helper to find a category by ID in the tree
    const findCategoryById = (categoryList: Category[], categoryId: number): Category | null => {
        for (const category of categoryList) {
            if (category.CategoryID === categoryId) {
                return category;
            }

            if (category.children && category.children.length > 0) {
                const found = findCategoryById(category.children, categoryId);
                if (found) return found;
            }
        }

        return null;
    };

    // Perform the actual deletion
    const confirmDeleteCategory = async () => {
        if (!categoryToDelete) return;

        try {
            // Optimistic update - remove from UI first
            const updatedCategories = removeCategoryFromTree(categories, categoryToDelete);
            setCategories(updatedCategories);

            // Then delete from server
            await CategoryService.deleteCategory(categoryToDelete);

            // Clear selected category if it was deleted
            if (selectedCategory?.CategoryID === categoryToDelete) {
                setSelectedCategory(null);
            }
        } catch (err) {
            const error = err as Error;
            alert(`Failed to delete category: ${error.message}`);
            // Rollback on error by re-fetching
            fetchCategories();
        } finally {
            setShowDeleteModal(false);
            setCategoryToDelete(null);
            // Close modal and reset state
            toast.success("Xóa danh mục thành công!", {

                autoClose: 1000
            });
        }
    };

    const handleToggleActive = async (categoryId: number, isActive: boolean) => {
        try {
            // Optimistic update - update UI first
            const updatedCategories = updateCategoryInTree(
                categories,
                categoryId,
                (category) => ({ ...category, isActive })
            );
            setCategories(updatedCategories);

            // Update selected category if it was changed
            if (selectedCategory?.CategoryID === categoryId) {
                setSelectedCategory({ ...selectedCategory, isActive });
            }

            // Then update on server
            await CategoryService.toggleCategoryStatus(categoryId, isActive);
        } catch (err) {
            alert('Failed to update category status');
            // Rollback on error by re-fetching
            fetchCategories();
        }
    };

    const handleSaveCategory = async (categoryData: Partial<Category>, refreshOnError = false) => {
        try {
            let updatedCategory: Category;
            setErrorLog(null);

            if (dialogMode === 'edit' && selectedCategory) {
                // Update existing category
                updatedCategory = await CategoryService.updateCategory(
                    selectedCategory.CategoryID,
                    categoryData
                );

                // Update UI with optimistic update
                const updatedCategories = updateCategoryInTree(
                    categories,
                    selectedCategory.CategoryID,
                    (category) => ({ ...category, ...categoryData })
                );

                toast.success("Sửa danh mục thành công!", {
                    onClose: () => {
                        setCategories(updatedCategories);
                        setSelectedCategory({ ...selectedCategory, ...categoryData });
                    },
                    autoClose: 1000
                });
            } else if (dialogMode === 'newChild' && selectedCategory) {
                // Create child category
                const newCategoryData = {
                    ...categoryData,
                    ParentID: selectedCategory.CategoryID
                };

                updatedCategory = await CategoryService.createCategory(newCategoryData);

                // Fetch the real ID by name
                const categoryByName = await CategoryService.getCategoryByName(newCategoryData.CategoryName!);
                const realCategoryId = categoryByName.CategoryID;

                // Update the category object with the real ID
                updatedCategory = { ...updatedCategory, CategoryID: realCategoryId };

                // Add to UI with optimistic update
                const updatedCategories = updateCategoryInTree(
                    categories,
                    selectedCategory.CategoryID,
                    (category) => ({
                        ...category,
                        children: category.children
                            ? [...category.children, updatedCategory]
                            : [updatedCategory]
                    })
                );
                toast.success("Thêm danh mục con thành công!", {
                    onClose: () => {
                        setCategories(updatedCategories);
                    },
                    autoClose: 1000
                });

            } else {
                // Create new root category
                updatedCategory = await CategoryService.createCategory(categoryData);

                // Fetch the real ID by name
                const categoryByName = await CategoryService.getCategoryByName(categoryData.CategoryName!);
                const realCategoryId = categoryByName.CategoryID;

                // Add to UI with optimistic update
                toast.success("Thêm danh mục thành công!", {
                    onClose: () => {
                        setCategories([...categories, { ...updatedCategory, CategoryID: realCategoryId }]);

                    },
                    autoClose: 1000
                });
            }


            setShowDialog(false);

        } catch (err) {
            const error = err as Error;
            setErrorLog(error.message);
            // Only refresh if the parameter is true
            if (refreshOnError) {
                fetchCategories();
            }
        }
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    // --- Render ---
    if (isLoading && categories.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
        );
    }

    // Display main error if fetch failed
    if (error && categories.length === 0) {
        return (
            <div className="p-4">
                <div className="mb-4 text-sm text-gray-600 flex items-center">
                    <Link to="/admin" className="hover:text-orange-600 transition-colors">Trang chủ</Link>
                    <ChevronRight size={16} className="mx-1 text-gray-400" />
                    <span className="font-medium text-gray-800">Quản lý danh mục</span>
                </div>
                <div className="p-4 bg-red-100 text-red-700 border border-red-400 rounded">
                    {error}
                </div>
            </div>
        );
    }

    // Get the name of the category to delete for the modal
    const categoryToDeleteName = categoryToDelete
        ? findCategoryById(categories, categoryToDelete)?.CategoryName || "this category"
        : "";

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Breadcrumbs */}
            <div className="mb-4 text-sm text-gray-600 flex items-center">
                <Link to="/admin" className="hover:text-orange-600 transition-colors">Trang chủ</Link>
                <ChevronRight size={16} className="mx-1 text-gray-400" />
                <span className="font-medium text-gray-800">Quản lý danh mục</span>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="bg-white shadow rounded-lg">
                    <div className="flex justify-between items-center p-4 border-b border-gray-300">
                        <h1 className="text-2xl font-semibold">Categories</h1>
                        <div className="flex space-x-2">
                            <button
                                onClick={handleNewCategory}
                                className="flex items-center px-3 py-2 text-sm bg-teal-500 text-white rounded hover:bg-teal-600"
                            >
                                <span className="text-xl mr-1">+</span> New
                            </button>
                            <button
                                onClick={() => selectedCategory && handleNewChildCategory(selectedCategory)}
                                disabled={!selectedCategory}
                                className={`flex items-center px-3 py-2 text-sm rounded ${selectedCategory
                                    ? 'bg-teal-500 text-white hover:bg-teal-600'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <span className="text-xl mr-1">+</span> New Child
                            </button>
                            <button
                                onClick={() => selectedCategory && handleEditCategory(selectedCategory)}
                                disabled={!selectedCategory}
                                className={`px-3 py-2 text-sm rounded ${selectedCategory
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => selectedCategory && handleDeleteCategory(selectedCategory.CategoryID)}
                                disabled={!selectedCategory}
                                className={`px-3 py-2 text-sm rounded ${selectedCategory
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center p-4 border-b border-gray-300">
                        <div className="flex">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1 text-sm rounded mr-2 ${statusFilter === 'all'
                                    ? 'bg-gray-800 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setStatusFilter('active')}
                                className={`px-3 py-1 text-sm rounded mr-2 ${statusFilter === 'active'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                <span className="flex items-center">
                                    <Filter size={14} className="mr-1" />
                                    Active
                                </span>
                            </button>
                            <button
                                onClick={() => setStatusFilter('inactive')}
                                className={`px-3 py-1 text-sm rounded ${statusFilter === 'inactive'
                                    ? 'bg-gray-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                <span className="flex items-center">
                                    <Filter size={14} className="mr-1" />
                                    Inactive
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 font-medium text-gray-600 p-4 border-b border-gray-300">
                        <div
                            className="flex items-center cursor-pointer hover:text-gray-800"
                            onClick={toggleSortOrder}
                        >
                            No.
                            <span className="ml-1">
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                        </div>
                        <div className="col-span-1">Description</div>
                        <div>Items</div>
                        <div>Duyệt</div>
                    </div>

                    {isLoading && categories.length > 0 ? (
                        <div className="p-4 flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                            <span className="ml-3 text-gray-600">Đang cập nhật...</span>
                        </div>
                    ) : (
                        <CategoryTree
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                            onEditCategory={handleEditCategory}
                            onNewChild={handleNewChildCategory}
                            onDeleteCategory={handleDeleteCategory}
                            onToggleActive={handleToggleActive}
                            sortOrder={sortOrder}
                            statusFilter={statusFilter}
                        />
                    )}
                </div>

                {/* Category Edit/Create Dialog */}
                {showDialog && (
                    <CategoryDialog
                        mode={dialogMode}
                        category={selectedCategory}
                        onClose={() => setShowDialog(false)}
                        onSave={handleSaveCategory}
                        error={errorLog}
                    />
                )}

                {/* Delete Confirmation Modal */}
                <DeleteConfirmationModal
                    isOpen={showDeleteModal}
                    categoryName={categoryToDeleteName}
                    onConfirm={confirmDeleteCategory}
                    onCancel={() => {
                        setShowDeleteModal(false);
                        setCategoryToDelete(null);
                    }}
                />
            </div>
        </div>
    );
}

export default App;