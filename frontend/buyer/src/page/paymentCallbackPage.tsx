import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { HomeLayout } from "../layout/home";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<
    "loading" | "success" | "failed" | "invalid"
  >("loading");
  const [message, setMessage] = useState("Processing payment information...");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);

  useEffect(() => {
    const responseCode = searchParams.get("vnp_ResponseCode");
    const txnRef = searchParams.get("vnp_TxnRef");
    const vnpAmount = searchParams.get("vnp_Amount");

    if (txnRef) {
      setOrderId(txnRef.split("_")[0]);
    }
    if (vnpAmount) {
      setAmount((parseInt(vnpAmount) / 100).toLocaleString("vi-VN"));
    }

    if (responseCode === "00") {
      setPaymentStatus("success");
      setMessage("Thanh toán thành công!");
    } else if (responseCode) {
      setPaymentStatus("failed");
      setMessage(
        `Thanh toán thất bại. Mã lỗi: ${responseCode}. Vui lòng thử lại hoặc liên hệ hỗ trợ.`
      );
    } else {
      setPaymentStatus("invalid");
      setMessage("Thông tin thanh toán không hợp lệ.");
    }
  }, [searchParams]);

  return (
    <HomeLayout>
      <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-center min-h-[50vh] flex flex-col items-center justify-center">
        {paymentStatus === "loading" && (
          <div className="text-gray-600">{message}</div>
        )}

        {paymentStatus === "success" && (
          <div className="text-green-600">
            <FaCheckCircle size={50} className="mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">{message}</h2>
            {orderId && <p>Mã đơn hàng của bạn: <strong>{orderId}</strong></p>}
            {amount && <p>Số tiền đã thanh toán: <strong>₫{amount}</strong></p>}
            <p className="mt-4">Cảm ơn bạn đã mua hàng!</p>
          </div>
        )}

        {paymentStatus === "failed" && (
          <div className="text-red-600">
            <FaTimesCircle size={50} className="mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Thanh toán thất bại</h2>
            <p>{message}</p>
          </div>
        )}

        <Link to="/home" className="mt-6 inline-block px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">Quay về trang chủ</Link>
      </div>
    </HomeLayout>
  );
};

export default PaymentCallbackPage; 