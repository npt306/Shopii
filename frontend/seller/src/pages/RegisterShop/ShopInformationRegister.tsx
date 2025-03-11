import React, { useState } from "react";

interface ShopInformationFormProps {
    onNextStep: () => void;
}

interface AddressData {
    fullName: string;
    phone: string;
    province: string;   // Tỉnh/Thành phố
    district: string;   // Quận/Huyện
    ward: string;       // Phường/Xã
    addressDetail: string;
}

// Hardcoded address data
const ADDRESS_DATA: { [key: string]: { [key: string]: string[] } } = {
    "Hà Nội": {
        "Quận Ba Đình": ["Phường Phúc Xá", "Phường Trúc Bạch", "Phường Cống Vị", "Phường Liễu Giai", "Phường Nguyễn Trung Trực", "Phường Quán Thánh", "Phường Điện Biên", "Phường Đội Cấn"],
        "Quận Hoàn Kiếm": ["Phường Hàng Bạc", "Phường Lý Thái Tổ", "Phường Phan Chu Trinh", "Phường Hàng Buồm", "Phường Đồng Xuân", "Phường Hàng Bồ", "Phường Hàng Đào", "Phường Hàng Gai"],
        "Quận Tây Hồ": ["Phường Bưởi", "Phường Nhật Tân", "Phường Tứ Liên", "Phường Quảng An", "Phường Xuân La", "Phường Yên Phụ"],
        "Quận Long Biên": ["Phường Bồ Đề", "Phường Cự Khối", "Phường Đức Giang", "Phường Gia Thụy", "Phường Ngọc Lâm", "Phường Ngọc Thụy"],
        "Quận Cầu Giấy": ["Phường Dịch Vọng", "Phường Dịch Vọng Hậu", "Phường Mai Dịch", "Phường Nghĩa Đô", "Phường Nghĩa Tân", "Phường Quan Hoa", "Phường Trung Hòa", "Phường Yên Hòa"]
    },
    "TP Hồ Chí Minh": {
        "Quận 1": ["Phường Bến Nghé", "Phường Bến Thành", "Phường Nguyễn Thái Bình", "Phường Cầu Kho", "Phường Cầu Ông Lãnh", "Phường Cô Giang", "Phường Đa Kao", "Phường Nguyễn Cư Trinh", "Phường Phạm Ngũ Lão", "Phường Tân Định"],
        "Quận 3": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"],
        "Quận 5": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"],
        "Quận 7": ["Phường Tân Thuận Đông", "Phường Tân Thuận Tây", "Phường Tân Kiểng", "Phường Tân Hưng", "Phường Bình Thuận", "Phường Tân Quy", "Phường Phú Thuận", "Phường Tân Phú", "Phường Tân Phong", "Phường Phú Mỹ"],
        "Quận Bình Thạnh": ["Phường 1", "Phường 2", "Phường 3", "Phường 5", "Phường 7", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 17", "Phường 19", "Phường 21", "Phường 22", "Phường 24", "Phường 25", "Phường 26", "Phường 27", "Phường 28"]
    },
    "Đà Nẵng": {
        "Quận Hải Châu": ["Phường Thạch Thang", "Phường Hải Châu 1", "Phường Hải Châu 2", "Phường Bình Hiên", "Phường Bình Thuận", "Phường Hòa Cường Bắc", "Phường Hòa Cường Nam", "Phường Hòa Thuận Đông", "Phường Hòa Thuận Tây", "Phường Nam Dương", "Phường Phước Ninh", "Phường Thanh Bình", "Phường Thuận Phước"],
        "Quận Thanh Khê": ["Phường Tân Chính", "Phường Vĩnh Trung", "Phường Thạc Gián", "Phường An Khê", "Phường Chính Gián", "Phường Hòa Khê", "Phường Tam Thuận", "Phường Thanh Khê Đông", "Phường Thanh Khê Tây", "Phường Xuân Hà"],
        "Quận Sơn Trà": ["Phường An Hải Bắc", "Phường An Hải Đông", "Phường An Hải Tây", "Phường Mân Thái", "Phường Nại Hiên Đông", "Phường Phước Mỹ", "Phường Thọ Quang"],
        "Quận Ngũ Hành Sơn": ["Phường Hòa Hải", "Phường Hòa Quý", "Phường Khuê Mỹ", "Phường Mỹ An"]
    },
    "Hải Phòng": {
        "Quận Hồng Bàng": ["Phường Hoàng Văn Thụ", "Phường Minh Khai", "Phường Quán Toan", "Phường Sở Dầu", "Phường Thượng Lý", "Phường Trại Chuối"],
        "Quận Ngô Quyền": ["Phường Cầu Đất", "Phường Cầu Tre", "Phường Đằng Giang", "Phường Đông Khê", "Phường Lạc Viên", "Phường Lê Lợi", "Phường Máy Chai", "Phường Máy Tơ"],
        "Quận Lê Chân": ["Phường An Biên", "Phường An Dương", "Phường Cát Dài", "Phường Đông Hải", "Phường Dư Hàng", "Phường Hàng Kênh", "Phường Lam Sơn", "Phường Nghĩa Xá"]
    },
    "Cần Thơ": {
        "Quận Ninh Kiều": ["Phường An Cư", "Phường An Hòa", "Phường An Khánh", "Phường An Nghiệp", "Phường An Phú", "Phường Cái Khế", "Phường Hưng Lợi", "Phường Tân An", "Phường Thới Bình", "Phường Xuân Khánh"],
        "Quận Ô Môn": ["Phường Châu Văn Liêm", "Phường Long Hưng", "Phường Phước Thới", "Phường Thới An", "Phường Thới Hòa", "Phường Thới Long", "Phường Trường Lạc"],
        "Quận Bình Thủy": ["Phường An Thới", "Phường Bình Thủy", "Phường Bùi Hữu Nghĩa", "Phường Long Hòa", "Phường Long Tuyền", "Phường Thới An Đông", "Phường Trà An", "Phường Trà Nóc"]
    },
    "Nha Trang": {
        "Thành phố Nha Trang": ["Phường Lộc Thọ", "Phường Ngọc Hiệp", "Phường Phước Hải", "Phường Phước Hòa", "Phường Phước Long", "Phường Phước Tân", "Phường Phước Tiến", "Phường Phương Sài", "Phường Phương Sơn", "Phường Tân Lập", "Phường Vạn Thắng", "Phường Vạn Thạnh", "Phường Vĩnh Hải", "Phường Vĩnh Hòa", "Phường Vĩnh Nguyên", "Phường Vĩnh Phước", "Phường Vĩnh Thọ", "Phường Xương Huân"]
    },
    "Huế": {
        "Thành phố Huế": ["Phường An Cựu", "Phường An Đông", "Phường An Hòa", "Phường An Tây", "Phường Hương Long", "Phường Hương Sơ", "Phường Kim Long", "Phường Phú Bình", "Phường Phú Cát", "Phường Phú Hậu", "Phường Phú Hiệp", "Phường Phú Hội", "Phường Phú Nhuận", "Phường Phước Vĩnh", "Phường Phường Đúc", "Phường Tây Lộc", "Phường Thuận Hòa", "Phường Thuận Lộc", "Phường Thuận Thành", "Phường Trường An", "Phường Vĩnh Ninh", "Phường Xuân Phú"]
    },
    "Đà Lạt": {
        "Thành phố Đà Lạt": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12"]
    }
};

const ShopInformationForm: React.FC<ShopInformationFormProps> = ({ onNextStep }) => {
    // Main form state
    const [formData, setFormData] = useState({
        shopName: '',
        email: '',
        phone: '••••••••••'
    });

    // State for controlling the Address Modal
    const [showAddressModal, setShowAddressModal] = useState(false);

    // State for new address inputs (in the modal)
    const [newAddress, setNewAddress] = useState<AddressData>({
        fullName: '',
        phone: '',
        province: '',
        district: '',
        ward: '',
        addressDetail: ''
    });

    // State to store the saved address from the modal
    const [savedAddress, setSavedAddress] = useState<AddressData | null>(null);

    // Handle main form changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Submit main form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData, { savedAddress });
        onNextStep();
    };

    // Open the "Add Address" modal
    const addAddress = () => {
        setShowAddressModal(true);
    };

    // Handle changes in the address modal form
    const handleAddressChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setNewAddress(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Close the modal without saving
    const handleModalCancel = () => {
        setShowAddressModal(false);
        // Optionally reset the new address inputs
        setNewAddress({
            fullName: '',
            phone: '',
            province: '',
            district: '',
            ward: '',
            addressDetail: ''
        });
    };

    // Save the address and close the modal
    const handleModalSave = () => {
        console.log('New address:', newAddress);
        setSavedAddress(newAddress);
        setShowAddressModal(false);
        // Reset newAddress if desired:
        setNewAddress({
            fullName: '',
            phone: '',
            province: '',
            district: '',
            ward: '',
            addressDetail: ''
        });
    };

    return (
        <div className="relative">
            <form onSubmit={handleSubmit} className="space-y-6 px-4 sm:px-6 mt-8">
                {/* Shop Name */}
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <label
                        htmlFor="shopName"
                        className="text-sm font-medium text-gray-700 sm:w-48 mb-1 sm:mb-0"
                    >
                        <span className="text-red-500 mr-1">*</span>
                        Tên Shop
                    </label>
                    <div className="relative flex-1">
                        <input
                            type="text"
                            id="shopName"
                            name="shopName"
                            value={formData.shopName}
                            onChange={(e) => {
                                if (e.target.value.length <= 30) {
                                    handleChange(e);
                                }
                            }}
                            placeholder="Nhập tên shop"
                            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="absolute right-3 top-2 text-gray-400 text-sm">
                            {formData.shopName.length}/30
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="flex flex-col sm:flex-row sm:items-start">
                    <label
                        htmlFor="address"
                        className="text-sm font-medium text-gray-700 sm:w-48 mb-1 sm:mb-0 mt-1"
                    >
                        <span className="text-red-500 mr-1">*</span>
                        Địa chỉ lấy hàng
                    </label>
                    <div className="flex-1">
                        {savedAddress ? (
                            // Render saved address information
                            <div className="p-4 border border-gray-300 rounded-md shadow-sm bg-white">
                                <p className="font-medium text-gray-800">{savedAddress.fullName}</p>
                                <p className="text-gray-600">{savedAddress.phone}</p>
                                <p className="text-gray-600">
                                    {savedAddress.ward}, {savedAddress.district}, {savedAddress.province}, {savedAddress.addressDetail}
                                </p>
                                <button
                                    type="button"
                                    onClick={addAddress}
                                    className="bg-gray-300 mt-2 text-sm text-blue-600 hover:underline"
                                >
                                    Sửa
                                </button>
                            </div>
                        ) : (
                            // Render button if no address has been saved yet
                            <button
                                type="button"
                                onClick={addAddress}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <span className="text-gray-500 mr-1">+</span> Thêm
                            </button>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700 sm:w-48 mb-1 sm:mb-0"
                    >
                        <span className="text-red-500 mr-1">*</span>
                        Email
                    </label>
                    <div className="flex-1">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Nhập vào"
                            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col sm:flex-row sm:items-center">
                    <label
                        htmlFor="phone"
                        className="text-sm font-medium text-gray-700 sm:w-48 mb-1 sm:mb-0"
                    >
                        <span className="text-red-500 mr-1">*</span>
                        Số điện thoại
                    </label>
                    <div className="flex-1">
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-400 bg-gray-100"
                            readOnly
                        />
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-8">
                    <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Lưu
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Tiếp theo
                    </button>
                </div>
            </form>

            {/* Address Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                        <h2 className="text-lg font-semibold mb-4">Thêm Địa Chỉ Mới</h2>

                        {/* Full Name */}
                        <div className="mb-4">
                            <label
                                htmlFor="fullName"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Họ & Tên
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={newAddress.fullName}
                                onChange={handleAddressChange}
                                placeholder="Nhập vào"
                                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Phone */}
                        <div className="mb-4">
                            <label
                                htmlFor="phone"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Số điện thoại
                            </label>
                            <input
                                type="text"
                                id="phone"
                                name="phone"
                                value={newAddress.phone}
                                onChange={handleAddressChange}
                                placeholder="Nhập vào"
                                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Province - District - Ward */}
                        <div className="mb-4">
                            <label
                                htmlFor="province"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Tỉnh/Thành phố
                            </label>
                            <select
                                id="province"
                                name="province"
                                value={newAddress.province}
                                onChange={(e) => {
                                    // Reset district, ward
                                    setNewAddress((prev) => ({
                                        ...prev,
                                        province: e.target.value,
                                        district: '',
                                        ward: '',
                                    }));
                                }}
                                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Chọn</option>
                                {Object.keys(ADDRESS_DATA).map((prov) => (
                                    <option key={prov} value={prov}>
                                        {prov}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {newAddress.province && (
                            <div className="mb-4">
                                <label
                                    htmlFor="district"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Quận/Huyện
                                </label>
                                <select
                                    id="district"
                                    name="district"
                                    value={newAddress.district}
                                    onChange={(e) => {
                                        // Reset ward
                                        setNewAddress((prev) => ({
                                            ...prev,
                                            district: e.target.value,
                                            ward: '',
                                        }));
                                    }}
                                    className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Chọn Quận/Huyện</option>
                                    {Object.keys(ADDRESS_DATA[newAddress.province]).map((dist) => (
                                        <option key={dist} value={dist}>
                                            {dist}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {newAddress.district && (
                            <div className="mb-4">
                                <label
                                    htmlFor="ward"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Phường/Xã
                                </label>
                                <select
                                    id="ward"
                                    name="ward"
                                    value={newAddress.ward}
                                    onChange={handleAddressChange}
                                    className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Chọn Phường/Xã</option>
                                    {ADDRESS_DATA[newAddress.province][newAddress.district].map((w) => (
                                        <option key={w} value={w}>
                                            {w}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Detailed Address */}
                        <div className="mb-4">
                            <label
                                htmlFor="addressDetail"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Địa chỉ chi tiết
                            </label>
                            <input
                                type="text"
                                id="addressDetail"
                                name="addressDetail"
                                value={newAddress.addressDetail}
                                onChange={handleAddressChange}
                                placeholder="Số nhà, tên đường, v.v."
                                className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Modal Actions */}
                        <div className="flex justify-end mt-6 space-x-3">
                            <button
                                type="button"
                                onClick={handleModalCancel}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleModalSave}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopInformationForm;
