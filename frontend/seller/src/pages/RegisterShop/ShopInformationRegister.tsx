import React, { useState } from "react";

interface AddressData {
  fullName: string;
  phone: string;
  province: string; // Tỉnh/Thành phố
  district: string; // Quận/Huyện
  ward: string;     // Phường/Xã
  addressDetail: string;
}

interface ShopInformationFormProps {
  onNextStep: (data: {
    shopName: string;
    email: string;
    phone: string;
    address?: AddressData;
  }) => void;
  initialData?: {
    shopName: string;
    email: string;
    phone: string;
    address?: AddressData;
  };
}

// Hardcoded address data
const ADDRESS_DATA: { [key: string]: { [key: string]: string[] } } = {
  "Hà Nội": {
    "Quận Ba Đình": [
      "Phường Phúc Xá",
      "Phường Trúc Bạch",
      "Phường Cống Vị",
      "Phường Liễu Giai",
      "Phường Nguyễn Trung Trực",
      "Phường Quán Thánh",
      "Phường Điện Biên",
      "Phường Đội Cấn"
    ],
    "Quận Hoàn Kiếm": [
      "Phường Hàng Bạc",
      "Phường Lý Thái Tổ",
      "Phường Phan Chu Trinh",
      "Phường Hàng Buồm",
      "Phường Đồng Xuân",
      "Phường Hàng Bồ",
      "Phường Hàng Đào",
      "Phường Hàng Gai"
    ],
    // ...other districts in Hà Nội
  },
  "TP Hồ Chí Minh": {
    "Quận 1": [
      "Phường Bến Nghé",
      "Phường Bến Thành",
      "Phường Nguyễn Thái Bình",
      "Phường Cầu Kho",
      "Phường Cầu Ông Lãnh",
      "Phường Cô Giang",
      "Phường Đa Kao",
      "Phường Nguyễn Cư Trinh",
      "Phường Phạm Ngũ Lão",
      "Phường Tân Định"
    ],
    // ...other districts in TP Hồ Chí Minh
  },
  // ...other cities
};

const ShopInformationForm: React.FC<ShopInformationFormProps> = ({ onNextStep, initialData }) => {
  // Main form state – including shop info and phone
  const [formData, setFormData] = useState({
    shopName: initialData?.shopName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
  });

  // State for controlling the Address Modal
  const [showAddressModal, setShowAddressModal] = useState(false);

  // State for new address inputs (in the modal)
  const [newAddress, setNewAddress] = useState<AddressData>({
    fullName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    addressDetail: ""
  });

  // State to store the saved address from the modal
  const [savedAddress, setSavedAddress] = useState<AddressData | null>(
    initialData?.address || null
  );

  // Handle main form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit main form, sending all data (including saved address if exists)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNextStep({ ...formData, address: savedAddress || undefined });
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
    setNewAddress((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Close the modal without saving
  const handleModalCancel = () => {
    setShowAddressModal(false);
    // Optionally reset the new address inputs
    setNewAddress({
      fullName: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      addressDetail: ""
    });
  };

  // Save the address and close the modal
  const handleModalSave = () => {
    console.log("New address:", newAddress);
    setSavedAddress(newAddress);
    setShowAddressModal(false);
    // Reset newAddress if desired:
    setNewAddress({
      fullName: "",
      phone: "",
      province: "",
      district: "",
      ward: "",
      addressDetail: ""
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
              placeholder="Nhập số điện thoại"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black bg-white"
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
                    district: "",
                    ward: ""
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
                      ward: ""
                    }));
                  }}
                  className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn Quận/Huyện</option>
                  {newAddress.province &&
                    Object.keys(ADDRESS_DATA[newAddress.province]).map((dist) => (
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
                  {newAddress.province &&
                    newAddress.district &&
                    ADDRESS_DATA[newAddress.province][newAddress.district].map((w) => (
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
