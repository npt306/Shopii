import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams, Outlet } from 'react-router-dom';
import {
    ChevronRight,
    Edit,
    Trash2,
    PlusCircle,
    Eye,
    ToggleLeft,
    ToggleRight,
    Save,
    X
} from 'lucide-react';
import { toast } from "react-toastify";


// Define the Category type
interface Category {
    CategoryID: number;
    CategoryName: string;
    ParentID?: number | null;
    children?: Category[];
    isActive?: boolean;
}

// Category Edit/View Page Component
const CategoryEditPage = () => {
    const [categoryName, setCategoryName] = useState('');
    const [parentCategory, setParentCategory] = useState<number | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isViewMode, setIsViewMode] = useState(false);

    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        // Determine if it's view mode based on the route
        setError(null);
        setIsViewMode(window.location.pathname.includes('/view/'));

        const fetchCategoryDetails = async () => {
            try {
                // Fetch all categories for parent dropdown
                const categoriesResponse = await fetch('http://34.58.241.34:3001/categories');
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData);

                // Fetch specific category details if editing or viewing existing category
                if (id && id !== 'add') {
                    const categoryResponse = await fetch(`http://34.58.241.34:3001/categories/${id}`);
                    const categoryData = await categoryResponse.json();
                    setCategoryName(categoryData.CategoryName);
                    setParentCategory(categoryData.ParentID);
                }
            } catch (err) {
                setError('Failed to load category data');
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryDetails();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isViewMode) return;

        // Reset error trước khi thực hiện submit
        setError(null);

        const categoryData = {
            CategoryName: categoryName,
            ParentID: parentCategory
        };
        try {
            const url = id && id !== 'add'
                ? `http://34.58.241.34:3001/categories/${id}`
                : 'http://34.58.241.34:3001/categories';

            const method = id && id !== 'add' ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData)
            });

            if (response.ok) {
                navigate('/admin/categories');

            } else {
                // Parse error message from response
                const errorData = await response.json();
                setError(errorData.message || 'Failed to save category');
            }
        } catch (err) {
            // Đảm bảo luôn set error là string
            setError(err instanceof Error ? err.message : 'An error occurred while saving the category');
        }
    };

    const flattenCategories = (categories: Category[], level = 0): Category[] => {
        return categories.reduce((acc, category) => {
            const categoryWithIndent = {
                ...category,
                CategoryName: '—'.repeat(level) + ' ' + category.CategoryName
            };

            acc.push(categoryWithIndent);

            if (category.children && category.children.length > 0) {
                acc.push(...flattenCategories(category.children, level + 1));
            }

            return acc;
        }, [] as Category[]);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <div className="text-gray-600 text-sm flex items-center">
                    Trang chủ
                    <ChevronRight className="inline-block mx-2" size={16} />
                    Quản lý danh mục
                    <ChevronRight className="inline-block mx-2" size={16} />
                    {isViewMode ? 'Chi Tiết Danh Mục' : (id === 'add' ? 'Thêm Danh Mục' : 'Chỉnh Sửa Danh Mục')}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800">
                    {isViewMode ? 'Chi Tiết Danh Mục' : (id === 'add' ? 'Thêm Danh Mục Mới' : 'Chỉnh Sửa Danh Mục')}
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryName">
                        Tên Danh Mục
                    </label>
                    <input
                        type="text"
                        id="categoryName"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Nhập tên danh mục"
                        required
                        disabled={isViewMode}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="parentCategory">
                        Danh Mục Cha
                    </label>
                    <select
                        id="parentCategory"
                        value={parentCategory || ''}
                        onChange={(e) => setParentCategory(e.target.value ? Number(e.target.value) : null)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        disabled={isViewMode}
                    >
                        <option value="">Không có danh mục cha</option>
                        {flattenCategories(categories)
                            .filter(cat => cat.CategoryID !== (id ? Number(id) : undefined))
                            .map(category => (
                                <option
                                    key={category.CategoryID}
                                    value={category.CategoryID}
                                >
                                    {category.CategoryName}
                                </option>
                            ))
                        }
                    </select>
                </div>

                <div className="flex items-center justify-between">
                    {!isViewMode && (
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                        >
                            <Save className="mr-2" /> Lưu
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => navigate('/admin/categories')}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                    >
                        <X className="mr-2" /> {isViewMode ? 'Quay Lại' : 'Hủy'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Main Category Management Page
export const CategoryManagementPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://34.58.241.34:3001/categories');
            if (response.ok) {
                const data = await response.json();
                // Add an isActive property to each category
                const categoriesWithActiveState = data.map((category: Category) => ({
                    ...category,
                    isActive: true // Default to active
                }));
                setCategories(categoriesWithActiveState);
            } else {
                setError('Failed to fetch categories.');
            }
        } catch (err) {
            setError('An error occurred while fetching categories.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setCategoryToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (categoryToDelete === null) return;

        try {
            const response = await fetch(`http://34.58.241.34:3001/categories/${categoryToDelete}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                // Remove the deleted category from the state
                const updatedCategories = categories.filter((c) => c.CategoryID !== categoryToDelete);

                setCategories(updatedCategories);
                setShowDeleteModal(false);
            } else {
                setError('Failed to delete category.');
                setShowDeleteModal(false);
            }
        } catch (err) {
            setError('An error occurred while deleting the category.');
            setShowDeleteModal(false);
        }
    };

    const handleToggleActive = async (category: Category) => {
        try {
            const response = await fetch(`http://34.58.241.34:3001/categories/${category.CategoryID}/toggle`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isActive: !category.isActive })
            });

            if (response.ok) {
                const updatedCategories = categories.map(c =>
                    c.CategoryID === category.CategoryID
                        ? { ...c, isActive: !c.isActive }
                        : c
                );
                setCategories(updatedCategories);
            } else {
                setError('Failed to update category status');
            }
        } catch (err) {
            setError('An error occurred while updating category status');
        }
    };

    const renderCategoryTree = (categories: Category[], level = 0) => {
        return categories.map((category) => (
            <React.Fragment key={category.CategoryID}>
                <tr className={`bg-white ${level > 0 ? 'font-light' : 'font-semibold'}`}>
                    <td className="px-4 py-2">
                        <div className="flex items-center">
                            {[...Array(level)].map((_, i) => (
                                <span key={i} className="mr-2">└</span>
                            ))}
                            {category.CategoryName}
                        </div>
                    </td>
                    <td className="px-4 py-2">{category.CategoryID}</td>
                    <td className="px-4 py-2">
                        <span
                            className={`px-2 py-1 rounded-full text-xs ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}
                        >
                            {category.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                        </span>
                    </td>
                    <td className="px-4 py-2 flex space-x-2">
                        <button
                            onClick={() => handleToggleActive(category)}
                            className="text-gray-600 hover:text-blue-600"
                        >
                            {category.isActive ? <ToggleRight /> : <ToggleLeft />}
                        </button>
                        <Link
                            to={`/admin/categories/view/${category.CategoryID}`}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <Eye size={20} />
                        </Link>
                        <Link
                            to={`/admin/categories/edit/${category.CategoryID}`}
                            className="text-green-600 hover:text-green-800"
                        >
                            <Edit size={20} />
                        </Link>
                        <button
                            onClick={() => handleDeleteClick(category.CategoryID)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <Trash2 size={20} />
                        </button>
                    </td>
                </tr>
                {category.children && category.children.length > 0 &&
                    renderCategoryTree(category.children, level + 1)}
            </React.Fragment>
        ));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-100 text-red-800 rounded">
                {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <div className="text-gray-600 text-sm">
                    Trang chủ <ChevronRight className="inline-block" size={16} /> Quản lý danh mục
                </div>
                <Link
                    to="/admin/categories/add"
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    <PlusCircle className="mr-2" /> Thêm Danh Mục
                </Link>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Danh Sách Danh Mục</h2>
                </div>
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left">Tên Danh Mục</th>
                            <th className="px-4 py-3 text-left">ID</th>
                            <th className="px-4 py-3 text-left">Trạng Thái</th>
                            <th className="px-4 py-3 text-left">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderCategoryTree(categories)}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex justify-center items-center bg-transparent backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Xác Nhận Xóa</h3>
                        <p className="mb-6 text-gray-600">Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.</p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Main App Routing Component
export const CategoryManagementApp = () => {
    return (
        <Routes>
            <Route path="/" element={<Outlet />}>
                <Route index element={<CategoryManagementPage />} />
                <Route path="add" element={<CategoryEditPage />} />
                <Route path="edit/:id" element={<CategoryEditPage />} />
                <Route path="view/:id" element={<CategoryEditPage />} />
            </Route>
        </Routes>
    );
};

export default CategoryManagementApp;