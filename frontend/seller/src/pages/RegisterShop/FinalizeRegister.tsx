import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import axios from "axios";
import { EnvValue } from "../../env-value/envValue";

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

  const handleAddProduct = async () => {
    // Optionally pass the final data up before navigating
    if (onSubmit) {
      onSubmit({ shopId });
    }
    localStorage.clear();
    // http://34.58.241.34:8000
    // http://localhost:8000
    window.location.href = `${EnvValue.BUYER_URL}/login`;
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
        Hãy đăng nhập để bắt đầu sử dụng dịch vụ của chúng tôi.
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
        Go to login
      </button>
    </div>
  );
};

export default FinalizeRegister;
