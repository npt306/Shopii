import { useState, useEffect } from "react";
import Select from "react-select"; // Import react-select

export default function AddressDialog({
  isOpen,
  onClose,
  onSave,
  address,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => void;
  address: any | null; // Pass the selected address for editing
}) {
  const [formData, setFormData] = useState({
    FullName: "",
    PhoneNumber: "",
    Province: "",
    District: "",
    Ward: "",
    SpecificAddress: "",
    isDefault: false,
    isShipping: false,
    isDelivery: false,
  });

  const [errors, setErrors] = useState({
    FullName: "",
    PhoneNumber: "",
    Province: "",
    District: "",
    Ward: "",
    SpecificAddress: "",
  });

  const [provinceOptions, setProvinceOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);

  // Populate form data when editing an address
  useEffect(() => {
    if (address) {
      setFormData({
        FullName: address.FullName || "",
        PhoneNumber: address.PhoneNumber || "",
        Province: address.Province || "",
        District: address.District || "",
        Ward: address.Ward || "",
        SpecificAddress: address.SpecificAddress || "",
        isDefault: address.isDefault || false,
        isShipping: address.isShipping || false,
        isDelivery: address.isDelivery || false,
      });
    } else {
      // Reset form for adding a new address
      setFormData({
        FullName: "",
        PhoneNumber: "",
        Province: "",
        District: "",
        Ward: "",
        SpecificAddress: "",
        isDefault: false,
        isShipping: false,
        isDelivery: false,
      });
    }
  }, [address]);

  // Fetch provinces dynamically
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch(
          "https://open.oapi.vn/location/provinces?page=0&size=64"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch provinces");
        }
        const data = await response.json();
        const formattedProvinces = data.data.map((province: any) => ({
          id: province.id,
          value: province.name,
          label: province.name,
        }));
        setProvinceOptions(formattedProvinces);
      } catch (err: any) {
        setErrors((prev) => ({
          ...prev,
          Province: err.message || "Error fetching provinces",
        }));
      }
    };
    fetchProvinces();
  }, []);

  const handleSelectChange = (selectedOption: any, field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: selectedOption?.label || "",
      ...(field === "Province" && { District: "", Ward: "" }), // Reset District and Ward when Province changes
      ...(field === "District" && { Ward: "" }), // Reset Ward when District changes
    }));

    if (field === "Province") {
      setDistrictOptions([]);
      setWardOptions([]);
      fetchDistricts(selectedOption?.id); // Fetch districts for the selected province
    }

    if (field === "District") {
      fetchWards(selectedOption?.id); // Fetch wards for the selected district
    }
  };

  const fetchDistricts = async (provinceId: string) => {
    try {
      const response = await fetch(
        `https://open.oapi.vn/location/districts/${provinceId}?page=0&size=100`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch districts");
      }
      const data = await response.json();
      const formattedDistricts = data.data.map((district: any) => ({
        id: district.id,
        value: district.name,
        label: district.name,
      }));
      setDistrictOptions(formattedDistricts);
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        District: err.message || "Error fetching districts",
      }));
    }
  };

  const fetchWards = async (districtId: string) => {
    try {
      const response = await fetch(
        `https://open.oapi.vn/location/wards/${districtId}?page=0&size=100`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch wards");
      }
      const data = await response.json();
      const formattedWards = data.data.map((ward: any) => ({
        id: ward.id,
        value: ward.name,
        label: ward.name,
      }));
      setWardOptions(formattedWards);
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        Ward: err.message || "Error fetching wards",
      }));
    }
  };

  const handleSubmit = () => {
    const newErrors = {
      FullName: !formData.FullName ? "Họ & Tên là bắt buộc" : "",
      PhoneNumber: !formData.PhoneNumber ? "Số điện thoại là bắt buộc" : "",
      Province: !formData.Province ? "Tỉnh/Thành phố là bắt buộc" : "",
      District: !formData.District ? "Quận/Huyện là bắt buộc" : "",
      Ward: !formData.Ward ? "Phường/Xã là bắt buộc" : "",
      SpecificAddress: !formData.SpecificAddress
        ? "Chi tiết địa chỉ là bắt buộc"
        : "",
    };

    setErrors(newErrors);

    if (Object.values(newErrors).every((error) => !error)) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 ${
        isOpen ? "" : "hidden"
      }`}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold">
            {address ? "Cập Nhật Địa Chỉ" : "Thêm Địa Chỉ Mới"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 bg-white">
            ✖
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <input
            type="text"
            name="FullName"
            value={formData.FullName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, FullName: e.target.value }))
            }
            placeholder="Họ & Tên"
            className="w-full p-2 border rounded text-black bg-white"
          />
          {errors.FullName && (
            <p className="text-red-500 text-sm">{errors.FullName}</p>
          )}
          <input
            type="text"
            name="PhoneNumber"
            value={formData.PhoneNumber}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, PhoneNumber: e.target.value }))
            }
            placeholder="Số điện thoại"
            className="w-full p-2 border rounded text-black bg-white"
          />
          {errors.PhoneNumber && (
            <p className="text-red-500 text-sm">{errors.PhoneNumber}</p>
          )}
          <Select
            options={provinceOptions}
            onChange={(selectedOption) =>
              handleSelectChange(selectedOption, "Province")
            }
            placeholder="Chọn Tỉnh/Thành Phố"
            className="mt-1"
          />
          {errors.Province && (
            <p className="text-red-500 text-sm">{errors.Province}</p>
          )}
          <Select
            options={districtOptions}
            onChange={(selectedOption) =>
              handleSelectChange(selectedOption, "District")
            }
            placeholder="Chọn Quận/Huyện"
            className="mt-1"
            isDisabled={!formData.Province}
          />
          {errors.District && (
            <p className="text-red-500 text-sm">{errors.District}</p>
          )}
          <Select
            options={wardOptions}
            onChange={(selectedOption) =>
              handleSelectChange(selectedOption, "Ward")
            }
            placeholder="Chọn Phường/Xã"
            className="mt-1"
            isDisabled={!formData.District}
          />
          {errors.Ward && <p className="text-red-500 text-sm">{errors.Ward}</p>}
          <textarea
            name="SpecificAddress"
            value={formData.SpecificAddress}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                SpecificAddress: e.target.value,
              }))
            }
            placeholder="Số nhà, tên đường v.v.."
            className="w-full p-2 border rounded text-black bg-white"
          ></textarea>
          {errors.SpecificAddress && (
            <p className="text-red-500 text-sm">{errors.SpecificAddress}</p>
          )}
          <div className="space-y-2 bg-white">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isDefault: e.target.checked,
                  }))
                }
              />
              <span>Đặt làm địa chỉ mặc định</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isShipping"
                checked={formData.isShipping}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isShipping: e.target.checked,
                  }))
                }
              />
              <span>Đặt làm địa chỉ giao hàng</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isDelivery"
                checked={formData.isDelivery}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isDelivery: e.target.checked,
                  }))
                }
              />
              <span>Đặt làm địa chỉ nhận hàng</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-4 text-sm">
          <button
            onClick={onClose}
            className="border px-3 py-1 rounded bg-white border border-gray-300"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}