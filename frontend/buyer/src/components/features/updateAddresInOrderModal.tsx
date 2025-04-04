import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Address } from "../../types/address";
import axios from "axios";
import Select from "react-select";
import "../../css/page/orderPage.css";
import { EnvValue } from "../../env-value/envValue";

type UpdateAdressInOrderModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  updateAddress: Address | null;
};

export const UpdateAdressInOrderModal: React.FC<
  UpdateAdressInOrderModalProps
> = ({ open, setOpen, setOpenModal, updateAddress }) => {
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

  useEffect(() => {
    if (updateAddress) {
      setFormData({
        FullName: updateAddress.FullName,
        PhoneNumber: updateAddress.PhoneNumber,
        Province: updateAddress.Province,
        District: updateAddress.District,
        Ward: updateAddress.Ward,
        SpecificAddress: updateAddress.SpecificAddress,
        isDefault: updateAddress.isDefault,
      });
    }
  }, [updateAddress]);

  const [provinceOptions, setProvinceOptions] = useState<any[]>([]);
  const [districtOptions, setDistrictOptions] = useState<any[]>([]);
  const [wardOptions, setWardOptions] = useState<any[]>([]);

  const [isDefaultAddress, setIsDefaultAddress] = useState<boolean>(false);
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

  useEffect(() => {
    if (formData.Province && provinceOptions.length > 0) {
      const provinceOption = provinceOptions.find(
        (opt: any) => opt.label === formData.Province
      );
      if (provinceOption) {
        fetchDistricts(provinceOption.id);
      }
    }
  }, [formData.Province, provinceOptions]);

  useEffect(() => {
    if (formData.District && districtOptions.length > 0) {
      const districtOption = districtOptions.find(
        (opt: any) => opt.label === formData.District
      );
      if (districtOption) {
        fetchWards(districtOption.id);
      }
    }
  }, [formData.District, districtOptions]);

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

    try {
      const response = await axios.post(
        // `http://localhost:3005/address/update/${updateAddress?.AddressId}`,
        `${EnvValue.API_GATEWAY_URL}/api/address/update/${updateAddress?.AddressId}`,
        formData
      );
      // console.log(response);
    } catch (error) {
      console.error("Error creating address:", error);
    }
    // reset form data
    resetForm();
  };

  const resetForm = () => {
    setIsInputDisabled(true);
    setIsDefaultAddress(false);
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
    setOpen(false); // Đóng Modal 1
    setOpenModal(true);
  };

  if (!open) return null;

  return (
    <>
      <div className="address-modal">
        <div className="z-1">
          <div className="address-container">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col h-[auto] w-[32rem] px-5">
                <div className="">
                  <div className="text-[1.25rem] my-5">Cập nhật địa chỉ</div>
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
                      value={
                        provinceOptions.find(
                          (option: any) => option.label === formData.Province
                        ) || null
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
                      value={
                        districtOptions.find(
                          (option) => option.label === formData.District
                        ) || null
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
                      value={
                        wardOptions.find(
                          (option) => option.label === formData.Ward
                        ) || null
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
                    value={formData.SpecificAddress}
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

                  {updateAddress?.isDefault ? (
                    <>
                      <div className="flex flex-row gap-2">
                        <input
                          type="checkbox"
                          checked={formData.isDefault}
                          onChange={() => {}}
                          className="w-4 h-4 appearance-none border border-black checked:bg-orange-500 checked:border-orange-500 relative
             before:content-['✔'] before:absolute before:inset-0 before:flex before:items-center before:justify-center
             before:text-white before:opacity-0 checked:before:opacity-100"
                        />
                        <div>Đặt làm địa chỉ mặc định</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-row gap-2">
                        <input
                          type="checkbox"
                          checked={isDefaultAddress}
                          onChange={() => {
                            formData.isDefault = !isDefaultAddress;
                            setIsDefaultAddress(!isDefaultAddress);
                          }}
                          className="w-4 h-4 appearance-none border border-black checked:bg-orange-500 checked:border-orange-500 relative
             before:content-['✔'] before:absolute before:inset-0 before:flex before:items-center before:justify-center
             before:text-white before:opacity-0 checked:before:opacity-100"
                        />
                        <div>Đặt làm địa chỉ mặc định</div>
                      </div>
                    </>
                  )}
                </div>

                <div className="border-black/10 pb-5 bottom-0 h-[64px] py-3 justify-end !items-center flex mt-5 border-t-0">
                  <button
                    type="button"
                    className="!mr-2 gray-button"
                    onClick={() => resetForm()}
                  >
                    Trở lại
                  </button>
                  <button type="submit" className="color-button">
                    Hoàn thành
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="modal-bg" onClick={() => setOpen(false)} />
      </div>
    </>
  );
};
