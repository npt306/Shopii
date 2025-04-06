import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, PenLine, X, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EnvValue } from '../../../env-value/envValue';

// Define types for tab data
type TabId = 'basic' | 'sales' | 'shipping' | 'other';
type StepId = 'Image' | 'Video' | 'Name' | 'Des' | 'Add';

interface Tab {
    id: TabId;
    label: string;
    ref: React.RefObject<HTMLDivElement>;
}

interface Step {
    id: StepId;
    label: string;
    ref: React.RefObject<HTMLDivElement>;
}

// Định nghĩa cấu trúc dữ liệu
interface Category {
    id: number;
    name: string;
    options: Option[];
    maxOptions: number;
    currentOptions: number;
}

interface Option {
    name: string;
    subOptions: string[];
    price: number;
    stock: number;
    image: string;
    weight: number[];
    dimensions: {
        length: number[];
        width: number[];
        height: number[];
    };
}


interface Combination {
    combination: string[]; // Mảng các giá trị option, ví dụ ["do", "a"]
    variantId?: string;    // ID duy nhất cho combination, có thể tạo từ combination
    price: number;
    stock: number;
    image: string;
    weight: number[];
    dimensions: {
        length: number[];
        width: number[];
        height: number[];
    };
}

interface UpdateOptionParams {
    categoryId: number;
    index: number;
    field: string;
    value: string | number;
}

interface AddOptionParams {
    categoryId: number;
    value: string;
}

interface RemoveOptionParams {
    categoryId: number;
    index: number;
}

type CategoryType = {
    CategoryID: number;
    CategoryName: string;
    isActive: boolean;
    ParentID: number | null;
}

type CategoryWithChildren = CategoryType & {
    children?: CategoryWithChildren[];
};

type CategorySelectorModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (category: CategoryType, path: CategoryType[]) => void;
    categories?: CategoryWithChildren[];
};

const CategorySelectorModal = ({
    open,
    onOpenChange,
    onConfirm,
    categories = [] // Default to empty array if not provided
}: CategorySelectorModalProps) => {
    // Store the whole selection path as an array
    const [selectionPath, setSelectionPath] = useState<CategoryWithChildren[]>([]);

    // Debug logging
    useEffect(() => {
        if (open) {
            console.log("Modal opened, categories structure:", categories);
            console.log("Categories type:", Array.isArray(categories) ? "Array" : typeof categories);

            if (Array.isArray(categories) && categories.length > 0 && Array.isArray(categories[0])) {
                console.log("Warning: Categories is nested in an extra array layer");
            }
        }
    }, [open, categories]);

    // Process categories để chắc chắn nó là mảng đúng định dạng
    const processedCategories = useMemo(() => {
        // Helper function to recursively filter categories
        const filterInactiveCategories = (cats: CategoryWithChildren[]): CategoryWithChildren[] => {
            return cats
                .filter(cat => cat.isActive !== false) // Keep only active categories
                .map(cat => ({
                    ...cat,
                    children: cat.children ? filterInactiveCategories(cat.children) : []
                }));
        };

        // If categories is an array of arrays, get the first element
        let cats = Array.isArray(categories) && categories.length > 0 && Array.isArray(categories[0])
            ? categories[0] as CategoryWithChildren[]
            : categories;

        // Apply the filter function
        return filterInactiveCategories(cats);
    }, [categories]);

    // Reset selections when modal is closed
    useEffect(() => {
        if (!open) {
            setSelectionPath([]);
        }
    }, [open]);

    // Don't return null, just hide the modal when not open
    if (!open) {
        return null;
    }

    const handleConfirm = () => {
        if (selectionPath.length > 0) {
            // Get the most specific selected category (last in the path)
            const selectedCategory = selectionPath[selectionPath.length - 1];
            // Pass both the category and the full path to the onConfirm handler
            onConfirm(
                {
                    CategoryID: selectedCategory.CategoryID,
                    CategoryName: selectedCategory.CategoryName,
                    isActive: selectedCategory.isActive,
                    ParentID: selectedCategory.ParentID
                },
                selectionPath.map(cat => ({
                    CategoryID: cat.CategoryID,
                    CategoryName: cat.CategoryName,
                    isActive: cat.isActive,
                    ParentID: cat.ParentID
                }))

            );
        }
    };

    // Handle category selection at any level
    const handleCategorySelect = (category: CategoryWithChildren, depth: number) => {
        // Truncate the path up to the current depth and add the new selection
        const newPath = [...selectionPath.slice(0, depth), category];
        setSelectionPath(newPath);
    };

    // Get categories for a specific depth level
    const getCategoriesForLevel = (depth: number): CategoryWithChildren[] => {
        if (depth === 0) {
            return processedCategories;
        }

        if (depth > 0 && selectionPath.length >= depth) {
            const parentCategory = selectionPath[depth - 1];
            return parentCategory.children || [];
        }

        return [];
    };

    // Determine the maximum depth to display
    const maxDepthToRender = Math.min(selectionPath.length + 1, 5); // Limit to 5 columns max for UI reasons

    // Nếu không có categories ở level 0, hiển thị thông báo thay vì trống rỗng
    const rootCategories = getCategoriesForLevel(0);
    if (!rootCategories || rootCategories.length === 0) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white w-full max-w-4xl h-full max-h-[600px] md:h-[600px] rounded-lg shadow-xl flex flex-col border border-gray-200">
                    <div className="flex justify-between items-center p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-black">Chỉnh sửa ngành hàng</h2>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="bg-white text-black hover:bg-gray-100 rounded-full p-1 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-grow flex items-center justify-center">
                        <div className="text-center p-6">
                            <p className="text-lg text-gray-600">Không có dữ liệu ngành hàng.</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Vui lòng kiểm tra lại cấu trúc dữ liệu categories.
                                {Array.isArray(categories) && categories.length > 0 && Array.isArray(categories[0]) && (
                                    <span className="block mt-2 text-red-500">
                                        Dữ liệu có thể đang bị bọc trong một mảng thừa.
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end p-4 border-t border-gray-200">
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                            onClick={() => onOpenChange(false)}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
            data-name="category-list-container"
        >
            <div className="bg-white w-full max-w-4xl h-full max-h-[600px] md:h-[600px] rounded-lg shadow-xl flex flex-col border border-gray-200">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-black">Chỉnh sửa ngành hàng</h2>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="bg-white text-black hover:bg-gray-100 rounded-full p-1 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Selection path display */}
                {selectionPath.length > 0 && (
                    <div className="px-4 py-2 border-b border-gray-200 text-sm flex flex-wrap items-center gap-1">
                        {selectionPath.map((category, index) => (
                            <React.Fragment key={`path-${category.CategoryID}`}>
                                {index > 0 && <ChevronRight className="text-gray-400" size={14} />}
                                <span className="font-medium">{category.CategoryName}</span>
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* Categories */}
                <div className="flex flex-grow overflow-hidden">
                    {/* Generate columns dynamically based on the selection depth */}
                    {Array.from({ length: maxDepthToRender }).map((_, depth) => {
                        const categoriesForLevel = getCategoriesForLevel(depth);
                        const columnWidth = 100 / maxDepthToRender;

                        return (
                            <div
                                key={`depth-${depth}`}
                                className={`overflow-y-auto ${depth < maxDepthToRender - 1 ? 'border-r border-gray-200' : ''}`}
                                style={{ width: `${columnWidth}%` }}
                            >
                                {categoriesForLevel.length > 0 ? (
                                    categoriesForLevel.map((category) => (
                                        <div
                                            key={`category-${depth}-${category.CategoryID}`}
                                            className={`p-2 flex items-center justify-between cursor-pointer hover:bg-gray-100 ${selectionPath[depth]?.CategoryID === category.CategoryID ? 'bg-gray-200' : ''
                                                }`}
                                            onClick={() => handleCategorySelect(category, depth)}
                                        >
                                            <span className={`text-black ${selectionPath[depth]?.CategoryID === category.CategoryID ? 'font-semibold' : ''
                                                }`}>
                                                {category.CategoryName}
                                            </span>
                                            {category.children && category.children.length > 0 && (
                                                <ChevronRight className="text-gray-500" size={16} />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-gray-500 text-center">
                                        No categories at this level
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end p-4 border-t border-gray-200">
                    <button
                        className="mr-4 text-black bg-white border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded transition-colors"
                        onClick={() => onOpenChange(false)}
                    >
                        Hủy
                    </button>
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        disabled={selectionPath.length === 0}
                        onClick={() => {
                            handleConfirm();
                            onOpenChange(false);
                        }}
                    >
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};


const AddProduct = () => {
    const [activeStep, setActiveStep] = useState<StepId>('Image');
    const [activeTab, setActiveTab] = useState<TabId>('basic');
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [selectedRatio, setSelectedRatio] = useState<string>("1:1");
    const [hasSelected, setHasSelected] = useState<boolean>(false);
    const [hasSelectedProduct, setHasSelectedProduct] = useState<boolean>(false);
    const [hasSelectedIndustry, setHasSelectedIndustry] = useState<boolean>(false);
    const [hasSelectedDes, setHasSelectedDes] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
    const [selectedCategoryPath, setSelectedCategoryPath] = useState<CategoryType[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
    const [selectedFileOne, setSelectedFileOne] = useState<File[]>([]);
    const [uploadedUrlOne, setUploadedUrlOne] = useState<string[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
    const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
    const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
    const [charCounts, setCharCounts] = useState<{ [key: string]: number }>({});
    const [useCustomSettings, setUseCustomSettings] = useState(false);
    const [inputValue, setInputValue] = useState<string>("");
    const [showError, setShowError] = useState<boolean>(false);

    const navigate = useNavigate();

    // Create refs for each section
    const ImageRef = useRef<HTMLDivElement>(null);
    const VideoRef = useRef<HTMLDivElement>(null);
    const NameRef = useRef<HTMLDivElement>(null);
    const DesRef = useRef<HTMLDivElement>(null);
    const AddRef = useRef<HTMLDivElement>(null);

    const steps: Step[] = [
        { id: 'Image', label: 'Thêm ít nhất 3 hình ảnh', ref: ImageRef },
        { id: 'Video', label: 'Thêm video sản phẩm', ref: VideoRef },
        { id: 'Name', label: 'Tên sản phẩm có ít nhất 25~100 kí tự', ref: NameRef },
        { id: 'Des', label: 'Thêm ít nhất 100 kí tự hoặc 1 hình ảnh trong mô tả sản phẩm', ref: DesRef },
        { id: 'Add', label: 'Thêm thương hiệu', ref: AddRef }
    ];

    // Create refs for each section
    const basicRef = useRef<HTMLDivElement>(null);
    const salesRef = useRef<HTMLDivElement>(null);
    const shippingRef = useRef<HTMLDivElement>(null);
    const otherRef = useRef<HTMLDivElement>(null);

    // Define tab data with proper typing
    const tabs: Tab[] = [
        { id: 'basic', label: 'Thông tin cơ bản', ref: basicRef },
        { id: 'sales', label: 'Thông tin bán hàng', ref: salesRef },
        { id: 'shipping', label: 'Vận chuyển', ref: shippingRef },
        { id: 'other', label: 'Thông tin khác', ref: otherRef }
    ];



    const handleTabClick = (tabId: TabId) => {
        setActiveTab(tabId);
        const ref = tabs.find(tab => tab.id === tabId)?.ref;
        ref?.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleStepClick = (stepId: StepId) => {
        setActiveStep(stepId);
        const ref = steps.find(step => step.id === stepId)?.ref;
        ref?.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleRatioChangeInf = () => {
        setHasSelected(true);
        setHasSelectedProduct(false);
        setHasSelectedIndustry(false);
        setHasSelectedDes(false);
    };

    const handleRatioChangePro = () => {
        setHasSelected(false);
        setHasSelectedProduct(true);
        setHasSelectedIndustry(false);
        setHasSelectedDes(false);
    };

    const handleRatioChangeInd = () => {
        setHasSelected(false);
        setHasSelectedProduct(false);
        setHasSelectedIndustry(true);
        setHasSelectedDes(false);
        setIsCategoryModalOpen(true)
    };

    const handleRatioChangeDes = () => {
        setHasSelected(false);
        setHasSelectedProduct(false);
        setHasSelectedIndustry(false);
        setHasSelectedDes(true);
    };

    const handleCancelClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleConfirmClick = () => {
        navigate('/portal/product/list/all');
    };

    const [categories, setCategories] = useState<Category[]>([
        {
            id: 1,
            name: "",
            options: [
                {
                    name: "",
                    subOptions: [],
                    price: 0,
                    stock: 0,
                    image: "",
                    weight: [],
                    dimensions: {
                        length: [],
                        width: [],
                        height: [],
                    },
                },
            ],
            maxOptions: 14,
            currentOptions: 0,
        },
    ]);


    const handleConfirm = (category: CategoryType, path: CategoryType[]) => {
        setSelectedCategory(category);
        setSelectedCategoryPath(path);
    };




    const addNewCategory = () => {
        setCategories([
            ...categories,
            {
                id: categories.length + 1,
                name: "",
                options: [
                    {
                        name: "",
                        subOptions: [],
                        price: 0,
                        stock: 0,
                        image: "",
                        weight: [],
                        dimensions: {
                            length: [],
                            width: [],
                            height: [],
                        },
                    },
                ],
                maxOptions: 14,
                currentOptions: 0,
            }
        ]);
    };

    const addOption = ({ categoryId, value }: AddOptionParams) => {
        if (!value) return;

        setCategories(
            categories.map((cat: Category) => {
                if (cat.id === categoryId && cat.currentOptions < cat.maxOptions) {
                    return {
                        ...cat,
                        options: [
                            ...cat.options,
                            {
                                name: value,
                                subOptions: [],
                                price: 0,
                                stock: 0,
                                image: "",
                                weight: [],
                                dimensions: {
                                    length: [],
                                    width: [],
                                    height: [],
                                },
                            },
                        ],
                        currentOptions: cat.currentOptions + 1,
                    };
                }
                return cat;
            })
        );
    };

    const updateCategoryName = (id: number, value: string) => {
        setCategories(
            categories.map((cat: Category) =>
                cat.id === id ? { ...cat, name: value } : cat
            )
        );
    };

    const updateOption = ({ categoryId, index, field, value }: UpdateOptionParams) => {
        if (categoryId === undefined) {
            console.error("categoryId is undefined");
            return;
        }

        setCategories(prevCategories => {
            // Tạo bản sao của mảng categories để tránh thay đổi trực tiếp state
            const newCategories = [...prevCategories];

            // Tìm category dựa trên categoryId
            const categoryIndex = newCategories.findIndex(cat => cat.id === categoryId);

            if (categoryIndex === -1) {
                console.error("Category with ID", categoryId, "not found");
                return prevCategories;
            }

            const category = newCategories[categoryIndex];

            // Kiểm tra xem index có hợp lệ không
            if (index < 0 || index >= category.options.length) {
                console.error("Option at index", index, "is out of bounds");
                return prevCategories;
            }

            // Tạo bản sao của options để cập nhật an toàn
            const newOptions = [...category.options];
            const option = { ...newOptions[index] };

            // Cập nhật dựa trên loại field
            if (field.startsWith('dimensions.')) {
                const parts = field.split('.');
                const dimensionField = parts[1] as 'length' | 'width' | 'height';

                // Nếu có index cụ thể (dimensions.length.0)
                if (parts.length > 2) {
                    const dimensionIndex = parseInt(parts[2], 10);

                    // Tạo bản sao của đối tượng dimensions
                    const newDimensions = {
                        length: [...(option.dimensions.length || [])],
                        width: [...(option.dimensions.width || [])],
                        height: [...(option.dimensions.height || [])]
                    };

                    // Cập nhật giá trị cụ thể
                    newDimensions[dimensionField][dimensionIndex] = Number(value);
                    option.dimensions = newDimensions;
                }
                // Nếu đang cập nhật toàn bộ mảng (dimensions.length)
                else {
                    const newDimensions = { ...option.dimensions };
                    newDimensions[dimensionField] = Array.isArray(value) ? value : [Number(value)];
                    option.dimensions = newDimensions;
                }
            }
            // Cập nhật weight
            else if (field.startsWith('weight.')) {
                const weightIndex = parseInt(field.split('.')[1], 10);
                const newWeight = [...(option.weight || [])];
                newWeight[weightIndex] = Number(value);
                option.weight = newWeight;
            }
            // Cập nhật weight toàn bộ mảng
            else if (field === 'weight') {
                option.weight = Array.isArray(value) ? value : [Number(value)];
            }
            // Các trường thông thường khác
            else {
                (option as any)[field] = value;
            }

            // Cập nhật option vào mảng
            newOptions[index] = option;

            // Cập nhật category với options mới
            newCategories[categoryIndex] = {
                ...category,
                options: newOptions
            };

            return newCategories;
        });
    };

    const removeOption = ({ categoryId, index }: RemoveOptionParams) => {
        setCategories(
            categories.map((cat: Category) => {
                if (cat.id === categoryId) {
                    const newOptions = [...cat.options];
                    newOptions.splice(index, 1);
                    return {
                        ...cat,
                        options: newOptions,
                        currentOptions: cat.currentOptions - 1
                    };
                }
                return cat;
            })
        );
    };

    // Xóa phân loại
    const removeCategory = (id: number) => {
        setCategories(categories.filter(cat => cat.id !== id));
    };

    const generateCombinations = (categories: Category[]): Combination[] => {
        // Hàm đệ quy để tạo tất cả các tổ hợp
        const buildCombinations = (
            categoryIndex: number,
            currentCombination: string[] = []
        ): Combination[] => {
            // Nếu đã xử lý hết tất cả categories, trả về combination hiện tại
            if (categoryIndex >= categories.length) {
                // Tạo một variantId duy nhất từ combination
                const variantId = currentCombination.join('-');

                return [{
                    combination: [...currentCombination],
                    variantId,
                    price: 0,
                    stock: 0,
                    image: "",
                    weight: [],
                    dimensions: {
                        length: [],
                        width: [],
                        height: []
                    }
                }];
            }

            const currentCategory = categories[categoryIndex];
            const validOptions = currentCategory.options.filter(option => option.name.trim() !== '');

            if (validOptions.length === 0) {
                // Nếu category hiện tại không có options hợp lệ, bỏ qua nó
                return buildCombinations(categoryIndex + 1, currentCombination);
            }

            // Tạo combinations cho mỗi option trong category hiện tại
            let results: Combination[] = [];

            for (const option of validOptions) {
                const newCombination = [...currentCombination, option.name];
                const nextCombinations = buildCombinations(categoryIndex + 1, newCombination);
                results = [...results, ...nextCombinations];
            }

            return results;
        };

        return buildCombinations(0);
    };

    const [combinationData, setCombinationData] = useState<Record<string, Combination>>({});

    const updateCombinationData = (
        variantId: string,
        field: string,
        value: number | number[] | string
    ) => {
        setCombinationData(prev => {
            const updated = { ...prev };

            // Nếu combination chưa tồn tại, tạo mới
            if (!updated[variantId]) {
                updated[variantId] = {
                    combination: variantId.split('-'),
                    variantId,
                    price: 0,
                    stock: 0,
                    image: "",
                    weight: [],
                    dimensions: {
                        length: [],
                        width: [],
                        height: []
                    }
                };
            }

            // Cập nhật trường dữ liệu
            if (field === 'price') {
                updated[variantId].price = value as number;
            } else if (field === 'stock') {
                updated[variantId].stock = value as number;
            } else if (field === 'image') {
                updated[variantId].image = value as string;
            } else if (field === 'weight') {
                updated[variantId].weight = value as number[];
            } else if (field.startsWith('dimensions.')) {
                const dimensionType = field.split('.')[1] as 'length' | 'width' | 'height';
                updated[variantId].dimensions[dimensionType] = value as number[];
            }
            console.log("Only", updated);
            return updated;
        });
    };

    const handleInputChangeWeight = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setShowError(value.trim() === "");

        updateAllOptions({ field: 'weight', value: [parseFloat(value) || 0] });
    };

    const handleChangeOptions = () => {
        setUseCustomSettings(!useCustomSettings)
        setInputValue('0');
        updateAllOptions({ field: 'weight', value: [0] });
    };
    const updateAllOptions = ({ field, value }: { field: string; value: number | number[] }) => {
        setCombinationData(prev => {
            const updated = { ...prev };

            // Loop through all variant IDs in the combination data
            Object.keys(updated).forEach(variantId => {
                // If the variant doesn't exist yet, create it with default values
                if (!updated[variantId]) {
                    updated[variantId] = {
                        combination: variantId.split('-'),
                        variantId,
                        price: 0,
                        stock: 0,
                        image: "",
                        weight: [],
                        dimensions: {
                            length: [],
                            width: [],
                            height: []
                        }
                    };
                }

                // Update the field for all variants
                if (field === 'price') {
                    updated[variantId].price = value as number;
                } else if (field === 'stock') {
                    updated[variantId].stock = value as number;
                } else if (field === 'weight') {
                    updated[variantId].weight = value as number[];
                } else if (field.startsWith('dimensions.')) {
                    const dimensionType = field.split('.')[1] as 'length' | 'width' | 'height';
                    updated[variantId].dimensions[dimensionType] = value as number[];
                }
            });

            return updated;
        });
        console.log("All", combinationData);
    };

    const combinations = generateCombinations(categories);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(event.target.files || []);
        const combinedFiles = [...selectedFiles];

        // Kiểm tra và thêm các tệp mới nếu chúng chưa tồn tại trong danh sách
        newFiles.forEach((newFile) => {
            if (!combinedFiles.some((file) => file.name === newFile.name && file.lastModified === newFile.lastModified)) {
                combinedFiles.push(newFile);
            }
        });

        // Giới hạn số lượng ảnh là 9
        const limitedFiles = combinedFiles.slice(0, 9);
        console.log("Danh sách ảnh sau khi giới hạn:", limitedFiles);

        setSelectedFiles(limitedFiles);

        // Chỉ tải lên những tệp mới
        const newUploadFiles = newFiles.filter((newFile) =>
            !uploadedUrls.some((url) => url.includes(newFile.name))
        );

        // Upload từng ảnh lên GCS
        const uploadPromises = newUploadFiles.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);

            try {
                const response = await axios.post(`${EnvValue.API_GATEWAY_URL}/api/product/uploadIMG`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                return response.data.url; // Trả về URL từ server
            } catch (error) {
                console.error("Lỗi khi upload ảnh:", error);
                return null;
            }
        });

        // Chờ tất cả ảnh upload xong và cập nhật URL
        const newUrls = (await Promise.all(uploadPromises)).filter((url) => url !== null);
        setUploadedUrls([...uploadedUrls, ...newUrls]);
    };

    const handleRemoveFile = async (index: number) => {
        const updatedUrls = [...uploadedUrls];
        const removedUrl = updatedUrls.splice(index, 1)[0]; // Lấy URL bị xóa
        setUploadedUrls(updatedUrls);

        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(updatedFiles);

        // Gọi API xóa ảnh trên server nếu cần
        try {
            await axios.delete(`${EnvValue.API_GATEWAY_URL}/api/product/deleteIMG`, { data: { url: removedUrl } });
        } catch (error) {
            console.error("Lỗi khi xóa ảnh trên server:", error);
        }
    };


    const handleOneFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(event.target.files || []);
        const combinedFiles = [...selectedFileOne, ...newFiles].slice(0, 1); // Giới hạn tối đa 9 ảnh
        setSelectedFileOne(combinedFiles);

        // Upload từng ảnh lên GCS
        const uploadPromises = combinedFiles.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);

            try {
                const response = await axios.post(`${EnvValue.API_GATEWAY_URL}/api/product/uploadIMG`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                return response.data.url; // Trả về URL từ server
            } catch (error) {
                console.error("Lỗi khi upload ảnh:", error);
                return null;
            }
        });

        // Chờ tất cả ảnh upload xong và cập nhật URL
        const urls = (await Promise.all(uploadPromises)).filter((url) => url !== null);
        setUploadedUrlOne(urls);
    };

    const handleRemoveOneFile = async (index: number) => {
        const updatedFiles = selectedFileOne.filter((_, i) => i !== index);
        setSelectedFileOne(updatedFiles);

        const updatedUrls = [...uploadedUrlOne];
        const removedUrl = updatedUrls.splice(index, 1)[0]; // Lấy URL bị xóa
        setUploadedUrlOne(updatedUrls);

        // Gọi API xóa ảnh trên server nếu cần
        try {
            await axios.delete(`${EnvValue.API_GATEWAY_URL}/api/product/deleteIMG`, { data: { url: removedUrl } });
        } catch (error) {
            console.error("Lỗi khi xóa ảnh trên server:", error);
        }
    };

    const handleVideoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Kiểm tra kích thước tệp
            if (file.size > 30 * 1024 * 1024) {
                alert("Kích thước tệp vượt quá 30MB.");
                return;
            }

            // Kiểm tra định dạng tệp
            if (file.type !== "video/mp4") {
                alert("Định dạng tệp không phải là MP4.");
                return;
            }

            // Kiểm tra độ phân giải và độ dài video
            const videoElement = document.createElement("video");
            videoElement.src = URL.createObjectURL(file);
            videoElement.onloadedmetadata = () => {
                const { duration } = videoElement;

                if (duration < 10 || duration > 60) {
                    alert("Độ dài video phải từ 10s đến 60s.");
                    return;
                }

                // Nếu tất cả các kiểm tra đều đạt, tiến hành tải lên video
                setSelectedVideo(file);

                const formData = new FormData();
                formData.append("file", file);

                axios.post(`${EnvValue.API_GATEWAY_URL}/api/product/uploadVideo`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                    .then(response => {
                        setUploadedVideoUrl(response.data.url); // Trả về URL từ server
                    })
                    .catch(error => {
                        console.error("Lỗi khi upload video:", error);
                    });
            };
        }
    };

    const handleRemoveVideo = async () => {
        if (uploadedVideoUrl) {
            try {
                await axios.delete(`${EnvValue.API_GATEWAY_URL}/api/product/deleteVideo`, { data: { url: uploadedVideoUrl } });
                setUploadedVideoUrl(null);
                setSelectedVideo(null);
            } catch (error) {
                console.error("Lỗi khi xóa video trên server:", error);
            }
        }
    };

    const handleInputChange = (categoryId: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        if (value.length <= 20) { // Giới hạn tối đa 20 ký tự
            setInputValues(prevValues => ({ ...prevValues, [categoryId]: value }));
            setCharCounts(prevCounts => ({ ...prevCounts, [categoryId]: value.length }));
        }
    };

    const convertCategoriesToClassifications = (categories: Category[]): any[] => {
        return categories.map((category, index) => ({
            ClassTypeName: category.name,
            Level: index + 1
        }));
    };

    const convertCategoriesToDetails = (categories: Category[], combinationData: Record<string, Combination>): any[] => {
        const combinations = Object.keys(combinationData);
        console.log("Categories:", categories);
        console.log("Combination Data:", combinationData);

        return combinations
            .map(variantId => {
                const combination = combinationData[variantId];
                // Tìm kiếm tùy chọn từ categories khớp với các phần tử trong combination
                const option1 = categories[0]?.options.find(option =>
                    option.name.trim() === combination.combination[0]?.trim());

                // Chỉ tìm kiếm option2 nếu combination có phần tử thứ hai
                const option2 = combination.combination.length > 1 ?
                    categories[1]?.options.find(option =>
                        option.name.trim() === combination.combination[1]?.trim()) : null;

                return {
                    Type_1: combination.combination[0] || "",
                    // Chỉ thiết lập Type_2 nếu có phần tử thứ hai trong combination
                    Type_2: combination.combination.length > 1 ? (combination.combination[1] || "") : "",
                    Image: option1?.image || option2?.image || combination.image || "",
                    Price: option1?.price || option2?.price || combination.price || 0,
                    Quantity: option1?.stock || option2?.stock || combination.stock || 0,
                    Dimension: {
                        Weight: option1?.weight?.[0] || option2?.weight?.[0] || combination.weight?.[0] || 0,
                        Length: option1?.dimensions?.length?.[0] || option2?.dimensions?.length?.[0] || combination.dimensions?.length?.[0] || 0,
                        Width: option1?.dimensions?.width?.[0] || option2?.dimensions?.width?.[0] || combination.dimensions?.width?.[0] || 0,
                        Height: option1?.dimensions?.height?.[0] || option2?.dimensions?.height?.[0] || combination.dimensions?.height?.[0] || 0
                    }
                };
            })
            // Lọc ra các chi tiết có ít nhất Type_1 không trống
            .filter(detail => detail.Type_1.trim() !== "");
    };

    const sendProduct = async () => {
        const productClassifications = convertCategoriesToClassifications(categories);
        const productDetails = convertCategoriesToDetails(categories, combinationData);
        const totalQuantity = productDetails.reduce((sum, detail) => sum + detail.Quantity, 0);

        console.log("Classifications:", productClassifications);
        console.log("Details:", productDetails);

        const sampleProduct = {
            SellerID: localStorage.getItem('user_accountId'),
            Name: productName,
            Description: productDescription,
            Categories: selectedCategoryPath.map(category => category.CategoryID),
            Images: uploadedUrls,
            SoldQuantity: 0,
            Rating: 0.0,
            status: "Pending",
            CreatedAt: new Date(),
            UpdatedAt: new Date(),
            CoverImage: uploadedUrlOne[0],
            Video: uploadedVideoUrl,
            Quantity: totalQuantity,
            Reviews: 0,
            classifications: productClassifications,
            details: productDetails
        };

        console.log("final Product:", sampleProduct);


        try {
            const response = await axios.post(`${EnvValue.API_GATEWAY_URL}/api/product`, sampleProduct);
            console.log('Product added:', response.data);
            toast.success("Thêm sản phẩm thành công!", {
                onClose: () => {
                    window.location.reload();
                },
                autoClose: 1000 // 2 seconds delay before auto-closing
            });
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            // Replace this with your actual API call
            const response = await axios.get(`${EnvValue.API_GATEWAY_URL}/api/categories/tree`);
            const data = response.data;
            setSelectedCategory(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {

        fetchCategories();

        const handleScroll = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveTab(entry.target.id as TabId);
                }
            });
        };

        const observer = new IntersectionObserver(handleScroll, { threshold: 0.5 });

        tabs.forEach(tab => {
            if (tab.ref.current) {
                observer.observe(tab.ref.current);
            }
        });

        return () => {
            tabs.forEach(tab => {
                if (tab.ref.current) {
                    observer.unobserve(tab.ref.current);
                }
            });
        };
    }, []);

    return (
        <div className="flex min-h-screen px-20 gap-5 mt-6">
            {/* Sidebar */}
            <div className="fixed top-20 left-20 w-80 bg-blue-50 p-6 border-r border-t-4 border-blue-500 shadow-md rounded-xl"
                id="sidebar">
                <h2 className="text-lg font-semibold mb-4 text-black">Gợi ý điền Thông tin</h2>
                <ul className="space-y-3 bg-white rounded-xl text-sm">
                    {steps.map(step => (
                        <li
                            key={step.id}
                            onClick={() => handleStepClick(step.id)}
                            className={`flex items-center space-x-2 cursor-pointer py-2 px-3 rounded ${activeStep === step.id
                                ? 'bg-blue-100 text-black font-semibold'
                                : 'text-gray-600 hover:bg-blue-100/50'
                                }`}

                        >
                            {/* SVG Icon */}
                            <svg
                                className="w-4 h-4 text-blue-500"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path fillRule="evenodd" d="M8,1 C11.8659932,1 15,4.13400675 15,8 C15,11.8659932 11.8659932,15 8,15 C4.13400675,15 1,11.8659932 1,8 C1,4.13400675 4.13400675,1 8,1 Z M11.1464466,5.92870864 L7.097234,9.97792125 L4.85355339,7.73424065 C4.65829124,7.5389785 4.34170876,7.5389785 4.14644661,7.73424065 C3.95118446,7.92950279 3.95118446,8.24608528 4.14644661,8.44134743 L6.7436806,11.0385814 C6.93894275,11.2338436 7.25552524,11.2338436 7.45078739,11.0385814 L11.8535534,6.63581542 C12.0488155,6.44055327 12.0488155,6.12397078 11.8535534,5.92870864 C11.6582912,5.73344649 11.3417088,5.73344649 11.1464466,5.92870864 Z"></path>
                            </svg>

                            <span>{step.label}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Suggestion Section Info */}
            {hasSelected && (
                <div
                    className="fixed left-20 w-80 bg-white p-4 rounded-lg shadow-md border border-gray-200"
                    style={{ top: `calc(80px + ${document.getElementById('sidebar')?.offsetHeight || 200}px + 10px)` }}
                >
                    <h3 className="font-semibold mb-2 text-blue-800 flex justify-between items-center">
                        Gợi ý
                        <svg
                            className="w-5 h-5 text-blue-500"
                            viewBox="0 0 32 48"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M23.703 5.997c-6.371-3.935-14.518-1.6-18.197 5.216-3.623 6.714-1.122 14.722 5.297 18.686 1.3.803 2.366 2.152 3.255 3.865.893 1.72 1.656 3.903 2.309 6.509l.272 1.086 11.513-3.3-.273-1.086c-.652-2.606-1.011-4.904-1.042-6.872-.031-1.959.262-3.697 1.012-5.088 3.837-7.11 2.144-15.13-4.146-19.016ZM3.078 9.713C7.53 1.463 17.392-1.364 25.105 3.4c7.793 4.814 9.688 14.748 5.173 23.114-.406.752-.663 1.889-.637 3.538.025 1.639.33 3.68.947 6.145l.998 3.985-16.93 4.853-.998-3.985c-.617-2.465-1.308-4.396-2.052-5.829-.748-1.442-1.502-2.288-2.205-2.723-7.562-4.67-10.83-14.431-6.323-22.784Zm15.287 39.984 12.19-3.494.725 2.898-12.19 3.494-.725-2.898Z"></path>
                        </svg>
                    </h3>
                    <h3 className="font-semibold mb-2 text-black">Hình ảnh sản phẩm</h3>
                    <div className="text-xs text-gray-600 text-sm">
                        <p>
                            • Tham khảo hướng dẫn hình ảnh sản phẩm khi đăng bán{' '}
                            <a href="#" className="text-blue-600">tại đây</a>
                        </p>
                        <p>
                            • Tham khảo hướng dẫn cho Shopee Mall{' '}
                            <a href="#" className="text-blue-600">tại đây</a>
                        </p>
                    </div>
                </div>
            )}

            {/* Suggestion Section Name Products */}
            {hasSelectedProduct && (
                <div
                    className="fixed left-20 w-80 bg-white p-4 rounded-lg shadow-md border border-gray-200"
                    style={{ top: `calc(80px + ${document.getElementById('sidebar')?.offsetHeight || 200}px + 10px)` }}
                >
                    <h3 className="font-semibold mb-2 text-blue-800 flex justify-between items-center">
                        Gợi ý
                        <svg
                            className="w-5 h-5 text-blue-500"
                            viewBox="0 0 32 48"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M23.703 5.997c-6.371-3.935-14.518-1.6-18.197 5.216-3.623 6.714-1.122 14.722 5.297 18.686 1.3.803 2.366 2.152 3.255 3.865.893 1.72 1.656 3.903 2.309 6.509l.272 1.086 11.513-3.3-.273-1.086c-.652-2.606-1.011-4.904-1.042-6.872-.031-1.959.262-3.697 1.012-5.088 3.837-7.11 2.144-15.13-4.146-19.016ZM3.078 9.713C7.53 1.463 17.392-1.364 25.105 3.4c7.793 4.814 9.688 14.748 5.173 23.114-.406.752-.663 1.889-.637 3.538.025 1.639.33 3.68.947 6.145l.998 3.985-16.93 4.853-.998-3.985c-.617-2.465-1.308-4.396-2.052-5.829-.748-1.442-1.502-2.288-2.205-2.723-7.562-4.67-10.83-14.431-6.323-22.784Zm15.287 39.984 12.19-3.494.725 2.898-12.19 3.494-.725-2.898Z"></path>
                        </svg>
                    </h3>
                    <h3 className="font-semibold mb-2 text-black">Tên sản phẩm</h3>
                    <div className="text-xs text-gray-600">
                        <p>
                            • Tham khảo quy định đặt tên {' '}
                            <a href="#" className="text-blue-600">tại đây</a>
                        </p>
                        <p>
                            • Với Shopee Mall, xem thêm quy định {' '}
                            <a href="#" className="text-blue-600">tại đây</a>
                        </p>
                        <p>
                            Sử dụng tiếng Việt có dấu, không viết tắt, tối thiểu 10 ký tự, 20 ký tự đối với Shopee Mall. Độ dài tối đa của tên sản phẩm cho tất cả các Shop là 120 ký tự (bao gồm cả khoảng trắng).
                        </p>
                    </div>
                </div>
            )}

            {/* Suggestion Section Industry*/}
            {hasSelectedIndustry && (
                <div
                    className="fixed left-20 w-80 bg-white p-4 rounded-lg shadow-md border border-gray-200"
                    style={{ top: `calc(80px + ${document.getElementById('sidebar')?.offsetHeight || 200}px + 10px)` }}
                >
                    <h3 className="font-semibold mb-2 text-blue-800 flex justify-between items-center">
                        Gợi ý
                        <svg
                            className="w-5 h-5 text-blue-500"
                            viewBox="0 0 32 48"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M23.703 5.997c-6.371-3.935-14.518-1.6-18.197 5.216-3.623 6.714-1.122 14.722 5.297 18.686 1.3.803 2.366 2.152 3.255 3.865.893 1.72 1.656 3.903 2.309 6.509l.272 1.086 11.513-3.3-.273-1.086c-.652-2.606-1.011-4.904-1.042-6.872-.031-1.959.262-3.697 1.012-5.088 3.837-7.11 2.144-15.13-4.146-19.016ZM3.078 9.713C7.53 1.463 17.392-1.364 25.105 3.4c7.793 4.814 9.688 14.748 5.173 23.114-.406.752-.663 1.889-.637 3.538.025 1.639.33 3.68.947 6.145l.998 3.985-16.93 4.853-.998-3.985c-.617-2.465-1.308-4.396-2.052-5.829-.748-1.442-1.502-2.288-2.205-2.723-7.562-4.67-10.83-14.431-6.323-22.784Zm15.287 39.984 12.19-3.494.725 2.898-12.19 3.494-.725-2.898Z"></path>
                        </svg>
                    </h3>
                    <h3 className="font-semibold mb-2 text-black">Ngành hàng</h3>
                    <div className="text-xs text-gray-600">
                        <p>
                            • Việc đăng tải sản phẩm đúng ngành hàng giúp Người mua dễ dàng tìm thấy sản phẩm của Shop khi đang tìm kiếm trong ngành hàng đó.
                        </p>
                        <p>
                            • Người bán có thể dễ dàng tìm thấy ngành hàng phù hợp cho sản phẩm của Shop tại  {' '}
                            <a href="#" className="text-blue-600">Danh sách ngành hàng</a>
                        </p>
                        <p>
                            • Tham khảo hướng dẫn chọn danh mục ngành hàng cho sản phẩm {' '}
                            <a href="#" className="text-blue-600">tại đây</a>
                        </p>

                    </div>
                </div>
            )}

            {/* Suggestion Section Description*/}
            {hasSelectedDes && (
                <div
                    className="fixed left-20 w-80 bg-white p-4 rounded-lg shadow-md border border-gray-200"
                    style={{ top: `calc(80px + ${document.getElementById('sidebar')?.offsetHeight || 200}px + 10px)` }}
                >
                    <h3 className="font-semibold mb-2 text-blue-800 flex justify-between items-center">
                        Gợi ý
                        <svg
                            className="w-5 h-5 text-blue-500"
                            viewBox="0 0 32 48"
                            fill="currentColor"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M23.703 5.997c-6.371-3.935-14.518-1.6-18.197 5.216-3.623 6.714-1.122 14.722 5.297 18.686 1.3.803 2.366 2.152 3.255 3.865.893 1.72 1.656 3.903 2.309 6.509l.272 1.086 11.513-3.3-.273-1.086c-.652-2.606-1.011-4.904-1.042-6.872-.031-1.959.262-3.697 1.012-5.088 3.837-7.11 2.144-15.13-4.146-19.016ZM3.078 9.713C7.53 1.463 17.392-1.364 25.105 3.4c7.793 4.814 9.688 14.748 5.173 23.114-.406.752-.663 1.889-.637 3.538.025 1.639.33 3.68.947 6.145l.998 3.985-16.93 4.853-.998-3.985c-.617-2.465-1.308-4.396-2.052-5.829-.748-1.442-1.502-2.288-2.205-2.723-7.562-4.67-10.83-14.431-6.323-22.784Zm15.287 39.984 12.19-3.494.725 2.898-12.19 3.494-.725-2.898Z"></path>
                        </svg>
                    </h3>
                    <h3 className="font-semibold mb-2 text-black">Mô tả sản phẩm</h3>
                    <div className="text-xs text-gray-600">
                        <p>
                            <strong>Lưu ý: </strong>
                            Đối với một số mặt hàng nhất định cần cung cấp thông tin tại mục "Mô tả sản phẩm" theo Nghị định 85/2021/NĐ-CP (Xem hướng dẫn  {' '}
                            <a href="#" className="text-blue-600">tại đây)</a>
                        </p>
                        <p>
                            Tham khảo hướng dẫn chọn danh mục ngành hàng cho sản phẩm {' '}
                            <a href="#" className="text-blue-600">tại đây</a>
                        </p>
                        <p>
                            • Số chứng nhận phê duyệt kiểu <br />
                            • Khuyến cáo - Hướng dẫn sử dụng <br />
                            • Thông số kỹ thuật <br />
                            • Thông tin cảnh báo

                        </p>
                    </div>
                </div>
            )}



            {/* Main Content */}
            <div className="ml-[22rem] flex-grow h-full p-6 bg-white rounded-xl shadow-lg overflow-auto">
                <div className="max-w-2xl mx-auto">

                    {/* Horizontal Tabs */}
                    <div className="flex border-b sticky top-0 bg-white">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={`px-6 py-3 bg-white hover:text-gray-800 focus:outline-none outline-none ${activeTab === tab.id
                                    ? 'text-orange-600 border-b-2 border-orange-500 font-medium'
                                    : 'text-black'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>


                    {/* All Sections Content */}
                    <div className="divide-y text-black">
                        {/* Basic Information Section */}
                        <div id="basic" ref={basicRef} className="p-6">
                            <h2 className="text-lg font-semibold mb-4 ">Thông tin cơ bản</h2>

                            {/* Product Images */}
                            <div className="mb-4">
                                <label
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                    onClick={() => handleRatioChangeInf()} // Kích hoạt khi nhấn vào label
                                >
                                    <span className="text-red-500">*</span> Hình ảnh sản phẩm
                                </label>



                                {/* Radio Buttons */}
                                <div className="flex items-center space-x-4 mb-2">
                                    {/* Tỷ lệ 1:1 */}
                                    <label className="flex items-center cursor-pointer space-x-2">
                                        <input
                                            type="radio"
                                            name="imageRatio"
                                            value="1:1"
                                            checked={selectedRatio === "1:1"}
                                            onChange={() => setSelectedRatio("1:1")}
                                            onClick={() => handleRatioChangeInf()}
                                            className="peer hidden"
                                        />
                                        <div className="w-5 h-5 border-2 border-gray-400 rounded-full flex items-center justify-center peer-checked:border-orange-500">
                                            <div className="w-3 h-3 bg-transparent rounded-full peer-checked:bg-orange-500"></div>
                                        </div>
                                        <span className={`text-sm font-medium ${selectedRatio === "1:1" ? "text-orange-500" : "text-gray-700"}`}>
                                            Hình ảnh tỷ lệ 1:1
                                        </span>
                                    </label>
                                </div>

                                {/* Upload Button */}
                                <label className="cursor-pointer flex items-center px-4 py-2 bg-gray-100 text-blue-600 rounded w-48" onClick={() => handleRatioChangeInf()} >
                                    <Upload className="mr-2 h-5 w-5" />
                                    Thêm hình ảnh (0/9)
                                    <input type="file" name="product-images" multiple className="hidden" onChange={handleFileChange} />
                                </label>
                                <div className="mt-4 flex flex-wrap">
                                    {selectedFiles.map((file, index) => (
                                        <div key={index} className="relative w-32 h-32 m-2">
                                            <img
                                                src={URL.createObjectURL(file)} // Hiển thị hình ảnh từ selectedFiles
                                                alt={`Upload preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                style={{ aspectRatio: "1 / 1" }} // Đảm bảo tỉ lệ 1:1
                                            />
                                            <button
                                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1"
                                                onClick={() => handleRemoveFile(index)}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Cover Image */}
                            <div ref={ImageRef} className="mb-4" >
                                <label className="block text-sm font-medium text-gray-700 mb-2" onClick={() => handleRatioChangeInf()}>
                                    <span className="text-red-500">*</span> Ảnh bìa
                                </label>
                                <label className="cursor-pointer flex items-center px-4 py-2 bg-gray-100 text-blue-600 rounded w-48" onClick={() => handleRatioChangeInf()}>
                                    <Upload className="mr-2 h-5 w-5" />
                                    Thêm hình ảnh (0/1)
                                    <input type="file" name="product-cover-image" className="hidden" onChange={handleOneFileChange} />
                                </label>
                                <div className="mt-4 flex flex-wrap">
                                    {selectedFileOne.map((file, index) => (
                                        <div key={index} className="relative w-32 h-32 m-2">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Upload preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                                style={{ aspectRatio: "1 / 1" }} // Đảm bảo tỉ lệ 1:1
                                            />
                                            <button
                                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1"
                                                onClick={() => handleRemoveOneFile(index)}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <small className="text-gray-500 text-xs">
                                    • Tải lên hình ảnh 1:1.<br></br> • Ảnh sẽ được hiển thị tại các trang Kết quả tìm kiếm, Gợi ý hôm nay... Việc sử dụng ảnh bìa đẹp sẽ thu hút thêm lượt truy cập vào sản phẩm của bạn
                                </small>

                            </div>

                            {/* Product Video */}
                            <div ref={VideoRef} className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Video sản phẩm
                                </label>
                                <label className="cursor-pointer flex items-center px-4 py-2 bg-gray-100 text-blue-600 rounded w-48">
                                    <Upload className="mr-2 h-5 w-5" />
                                    Thêm video (0/1)
                                    <input type="file" name="product-video" className="hidden" onChange={handleVideoChange} />
                                </label>
                                {selectedVideo && (
                                    <div className="mt-4 relative w-64">
                                        <video
                                            src={URL.createObjectURL(selectedVideo)}
                                            controls
                                            className="w-full h-auto"
                                        />
                                        <button
                                            className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1"
                                            onClick={handleRemoveVideo}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                <small className="text-gray-500 text-xs block">
                                    • Kích thước tối đa 30Mb, độ phân giải không vượt quá 1280x1280px<br />
                                    • Độ dài: 10s-60s<br />
                                    • Định dạng: MP4<br />
                                    • Lưu ý: sản phẩm có thể hiển thị trong khi video đang được xử lý. Video sẽ tự động hiển thị sau khi đã xử lý thành công.
                                </small>
                            </div>

                            {/* Product Name */}
                            <div ref={NameRef} className="mb-4" onClick={() => handleRatioChangePro()}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="text-red-500">*</span> Tên sản phẩm
                                </label>

                                {/* Khung chứa input và bộ đếm */}
                                <div className={`w-full flex items-center border rounded px-3 py-2 bg-white ${productName && (productName.trim().length < 10 || productName !== productName.trim()) ? "border-red-500" : "border-gray-300"}`}>
                                    <input
                                        type="text"
                                        name="product-name"
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                        placeholder="Tên sản phẩm + Thương hiệu + Model + Thông số kỹ thuật"
                                        className="w-full outline-none bg-transparent"
                                    />
                                    <div className="text-gray-500 text-xs ml-2">{productName.length}/120</div>
                                </div>

                                {/* Hiển thị lỗi khi có nội dung nhập vào */}
                                {productName && (
                                    <>
                                        {productName !== productName.trim() && (
                                            <div className="text-red-500 text-xs mt-1">
                                                Vui lòng kiểm tra lại. Đầu và cuối của chuỗi ký tự được nhập không được chứa khoảng trắng.
                                            </div>
                                        )}
                                        {productName.trim().length < 10 && (
                                            <div className="text-red-500 text-xs mt-1">
                                                Tên sản phẩm của bạn quá ngắn. Vui lòng nhập ít nhất 10 ký tự.
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>


                            {/* Product Category */}
                            <div className="mb-4" onClick={() => handleRatioChangeInd()}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="text-red-500">*</span> Ngành hàng
                                </label>
                                <div className="flex justify-between items-center border rounded px-3 py-2">
                                    <span className="text-gray-500">
                                        {selectedCategoryPath && selectedCategoryPath.length > 0 ?
                                            selectedCategoryPath.map(cat => cat.CategoryName).join(" > ")
                                            : 'Chọn ngành hàng'}
                                    </span>
                                    <PenLine className="text-blue-600 cursor-pointer" size={20} />
                                </div>
                            </div>

                            {/* Product Code */}
                            <div ref={DesRef} className="mb-4" onClick={() => handleRatioChangeDes()}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <span className="text-red-500">*</span> Mô tả sản phẩm
                                </label>
                                <input
                                    type="text"
                                    name="product-description"
                                    value={productDescription}
                                    onChange={(e) => setProductDescription(e.target.value)}
                                    className="w-full border rounded px-3 py-2 bg-white text-black h-32"
                                />

                                {/* Hiển thị số ký tự */}
                                <div className="text-right text-gray-500 text-xs mt-1">{productDescription.length}/3000</div>

                                {/* Thông báo lỗi nếu dưới 100 ký tự */}
                                {productDescription.length > 0 && productDescription.length < 20 && (
                                    <div className="text-red-500 text-xs mt-1">
                                        Mô tả sản phẩm của bạn quá ngắn. Vui lòng nhập ít nhất 20 ký tự.
                                    </div>
                                )}
                            </div>



                        </div>

                        {/* Sales Information Section */}
                        <div className="max-w-screen-xl mx-auto">
                            <h2 className="text-xl font-medium mb-4">Thông tin bán hàng</h2>

                            {/* Phân loại hàng */}
                            <div className="mb-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                                    <span className="font-medium">Phân loại hàng</span>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-md mb-4">
                                    {categories.map((category, categoryIndex) => (
                                        <div key={category.id} className="mb-4">
                                            <div className="flex border-b pb-2">
                                                <div className="w-1/4 px-4 py-2 bg-gray-100 font-medium text-center">
                                                    Phân loại {category.id}
                                                </div>
                                                <div className="w-3/4 px-4 py-2 flex items-center">
                                                    <input
                                                        type="text"
                                                        name="category-name"
                                                        value={category.name}
                                                        onChange={(e) => updateCategoryName(category.id, e.target.value)}
                                                        placeholder="Nhập tên phân loại"
                                                        className="outline-none bg-transparent flex-grow"
                                                    />
                                                    <span className="text-gray-500 ml-2 text-sm">{category.currentOptions}/{category.maxOptions}</span>
                                                    {categoryIndex > 0 && (
                                                        <button
                                                            className="ml-2 text-gray-500"
                                                            onClick={() => removeCategory(category.id)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex py-2">
                                                <div className="w-1/4 px-4 py-2 font-medium">
                                                    Tùy chọn
                                                </div>
                                                <div className="w-3/4 flex">
                                                    <div className="flex-1 px-1">
                                                        {category.options
                                                            .filter((_, index) => index !== 0) // Filter out the first option
                                                            .map((option, index) => (
                                                                <div key={index} className="flex justify-between mb-1">
                                                                    <input
                                                                        type="text"
                                                                        value={option.name}
                                                                        onChange={(e) => updateOption({ categoryId: category.id, index: index + 1, field: 'name', value: e.target.value })} // Adjust index
                                                                        className="outline-none bg-transparent"
                                                                    />
                                                                    <div className="flex items-center">
                                                                        <button
                                                                            className="ml-1 text-gray-400"
                                                                            onClick={() => removeOption({ categoryId: category.id, index: index + 1 })} // Adjust index
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex py-2 bg-white text-black">
                                                <div className="w-1/4 px-4 py-2"></div>
                                                <div className="w-3/4">
                                                    <form
                                                        onSubmit={(e) => {
                                                            e.preventDefault();
                                                            const input = (e.target as HTMLFormElement).elements.namedItem('newOption') as HTMLInputElement;
                                                            if (input.value.trim() !== '') {
                                                                addOption({ categoryId: category.id, value: input.value });
                                                                setCharCounts(prevCounts => ({ ...prevCounts, [category.id]: 0 })); // Reset character count after form submission
                                                                setInputValues(prevValues => ({ ...prevValues, [category.id]: '' })); // Reset input value after form submission
                                                            }
                                                        }}
                                                    >
                                                        <div className="border border-gray-300 rounded flex items-center bg-white">
                                                            <input
                                                                type="text"
                                                                name="newOption"
                                                                placeholder="Nhập"
                                                                className="w-full px-4 py-2 outline-none rounded bg-white text-black"
                                                                onChange={(e) => handleInputChange(category.id, e)}
                                                                value={inputValues[category.id] || ''}
                                                                maxLength={20}
                                                            />
                                                            <span className="pr-4 text-gray-500 text-sm">{charCounts[category.id] || 0}/20</span>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>

                                        </div>
                                    ))}
                                </div>

                                {/* Thêm nhóm phân loại */}
                                {categories.length < 2 && (
                                    <button
                                        onClick={addNewCategory}
                                        className="border border-dashed border-orange-400 text-orange-500 bg-white px-4 py-2 rounded flex items-center justify-center w-full sm:w-auto"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Thêm nhóm phân loại {categories.length + 1}
                                    </button>
                                )}
                            </div>

                            {/* Danh sách phân loại hàng */}
                            <div className="mb-6 mt-8">
                                <div className="flex justify-between mb-4">
                                    <h3 className="font-medium">Danh sách phân loại hàng</h3>
                                </div>

                                {combinations.length > 0 ? (
                                    <div className="border rounded">
                                        <div className="overflow-x-auto" style={{ position: 'relative' }}>
                                            <table className="w-full table-fixed">
                                                <thead>
                                                    <tr className="bg-gray-50">
                                                        {/* Header for categories */}
                                                        {categories.map((category, index) => (
                                                            <th key={index} className="text-left py-3 px-4 font-medium border-b border-r sticky left-0 bg-gray-50 z-10"
                                                                style={{
                                                                    left: index === 0 ? 0 : `${index * 150}px`,
                                                                    minWidth: '150px',
                                                                    width: '150px'
                                                                }}>
                                                                {category.name}
                                                            </th>
                                                        ))}

                                                        {/* Header for other information */}
                                                        <th className="text-left py-3 px-4 font-medium border-b border-r whitespace-nowrap" style={{ minWidth: '150px', width: '150px' }}>Giá</th>
                                                        <th className="text-left py-3 px-4 font-medium border-b border-r whitespace-nowrap" style={{ minWidth: '150px', width: '150px' }}>Kho hàng</th>

                                                        {useCustomSettings && (
                                                            <>
                                                                <th className="text-left py-3 px-4 font-medium border-b border-r whitespace-nowrap" style={{ minWidth: '200px', width: '200px' }}>
                                                                    <div className="flex items-center">
                                                                        <span className="text-red-500 mr-1">*</span>
                                                                        Cân nặng
                                                                    </div>
                                                                </th>
                                                                <th className="text-left py-3 px-4 font-medium border-b border-r whitespace-nowrap" style={{ minWidth: '350px', width: '350px' }}>
                                                                    Kích thước đóng gói
                                                                </th>
                                                            </>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {/* Process combinations for cell merging with image upload */}
                                                    {(() => {
                                                        // Add TypeScript type annotation
                                                        const rows: React.ReactNode[] = [];

                                                        // Group combinations by first option value
                                                        const groupedByFirstOption: { [key: string]: any[] } = {};
                                                        combinations.forEach((combination) => {
                                                            const firstOption = combination.combination[0];
                                                            if (!groupedByFirstOption[firstOption]) {
                                                                groupedByFirstOption[firstOption] = [];
                                                            }
                                                            groupedByFirstOption[firstOption].push(combination);
                                                        });

                                                        // Function to handle image upload for a group
                                                        const handleImageUpload = async (firstOption: string, e: React.ChangeEvent<HTMLInputElement>, currentUrl: string) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                const file = e.target.files[0];

                                                                // Create FormData for the upload
                                                                const formData = new FormData();
                                                                formData.append("file", file);

                                                                try {
                                                                    // If there's a current URL, delete it first
                                                                    if (currentUrl && currentUrl !== "") {
                                                                        try {
                                                                            await axios.delete(
                                                                                `${EnvValue.API_GATEWAY_URL}/api/product/deleteIMG`,
                                                                                { data: { url: currentUrl } }
                                                                            );
                                                                        } catch (error) {
                                                                            console.error("Error deleting previous image:", error);
                                                                            // Continue with upload even if delete fails
                                                                        }
                                                                    }

                                                                    // Upload the image to the server
                                                                    const response = await axios.post(
                                                                        `${EnvValue.API_GATEWAY_URL}/api/product/uploadIMG`,
                                                                        formData,
                                                                        {
                                                                            headers: { "Content-Type": "multipart/form-data" },
                                                                        }
                                                                    );

                                                                    // Get the URL from the server response
                                                                    const imageUrl = response.data.url;

                                                                    if (imageUrl) {
                                                                        // Update all combinations with this first option to have the same image URL
                                                                        groupedByFirstOption[firstOption].forEach(combination => {
                                                                            const variantId = combination.variantId || combination.combination.join('-');
                                                                            updateCombinationData(variantId, 'image', imageUrl);
                                                                        });
                                                                    }
                                                                } catch (error) {
                                                                    console.error("Lỗi khi upload ảnh:", error);
                                                                }
                                                            }
                                                        };

                                                        // Render rows with rowspan for the first column and image upload
                                                        Object.entries(groupedByFirstOption).forEach(([firstOption, groupCombinations]) => {
                                                            // Get image for this group (use the first item's image if exists)
                                                            const firstItem = groupCombinations[0];
                                                            const firstItemId = firstItem.variantId || firstItem.combination.join('-');
                                                            const firstItemData = combinationData[firstItemId] || firstItem;
                                                            const groupImage = firstItemData.image || null;

                                                            groupCombinations.forEach((combination, index) => {
                                                                const variantId = combination.variantId || combination.combination.join('-');
                                                                const data = combinationData[variantId] || combination;

                                                                rows.push(
                                                                    <tr key={variantId}>
                                                                        {/* First column with rowspan and image upload */}
                                                                        {index === 0 && (
                                                                            <td
                                                                                rowSpan={groupCombinations.length}
                                                                                className="border-r p-4 border-t sticky bg-white"
                                                                                style={{
                                                                                    left: 0,
                                                                                    minWidth: '150px',
                                                                                    width: '150px',
                                                                                    zIndex: 5
                                                                                }}
                                                                            >
                                                                                <div className="flex flex-col items-center">
                                                                                    <span className="mb-2">{firstOption}</span>

                                                                                    {/* Image upload area */}
                                                                                    <div className="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-500 hover:text-blue-500">
                                                                                        {groupImage ? (
                                                                                            <div className="relative w-full h-full">
                                                                                                <img
                                                                                                    src={groupImage}
                                                                                                    alt="Variant"
                                                                                                    className="w-full h-full object-contain"
                                                                                                />
                                                                                            </div>
                                                                                        ) : (
                                                                                            <>
                                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                                                </svg>
                                                                                                <span className="text-xs mt-1">Upload</span>
                                                                                            </>
                                                                                        )}
                                                                                        <input
                                                                                            type="file"
                                                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                                            accept="image/*"
                                                                                            onChange={(e) => handleImageUpload(firstOption, e, groupImage || "")}
                                                                                        />
                                                                                        {groupImage && (
                                                                                            <button
                                                                                                className="absolute bottom-0 left-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                                                                                onClick={async (e) => {
                                                                                                    e.stopPropagation(); // Prevent event propagation
                                                                                                    e.preventDefault(); // Prevent default action

                                                                                                    if (groupImage) {
                                                                                                        try {
                                                                                                            await axios.delete(
                                                                                                                `${EnvValue.API_GATEWAY_URL}/api/product/deleteIMG`,
                                                                                                                { data: { url: groupImage } }
                                                                                                            );

                                                                                                            // Sau khi xóa thành công, cập nhật state
                                                                                                            groupCombinations.forEach(c => {
                                                                                                                const cId = c.variantId || c.combination.join('-');
                                                                                                                updateCombinationData(cId, 'image', "");
                                                                                                            });
                                                                                                        } catch (error) {
                                                                                                            console.error("Lỗi khi xóa ảnh:", error);
                                                                                                        }
                                                                                                    }
                                                                                                }}
                                                                                            >
                                                                                                ×
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        )}

                                                                        {/* Other option values */}
                                                                        {combination.combination.slice(1).map((optionValue: string, optIndex: number) => (
                                                                            <td
                                                                                key={optIndex}
                                                                                className="border-r p-4 border-t sticky bg-white"
                                                                                style={{
                                                                                    left: `${(optIndex + 1) * 150}px`,
                                                                                    minWidth: '150px',
                                                                                    width: '150px',
                                                                                    zIndex: 5
                                                                                }}
                                                                            >
                                                                                <span>{optionValue}</span>
                                                                            </td>
                                                                        ))}

                                                                        {/* Price column */}
                                                                        <td className="border-r p-4 border-t" style={{ minWidth: '150px', width: '150px' }}>
                                                                            <div className="relative">
                                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₫</span>
                                                                                <input
                                                                                    type="number"
                                                                                    name="product-price"
                                                                                    className="pl-8 pr-4 py-2 border rounded w-full bg-white text-black"
                                                                                    placeholder="Nhập vào"
                                                                                    min="0"
                                                                                    value={data.price || ''}
                                                                                    onChange={(e) => updateCombinationData(
                                                                                        variantId,
                                                                                        'price',
                                                                                        parseFloat(e.target.value) || 0
                                                                                    )}
                                                                                />
                                                                            </div>
                                                                        </td>

                                                                        {/* Stock column */}
                                                                        <td className="border-r p-4 border-t" style={{ minWidth: '150px', width: '150px' }}>
                                                                            <input
                                                                                type="number"
                                                                                name="product-quantity"
                                                                                className="px-4 py-2 border rounded w-full bg-white text-black"
                                                                                placeholder="0"
                                                                                min="0"
                                                                                value={data.stock || ''}
                                                                                onChange={(e) => updateCombinationData(
                                                                                    variantId,
                                                                                    'stock',
                                                                                    parseInt(e.target.value) || 0
                                                                                )}
                                                                            />
                                                                        </td>

                                                                        {/* Weight and dimensions columns */}
                                                                        {useCustomSettings && (
                                                                            <>
                                                                                <td className="border-r p-4 border-t" style={{ minWidth: '200px', width: '200px' }}>
                                                                                    <div className="flex items-center">
                                                                                        <input
                                                                                            type="text"
                                                                                            className="border rounded p-2 w-32 bg-white text-black"
                                                                                            placeholder="Nhập vào"
                                                                                            value={data.weight[0] !== undefined ? data.weight[0] : ''}
                                                                                            onChange={(e) => {
                                                                                                let value = e.target.value;

                                                                                                // Cho phép nhập số và dấu chấm thập phân
                                                                                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                                                                    if (value !== '') {
                                                                                                        updateCombinationData(
                                                                                                            variantId,
                                                                                                            'weight',
                                                                                                            [parseFloat(value)]
                                                                                                        )
                                                                                                    }
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                        <span className="ml-2 text-gray-600">gr</span>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="border-r p-4 border-t" style={{ minWidth: '350px', width: '350px' }}>
                                                                                    <div className="flex items-center space-x-2">
                                                                                        <input
                                                                                            type="text"
                                                                                            className="border rounded p-2 w-16 bg-white text-black"
                                                                                            placeholder="R"
                                                                                            value={data.dimensions.length[0] !== undefined ? data.dimensions.length[0] : ''}
                                                                                            onChange={(e) => {
                                                                                                let value = e.target.value;

                                                                                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                                                                    if (value !== '') {
                                                                                                        updateCombinationData(
                                                                                                            variantId,
                                                                                                            'dimensions.length',
                                                                                                            [parseFloat(value)]
                                                                                                        )
                                                                                                    }
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                        <span className="text-gray-600 whitespace-nowrap">cm</span>

                                                                                        <span className="text-gray-600 mx-1">×</span>

                                                                                        <input
                                                                                            type="text"
                                                                                            className="border rounded p-2 w-16 bg-white text-black"
                                                                                            placeholder="D"
                                                                                            value={data.dimensions.width[0] !== undefined ? data.dimensions.width[0] : ''}
                                                                                            onChange={(e) => {
                                                                                                let value = e.target.value;

                                                                                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                                                                    if (value !== '') {
                                                                                                        updateCombinationData(
                                                                                                            variantId,
                                                                                                            'dimensions.width',
                                                                                                            [parseFloat(value)]
                                                                                                        )
                                                                                                    }
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                        <span className="text-gray-600 whitespace-nowrap">cm</span>

                                                                                        <span className="text-gray-600 mx-1">×</span>

                                                                                        <input
                                                                                            type="text"
                                                                                            className="border rounded p-2 w-16 bg-white text-black"
                                                                                            placeholder="C"
                                                                                            value={data.dimensions.height[0] !== undefined ? data.dimensions.height[0] : ''}
                                                                                            onChange={(e) => {
                                                                                                let value = e.target.value;

                                                                                                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                                                                    if (value !== '') {
                                                                                                        updateCombinationData(
                                                                                                            variantId,
                                                                                                            'dimensions.height',
                                                                                                            [parseFloat(value)]
                                                                                                        )
                                                                                                    }
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                        <span className="text-gray-600 whitespace-nowrap">cm</span>
                                                                                    </div>
                                                                                </td>
                                                                            </>
                                                                        )}
                                                                    </tr>
                                                                );
                                                            });
                                                        });

                                                        return rows;
                                                    })()}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border rounded p-8 text-center text-gray-500 mt-16">
                                        Thêm các tùy chọn vào phân loại để hiển thị bảng phân loại hàng
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Shipping Section */}
                        <div id="shipping" className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Vận chuyển</h2>

                            <div className="space-y-4">
                                {/* Toggle switch */}
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700">Thiết lập cân nặng & kích thước cho từng phân loại</span>
                                    <button
                                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${useCustomSettings ? 'bg-green-500' : 'bg-gray-300'}`}
                                        onClick={() => handleChangeOptions()}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${useCustomSettings ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>

                                {/* Inputs - only show when toggle is OFF */}
                                {!useCustomSettings && (
                                    <>
                                        {/* Cân nặng */}
                                        <div className="flex items-center">
                                            <div className="w-1/3 flex items-center">
                                                <span className="text-red-500 mr-1">*</span>
                                                <span className="text-gray-700">Cân nặng (Sau khi đóng gói)</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center">
                                                    <input
                                                        type="text"
                                                        name="product-weight"
                                                        className={`border rounded p-2 w-32 bg-white text-black ${showError ? 'border-red-500' : 'border-gray-300'}`}
                                                        placeholder="Nhập vào"
                                                        value={inputValue}
                                                        onChange={handleInputChangeWeight}
                                                    />
                                                    <span className="ml-2 text-gray-600">gr</span>
                                                </div>
                                                {showError && <span className="text-red-500 text-sm mt-1">Không được để trống ô</span>}
                                            </div>
                                        </div>

                                        {/* Kích thước đóng gói */}
                                        <div className="flex items-start">
                                            <div className="w-1/3">
                                                <span className="text-gray-700">Kích thước đóng gói (Phí vận chuyển thực tế sẽ thay đổi nếu bạn nhập sai kích thước)</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    className="border rounded p-2 w-20 bg-white text-black"
                                                    placeholder="R"
                                                    onChange={(e) => {
                                                        updateAllOptions({ field: 'dimensions.length', value: [parseFloat(e.target.value) || 0] });
                                                    }}
                                                />
                                                <span className="text-gray-600">cm</span>

                                                <span className="text-gray-600 mx-1">×</span>

                                                <input
                                                    type="text"
                                                    className="border rounded p-2 w-20 bg-white text-black"
                                                    placeholder="D"
                                                    onChange={(e) => {
                                                        updateAllOptions({ field: 'dimensions.width', value: [parseFloat(e.target.value) || 0] });
                                                    }}
                                                />
                                                <span className="text-gray-600">cm</span>

                                                <span className="text-gray-600 mx-1">×</span>

                                                <input
                                                    type="text"
                                                    className="border rounded p-2 w-20 bg-white text-black"
                                                    placeholder="C"
                                                    onChange={(e) => {
                                                        updateAllOptions({ field: 'dimensions.height', value: [parseFloat(e.target.value) || 0] });
                                                    }}
                                                />
                                                <span className="text-gray-600">cm</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Other Information Section */}
                        <div id="other" ref={otherRef} className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Thông tin khác</h2>
                            <div className="p-4 bg-gray-50 rounded">
                                <p className="text-gray-500">Có thể điều chỉnh sau khi chọn ngành hàng</p>
                            </div>
                        </div>

                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 p-6 bg-white border-t shadow-lg">
                        <button className="px-4 py-2 border border-black rounded text-black bg-white" onClick={handleCancelClick}>Hủy</button>
                        <button
                            type="button"
                            name="save-new-product"
                            className="px-4 py-2 border border-black bg-orange-500 text-white rounded"
                            onClick={sendProduct}
                        >
                            Lưu
                        </button>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white p-8 w-96 rounded shadow-lg text-black">
                        <h2 className="text-lg font-semibold mb-4">Xác nhận</h2>
                        <p>Hủy thay đổi?</p>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button className="px-4 py-2 border border-black rounded text-black bg-white" onClick={handleCloseModal}>Hủy</button>
                            <button className="px-4 py-2 border border-black bg-orange-500 text-white rounded" onClick={handleConfirmClick}>Đồng ý</button>
                        </div>
                    </div>
                </div>
            )}
            <CategorySelectorModal
                open={isCategoryModalOpen}
                onOpenChange={setIsCategoryModalOpen}
                onConfirm={handleConfirm}
                categories={selectedCategory ? [selectedCategory as CategoryWithChildren] : []}
            />
        </div>
    );
};

export default AddProduct;
