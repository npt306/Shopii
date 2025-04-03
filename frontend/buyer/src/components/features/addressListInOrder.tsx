import { useState, useEffect } from "react";
import { Address } from "../../types/address";

const mockAddressData: Address[] = [
  {
    AddressId: 1,
    FullName: "Nguyen Huynh Phu Qui",
    PhoneNumber: "0787820631",
    Province: "Tien Giang",
    District: "My Tho",
    Ward: "Phuong 4",
    SpecificAddress: "308/9/34 Tran Hung Dao, Khu Pho 4",
    isDefault: false,
  },
  {
    AddressId: 2,
    FullName: "Ly San",
    PhoneNumber: "0359476220",
    Province: "Bà Rịa - Vũng Tàu",
    District: "Huyện Châu Đức",
    Ward: "Thị Trấn Ngãi Giao",
    SpecificAddress:
      "Hội Nạn Nhân Chất Độc Da Cam Và Bảo Trợ Xã Hội Huyện Châu Đức, Số 58, Đường 30/4",
    isDefault: false,
  },
  {
    AddressId: 3,
    FullName: "Lý San",
    PhoneNumber: "0359476221",
    Province: "Bà Rịa - Vũng Tàu",
    District: "Huyện Châu Đức",
    Ward: "Thị Trấn Ngãi Giao",
    SpecificAddress: "Số 23, Mỹ Xuân - Ngãi Giao, Mỹ Xuân",
    isDefault: false,
  },
  {
    AddressId: 4,
    FullName: "Huỳnh Oanh",
    PhoneNumber: "0922136873",
    Province: "Tien Giang",
    District: "My Tho",
    Ward: "Phuong 4",
    SpecificAddress: "85/33, Đống Đa, khu phố 4 (trong hẻm)",
    isDefault: true,
  },
];

const formatPhoneNumber = (phone: string) => {
  let newFormat = phone.slice(1);
  return newFormat
    .split("")
    .map((char, i) => ((i + 1) % 3 === 0 ? char + " " : char))
    .join("");
};

const RadioButton = ({ checked, onChange }: any) => {
  return (
    <div
      className={`stardust-radio ${checked ? "stardust-radio--checked" : ""}`}
      role="radio"
      onClick={onChange}
    >
      <div className="stardust-radio-button">
        <div className="stardust-radio-button__outer-circle">
          <div className="stardust-radio-button__inner-circle" />
        </div>
      </div>
    </div>
  );
};

type AddressListInOrderModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenModalAdd: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenModalUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  onSelectAddress: React.Dispatch<React.SetStateAction<string>>;
};

export const AddressListInOrderModal: React.FC<
  AddressListInOrderModalProps
> = ({
  open,
  setOpen,
  setOpenModalAdd,
  setOpenModalUpdate,
  onSelectAddress,
}) => {
  const [sortAddress, setSortAddress] = useState<Address[]>();
  const [selectedAddress, setSelectedAddress] = useState<Number | null>(null);

  const handleConfirm = () => {
    const selectedData = "123 Nguyễn Văn A, Quận 1"; // Giả sử đây là địa chỉ người dùng chọn
    onSelectAddress(selectedData); // Gửi dữ liệu lên component cha
  };

  useEffect(() => {
    if (mockAddressData) {
      sortAddresses(mockAddressData);
    }
  }, [mockAddressData]);

  const sortAddresses = (addresses: Address[]) => {
    const defaultAddresses = addresses.filter(
      (address) => address.isDefault === true
    );
    const notDefaultAddresses = addresses.filter(
      (address) => address.isDefault === false
    );
    const newSortAddress = [...defaultAddresses, ...notDefaultAddresses];
    setSortAddress(newSortAddress);
  };

  const handleUpdateAddress = (index: Number) => {
    const updatedAddresses =
      sortAddress?.map((address, i) => ({
        ...address,
        isDefault: i === index ? true : false,
      })) ?? [];
    sortAddresses(updatedAddresses);
  };

  if (!open) return null;
  return (
    <>
      <div>
        <div className="address-modal">
          <div className="z-1">
            <div className="address-container">
              <div className="flex flex-col h-[auto] w-auto">
                <div className="title">
                  <div>Địa Chỉ Của Tôi</div>
                </div>
                <div className="flex flex-col pr-7 pl-3 max-h-[25rem] overflow-y-auto custom-scrollbar">
                  {sortAddress?.map((address, index) => (
                    <div
                      key={address.AddressId}
                      className="flex flex-col items-center justify-center"
                    >
                      <div className="flex flex-row">
                        <div className="h-auto">
                          <RadioButton
                            checked={selectedAddress === address.AddressId}
                            onChange={() =>
                              setSelectedAddress(address.AddressId)
                            }
                          />
                        </div>
                        <div className="w-full flex flex-col py-2 gap-1">
                          <div className="flex flex-row items-center">
                            <div className="flex-7 flex flex-row items-center">
                              <div className="text-[1rem]">
                                {address.FullName}
                              </div>
                              <div className="mx-2 mb-1 text-xl text-[#00000042]">
                                <div>|</div>
                              </div>
                              <div className="addr-info text-[#00000070]">
                                (+84) {formatPhoneNumber(address.PhoneNumber)}
                              </div>
                            </div>
                            <div
                              onClick={() => handleUpdateAddress(index)}
                              className="text-blue-500"
                            >
                              <button
                                onClick={() => {
                                  setOpen(false); // Đóng Modal 1
                                  setOpenModalUpdate(true); // Mở Modal 2
                                }}
                              >
                                Cập nhật
                              </button>
                            </div>
                          </div>
                          <div className="w-[25rem] text-[#00000070]">
                            {address.SpecificAddress}
                          </div>
                          <div className="text-[#00000070]">
                            {address.Ward}, {address.District},{" "}
                            {address.Province}
                          </div>
                          {address.isDefault == true && (
                            <>
                              <div className="border-[#ee4d2d] border p-1 w-fit text-[0.7rem] text-[#ee4d2d]">
                                Mặc định
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      {index < 3 ? (
                        <>
                          <hr className="border-t border-gray-300 mt-2 w-[95%] mx-auto" />
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mb-7 mt-3 mx-5">
                  <button
                    onClick={() => {
                      setOpen(false); // Đóng Modal 1
                      setOpenModalAdd(true); // Mở Modal 2
                    }}
                    className="gray-button"
                  >
                    <svg
                      viewBox="0 0 10 10"
                      className="mr-2 fill-gray-500"
                      width={16}
                      height={16}
                    >
                      <path
                        stroke="none"
                        d="m10 4.5h-4.5v-4.5h-1v4.5h-4.5v1h4.5v4.5h1v-4.5h4.5z"
                      />
                    </svg>
                    Thêm Địa Chỉ Mới
                  </button>
                </div>

                <div className="border-t border-black/10 pb-5 bottom-0 h-[64px] px-6 pt-3 justify-end !items-center flex">
                  <button
                    className="!mr-2 gray-button"
                    onClick={() => setOpen(false)}
                  >
                    Huỷ
                  </button>
                  <button
                    className="color-button"
                    onClick={() => {
                      handleConfirm();
                      setOpen(false);
                    }}
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-bg" onClick={() => setOpen(false)} />
        </div>
      </div>
    </>
  );
};
