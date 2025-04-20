import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";

// Define type interfaces
interface Dimension {
    weight: string;
    length: string;
    width: string;
    height: string;
}

interface ProductDetail {
    type_id: number;
    type_1: string;
    type_2: string;
    price: number;
    quantity: number;
    dimension: Dimension;
    image?: string;
}

interface Product {
    productID: number;
    name: string;
    details: ProductDetail[];
}

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    productName: string | null;
    productId: number | null;
    variantId: number | null;
    products: Product[];
    onSave: (productName: string | null, productId: number, variantId: number, data: Partial<ProductDetail>) => void;
}

interface FormData {
    type_1: string;
    type_2: string;
    image: string;
    price: number;
    quantity: number;
    dimension: Dimension;
    [key: string]: any; // Add index signature
}

const EditProductVariantModal = ({ isOpen, onClose, productName, productId, variantId, products, onSave }: EditModalProps) => {
    const [formData, setFormData] = useState<FormData>({
        type_1: '',
        type_2: '',
        image: '',
        price: 0,
        quantity: 0,
        dimension: {
            weight: '0',
            length: '0',
            width: '0',
            height: '0'
        }
    });

    interface ImageChangeEvent extends React.ChangeEvent<HTMLInputElement> {
        target: HTMLInputElement & { files: FileList | null };
    }

    const handleImageChange = async (event: ImageChangeEvent): Promise<{ success: boolean, imageUrl?: string }> => {
        const file = event.target.files ? event.target.files[0] : null;
        if (!file) {
            return { success: false };
        }

        try {
            // Tạo FormData cho việc tải lên
            const uploadFormData = new FormData();
            uploadFormData.append("file", file);

            // Hiển thị hình ảnh tạm thời bằng FileReader để người dùng thấy ngay lập tức
            const localImageUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });

            // Cập nhật UI với hình ảnh cục bộ trước
            setFormData(prev => ({ ...prev, image: localImageUrl }));

            // Tải lên hình ảnh lên server
            const response = await axios.post(
                `${import.meta.env.VITE_PRODUCT_SERVICE_URL}/product/uploadIMG`,
                uploadFormData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            // Lấy URL hình ảnh từ phản hồi
            const imageUrl = response.data.url;
            console.log("Image URL:", imageUrl);

            // Cập nhật formData với URL hình ảnh từ server
            setFormData(prevFormData => ({ ...prevFormData, image: imageUrl }));

            // Trả về kết quả thành công với URL hình ảnh
            return { success: true, imageUrl };
        } catch (error) {
            console.error("Error uploading image:", error);
            return { success: false };
        }
    };

    useEffect(() => {
        if (isOpen && productId && variantId) {
            const product = products.find(p => p.productID === productId);
            if (product) {
                const detail = product.details.find(d => d.type_id === variantId);
                if (detail) {
                    setFormData({
                        type_1: detail.type_1 || '',
                        type_2: detail.type_2 || '',
                        image: detail.image || '',
                        price: detail.price || 0,
                        quantity: detail.quantity || 0,
                        dimension: {
                            weight: detail.dimension?.weight || '0',
                            length: detail.dimension?.length || '0',
                            width: detail.dimension?.width || '0',
                            height: detail.dimension?.height || '0'
                        }
                    });
                }
            }
        }
    }, [isOpen, productId, variantId, products]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData((prevFormData) => ({
                ...prevFormData,
                [parent]: {
                    ...prevFormData[parent],
                    [child]: value,
                },
            }));
        } else {
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: name === 'price' || name === 'quantity' ? Number(value) : value,
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (productId && variantId) {
            onSave(productName, productId, variantId, formData);
        }
        onClose();
        toast.success("Sửa sản phẩm thành công!", {
            autoClose: 2000 // 2 seconds delay before auto-closing
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" >
            <div className="bg-white rounded-lg w-full max-w-lg mx-2" >
                <div className="flex justify-between items-center p-1 border-b" >
                    <h3 className="text-lg font-medium text-black" > Thông tin chi tiết</h3>
                    < button onClick={onClose} className="text-gray-500 hover:text-gray-700 bg-white" >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" >
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-1 bg-white text-black">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                        <div className="p-2 bg-gray-100 rounded">{productName}</div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                        <input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                                try {
                                    // Kiểm tra kích thước tệp
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    // Giới hạn kích thước tệp (1MB = 1048576 bytes)
                                    if (file.size > 1048576) {
                                        alert("Kích thước hình ảnh quá lớn. Vui lòng chọn hình có kích thước dưới 1MB.");
                                        e.target.value = "";
                                        return;
                                    }

                                    // Lưu trữ URL hình ảnh cũ để xóa sau này
                                    const oldImageUrl = formData.image;

                                    // Xử lý tải lên hình ảnh mới trước
                                    const result = await handleImageChange(e);

                                    // Chỉ xóa hình ảnh cũ nếu tải lên thành công
                                    if (result.success && oldImageUrl) {
                                        // Cập nhật formData với URL hình ảnh mới trước (để tránh mất tham chiếu)
                                        setFormData(prev => ({ ...prev, image: result.imageUrl || '' }));

                                        // Bỏ qua bước xóa hình ảnh cũ nếu đường dẫn không hợp lệ
                                        if (!oldImageUrl.includes('/')) {
                                            console.warn("Đường dẫn hình ảnh cũ không hợp lệ:", oldImageUrl);
                                            return;
                                        }

                                        try {
                                            await axios.delete(`${import.meta.env.VITE_PRODUCT_SERVICE_URL}/product/deleteIMG`, { data: { url: oldImageUrl } });
                                        } catch (deleteError) {
                                            // Ghi lại lỗi nhưng không cản trở người dùng
                                            console.warn("Không thể xóa hình ảnh cũ, nhưng không ảnh hưởng đến tải lên mới:", deleteError);
                                        }
                                    }
                                } catch (error) {
                                    console.error("Lỗi khi xử lý thay đổi hoặc xóa hình ảnh:", error);
                                    alert("Có lỗi xảy ra khi xử lý hình ảnh. Vui lòng thử lại.");
                                }
                            }}
                            className="hidden"
                        />
                        <div
                            onClick={() => document.getElementById('image')?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-md p-2 w-32 h-32 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                        >
                            {formData.image ? (
                                <div className="relative w-full h-full">
                                    <img
                                        src={formData.image}
                                        alt="Product"
                                        className="w-full h-full object-cover rounded"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                        <span>Thay đổi</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="flex justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1">Tải lên</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="type_1" className="block text-sm font-medium text-gray-700 mb-1">Type 1</label>
                            <input
                                id="type_1"
                                name="type_1"
                                type="text"
                                value={formData.type_1}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded p-2 bg-white text-black"
                            />
                        </div>
                        <div>
                            <label htmlFor="type_2" className="block text-sm font-medium text-gray-700 mb-1">Type 2</label>
                            <input
                                id="type_2"
                                name="type_2"
                                type="text"
                                value={formData.type_2}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded p-2 bg-white text-black"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                            <input
                                id="price"
                                name="price"
                                type="number"
                                min="0"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded p-2 bg-white text-black"
                            />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                                id="quantity"
                                name="quantity"
                                type="number"
                                min="0"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded p-2 bg-white text-black"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2">Dimension</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="dimension.weight" className="block text-sm text-gray-700 mb-1">Weight</label>
                                <input
                                    id="dimension.weight"
                                    name="dimension.weight"
                                    type="text"
                                    value={formData.dimension.weight}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded p-2 bg-white text-black"
                                />
                            </div>
                            <div>
                                <label htmlFor="dimension.length" className="block text-sm text-gray-700 mb-1">Length</label>
                                <input
                                    id="dimension.length"
                                    name="dimension.length"
                                    type="text"
                                    value={formData.dimension.length}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded p-2 bg-white text-black"
                                />
                            </div>
                            <div>
                                <label htmlFor="dimension.width" className="block text-sm text-gray-700 mb-1">Width</label>
                                <input
                                    id="dimension.width"
                                    name="dimension.width"
                                    type="text"
                                    value={formData.dimension.width}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded p-2 bg-white text-black"
                                />
                            </div>
                            <div>
                                <label htmlFor="dimension.height" className="block text-sm text-gray-700 mb-1">Height</label>
                                <input
                                    id="dimension.height"
                                    name="dimension.height"
                                    type="text"
                                    value={formData.dimension.height}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded p-2 bg-white text-black"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductVariantModal;