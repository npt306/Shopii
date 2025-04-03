import { useState } from "react";
import Select from "react-select";
import "../../css/page/orderPage.css";

type UpdateAdressInOrderModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export const UpdateAdressInOrderModal: React.FC<
  UpdateAdressInOrderModalProps
> = ({ open, setOpen, setOpenModal }) => {
  if (!open) return null;

  const [selectedCity, setSelectedCity] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [selectedWard, setSelectedWard] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const options = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
  ];

  const [isDefaultAddress, setIsDefaultAddress] = useState<boolean>(false);
  const isInputDisabled = !selectedCity || !selectedDistrict || !selectedWard;

  return (
    <>
      <div className="address-modal">
        <div className="z-1">
          <div className="address-container">
            <div className="flex flex-col h-[auto] w-[32rem] px-5">
              <div className="">
                <div className="text-[1.25rem] my-5">Cập nhật địa chỉ</div>
              </div>

              <div className="flex flex-col w-full h-auto gap-5">
                <div className="flex flex-row gap-5">
                  <input
                    type="text"
                    placeholder="Họ và tên"
                    className="p-2.5 border border-gray-300 w-[50%] focus:border-black placeholder:text-gray-300"
                  />
                  <input
                    type="text"
                    placeholder="Số điện thoại"
                    className="p-2.5 border border-gray-300 w-[50%] focus:border-black placeholder:text-gray-300"
                  />
                </div>

                <div className="flex flex-row gap-1">
                  <Select
                    options={options}
                    className="flex-1/3 text-nowrap"
                    placeholder="Tỉnh/Thành Phố"
                    value={selectedCity}
                    onChange={setSelectedCity}
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        borderRadius: "0px",
                      }),
                    }}
                  />

                  <Select
                    options={options}
                    className="flex-1/3"
                    placeholder="Quận/Huyện"
                    value={selectedDistrict}
                    onChange={setSelectedDistrict}
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        borderRadius: "0px",
                      }),
                    }}
                  />

                  <Select
                    options={options}
                    className="flex-1/3"
                    placeholder="Phường/Xã"
                    value={selectedWard}
                    onChange={setSelectedWard}
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        borderRadius: "0px",
                      }),
                    }}
                  />
                </div>

                <textarea
                  className="p-2.5 border border-gray-300 focus:border-black placeholder:text-gray-300 mt-2 w-full resize-y"
                  placeholder="Địa chỉ cụ thể"
                  disabled={isInputDisabled}
                  rows={3}
                  style={{ maxHeight: "30vh" }} // Số dòng mặc định
                />

                <div className="flex flex-row gap-2">
                  <input
                    type="checkbox"
                    checked={isDefaultAddress}
                    onClick={() => setIsDefaultAddress(!isDefaultAddress)}
                    className="w-4 h-4 appearance-none border border-black checked:bg-orange-500 checked:border-orange-500 relative
             before:content-['✔'] before:absolute before:inset-0 before:flex before:items-center before:justify-center
             before:text-white before:opacity-0 checked:before:opacity-100"
                  />
                  <div>Đặt làm địa chỉ mặc định</div>
                </div>
              </div>

              <div className="border-t border-black/10 pb-5 bottom-0 h-[64px] py-3 justify-end !items-center flex mt-5 border-t-0">
                <button
                  className="!mr-2 gray-button"
                  onClick={() => {
                    setOpen(false); // Đóng Modal 1
                    setOpenModal(true); // Mở Modal 2
                  }}
                >
                  Trở lại
                </button>
                <button
                  className="color-button"
                  onClick={() => {
                    setOpen(false); // Đóng Modal 1
                    setOpenModal(true); // Mở Modal 2
                  }}
                >
                  Hoàn thành
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-bg" onClick={() => setOpen(false)} />
      </div>
    </>
  );
};
