import { useState, useEffect } from "react";
import Select from "react-select"; // Import react-select
import { EnvValue } from "../../../../env-value/envValue";
interface Address {
  id: number;
  fullName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  specificAddress: string;
  isDefault: boolean;
  isShipping: boolean;
  isDelivery: boolean;
}

interface AddAddressModalProps {
  accountId: number;
  onClose: () => void;
  onAddressAdded: (newAddress: Address) => void;
  onAddressUpdated: (updatedAddress: Address) => void;
  editAddress: Address | null;
}

export default function AddressDialog({
  accountId,
  onClose,
  onAddressAdded,
  onAddressUpdated,
  editAddress,
}: AddAddressModalProps) {
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
    }, [editAddress, formData.District, districtOptions]);
  


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
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 bg-white"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">
          {editAddress ? "Cập nhật Địa Chỉ" : "Thêm Địa Chỉ"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Họ và Tên:
            </label>
            <input
              name="FullName"
              value={formData.FullName}
              onChange={(e) =>
                setFormData({ ...formData, FullName: e.target.value })
              }
              required
              placeholder="Họ & Tên"
              className="w-full p-2 border rounded text-black bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Số Điện Thoại:
            </label>
            <input
              name="PhoneNumber"
              value={formData.PhoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, PhoneNumber: e.target.value })
              }
              required
              className="w-full p-2 border rounded text-black bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tỉnh/Thành Phố:
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quận/Huyện:
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phường/Xã:
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
                wardOptions.find(
                  (option) => option.label === formData.Ward
                ) || null
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Địa Chỉ Cụ Thể:
            </label>
            <input
              name="SpecificAddress"
              value={formData.SpecificAddress}
              onChange={(e) =>
                setFormData({ ...formData, SpecificAddress: e.target.value })
              }
              required
              className="w-full p-2 border rounded text-black bg-white"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 disabled:bg-gray-300"
          >
            {loading ? "Saving..." : editAddress ? "Update Address" : "Save Address"}
          </button>
        </form>
      </div>
    </div>
  );
}