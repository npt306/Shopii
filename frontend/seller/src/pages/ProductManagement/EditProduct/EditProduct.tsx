import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";

// Define type interfaces
interface Dimension {
    Weight: number;
    Length: number;
    Width: number;
    Height: number;
}

interface ProductDetail {
    Type_id: number;
    Type_1: string;
    Type_2: string;
    Price: number;
    Quantity: number;
    Dimension: Dimension;
    Image?: string;
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
    Type_1: string;
    Type_2: string;
    Image: string;
    Price: number;
    Quantity: number;
    Dimension: Dimension;
    [key: string]: any; // Add index signature
}

const EditProductVariantModal = ({ isOpen, onClose, productName, productId, variantId, products, onSave }: EditModalProps) => {
    const [formData, setFormData] = useState<FormData>({
        Type_1: '',
        Type_2: '',
        Image: '',
        Price: 0,
        Quantity: 0,
        Dimension: {
            Weight: 0,
            Length: 0,
            Width: 0,
            Height: 0
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
                const detail = product.details.find(d => d.Type_id === variantId);
                if (detail) {
                    setFormData({
                        Type_1: detail.Type_1 || '',
                        Type_2: detail.Type_2 || '',
                        Image: detail.Image || '',
                        Price: detail.Price || 0,
                        Quantity: detail.Quantity || 0,
                        Dimension: {
                            Weight: detail.Dimension?.Weight || 0,
                            Length: detail.Dimension?.Length || 0,
                            Width: detail.Dimension?.Width || 0,
                            Height: detail.Dimension?.Height || 0
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (productId && variantId) {
            try {
                console.log("formData gửi đi:", formData);
                await onSave(productName, productId, variantId, {
                    Type_1: formData.Type_1,
                    Type_2: formData.Type_2,
                    Image: formData.Image,
                    Price: formData.Price,
                    Quantity: formData.Quantity,
                    Dimension: {
                        Weight: formData.Dimension.Weight,
                        Length: formData.Dimension.Length,
                        Width: formData.Dimension.Width,
                        Height: formData.Dimension.Height,
                    },
                });
                toast.success("Sửa sản phẩm thành công!", {
                    autoClose: 2000
                });
            } catch (error) {
                console.error("Lỗi khi lưu:", error);
                toast.error("Sửa sản phẩm thất bại. Vui lòng thử lại!", {
                    autoClose: 2000
                });
                // Không đóng modal để người dùng có thể sửa lại
            }
        } else {
            toast.error("Thiếu thông tin sản phẩm hoặc biến thể!", {
                autoClose: 2000
            });
        }
        onClose();

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
                            <label htmlFor="Type_1" className="block text-sm font-medium text-gray-700 mb-1">Type 1</label>
                            <input
                                id="Type_1"
                                name="Type_1"
                                type="text"
                                value={formData.Type_1}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded p-2 bg-white text-black"
                            />
                        </div>
                        <div>
                            <label htmlFor="Type_2" className="block text-sm font-medium text-gray-700 mb-1">Type 2</label>
                            <input
                                id="Type_2"
                                name="Type_2"
                                type="text"
                                value={formData.Type_2}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded p-2 bg-white text-black"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="Price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                            <input
                                id="Price"
                                name="Price"
                                type="number"
                                min="0"
                                value={formData.Price}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded p-2 bg-white text-black"
                            />
                        </div>
                        <div>
                            <label htmlFor="Quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                                id="Quantity"
                                name="Quantity"
                                type="number"
                                min="0"
                                value={formData.Quantity}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded p-2 bg-white text-black"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2">Dimension</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="Dimension.Weight" className="block text-sm text-gray-700 mb-1">Weight</label>
                                <input
                                    id="Dimension.Weight"
                                    name="Dimension.Weight"
                                    type="text"
                                    value={formData.Dimension.Weight}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded p-2 bg-white text-black"
                                />
                            </div>
                            <div>
                                <label htmlFor="Dimension.Length" className="block text-sm text-gray-700 mb-1">Length</label>
                                <input
                                    id="Dimension.Length"
                                    name="Dimension.Length"
                                    type="text"
                                    value={formData.Dimension.Length}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded p-2 bg-white text-black"
                                />
                            </div>
                            <div>
                                <label htmlFor="Dimension.Width" className="block text-sm text-gray-700 mb-1">Width</label>
                                <input
                                    id="Dimension.Width"
                                    name="Dimension.Width"
                                    type="text"
                                    value={formData.Dimension.Width}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded p-2 bg-white text-black"
                                />
                            </div>
                            <div>
                                <label htmlFor="Dimension.Height" className="block text-sm text-gray-700 mb-1">Height</label>
                                <input
                                    id="Dimension.Height"
                                    name="Dimension.Height"
                                    type="text"
                                    value={formData.Dimension.Height}
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