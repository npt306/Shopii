import { useState, useEffect } from "react";
import AddressDialog from "../Components/AddressDialogue";
import { EnvValue } from '../../../../env-value/envValue';
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
//localStorage.setItem('user_accountId', String(userData.accountId));
const Address = () => {
  const user_accountId = localStorage.getItem("user_accountId"); // Retrieve user_accountId from localStorage
  const user_accountId_num = Number(localStorage.getItem("user_accountId")); // Retrieve user_accountId from localStorage
  console.log("user_accountId", user_accountId); // Log the user_accountId for debugging
  const [addresses, setAddresses] = useState<Address[]>([]); // Explicitly define the type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editAddress, setEditAddress] = useState<Address | null>(null);

  // Fetch addresses from backend
  const fetchAddresses = async () => {
    try {
      // setLoading(true);
      const response = await fetch(
        `${EnvValue.API_GATEWAY_URL}/api/address/account/${user_accountId}`
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
  }, [user_accountId]);

  const deleteAddress = async (id: number) => {
    try {
      const response = await fetch(`${EnvValue.API_GATEWAY_URL}/api/address/${id}`, {
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
        `${EnvValue.API_GATEWAY_URL}/api/address/${id}/set-default/${user_accountId}`,
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

  // Add or update address
  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditAddress(address); // Pass the address to edit
      
    } else {
      setEditAddress(null); // Open modal for adding a new address
    }
    setShowModal(true);
  };
  const handleAddressAdded = async (newAddress: Address) => {
    setAddresses([...addresses, newAddress]);
    await fetchAddresses();
  };


  const handleAddressUpdated = async (updatedAddress: Address) => {
    setAddresses((prev) =>
      prev.map((addr) => (addr.id === updatedAddress.id ? updatedAddress : addr))
    );
    await fetchAddresses();
  };


  return (
    <div className="p-2 text-black w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-semibold">Địa Chỉ</h2>
          <p className="text-gray-600 text-xs">
            Quản lý việc vận chuyển và địa chỉ giao hàng của bạn
          </p>
        </div>
        <button
          onClick={() => {
            handleOpenModal()
          }}
          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
        >
          + Thêm địa chỉ mới
        </button>
      </div>

      {
        addresses.map((address, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-sm font-medium mb-2">Address {index + 1}</h3>
            <div className="space-y-2 text-xs p-2 bg-gray-50 rounded">
              <div className="flex">
                <div className="w-24 text-gray-600">Họ & Tên</div>
                <div className="flex-1">
                  <span>{address.fullName}</span>

                  {address.isDefault && (
                    <span className="text-red-500 text-xs ml-1 bg-blue-100 px-1 py-0.5 rounded">
                      Default Address
                    </span>
                  )}
                  {address.isShipping && (
                    <span className="text-red-500 text-xs ml-1 bg-green-100 px-1 py-0.5 rounded">
                      Shipping Address
                    </span>
                  )}
                  {address.isDelivery && (
                      <span className="text-red-500 text-xs ml-1 bg-yellow-100 px-1 py-0.5 rounded">
                        Delivery Address
                      </span>
                    )}

                </div>
                <a
                  href="#"
                  className="text-blue-500 hover:underline text-xs"
                  onClick={() => {
                    handleOpenModal(address)
                  }}
                >
                  Sửa
                </a>
                {!address.isDefault && (
                    <a
                      href="#"
                      className="text-red-500 hover:underline ml-2 text-xs"
                      onClick={() => deleteAddress(address.id)}
                    >
                      Xóa
                    </a>
                  )}
              </div>

              <div className="flex">
                <div className="w-24 text-gray-600">Số điện thoại</div>
                <div className="flex-1">{address.phoneNumber}</div>
              </div>

              <div className="flex">
                <div className="w-24 text-gray-600">Địa chỉ</div>
                <div className="flex-1 space-y-1">
                  
                <p className="text-gray-600">
                {address.specificAddress}, {address.ward}, {address.district},{" "}
                {address.province}
              </p>
                  
                </div>
              </div>
            </div>
          </div>
        ))
      }

          {showModal && (
          <AddressDialog
            accountId={user_accountId_num}
            onClose={() => setShowModal(false)}
            onAddressAdded={handleAddressAdded}
            onAddressUpdated={handleAddressUpdated}
            editAddress={editAddress} // Pass the address to edit
          />
        )}
    </div>
  );
};

export default Address;