import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react'; // Import icons

interface Voucher {
  id: number;
  name: string;
  description?: string;
  code: string;
  starts_at: string;
  ends_at: string;
  per_customer_limit: number;
  total_usage_limit: number;
  condition_type: string;
  min_order_amount?: number;
  min_products?: number;
  product_ids?: number[];
  action_type: string;
  discount_amount?: number;
  discount_percentage?: number;
  free_shipping_max?: number;
  buy_x_amount?: number;
  get_y_amount?: number;
  created_at: string;
  updated_at: string;
}

export const VoucherDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Chi tiết Voucher";
    fetchVoucher();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchVoucher = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/vouchers/${id}`);
      if (response.ok) {
        const data = await response.json();
        setVoucher(data);
      } else if (response.status === 404) {
        setError('Voucher không tồn tại.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(`Không thể tải chi tiết voucher: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      setError(`Đã xảy ra lỗi khi tải chi tiết voucher: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        <span className="ml-3 text-gray-600">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4 text-sm text-gray-600 flex items-center">
           <Link to="/admin" className="hover:text-orange-600 transition-colors">Trang chủ</Link>
           <ChevronRight size={16} className="mx-1 text-gray-400" />
           <Link to="/admin/vouchers" className="hover:text-orange-600 transition-colors">Quản lý voucher</Link>
           <ChevronRight size={16} className="mx-1 text-gray-400" />
           <span className="font-medium text-gray-800">Lỗi</span>
        </div>
        <div className="p-4 bg-red-100 text-red-700 border border-red-400 rounded">
          {error}
        </div>
        <Link
            to="/admin/vouchers"
            className="mt-4 inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            <ArrowLeft size={16} className="mr-1" /> Quay lại danh sách
        </Link>
      </div>
    );
  }

   if (!voucher) {
      return (
          <div className="container mx-auto px-4 py-6">
               <div className="p-4 bg-yellow-100 text-yellow-700 border border-yellow-400 rounded">
                   Voucher không tồn tại.
               </div>
                <Link
                    to="/admin/vouchers"
                    className="mt-4 inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                >
                    <ArrowLeft size={16} className="mr-1" /> Quay lại danh sách
                </Link>
          </div>
      );
   }


  // Helper functions for display text
  const getConditionText = (type: string) => {
    switch (type) {
      case 'min_order': return 'Giá trị đơn hàng tối thiểu';
      case 'min_products': return 'Số lượng sản phẩm tối thiểu';
      case 'specific_products': return 'Sản phẩm cụ thể';
      default: return 'Không có';
    }
  };

  const getActionText = (type: string) => {
    switch (type) {
      case 'fixed_amount': return 'Giảm giá cố định';
      case 'percentage': return 'Giảm giá phần trăm';
      case 'product_percentage': return 'Giảm giá sản phẩm theo phần trăm';
      case 'free_shipping': return 'Miễn phí vận chuyển';
      case 'buy_x_get_y': return 'Mua X tặng Y';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <div className="mb-4 text-sm text-gray-600 flex items-center">
        <Link to="/admin" className="hover:text-orange-600 transition-colors">Trang chủ</Link>
        <ChevronRight size={16} className="mx-1 text-gray-400" />
        <Link to="/admin/vouchers" className="hover:text-orange-600 transition-colors">Quản lý voucher</Link>
        <ChevronRight size={16} className="mx-1 text-gray-400" />
        <span className="font-medium text-gray-800">Chi tiết voucher</span>
      </div>

      {/* Main Content Card */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
           <h4 className="text-xl font-semibold text-gray-800">Chi tiết Voucher - #{voucher.id}</h4>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            {/* Column 1 */}
            <div>
              <h5 className="font-medium text-gray-500 mb-1">Tên Voucher</h5>
              <p className="text-gray-900">{voucher.name}</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-500 mb-1">Mã Voucher</h5>
              <p className="text-gray-900 uppercase font-mono">{voucher.code}</p>
            </div>
            <div className="md:col-span-2">
              <h5 className="font-medium text-gray-500 mb-1">Mô tả</h5>
              <p className="text-gray-700 whitespace-pre-wrap">{voucher.description || 'N/A'}</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-500 mb-1">Ngày bắt đầu</h5>
              <p className="text-gray-700">{new Date(voucher.starts_at).toLocaleString()}</p>
            </div>
            <div>
              <h5 className="font-medium text-gray-500 mb-1">Ngày kết thúc</h5>
              <p className="text-gray-700">{new Date(voucher.ends_at).toLocaleString()}</p>
            </div>

            {/* Column 2 */}
             <div>
              <h5 className="font-medium text-gray-500 mb-1">Giới hạn sử dụng/khách</h5>
              <p className="text-gray-900">{voucher.per_customer_limit}</p>
            </div>
             <div>
              <h5 className="font-medium text-gray-500 mb-1">Tổng lượt sử dụng tối đa</h5>
              <p className="text-gray-900">{voucher.total_usage_limit}</p>
            </div>
            <div className="md:col-span-2 border-t pt-4 mt-2">
                <h5 className="font-medium text-gray-500 mb-1">Điều kiện áp dụng</h5>
                <p className="text-gray-900">{getConditionText(voucher.condition_type)}</p>
                {voucher.condition_type === 'min_order' && (
                    <p className="text-gray-700 mt-1 pl-4">Giá trị tối thiểu: {voucher.min_order_amount?.toLocaleString()} ₫</p>
                )}
                {voucher.condition_type === 'min_products' && (
                    <p className="text-gray-700 mt-1 pl-4">Số lượng tối thiểu: {voucher.min_products}</p>
                )}
                {voucher.condition_type === 'specific_products' && (
                    <p className="text-gray-700 mt-1 pl-4">
                        ID Sản phẩm: {voucher.product_ids && voucher.product_ids.length > 0 ? voucher.product_ids.join(', ') : "N/A"}
                    </p>
                 )}
            </div>
             <div className="md:col-span-2 border-t pt-4 mt-2">
                <h5 className="font-medium text-gray-500 mb-1">Hành động giảm giá</h5>
                <p className="text-gray-900">{getActionText(voucher.action_type)}</p>
                 {voucher.action_type === 'fixed_amount' && (
                    <p className="text-gray-700 mt-1 pl-4">Số tiền giảm: {voucher.discount_amount?.toLocaleString()} ₫</p>
                 )}
                 {(voucher.action_type === 'percentage' || voucher.action_type === 'product_percentage') && (
                    <p className="text-gray-700 mt-1 pl-4">Phần trăm giảm: {voucher.discount_percentage}%</p>
                 )}
                 {voucher.action_type === "free_shipping" && (
                    <p className="text-gray-700 mt-1 pl-4">Hỗ trợ tối đa: {voucher.free_shipping_max?.toLocaleString()} ₫</p>
                 )}
                 {voucher.action_type === "buy_x_get_y" && (
                    <>
                        <p className="text-gray-700 mt-1 pl-4">Mua X sản phẩm: {voucher.buy_x_amount}</p>
                        <p className="text-gray-700 mt-1 pl-4">Tặng Y sản phẩm: {voucher.get_y_amount}</p>
                    </>
                 )}
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-6 border-t pt-4">
            <Link
              to="/admin/vouchers"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm transition-colors"
            >
               <ArrowLeft size={16} className="mr-1" /> Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};