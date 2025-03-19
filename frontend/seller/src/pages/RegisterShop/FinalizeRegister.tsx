import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const FinalizeRegister: React.FC = () => {
    const location = useLocation();
    const { shopId } = (location.state as { shopId?: string }) || {};
    const navigate = useNavigate();

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

            {/* Shop ID (if needed) */}
            {shopId && (
                <p className="mt-2 text-sm text-gray-500">Shop ID: {shopId}</p>
            )}

            {/* Button to Add Product */}
            <button
                onClick={() => navigate("/portal/product/new")}
                className="mt-6 bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600"
            >
                Thêm sản phẩm
            </button>
        </div>
    );
};

export default FinalizeRegister;
