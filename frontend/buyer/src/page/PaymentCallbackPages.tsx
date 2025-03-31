import React, { useEffect, useState } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { API_GATEWAY_URL } from '../config/url';
import { OrderDetail } from '../types/order';

interface CallbackPageProps {
    success: boolean;
}

const PaymentCallbackPage: React.FC<CallbackPageProps> = ({ success }) => {
    const location = useLocation();
    const [orderId, setOrderId] = useState<string | null>(null);
    const [vnpCode, setVnpCode] = useState<string | null>(null);
    const [orderStatus, setOrderStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const extractedOrderId = params.get('orderId')?.split('_')[0]; // Extract order ID part if needed
        const code = params.get('code');

        setOrderId(extractedOrderId);
        setVnpCode(code);

        // Set initial status based on page type
        if (!success) {
            setOrderStatus('Thanh toán thất bại');
            setLoading(false);
            return;
        }

        // If success page, poll for final order status confirmed by IPN
        if (extractedOrderId) {
            document.title = success ? "Thanh toán thành công" : "Thanh toán thất bại";
            let attempts = 0;
            const maxAttempts = 5; // Poll up to 5 times
            const interval = setInterval(async () => {
                attempts++;
                try {
                    const response = await axios.get<OrderDetail>(`${API_GATEWAY_URL}/api/order/${extractedOrderId}`);
                    const fetchedOrder = response.data;

                    if (fetchedOrder.paymentStatus === 'Paid') {
                        setOrderStatus('Thanh toán thành công!');
                        setLoading(false);
                        clearInterval(interval);
                    } else if (fetchedOrder.paymentStatus === 'Failed') {
                         setOrderStatus('Thanh toán thất bại.');
                         setLoading(false);
                         clearInterval(interval);
                    } else if (attempts >= maxAttempts) {
                        setOrderStatus('Đang chờ xác nhận thanh toán...'); // Still pending after polling
                        setLoading(false);
                        clearInterval(interval);
                    }
                    // Continue polling if still PENDING and attempts < maxAttempts

                } catch (err) {
                    console.error("Error polling order status:", err);
                    setError('Không thể lấy trạng thái đơn hàng.');
                    setLoading(false);
                    clearInterval(interval);
                }
            }, 3000); // Poll every 3 seconds

            return () => clearInterval(interval); // Cleanup interval on unmount
        } else {
            setError('Thiếu thông tin đơn hàng.');
            setLoading(false);
        }
    }, [location.search, success]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
                {loading ? (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang xử lý thanh toán...</p>
                    </>
                ) : error ? (
                     <>
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-semibold text-red-700 mb-2">Lỗi</h1>
                        <p className="text-gray-700 mb-4">{error}</p>
                        {orderId && <p className="text-sm text-gray-500 mb-6">Mã đơn hàng: {orderId}</p>}
                        <Link to="/home" className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition">
                            Quay lại trang chủ
                        </Link>
                     </>
                ) : success && orderStatus === 'Thanh toán thành công!' ? (
                    <>
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-semibold text-green-700 mb-2">Thanh toán thành công!</h1>
                        <p className="text-gray-700 mb-4">Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.</p>
                        <p className="text-sm text-gray-500 mb-6">Mã đơn hàng: {orderId}</p>
                        <Link to={`/user/purchase`} className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition mr-2">
                            Xem đơn hàng
                        </Link>
                        <Link to="/home" className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition">
                            Tiếp tục mua sắm
                        </Link>
                    </>
                ) : ( // Failed or Pending Confirmation
                    <>
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-semibold text-red-700 mb-2">{orderStatus || 'Thanh toán không thành công'}</h1>
                        <p className="text-gray-700 mb-4">
                            {orderStatus === 'Đang chờ xác nhận thanh toán...'
                                ? 'Chúng tôi đang chờ xác nhận cuối cùng từ VNPay. Vui lòng kiểm tra lại trạng thái đơn hàng sau.'
                                : 'Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.'}
                        </p>
                        <p className="text-sm text-gray-500 mb-6">Mã đơn hàng: {orderId}</p>
                        <p className="text-xs text-gray-400 mb-4">Mã lỗi VNPay: {vnpCode}</p>
                        <Link to="/cart" className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600 transition mr-2">
                            Thử lại thanh toán
                        </Link>
                         <Link to="/home" className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition">
                            Về trang chủ
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export const PaymentSuccessPage = () => <PaymentCallbackPage success={true} />;
export const PaymentFailPage = () => <PaymentCallbackPage success={false} />;