import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

interface FinalizeRegisterData {
  shopId?: string;
  // You can add more final fields if needed
}

interface FinalizeRegisterProps {
  finalData?: FinalizeRegisterData;
  onSubmit?: (data: FinalizeRegisterData) => void;
}

const FinalizeRegister: React.FC<FinalizeRegisterProps> = ({ finalData, onSubmit }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve shopId either from finalData prop or from location.state
  const shopId = finalData?.shopId || (location.state as { shopId?: string })?.shopId;

  const handleAddProduct = () => {
    // Optionally pass the final data up before navigating
    if (onSubmit) {
      onSubmit({ shopId });
    }
    navigate("/portal/product/new");
  };

  return (
    <div className="max-w-2xl mx-auto text-center mt-12 p-6">
      {/* Success Icon */}
      <div className="flex justify-center mb-4">
        <CheckCircle className="text-green-500 w-16 h-16" />
      </div>

      {/* Success Message */}
      <h1 className="text-xl font-semibold text-gray-700">Đăng ký thành công</h1>
      <p className="text-gray-600 mt-2">
        Hãy đăng bán sản phẩm đầu tiên để khởi động hành trình bán hàng cùng Shopee nhé!
      </p>

      {/* Shop ID (if available) */}
      {shopId && (
        <p className="mt-2 text-sm text-gray-500">Shop ID: {shopId}</p>
      )}

      {/* Button to Add Product */}
      <button
        onClick={handleAddProduct}
        className="mt-6 bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600"
      >
        Thêm sản phẩm
      </button>
    </div>
  );
};

export default FinalizeRegister;
