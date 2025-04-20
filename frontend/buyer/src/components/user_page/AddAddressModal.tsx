import React, { useState, useEffect } from "react";
import Select from "react-select";
import { EnvValue } from "../../env-value/envValue";
import "../../css/user/addresses.css";
interface Address {
  id: number;
  fullName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  specificAddress: string;
  isDefault: boolean;
}

interface AddAddressModalProps {
  accountId: number;
  onClose: () => void;
  onAddressAdded: (newAddress: Address) => void;
  onAddressUpdated: (updatedAddress: Address) => void;
  editAddress: Address | null;
}

export const AddAddressModal = ({
  accountId,
  onClose,
  onAddressAdded,
  onAddressUpdated,
  editAddress,
}: AddAddressModalProps) => {
  const [formData, setFormData] = useState({
    FullName: editAddress?.fullName || "",
    PhoneNumber: editAddress?.phoneNumber || "",
    Province: editAddress?.province || "",
    District: editAddress?.district || "",
    Ward: editAddress?.ward || "",
    SpecificAddress: editAddress?.specificAddress || "",
    isDefault: editAddress?.isDefault || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [provinceOptions, setProvinceOptions] = useState<any[]>([]);
  const [districtOptions, setDistrictOptions] = useState<any[]>([]);
  const [wardOptions, setWardOptions] = useState<any[]>([]);

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      color: "#1f2937", // text-neutral-800
      flex: 1,
      height: "38px",
      width: "100%",
      borderRadius: "0px",
      borderColor: state.isFocused ? "#ee4d2d" : "#d1d5db", // <-- custom orange on focus
      boxShadow: state.isFocused ? "0 0 0 1px #ee4d2d" : "none", // <-- this adds the focus glow
      outline: "none",
      "&:hover": {
        borderColor: "#ee4d2d",
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: "#9ca3af", // gray-400
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#ee4d2d"
        : state.isFocused
        ? "#ee4d2dad"
        : "#fff",
      color: state.isSelected || state.isFocused ? "#fff" : "#1f2937", // text-neutral-800
      cursor: "pointer",
      "&:active": {
        backgroundColor: "#ee4d2d", // <- force orange on click selection too
        color: "#fff",
      },
    }),

    singleValue: (base) => ({
      ...base,
      color: "#1f2937",
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };
  // Fetch provinces dynamically on mount
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
        setError(err.message || "Error fetching provinces");
      }
    };
    fetchProvinces();
  }, []);

  // If editing, after provinces are loaded, fetch districts for the selected province.
  useEffect(() => {
    if (editAddress && formData.Province && provinceOptions.length > 0) {
      const provinceOption = provinceOptions.find(
        (opt) => opt.label === formData.Province
      );
      if (provinceOption) {
        fetchDistricts(provinceOption.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editAddress, formData.Province, provinceOptions]);

  // If editing, after districts are loaded, fetch wards for the selected district.
  useEffect(() => {
    if (editAddress && formData.District && districtOptions.length > 0) {
      const districtOption = districtOptions.find(
        (opt) => opt.label === formData.District
      );
      if (districtOption) {
        fetchWards(districtOption.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editAddress, formData.District, districtOptions]);

  const handleSelectChange = (selectedOption: any, field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: selectedOption?.label || "",
      ...(field === "Province" && { District: "", Ward: "" }),
      ...(field === "District" && { Ward: "" }),
    }));

    if (field === "Province") {
      setDistrictOptions([]);
      setWardOptions([]);
      fetchDistricts(selectedOption?.id);
    }

    if (field === "District") {
      fetchWards(selectedOption?.id);
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
      setError(err.message || "Error fetching districts");
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
      setError(err.message || "Error fetching wards");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (
      !formData.FullName ||
      !formData.PhoneNumber ||
      !formData.Province ||
      !formData.District ||
      !formData.Ward
    ) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const url = editAddress
        ? `${EnvValue.API_GATEWAY_URL}/api/address/update/${editAddress.id}`
        : `${EnvValue.API_GATEWAY_URL}/api/address/account/${accountId}`;
      const method = "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error(
          editAddress ? "Failed to update address" : "Failed to create address"
        );
      }
      const updatedAddress = await response.json();
      if (editAddress) {
        onAddressUpdated(updatedAddress);
      } else {
        onAddressAdded(updatedAddress);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Error creating address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-brightness-50 flex justify-center items-center z-50">
      <div className="bg-white hadow-lg p-6 w-125 max-w-md relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium flex items-center">
            {editAddress ? "Cập nhật Địa Chỉ" : "Thêm Địa Chỉ"}
          </h2>
          <button
            onClick={onClose}
            className=" items-center text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Họ và Tên
              </label>
              <input
                name="FullName"
                value={formData.FullName}
                placeholder="Họ và Tên"
                onChange={(e) =>
                  setFormData({ ...formData, FullName: e.target.value })
                }
                required
                className="text-neutral-800 flex-1 h-9.5 outline-[none] w-full mt-1 block border border-gray-300 p-2.5 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Số Điện Thoại
              </label>
              <input
                name="PhoneNumber"
                value={formData.PhoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, PhoneNumber: e.target.value })
                }
                placeholder="Số Điện Thoại"
                required
                className="text-neutral-800 flex-1 h-9.5 outline-[none] w-full mt-1 block border border-gray-300 p-2.5 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tỉnh/Thành Phố
            </label>
            <Select
              options={provinceOptions}
              onChange={(selectedOption) =>
                handleSelectChange(selectedOption, "Province")
              }
              placeholder="Chọn Tỉnh/Thành Phố"
              className="mt-1"
              value={
                provinceOptions.find(
                  (option) => option.label === formData.Province
                ) || null
              }
              styles={customSelectStyles}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quận/Huyện
            </label>
            <Select
              options={districtOptions}
              onChange={(selectedOption) =>
                handleSelectChange(selectedOption, "District")
              }
              placeholder="Chọn Quận/Huyện"
              className="mt-1"
              isDisabled={!formData.Province}
              value={
                districtOptions.find(
                  (option) => option.label === formData.District
                ) || null
              }
              styles={customSelectStyles}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phường/Xã
            </label>
            <Select
              options={wardOptions}
              onChange={(selectedOption) =>
                handleSelectChange(selectedOption, "Ward")
              }
              placeholder="Chọn Phường/Xã"
              className="mt-1"
              isDisabled={!formData.District}
              value={
                wardOptions.find((option) => option.label === formData.Ward) ||
                null
              }
              styles={customSelectStyles}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Địa Chỉ Cụ Thể
            </label>
            <input
              name="SpecificAddress"
              placeholder="Địa Chỉ Cụ Thể"
              value={formData.SpecificAddress}
              onChange={(e) =>
                setFormData({ ...formData, SpecificAddress: e.target.value })
              }
              required
              className=" text-neutral-800 flex-1 h-9.5 outline-[none] w-full mt-1 block border border-gray-300 p-2.5 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="min-w-35 p-2.5  items-center text-gray-500 hover:text-gray-700"
            >
              Trở lại
            </button>
            <button
              type="submit"
              disabled={loading}
              className="min-w-35 p-2.5 bg-orange-600 !text-white py-2 hover:bg-orange-500 disabled:bg-gray-300"
            >
              {loading ? "Đang lưu..." : "Hoàn thành"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
