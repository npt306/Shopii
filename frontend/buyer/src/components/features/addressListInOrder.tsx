import { useState, useEffect } from "react";
import { Address } from "../../types/address";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FormatPhoneNumber } from "../../helpers/utility/phoneFormat";
import { EnvValue } from "../../env-value/envValue";

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
  onSelectAddress: React.Dispatch<React.SetStateAction<Address>>;
  onSelectUpdateAddress: React.Dispatch<React.SetStateAction<Address>>;
};

export const AddressListInOrderModal: React.FC<
  AddressListInOrderModalProps
> = ({
  open,
  setOpen,
  setOpenModalAdd,
  setOpenModalUpdate,
  onSelectAddress,
  onSelectUpdateAddress,
}) => {
  const { id } = useParams<{ id: string }>();
  const [sortAddress, setSortAddress] = useState<Address[]>();
  const [selectedAddress, setSelectedAddress] = useState<Number | null>(null);

  const [addressDataFetch, setAddressDataFetch] = useState<Address[]>();

  const selectedAddr = sortAddress?.find(
    (address) => address.AddressId === selectedAddress
  );

  const handleConfirm = (address: any) => {
    sessionStorage.setItem("selectedAddress", JSON.stringify(address));
    onSelectAddress(address); // Gửi dữ liệu lên component cha
  };

  const fetchListAddress = async () => {
    try {
      const response = await axios.get<any>(
        // `http://localhost:3005/address/account/${id}`
        `${EnvValue.API_GATEWAY_URL}/api/address/account/${id}`
      );
      const addresses: Address[] = [];
      response.data.forEach((item: any) => {
        let address: Address = {
          AddressId: item.id,
          FullName: item.fullName,
          PhoneNumber: item.phoneNumber,
          Province: item.province,
          District: item.district,
          Ward: item.ward,
          SpecificAddress: item.specificAddress,
          isDefault: item.isDefault,
        };

        addresses.push(address);
      });
      setAddressDataFetch(addresses);
    } catch (error) {
      console.error("Error fetching list address:", error);
    }
  };

  useEffect(() => {
    fetchListAddress();
  }, [open]);

  useEffect(() => {
    if (addressDataFetch) {
      sortAddresses(addressDataFetch);
    }
  }, [addressDataFetch]);

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
                            onChange={() => {
                              setSelectedAddress(address.AddressId);
                            }}
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
                                (+84) {FormatPhoneNumber(address.PhoneNumber)}
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
                                  onSelectUpdateAddress(address);
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
                      {index < sortAddress.length - 1 ? (
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
                      handleConfirm(selectedAddr ?? ({} as Address));
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
