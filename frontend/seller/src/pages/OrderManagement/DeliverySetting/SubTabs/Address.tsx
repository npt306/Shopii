import { useState, useEffect } from "react";
import AddressDialog from "../Components/AddressDialogue";
import { EnvValue } from '../../../../env-value/envValue';
interface Address {
  id: number;
  name: string;
  phone: string;
  details: string;
  province: string;
  type: string[]; // Includes "Default address", "Shipping address", "Delivery address"
}
//localStorage.setItem('user_accountId', String(userData.accountId));
const Address = () => {
  const user_accountId = localStorage.getItem("user_accountId"); // Retrieve user_accountId from localStorage
  console.log("user_accountId", user_accountId); // Log the user_accountId for debugging
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch addresses from backend
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${EnvValue.API_GATEWAY_URL}/api/address/account/${user_accountId}` // Use user_accountId dynamically
      );
      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }
      const data = await response.json();
      setAddresses(
        data.map((address: any) => {
          // Check each flag individually
          const types: string[] = [];
          if (address.isDefault === true) {
            types.push("Default address");
          }
          if (address.isShipping === true) {
            types.push("Shipping address");
          }
          if (address.isDelivery === true) {
            types.push("Delivery address");
          }
    
          return {
            id: address.id,
            name: address.fullName,
            phone: address.phoneNumber,
            details: address.specificAddress,
            province: `${address.ward}, ${address.district}, ${address.province}`,
            type: types,
          };
        })
      );
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user_accountId) {
      fetchAddresses();
    } else {
      fetchAddresses();
      // setError("User account ID is missing");
    }
  }, [user_accountId]);

  // Add or update address
  const handleSaveAddress = async (newAddress: Address) => {
    try {
      if (newAddress.id) {
        // Update address
        const response = await fetch(
          `${EnvValue.API_GATEWAY_URL}/address/update/${newAddress.id}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newAddress),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update address");
        }
      } else {
        // Add new address
        const response = await fetch(
          `${EnvValue.API_GATEWAY_URL}/api/address/account/${user_accountId}`, // Use user_accountId dynamically
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newAddress),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to add address");
        }
      }
      fetchAddresses(); // Refresh the address list
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the address");
    } finally {
      setIsDialogOpen(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (id: number) => {
    try {
      const response = await fetch(`${EnvValue.API_GATEWAY_URL}/api/address/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete address");
      }
      setAddresses(addresses.filter((address) => address.id !== id));
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting the address");
    }
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
            setSelectedAddress(null);
            setIsDialogOpen(true);
          }}
          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
        >
          + Thêm địa chỉ mới
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        addresses.map((address, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-sm font-medium mb-2">Address {index + 1}</h3>
            <div className="space-y-2 text-xs p-2 bg-gray-50 rounded">
              <div className="flex">
                <div className="w-24 text-gray-600">Họ & Tên</div>
                <div className="flex-1">
                  <span>{address.name}</span>
                  {address.type.map((t, i) => {
                    let bgColor = "bg-red-50";
                    if (t === "Default address") bgColor = "bg-blue-100";
                    if (t === "Shipping address") bgColor = "bg-green-100";
                    if (t === "Delivery address") bgColor = "bg-yellow-100";

                    return (
                      <span
                        key={i}
                        className={`text-red-500 text-xs ml-1 ${bgColor} px-1 py-0.5 rounded`}
                      >
                        {t}
                      </span>
                    );
                  })}
                </div>
                <a
                  href="#"
                  className="text-blue-500 hover:underline text-xs"
                  onClick={() => {
                    setSelectedAddress(address);
                    setIsDialogOpen(true);
                  }}
                >
                  Sửa
                </a>
                <a
                  href="#"
                  className="text-red-500 hover:underline ml-2 text-xs"
                  onClick={() => handleDeleteAddress(address.id)}
                >
                  Xóa
                </a>
              </div>

              <div className="flex">
                <div className="w-24 text-gray-600">Số điện thoại</div>
                <div className="flex-1">{address.phone}</div>
              </div>

              <div className="flex">
                <div className="w-24 text-gray-600">Địa chỉ</div>
                <div className="flex-1 space-y-1">
                  {address.details.split(", ").map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      <AddressDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveAddress}
        address={selectedAddress} // Pass the selected address for editing
      />
    </div>
  );
};

export default Address;