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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
  
    // Fetch addresses by accountId
    useEffect(() => {
      const fetchAddresses = async () => {
        try {
          setLoading(true);
          const response = await fetch(`${import.meta.env.VITE_ACCOUNT_SERVICE_URL}/address/account/${accountId}`);
          
          if (!response.ok) {
            throw new Error("Failed to fetch addresses");
          }
          const data: Address[] = await response.json(); // Explicitly type the response
          setAddresses(data);
        } catch (err: any) {
          setError(err.message || "An error occurred");
        } finally {
          setLoading(false);
        }
      };
  
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
  
    const setDefaultAddress = (id: number) => {
      setAddresses(
        addresses.map((address) =>
          address.id === id
            ? { ...address, isDefault: true }
            : { ...address, isDefault: false }
        )
      );
    };
    const handleAddressAdded = (newAddress: Address) => {
        setAddresses([...addresses, newAddress]);
      };
  
    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
  
    return (
      <div className="max-w-4xl mx-auto p-4 bg-white ">
        <div className="mb-4 flex justify-between items-center border-b border-gray-300 pb-4">
          <h2 className="text-xl font-semibold">Địa chỉ của tôi</h2>
          <button className="p-2 bg-orange-500 text-white rounded-md"
          onClick={() => setShowModal(true)}
          >
            Thêm địa chỉ mới
          </button>
        </div>
  
        {addresses.map((address) => (
          <div key={address.id} className="border-b border-gray-300 py-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{address.fullName}</p>
                <p>{address.specificAddress}</p>
                <p>{address.phoneNumber}</p>
              </div>
              <div className="text-right">
                {address.isDefault && (
                  <p className="text-red-500 font-medium">Mặc định</p>
                )}
                <div className="flex space-x-6 mt-2 py-4">
                  <button
                    className="text-blue-500  "
                    onClick={() => setDefaultAddress(address.id)}
                  >
                    Thiết lập mặc định 
                  </button>
                  <button
                    className="text-blue-500"
                    onClick={() => deleteAddress(address.id)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {showModal && (
        <AddAddressModal
          accountId={accountId}
          onClose={() => setShowModal(false)}
          onAddressAdded={handleAddressAdded}
        />
      )}
      </div>
    );
  };