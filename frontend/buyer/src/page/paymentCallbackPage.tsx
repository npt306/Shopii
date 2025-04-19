import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { HomeLayout } from "../layout/home";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import axios from "axios";
import { EnvValue } from "../env-value/envValue";

const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState<
    "loading" | "success" | "failed" | "invalid"
  >("loading");
  const [message, setMessage] = useState("Processing payment information...");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [isUpdatingBackend, setIsUpdatingBackend] = useState(false);

  useEffect(() => {
    const processPayment = async () => {
      setIsUpdatingBackend(true);
      setMessage("Processing payment and updating order status...");

      const responseCode = searchParams.get("vnp_ResponseCode");
      const txnRef = searchParams.get("vnp_TxnRef");
      const vnpAmount = searchParams.get("vnp_Amount");
      let statusToUpdateApi: "Paid" | "Failed" | null = null;
      let extractedSessionId: string | null = null;

      if (txnRef) {
        const parts = txnRef.split('_');
        if (parts.length > 0) {
            extractedSessionId = parts[0];
            setCheckoutSessionId(extractedSessionId);
        }
        setOrderId(txnRef);
      }

      if (vnpAmount) {
        setAmount((parseInt(vnpAmount) / 100).toLocaleString("vi-VN"));
      }

      if (responseCode === "00") {
        setPaymentStatus("success");
        setMessage("Thanh toán thành công! Đang cập nhật trạng thái đơn hàng...");
        statusToUpdateApi = "Paid";
      } else if (responseCode) {
        setPaymentStatus("failed");
        setMessage(
          `Thanh toán thất bại. Mã lỗi: ${responseCode}. Đang cập nhật trạng thái đơn hàng...`
        );
        statusToUpdateApi = "Failed";
      } else {
        setPaymentStatus("invalid");
        setMessage("Thông tin thanh toán không hợp lệ.");
        setIsUpdatingBackend(false);
        return;
      }

      if (statusToUpdateApi && extractedSessionId) {
        try {
          const updateUrl = `${EnvValue.API_GATEWAY_URL}/order/sessions/${extractedSessionId}/payment-status`;

          console.log(`Sending PATCH request to ${updateUrl} for session ${extractedSessionId} with status ${statusToUpdateApi}`);

          await axios.patch(
            updateUrl,
            { status: statusToUpdateApi },
          );

          console.log(`Backend update successful for session ${extractedSessionId}`);
          if (statusToUpdateApi === "Paid") {
            setMessage("Thanh toán thành công và đơn hàng đã được cập nhật!");
          } else {
            setMessage(`Thanh toán thất bại (Mã lỗi: ${responseCode}) và đơn hàng đã được cập nhật.`);
          }
        } catch (error: any) {
          console.error("Error updating backend status via Order Service:", error);
          setMessage(
            `Thanh toán ${statusToUpdateApi === 'Paid' ? 'thành công' : 'thất bại'} nhưng không thể cập nhật trạng thái đơn hàng. Vui lòng kiểm tra lịch sử đơn hàng hoặc liên hệ hỗ trợ. Lỗi: ${error.response?.data?.message || error.message}`
          );
        } finally {
          setIsUpdatingBackend(false);
        }
      } else {
          setMessage("Không thể cập nhật trạng thái đơn hàng do thiếu thông tin (Session ID).");
          setIsUpdatingBackend(false);
      }
    };

    processPayment();
  }, [searchParams]);

  return (
    <HomeLayout>
      <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-center min-h-[50vh] flex flex-col items-center justify-center">
        {paymentStatus === "loading" || isUpdatingBackend ? (
          <div className="text-gray-600 flex flex-col items-center">
             <FaSpinner className="animate-spin text-4xl mb-4 text-blue-500" />
            {message}
          </div>
        ) : paymentStatus === "success" ? (
          <div className="text-green-600">
            <FaCheckCircle size={50} className="mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Thanh toán thành công</h2>
             <p>{message}</p>
            {orderId && <p>Mã giao dịch tham chiếu: <strong>{orderId}</strong></p>}
            {amount && <p>Số tiền đã thanh toán: <strong>₫{amount}</strong></p>}
            <p className="mt-4">Cảm ơn bạn đã mua hàng!</p>
          </div>
        ) : paymentStatus === "failed" ? (
          <div className="text-red-600">
            <FaTimesCircle size={50} className="mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Thanh toán thất bại</h2>
            <p>{message}</p>
          </div>
        ) : (
             <div className="text-yellow-600">
                 <FaTimesCircle size={50} className="mx-auto mb-4" />
                 <h2 className="text-2xl font-semibold mb-2">Thông tin không hợp lệ</h2>
                 <p>{message}</p>
             </div>
         )}

        {!isUpdatingBackend && paymentStatus !== 'loading' && (
             <Link to="/home" className="mt-6 inline-block px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">Quay về trang chủ</Link>
        )}
      </div>
    </HomeLayout>
  );
};

export default PaymentCallbackPage; 