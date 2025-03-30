import { useState, useEffect } from 'react';
import { CategoryTree } from './components/CategoryTree';
import { CategoryDialog } from './components/CategoryDialog';
import { CategoryService } from './services/CategoryService';

interface Category {
    CategoryID: number;
    CategoryName: string;
    ParentID: number | null;
    isActive: boolean;
    children?: Category[];
}

function App() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'new' | 'edit' | 'newChild'>('new');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const data = await CategoryService.getCategoryTree();
            setCategories(data);
        } catch (err) {
            setError('Failed to load categories');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
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

    const handleDeleteCategory = async (categoryId: number) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            await CategoryService.deleteCategory(categoryId);
            await fetchCategories();
        } catch (err) {
            const error = err as Error;
            alert(`Failed to delete category: ${error.message}`);
        }
    };

    const handleToggleActive = async (categoryId: number, isActive: boolean) => {
        try {
            await CategoryService.toggleCategoryStatus(categoryId, isActive);
            await fetchCategories();
        } catch (err) {
            alert('Failed to update category status');
        }
    };

    const handleSaveCategory = async (categoryData: Partial<Category>) => {
        try {
            if (dialogMode === 'edit' && selectedCategory) {
                await CategoryService.updateCategory(selectedCategory.CategoryID, categoryData);
            } else if (dialogMode === 'newChild' && selectedCategory) {
                await CategoryService.createCategory({
                    ...categoryData,
                    ParentID: selectedCategory.CategoryID
                });
            } else {
                await CategoryService.createCategory(categoryData);
            }
            setShowDialog(false);
            await fetchCategories();
        } catch (err) {
            const error = err as Error;
            alert(`Failed to save category: ${error.message}`);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="container mx-auto p-4 max-w-4xl">
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

                    <div className="grid grid-cols-3 font-medium text-gray-600 p-4 border-b border-gray-300">
                        <div>Description</div>
                        <div>Items</div>
                        <div>Images</div>
                    </div>

                    {isLoading ? (
                        <div className="p-8 text-center">Loading categories...</div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-500">{error}</div>
                    ) : (
                        <CategoryTree
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                            onEditCategory={handleEditCategory}
                            onNewChild={handleNewChildCategory}
                            onDeleteCategory={handleDeleteCategory}
                            onToggleActive={handleToggleActive}
                        />
                    )}
                </div>

                {showDialog && (
                    <CategoryDialog
                        mode={dialogMode}
                        category={selectedCategory}
                        onClose={() => setShowDialog(false)}
                        onSave={handleSaveCategory}
                    />
                )}
            </div>
        </div>
    );
}

export default App;