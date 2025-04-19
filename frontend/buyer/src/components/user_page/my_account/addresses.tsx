import "../../../css/user/addresses.css";
import React, { useState, useEffect } from "react";
import { AddAddressModal } from "../AddAddressModal.tsx";
import { EnvValue } from "../../../env-value/envValue";
import { IoAdd } from "react-icons/io5";
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

export const Addressesupdate = ({ accountId }: { accountId: number }) => {
  const [addresses, setAddresses] = useState<Address[]>([]); // Explicitly define the type
  //const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editAddress, setEditAddress] = useState<Address | null>(null);
  const [hasAddress, setHasAddress] = useState(true);
  // Fetch addresses by accountId
  const fetchAddresses = async () => {
    try {
      // setLoading(true);
      const response = await fetch(
        `${EnvValue.API_GATEWAY_URL}/api/address/account/${accountId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }
      const data: Address[] = await response.json();
      setAddresses(data);
      setHasAddress(data.length > 0); 
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
    // finally {
    //   setLoading(false);
    // }
  };

  useEffect(() => {
    fetchAddresses();
  }, [accountId]);

  const deleteAddress = async (id: number) => {
    try {
      const response = await fetch(
        `${EnvValue.API_GATEWAY_URL}/api/address/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete address");
      }
      // Remove the deleted address from the state
      const storedAddress = sessionStorage.getItem("selectedAddress");
      if (storedAddress) {
        const selectedAddressInSession = JSON.parse(storedAddress);
        if (selectedAddressInSession.AddressId == id) {
          sessionStorage.removeItem("selectedAddress");
        }
      }
      setAddresses(addresses.filter((address) => address.id !== id));
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting the address");
    }
  };
  const setDefaultAddress = async (id: number) => {
    try {
      const response = await fetch(
        `${EnvValue.API_GATEWAY_URL}/api/address/${id}/set-default/${accountId}`,
        {
          method: "POST",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to set default address");
      }
      await fetchAddresses(); // Refresh the address list
    } catch (err: any) {
      setError(
        err.message || "An error occurred while setting default address"
      );
    }
  };

  // Open the modal for adding or editing an address
  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditAddress(address); // Pass the address to edit
    } else {
      setEditAddress(null); // Open modal for adding a new address
    }
    setShowModal(true);
  };
  // Handle address addition
  const handleAddressAdded = async (newAddress: Address) => {
    setAddresses([...addresses, newAddress]);
    await fetchAddresses();
  };
  // Handle address update
  const handleAddressUpdated = async (updatedAddress: Address) => {
    setAddresses((prev) =>
      prev.map((addr) =>
        addr.id === updatedAddress.id ? updatedAddress : addr
      )
    );
    await fetchAddresses();
  };

  //if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex min-h-full relative flex-col" role="main">
      <div className="flex overflow-visible flex-col">
        <div className="title-container">
          <div className="flex-1">
            <div className="text-xl font-medium">Địa chỉ của tôi</div>
          </div>
          <div>
            <div className="ml-2.5">
              <div style={{ display: "flex" }}>
                <button
                  className="bg-orange-600 !text-white text-sm font-normal h-10 px-4"
                  onClick={() => handleOpenModal()}
                >
                  <div className="w-full justify-between items-center flex">
                    <IoAdd className="mr-2 items-center flex text-xl font-bold" />
                    <div>Thêm địa chỉ mới</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        {hasAddress ? (
          <>
            <div className="bg-neutral-100">
              <div className="bg-white pt-3 px-7.5 pb-0">
                <div className="text-lg leading-7 mb-2">Địa chỉ</div>
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="bg-white border-b border-black/10 flex pt-4.5 px-0 pb-3"
                  >
                    <div className="w-full">
                      <div role="heading" className="mb-1 flex justify-between">
                        <div className="mr-2 flex flex-grow overflow-x-hidden">
                          <span className="text-gray-800 text-normal leading-6 font-medium items-center inline-flex">
                            <div className="overflow-x-hidden overflow-ellipsis whitespace-nowrap">
                              {address.fullName}
                            </div>
                          </span>
                          <div className="border-l border-black/26 mx-2" />
                          <div
                            role="row"
                            className="text-gray-500 flex items-center"
                          >
                            {address.phoneNumber}
                          </div>
                        </div>
                        <div className="flex basis-10">
                          <button
                            className="buttons-style"
                            onClick={() => handleOpenModal(address)}
                          >
                            Cập nhật
                          </button>
                          {!address.isDefault && (
                            <button
                              className="buttons-style !text-orange-600"
                              onClick={() => deleteAddress(address.id)}
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </div>
                      <div role="heading" className="mb-1 flex justify-between">
                        <div className="mr-2 flex flex-grow overflow-x-hidden">
                          <div className="text-sm">
                            <div
                              role="row"
                              className="flex items-center text-gray-500"
                            >
                              {address.specificAddress}
                            </div>
                            <div
                              role="row"
                              className="flex items-center text-gray-500"
                            >
                              {address.ward}, {address.district},{" "}
                              {address.province}
                            </div>
                          </div>
                        </div>
                        <div className="pt-1 flex basis-10">
                          {!address.isDefault && (
                            <button className="set-default-btn bg-white" onClick={() => setDefaultAddress(address.id)}>
                              Thiết lập mặc định
                            </button>
                          )}
                        </div>
                      </div>

                      <div
                        role="row"
                        className="mt-1 flex-wrap flex items-center"
                      >
                        {address.isDefault && (
                          <span
                            role="mark"
                            className="mr-1 mb-1 border border-orange-600 text-orange-600 !text-xs py-0.5 px-1"
                          >
                            Mặc định
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="box-border h-[500px] p-7.5 items-center flex flex-col justify-center">
            <svg
              fill="none"
              viewBox="0 0 121 120"
              className="h-[120px] w-[120px]"
            >
              <path
                d="M16 79.5h19.5M43 57.5l-2 19"
                stroke="#BDBDBD"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M56.995 78.791v-.001L41.2 38.195c-2.305-5.916-2.371-12.709.44-18.236 1.576-3.095 4.06-6.058 7.977-8 5.061-2.5 11.038-2.58 16.272-.393 3.356 1.41 7 3.92 9.433 8.43v.002c2.837 5.248 2.755 11.853.602 17.603L60.503 78.766v.001c-.617 1.636-2.88 1.643-3.508.024Z"
                fill="#fff"
                stroke="#BDBDBD"
                strokeWidth={2}
              />
              <path
                d="m75.5 58.5 7 52.5M13 93h95.5M40.5 82.5 30.5 93 28 110.5"
                stroke="#BDBDBD"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M44.5 79.5c0 .55-.318 1.151-1.038 1.656-.717.502-1.761.844-2.962.844-1.2 0-2.245-.342-2.962-.844-.72-.505-1.038-1.105-1.038-1.656 0-.55.318-1.151 1.038-1.656.717-.502 1.761-.844 2.962-.844 1.2 0 2.245.342 2.962.844.72.505 1.038 1.105 1.038 1.656Z"
                stroke="#BDBDBD"
                strokeWidth={2}
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M48.333 68H18.5a1 1 0 1 0 0 2h30.667l-.834-2Zm20.5 2H102a1 1 0 0 0 0-2H69.667l-.834 2Z"
                fill="#BDBDBD"
              />
              <path
                d="M82 73h20l3 16H84.5L82 73ZM34.5 97H76l1.5 13H33l1.5-13ZM20.5 58h18l-1 7h-18l1-7Z"
                fill="#E8E8E8"
              />
              <path
                clipRule="evenodd"
                d="M19.5 41a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM102.5 60a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                stroke="#E8E8E8"
                strokeWidth={2}
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M93.5 22a1 1 0 0 0-1 1v3h-3a1 1 0 1 0 0 2h3v3a1 1 0 1 0 2 0v-3h3a1 1 0 1 0 0-2h-3v-3a1 1 0 0 0-1-1Z"
                fill="#E8E8E8"
              />
              <circle
                cx="58.5"
                cy={27}
                r={7}
                stroke="#BDBDBD"
                strokeWidth={2}
              />
            </svg>
            <div className="text-gray-600 font-medium text-md mt-4">
              Bạn chưa có địa chỉ.
            </div>
          </div>
        )}
      </div>
      {showModal && (
        <AddAddressModal
          accountId={accountId}
          onClose={() => setShowModal(false)}
          onAddressAdded={handleAddressAdded}
          onAddressUpdated={handleAddressUpdated}
          editAddress={editAddress} // Pass the address to edit
        />
      )}
    </div>
  );
};
