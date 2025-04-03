
import "../../../css/user/addresses.css";
import React, { useState, useEffect } from "react";
import { AddAddressModal } from "../AddAddressModal.tsx";

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
  
    // Fetch addresses by accountId
    const fetchAddresses = async () => {
      try {
        // setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_ACCOUNT_SERVICE_URL}/address/account/${accountId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch addresses");
        }
        const data: Address[] = await response.json();
        setAddresses(data);
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
        const response = await fetch(`${import.meta.env.VITE_ACCOUNT_SERVICE_URL}/address/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete address");
        }
        // Remove the deleted address from the state
        setAddresses(addresses.filter((address) => address.id !== id));
      } catch (err: any) {
        setError(err.message || "An error occurred while deleting the address");
      }
    };
    const setDefaultAddress = async (id: number) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_ACCOUNT_SERVICE_URL}/address/${id}/set-default/${accountId}`,
          {
            method: "POST",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to set default address");
        }
        await fetchAddresses(); // Refresh the address list
      } catch (err: any) {
        setError(err.message || "An error occurred while setting default address");
      }
    };
    // const setDefaultAddress = (id: number) => {
    //   setAddresses(
    //     addresses.map((address) =>
    //       address.id === id
    //         ? { ...address, isDefault: true }
    //         : { ...address, isDefault: false }
    //     )
    //   );
    // };

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
      prev.map((addr) => (addr.id === updatedAddress.id ? updatedAddress : addr))
    );
    await fetchAddresses();
  };
  
    //if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
  
    return (
      <div className="max-w-4xl mx-auto p-4 bg-white">
        <div className="mb-4 flex justify-between items-center border-b border-gray-300 pb-4">
          <h2 className="text-xl font-semibold">Địa chỉ của tôi</h2>
          <button
            className="p-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            onClick={() => handleOpenModal()}
          >
            Thêm địa chỉ mới
          </button>
        </div>
  
        {addresses.map((address) => (
          <div
            key={address.id}
            className="flex justify-between items-start border rounded-md p-4 mb-4"
          >
            <div>
              <p className="font-medium">
                {address.fullName} &nbsp;|&nbsp; {address.phoneNumber}
              </p>
              <p className="text-gray-600">
                {address.specificAddress}, {address.ward}, {address.district},{" "}
                {address.province}
              </p>
              {address.isDefault && (
                <span className="inline-block mt-1 px-2 py-1 text-red-500 border border-red-500 rounded-md text-sm font-semibold">
                  Mặc định
                </span>
              )}
            </div>
  
            <div className="flex flex-col text-left space-y-2">
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 bg-white-500 text-red-500 rounded-md hover:underline"
                  onClick={() => handleOpenModal(address)}
                >
                  Cập nhật
                </button>
                <button
                  className="px-3 py-1 bg-white-500 text-white rounded-md hover:underline"
                  onClick={() => deleteAddress(address.id)}
                >
                  Xóa
                </button>
              </div>
              {!address.isDefault && (
                <button
                  className="mt-2 px-3 py-1 text-gray-600 hover:underline"
                  onClick={() => setDefaultAddress(address.id)}
                >
                  Thiết lập mặc định
                </button>
              )}
            </div>
          </div>
        ))}
  
        {showModal && (
          <AddAddressModal
            accountId={accountId}
            onClose={() => setShowModal(false)}
            onAddressAdded={handleAddressAdded}
            //editAddress={handleAddressUpdated} // Pass the address to edit
            //onAddressUpdated={handleAddressUpdated} // Handle updates
          />
        )}
      </div>
    );
  };