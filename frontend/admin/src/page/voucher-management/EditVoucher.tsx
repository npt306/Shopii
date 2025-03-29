import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Save, X, ArrowLeft } from 'lucide-react'; // Import icons

// Keep the Voucher interface
interface Voucher {
  id: number;
  name: string;
  description?: string;
  starts_at: string; // Keep as string for input binding
  ends_at: string;   // Keep as string for input binding
  code: string;
  per_customer_limit: number;
  total_usage_limit: number;
  min_order_amount?: number;
  min_products?: number;
  product_ids?: number[];
  condition_type: string;
  action_type: string;
  discount_amount?: number;
  discount_percentage?: number;
  free_shipping_max?: number;
  buy_x_amount?: number;
  get_y_amount?: number;
  created_at: string;
  updated_at: string;
}

// Helper function to format ISO date to 'yyyy-MM-ddThh:mm' for datetime-local input
const formatDateTimeLocal = (isoString: string | undefined): string => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        // Adjust for timezone offset to display correctly in local time input
        const timezoneOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
        const localISOTime = new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
        return localISOTime;
    } catch (e) {
        console.error("Error formatting date:", e);
        return ''; // Return empty string on error
    }
};


export const EditVoucherPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [voucherData, setVoucherData] = useState<Voucher | null>(null); // Initial state null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    document.title = `Chỉnh sửa Voucher #${id}`;
    fetchVoucher();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchVoucher = async () => {
    setLoading(true);
    setError(null);
    setUpdateSuccess(false); // Reset success message on new fetch
    setIsSubmitting(false);
    try {
      const response = await fetch(`/api/vouchers/${id}`);
      if (response.ok) {
        const data = await response.json();
        // Format dates correctly for input fields *after* fetching
        setVoucherData({
            ...data,
            starts_at: formatDateTimeLocal(data.starts_at),
            ends_at: formatDateTimeLocal(data.ends_at),
        });
      } else if (response.status === 404) {
        setError('Không tìm thấy thông tin voucher.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(`Không thể tải thông tin voucher: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      setError(`Đã xảy ra lỗi khi tải thông tin voucher: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!voucherData) return; // Should not happen if loading is false

    const { name, value } = e.target;
    const numericFields = [
      "per_customer_limit", "total_usage_limit", "min_order_amount",
      "min_products", "discount_amount", "discount_percentage",
      "free_shipping_max", "buy_x_amount", "get_y_amount"
    ];

    setVoucherData(prevData => {
        if (!prevData) return null; // Should not happen
        return {
            ...prevData,
            [name]: numericFields.includes(name) ? (parseInt(value, 10) || 0) : value,
        };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherData) return;

    setUpdateSuccess(false);
    setError(null);
    setIsSubmitting(true);

    // Basic date validation
    if (!voucherData.starts_at || !voucherData.ends_at || new Date(voucherData.ends_at) <= new Date(voucherData.starts_at)) {
        setError("Ngày kết thúc phải sau ngày bắt đầu.");
        setIsSubmitting(false);
        return;
    }

    // Prepare data for API (convert dates back to ISO string)
     const apiData = {
        name: voucherData.name,
        description: voucherData.description,
        starts_at: new Date(voucherData.starts_at).toISOString(),
        ends_at: new Date(voucherData.ends_at).toISOString(),
        code: voucherData.code.toUpperCase(),
        per_customer_limit: voucherData.per_customer_limit,
        total_usage_limit: voucherData.total_usage_limit,
        condition_type: voucherData.condition_type,
        action_type: voucherData.action_type,
        // Conditionally include fields based on type selection
        min_order_amount: voucherData.condition_type === 'min_order' ? voucherData.min_order_amount : undefined,
        min_products: voucherData.condition_type === 'min_products' ? voucherData.min_products : undefined,
        product_ids: voucherData.condition_type === 'specific_products' ? voucherData.product_ids : undefined,
        discount_amount: voucherData.action_type === 'fixed_amount' ? voucherData.discount_amount : undefined,
        discount_percentage: ['percentage', 'product_percentage'].includes(voucherData.action_type) ? voucherData.discount_percentage : undefined,
        free_shipping_max: voucherData.action_type === 'free_shipping' ? voucherData.free_shipping_max : undefined,
        buy_x_amount: voucherData.action_type === 'buy_x_get_y' ? voucherData.buy_x_amount : undefined,
        get_y_amount: voucherData.action_type === 'buy_x_get_y' ? voucherData.get_y_amount : undefined,
    };

    // Remove undefined keys before sending
    Object.keys(apiData).forEach(key => apiData[key as keyof typeof apiData] === undefined && delete apiData[key as keyof typeof apiData]);


    try {
      const response = await fetch(`/api/vouchers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        setUpdateSuccess(true);
        // Optionally navigate away after success
        setTimeout(() => navigate(`/admin/vouchers/${id}`), 1500); // Navigate to detail page
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Đã xảy ra lỗi khi cập nhật: ${response.statusText}`);
        console.error('Error updating voucher:', errorData);
      }
    } catch (error) {
      setError(`Đã xảy ra lỗi không mong muốn: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Error updating voucher:', error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to the previous page
  };

  // --- Render States ---
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
        {/* Breadcrumbs */}
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
         <button
            onClick={handleCancel}
            className="mt-4 inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
             <ArrowLeft size={16} className="mr-1" /> Quay lại
          </button>
      </div>
    );
   }

   if (!voucherData) {
       // Should ideally be covered by the error state from fetch, but good fallback
       return <div>Voucher data not available.</div>;
   }

    // --- Common Tailwind input styling ---
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm disabled:bg-gray-100";
    const labelClass = "block text-sm font-medium text-gray-700";


  return (
     <div className="container mx-auto px-4 py-6">
       {/* Breadcrumbs */}
       <div className="mb-4 text-sm text-gray-600 flex items-center">
           <Link to="/admin" className="hover:text-orange-600 transition-colors">Trang chủ</Link>
           <ChevronRight size={16} className="mx-1 text-gray-400" />
           <Link to="/admin/vouchers" className="hover:text-orange-600 transition-colors">Quản lý voucher</Link>
           <ChevronRight size={16} className="mx-1 text-gray-400" />
           <span className="font-medium text-gray-800">Chỉnh sửa voucher</span>
       </div>

      {/* Card */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h4 className="mb-0 text-xl font-semibold text-gray-800">Chỉnh sửa Voucher (ID: {voucherData.id})</h4>
        </div>
        <div className="p-6">
          {updateSuccess && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm" role="alert">
              Voucher đã được cập nhật thành công! Đang chuyển hướng...
            </div>
          )}
          {/* Show non-success error */}
           {error && !updateSuccess && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Section */}
            <div>
               <h5 className="text-base font-semibold text-gray-500 border-b pb-2 mb-4">Thông tin cơ bản</h5>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editVoucherName" className={labelClass}>Tên voucher<span className="text-red-500">*</span></label>
                    <input id="editVoucherName" type="text" name="name" value={voucherData.name} onChange={handleChange} required className={inputClass} disabled={isSubmitting} />
                  </div>
                  <div>
                    <label htmlFor="editVoucherCode" className={labelClass}>Mã voucher<span className="text-red-500">*</span></label>
                    <input id="editVoucherCode" type="text" name="code" value={voucherData.code} onChange={handleChange} required className={`${inputClass} uppercase`} disabled={isSubmitting} />
                    <p className="mt-1 text-xs text-gray-500">Mã voucher sẽ được người dùng nhập.</p>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="editVoucherDescription" className={labelClass}>Mô tả</label>
                    <textarea id="editVoucherDescription" name="description" value={voucherData.description || ''} onChange={handleChange} rows={3} className={inputClass} disabled={isSubmitting}></textarea>
                  </div>
                  <div>
                    <label htmlFor="editVoucherStartDate" className={labelClass}>Ngày bắt đầu<span className="text-red-500">*</span></label>
                    <input id="editVoucherStartDate" type="datetime-local" name="starts_at" value={voucherData.starts_at} onChange={handleChange} required className={inputClass} disabled={isSubmitting} />
                  </div>
                  <div>
                    <label htmlFor="editVoucherEndDate" className={labelClass}>Ngày kết thúc<span className="text-red-500">*</span></label>
                    <input id="editVoucherEndDate" type="datetime-local" name="ends_at" value={voucherData.ends_at} onChange={handleChange} required className={inputClass} disabled={isSubmitting} />
                  </div>
                  <div>
                    <label htmlFor="editVoucherPerCustomerLimit" className={labelClass}>Giới hạn sử dụng / khách</label>
                    <input id="editVoucherPerCustomerLimit" type="number" name="per_customer_limit" value={voucherData.per_customer_limit} onChange={handleChange} min="1" className={inputClass} disabled={isSubmitting} />
                  </div>
                  <div>
                    <label htmlFor="editVoucherTotalUsageLimit" className={labelClass}>Tổng lượt sử dụng tối đa</label>
                    <input id="editVoucherTotalUsageLimit" type="number" name="total_usage_limit" value={voucherData.total_usage_limit} onChange={handleChange} min="1" className={inputClass} disabled={isSubmitting} />
                  </div>
               </div>
            </div>

            {/* Condition Section */}
            <div>
               <h5 className="text-base font-semibold text-gray-500 border-b pb-2 mb-4">Điều kiện áp dụng</h5>
                <div>
                    <label htmlFor="editConditionType" className={labelClass}>Loại điều kiện</label>
                    <select id="editConditionType" name="condition_type" value={voucherData.condition_type} onChange={handleChange} className={inputClass} disabled={isSubmitting}>
                        <option value="none">Không có điều kiện</option>
                        <option value="min_order">Giá trị đơn hàng tối thiểu</option>
                        <option value="min_products">Số lượng sản phẩm tối thiểu</option>
                        <option value="specific_products">Sản phẩm cụ thể (chưa hỗ trợ)</option>
                    </select>
                </div>

                {voucherData.condition_type === "min_order" && (
                    <div className="mt-4">
                        <label htmlFor="editMinOrderAmount" className={labelClass}>Giá trị đơn hàng tối thiểu (VNĐ)</label>
                        <div className="relative">
                            <input id="editMinOrderAmount" type="number" name="min_order_amount" value={voucherData.min_order_amount || 0} onChange={handleChange} min="0" className={`${inputClass} pr-8`} disabled={isSubmitting} />
                             <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">₫</span>
                        </div>
                    </div>
                )}
                {voucherData.condition_type === "min_products" && (
                    <div className="mt-4">
                        <label htmlFor="editMinProducts" className={labelClass}>Số lượng sản phẩm tối thiểu</label>
                        <input id="editMinProducts" type="number" name="min_products" value={voucherData.min_products || 0} onChange={handleChange} min="1" className={inputClass} disabled={isSubmitting} />
                    </div>
                )}
                {voucherData.condition_type === "specific_products" && (
                    <div className="mt-4 border rounded p-3 bg-gray-50 text-sm text-gray-600">
                        Tính năng chọn sản phẩm cụ thể sẽ được cập nhật sau.
                    </div>
                 )}
            </div>

            {/* Action Section */}
            <div>
               <h5 className="text-base font-semibold text-gray-500 border-b pb-2 mb-4">Hành động giảm giá</h5>
                <div>
                    <label htmlFor="editActionType" className={labelClass}>Loại giảm giá</label>
                    <select id="editActionType" name="action_type" value={voucherData.action_type} onChange={handleChange} className={inputClass} disabled={isSubmitting}>
                        <option value="fixed_amount">Giảm theo số tiền cố định</option>
                        <option value="percentage">Giảm theo phần trăm (tổng đơn)</option>
                        <option value="product_percentage">Giảm theo phần trăm (sản phẩm)</option>
                        <option value="free_shipping">Miễn phí vận chuyển</option>
                        <option value="buy_x_get_y">Mua X tặng Y</option>
                    </select>
                </div>

                 {voucherData.action_type === "fixed_amount" && (
                    <div className="mt-4">
                        <label htmlFor="editDiscountAmount" className={labelClass}>Số tiền giảm (VNĐ)</label>
                         <div className="relative">
                            <input id="editDiscountAmount" type="number" name="discount_amount" value={voucherData.discount_amount || 0} onChange={handleChange} min="0" className={`${inputClass} pr-8`} disabled={isSubmitting}/>
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">₫</span>
                        </div>
                    </div>
                 )}
                 {(voucherData.action_type === "percentage" || voucherData.action_type === "product_percentage") && (
                    <div className="mt-4">
                        <label htmlFor="editDiscountPercentage" className={labelClass}>Phần trăm giảm giá (%)</label>
                         <div className="relative">
                            <input id="editDiscountPercentage" type="number" name="discount_percentage" value={voucherData.discount_percentage || 0} onChange={handleChange} min="0" max="100" className={`${inputClass} pr-8`} disabled={isSubmitting}/>
                             <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">%</span>
                        </div>
                    </div>
                 )}
                 {voucherData.action_type === "free_shipping" && (
                    <div className="mt-4">
                        <label htmlFor="editFreeShippingMax" className={labelClass}>Mức hỗ trợ vận chuyển tối đa (VNĐ)</label>
                         <div className="relative">
                            <input id="editFreeShippingMax" type="number" name="free_shipping_max" value={voucherData.free_shipping_max || 0} onChange={handleChange} min="0" className={`${inputClass} pr-8`} disabled={isSubmitting}/>
                             <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">₫</span>
                        </div>
                    </div>
                 )}
                 {voucherData.action_type === "buy_x_get_y" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                         <div>
                            <label htmlFor="editBuyXAmount" className={labelClass}>Mua X sản phẩm</label>
                            <input id="editBuyXAmount" type="number" name="buy_x_amount" value={voucherData.buy_x_amount || 0} onChange={handleChange} min="1" className={inputClass} disabled={isSubmitting}/>
                         </div>
                         <div>
                            <label htmlFor="editGetYAmount" className={labelClass}>Tặng Y sản phẩm</label>
                            <input id="editGetYAmount" type="number" name="get_y_amount" value={voucherData.get_y_amount || 0} onChange={handleChange} min="1" className={inputClass} disabled={isSubmitting}/>
                         </div>
                    </div>
                 )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-5 border-t">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium disabled:opacity-50"
              >
                 <X size={16} className="inline mr-1" /> Hủy
              </button>
               <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Đang cập nhật...
                    </>
                ) : (
                    <> <Save size={16} className="inline mr-1" /> Cập nhật </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};