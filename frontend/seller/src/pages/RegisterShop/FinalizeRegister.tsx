import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";

interface FinalizeRegisterData {
  shopId?: string;
  isLoading?: boolean;
}

interface FinalizeRegisterProps {
  finalData?: FinalizeRegisterData;
  onSubmit?: (data: FinalizeRegisterData) => Promise<void>;
}

const FinalizeRegister: React.FC<FinalizeRegisterProps> = ({ finalData, onSubmit }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const shopId = finalData?.shopId || (location.state as { shopId?: string })?.shopId;

  const handleAddProduct = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (onSubmit) {
        await onSubmit({ shopId }); // Wait for parent to handle submission (optional)
      }

      localStorage.clear();
      window.location.href = `http://34.58.241.34:8000/login`;
    } catch (error) {
      console.error("Failed to finalize:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center mt-12 p-6">
      <div className="flex justify-center mb-4">
        <CheckCircle className="text-green-500 w-16 h-16" />
      </div>

      <h1 className="text-xl font-semibold text-gray-700">Đăng ký thành công</h1>
      <p className="text-gray-600 mt-2">
        Hãy đăng nhập để bắt đầu sử dụng dịch vụ của chúng tôi.
      </p>

      {shopId && <p className="mt-2 text-sm text-gray-500">Shop ID: {shopId}</p>}

      <button
        onClick={handleAddProduct}
        disabled={loading}
        className={`mt-6 px-6 py-2 rounded-md text-white transition ${
          loading ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
        }`}
      >
        {loading ? "Redirecting..." : "Go to login"}
      </button>
    </div>
  );
};

export default FinalizeRegister;
