import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Select from "react-select";
import axios from "axios";
import "../../css/page/orderPage.css";
import { EnvValue } from "../../env-value/envValue";

type AddDefaultAdressInOrderModalProps = {
  open: boolean;
  handleAddressDefault: () => void;
};

export const AddDefaultAdressInOrderModal: React.FC<
  AddDefaultAdressInOrderModalProps
> = ({ open, handleAddressDefault }) => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    FullName: "",
    PhoneNumber: "",
    Province: "",
    District: "",
    Ward: "",
    SpecificAddress: "",
    isDefault: false,
  });

  const [provinceOptions, setProvinceOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);

  const [isInputDisabled, setIsInputDisabled] = useState<boolean>(true);

  const [error, setError] = useState<string>("");

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
    } catch (error) {
      console.error("Error fetching provinces:", error);
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
      setIsInputDisabled(false);
    } catch (error) {
      console.error("Error fetching districts:", error);
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
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
  };

  useEffect(() => {
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
      setWardOptions([]); // Clear ward options
      fetchDistricts(selectedOption?.id); // Fetch districts for the selected province
    }

    if (field === "District") {
      fetchWards(selectedOption?.id); // Fetch wards for the selected district
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validation: Check if required fields are filled
    formData.isDefault = true;

    if (
      !formData.FullName ||
      !formData.PhoneNumber ||
      !formData.Province ||
      !formData.District ||
      !formData.SpecificAddress
    ) {
      return;
    }

    // check phone number
    const regex = /^(0[3|5|7|8|9])\d{8}$/;
    if (!regex.test(formData.PhoneNumber)) {
      setError("Số điện thoại không hợp lệ");
      return;
    }

    // console.log("Form Data:", formData);

    try {
      const response = await axios.post(
        // `http://localhost:3005/address/account/${id}`,
        `${EnvValue.API_GATEWAY_URL}/api/address/account/${id}`,
        formData
      );
      // console.log(response);
      handleAddressDefault();
    } catch (error) {
      console.error("Error creating address:", error);
    }

    // reset form data
    resetForm();
  };

  const resetForm = () => {
    setIsInputDisabled(true);
    setError("");
    setFormData({
      FullName: "",
      PhoneNumber: "",
      Province: "",
      District: "",
      Ward: "",
      SpecificAddress: "",
      isDefault: false,
    });
  };

  if (!open) return null;

  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <div className="address-modal">
        <div className="z-1">
          <div className="address-container">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col h-[auto] w-[32rem] px-5">
                <div className="">
                  <div className="text-[1.25rem] my-5">
                    {" "}
                    Thêm địa chỉ nhận hàng
                  </div>
                </div>

                <div className="flex flex-col w-full h-auto gap-5">
                  <div className="flex flex-row gap-5">
                    <input
                      type="text"
                      value={formData.FullName}
                      onChange={(e) =>
                        setFormData({ ...formData, FullName: e.target.value })
                      }
                      required
                      placeholder="Họ và tên"
                      className="p-2.5 border border-gray-300 w-[50%] focus:border-black placeholder:text-gray-300"
                    />
                    <input
                      type="text"
                      value={formData.PhoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          PhoneNumber: e.target.value,
                        })
                      }
                      required
                      placeholder="Số điện thoại"
                      className="p-2.5 border border-gray-300 w-[50%] focus:border-black placeholder:text-gray-300"
                    />
                  </div>
                  {error && (
                    <div className="w-full h-full">
                      <div className="flex flex-row gap-5">
                        <div className="w-[50%]"></div>
                        <div className="w-[50%] text-[0.8rem] text-red-500">
                          {error}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-row gap-1">
                    <Select
                      options={provinceOptions}
                      onChange={(selectedOption) =>
                        handleSelectChange(selectedOption, "Province")
                      }
                      className="flex-1/3 text-nowrap"
                      placeholder="Tỉnh/Thành Phố"
                      required
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          borderRadius: "0px",
                        }),
                      }}
                    />

                    <Select
                      options={districtOptions}
                      onChange={(selectedOption) =>
                        handleSelectChange(selectedOption, "District")
                      }
                      className="flex-1/3"
                      placeholder="Quận/Huyện"
                      required
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          borderRadius: "0px",
                        }),
                      }}
                    />

                    <Select
                      options={wardOptions}
                      onChange={(selectedOption) =>
                        handleSelectChange(selectedOption, "Ward")
                      }
                      className="flex-1/3"
                      placeholder="Phường/Xã"
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          borderRadius: "0px",
                        }),
                      }}
                    />
                  </div>
                  <textarea
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        SpecificAddress: e.target.value,
                      })
                    }
                    className="p-2.5 border border-gray-300 focus:border-black placeholder:text-gray-300 mt-2 w-full resize-y"
                    placeholder="Địa chỉ cụ thể"
                    required
                    disabled={isInputDisabled}
                    rows={3}
                    style={{
                      cursor: isInputDisabled ? "not-allowed" : "text",
                      maxHeight: "30vh",
                    }} // Số dòng mặc định
                  />

                  <div className="relative group flex flex-row gap-2">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => {}}
                      className="opacity-35 w-4 h-4 appearance-none border border-black checked:bg-orange-500 checked:border-orange-500 relative
      before:content-['✔'] before:absolute before:inset-0 before:flex before:items-center before:justify-center
      before:text-white before:opacity-0 checked:before:opacity-100"
                    />
                    <div className="opacity-35">Đặt làm địa chỉ mặc định</div>

                    {/* Tooltip khi hover */}
                    <div
                      className="absolute top-[1.5rem] left-0 p-2 border border-gray-300 text-black bg-white shadow-lg w-[12rem]
      text-center flex items-center justify-center z-30 
      opacity-0 invisible group-hover:opacity-100 group-hover:visible transition"
                    >
                      Bạn không thể xóa nhãn địa chỉ mặc định.
                    </div>
                  </div>
                </div>

                <div className="border-black/10 pb-5 bottom-0 h-[64px] py-3 justify-end !items-center flex mt-5 border-t-0">
                  <button type="submit" className="color-button">
                    Hoàn thành
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="modal-bg" />
      </div>
    </>
  );
};
