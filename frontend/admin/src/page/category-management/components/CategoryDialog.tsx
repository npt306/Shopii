import { useState, useEffect } from 'react';

interface Category {
    CategoryID: number;
    CategoryName: string;
    ParentID: number | null;
    isActive: boolean;
    children?: Category[];
}

interface CategoryDialogProps {
    mode: 'new' | 'edit' | 'newChild';
    category: Category | null;
    onClose: () => void;
    onSave: (categoryData: Partial<Category>) => void;
}

export const CategoryDialog = ({
    mode,
    category,
    onClose,
    onSave
}: CategoryDialogProps) => {
    const [categoryName, setCategoryName] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [includeInMenu, setIncludeInMenu] = useState(true);

    useEffect(() => {
        if (mode === 'edit' && category) {
            setCategoryName(category.CategoryName);
            setIsActive(category.isActive);
            setIncludeInMenu(true); // Assuming default is true
        }
    }, [mode, category]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const categoryData: Partial<Category> = {
            CategoryName: categoryName,
            isActive: isActive
        };

        onSave(categoryData);
    };

    const getTitle = () => {
        switch (mode) {
            case 'new':
                return 'Add New Category';
            case 'edit':
                return `Edit - Category - ${category?.CategoryID}`;
            case 'newChild':
                return `Add Child Category to ${category?.CategoryName}`;
            default:
                return 'Category';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-medium">{getTitle()}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-4">
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-4 pb-2 border-b">General</h3>
                            <div className="flex items-center">
                                <label className="w-32 text-gray-600">Name</label>
                                <input
                                    type="text"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-4 pb-2 border-b">Settings</h3>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-gray-600">Is Active</label>
                                <div
                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer ${isActive ? 'bg-teal-500' : 'bg-gray-300'}`}
                                    onClick={() => setIsActive(!isActive)}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isActive ? 'translate-x-6' : ''}`}></div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="text-gray-600">Include In Menu</label>
                                <div
                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer ${includeInMenu ? 'bg-teal-500' : 'bg-gray-300'}`}
                                    onClick={() => setIncludeInMenu(!includeInMenu)}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${includeInMenu ? 'translate-x-6' : ''}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded mr-2 text-gray-600 hover:bg-gray-50"
                        >
                            Close
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};