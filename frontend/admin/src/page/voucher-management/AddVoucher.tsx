import React, { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Plus, Save, X } from 'lucide-react'; // Import icons

export const AddVoucherPage = () => {
  const navigate = useNavigate();
  const [voucherData, setVoucherData] = useState({
    name: "",
    description: "",
    starts_at: "",
    ends_at: "",
    code: "",
    per_customer_limit: 1,
    total_usage_limit: 100,
    min_order_amount: 0,
    min_products: 0,
    condition_type: "none",
    action_type: "fixed_amount",
    discount_amount: 0,
    discount_percentage: 0,
    product_ids: [], // Keep as empty array for now
    free_shipping_max: 0,
    buy_x_amount: 0,
    get_y_amount: 0
  });

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Thêm Voucher";
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numericFields = [
      "per_customer_limit", "total_usage_limit", "min_order_amount",
      "min_products", "discount_amount", "discount_percentage",
      "free_shipping_max", "buy_x_amount", "get_y_amount"
    ];

    setVoucherData(prevData => ({
      ...prevData,
      [name]: numericFields.includes(name) ? (parseInt(value, 10) || 0) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);
    setSubmitError(null);
    setIsSubmitting(true);

    // Basic date validation
    if (!voucherData.starts_at || !voucherData.ends_at || new Date(voucherData.ends_at) <= new Date(voucherData.starts_at)) {
        setSubmitError("Ngày kết thúc phải sau ngày bắt đầu.");
        setIsSubmitting(false);
        return;
    }

    // Prepare data for API
    const apiData = {
      ...voucherData,
      starts_at: new Date(voucherData.starts_at).toISOString(),
      ends_at: new Date(voucherData.ends_at).toISOString(),
      code: voucherData.code.toUpperCase(), // Ensure code is uppercase
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
      const response = await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        // Reset form after successful submission
        handleCancel(); // Use handleCancel to reset
         // Optionally navigate away
         // setTimeout(() => navigate('/admin/vouchers'), 1500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setSubmitError(errorData.message || `Đã xảy ra lỗi: ${response.statusText}`);
        console.error("Error creating voucher:", errorData);
      }
    } catch (error) {
      setSubmitError(`Đã xảy ra lỗi không mong muốn: ${error instanceof Error ? error.message : String(error)}`);
      console.error("Error creating voucher:", error);
    } finally {
        setIsSubmitting(false);
    }
  };

    const handleCancel = () => {
        setVoucherData({
            name: "", description: "", starts_at: "", ends_at: "", code: "",
            per_customer_limit: 1, total_usage_limit: 100, min_order_amount: 0,
            min_products: 0, condition_type: "none", action_type: "fixed_amount",
            discount_amount: 0, discount_percentage: 0, product_ids: [],
            free_shipping_max: 0, buy_x_amount: 0, get_y_amount: 0
        });
        setSubmitSuccess(false);
        setSubmitError(null);
        setIsSubmitting(false);
        // Optionally navigate back: navigate('/admin/vouchers');
    };

    // Common Tailwind input styling
    const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm disabled:bg-gray-50";
    const labelClass = "block text-sm font-medium text-gray-700";


  return (
    <div className="container mx-auto px-4 py-6">
       {/* Breadcrumbs */}
       <div className="mb-4 text-sm text-gray-600 flex items-center">
           <Link to="/admin" className="hover:text-orange-600 transition-colors">Trang chủ</Link>
           <ChevronRight size={16} className="mx-1 text-gray-400" />
           <Link to="/admin/vouchers" className="hover:text-orange-600 transition-colors">Quản lý voucher</Link>
           <ChevronRight size={16} className="mx-1 text-gray-400" />
           <span className="font-medium text-gray-800">Thêm voucher</span>
       </div>

      {/* Card */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h4 className="mb-0 text-xl font-semibold text-gray-800">Thêm Voucher Mới</h4>
        </div>
        <div className="p-6">
          {submitSuccess && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm" role="alert">
              Voucher đã được tạo thành công!
            </div>
          )}
          {submitError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm" role="alert">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Section */}
            <div>
               <h5 className="text-base font-semibold text-gray-500 border-b pb-2 mb-4">Thông tin cơ bản</h5>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="formVoucherName" className={labelClass}>Tên voucher<span className="text-red-500">*</span></label>
                    <input id="formVoucherName" type="text" name="name" value={voucherData.name} onChange={handleChange} placeholder="Nhập tên voucher" required className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="formVoucherCode" className={labelClass}>Mã voucher<span className="text-red-500">*</span></label>
                    <input id="formVoucherCode" type="text" name="code" value={voucherData.code} onChange={handleChange} placeholder="Nhập mã voucher" required className={`${inputClass} uppercase`} />
                    <p className="mt-1 text-xs text-gray-500">Mã voucher sẽ được người dùng nhập để áp dụng giảm giá.</p>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="formVoucherDescription" className={labelClass}>Mô tả</label>
                    <textarea id="formVoucherDescription" name="description" value={voucherData.description} onChange={handleChange} placeholder="Nhập mô tả cho voucher (tùy chọn)" rows={3} className={inputClass}></textarea>
                  </div>
                  <div>
                    <label htmlFor="formVoucherStartDate" className={labelClass}>Ngày bắt đầu<span className="text-red-500">*</span></label>
                    <input id="formVoucherStartDate" type="datetime-local" name="starts_at" value={voucherData.starts_at} onChange={handleChange} required className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="formVoucherEndDate" className={labelClass}>Ngày kết thúc<span className="text-red-500">*</span></label>
                    <input id="formVoucherEndDate" type="datetime-local" name="ends_at" value={voucherData.ends_at} onChange={handleChange} required className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="formVoucherPerCustomerLimit" className={labelClass}>Giới hạn sử dụng / khách</label>
                    <input id="formVoucherPerCustomerLimit" type="number" name="per_customer_limit" value={voucherData.per_customer_limit} onChange={handleChange} min="1" className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="formVoucherTotalUsageLimit" className={labelClass}>Tổng lượt sử dụng tối đa</label>
                    <input id="formVoucherTotalUsageLimit" type="number" name="total_usage_limit" value={voucherData.total_usage_limit} onChange={handleChange} min="1" className={inputClass} />
                  </div>
               </div>
            </div>

            {/* Condition Section */}
            <div>
               <h5 className="text-base font-semibold text-gray-500 border-b pb-2 mb-4">Điều kiện áp dụng</h5>
                <div>
                    <label htmlFor="formConditionType" className={labelClass}>Loại điều kiện</label>
                    <select id="formConditionType" name="condition_type" value={voucherData.condition_type} onChange={handleChange} className={inputClass}>
                        <option value="none">Không có điều kiện</option>
                        <option value="min_order">Giá trị đơn hàng tối thiểu</option>
                        <option value="min_products">Số lượng sản phẩm tối thiểu</option>
                        <option value="specific_products">Sản phẩm cụ thể (chưa hỗ trợ)</option>
                    </select>
                </div>

                {voucherData.condition_type === "min_order" && (
                    <div className="mt-4">
                        <label htmlFor="formMinOrderAmount" className={labelClass}>Giá trị đơn hàng tối thiểu (VNĐ)</label>
                        <div className="relative">
                            <input id="formMinOrderAmount" type="number" name="min_order_amount" value={voucherData.min_order_amount} onChange={handleChange} min="0" className={`${inputClass} pr-8`} />
                            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">₫</span>
                        </div>
                    </div>
                )}
                {voucherData.condition_type === "min_products" && (
                    <div className="mt-4">
                        <label htmlFor="formMinProducts" className={labelClass}>Số lượng sản phẩm tối thiểu</label>
                        <input id="formMinProducts" type="number" name="min_products" value={voucherData.min_products} onChange={handleChange} min="1" className={inputClass} />
                    </div>
                )}
                {/* Placeholder for specific_products UI */}
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
                    <label htmlFor="formActionType" className={labelClass}>Loại giảm giá</label>
                    <select id="formActionType" name="action_type" value={voucherData.action_type} onChange={handleChange} className={inputClass}>
                        <option value="fixed_amount">Giảm theo số tiền cố định</option>
                        <option value="percentage">Giảm theo phần trăm (tổng đơn)</option>
                        <option value="product_percentage">Giảm theo phần trăm (sản phẩm)</option>
                        <option value="free_shipping">Miễn phí vận chuyển</option>
                        <option value="buy_x_get_y">Mua X tặng Y</option>
                    </select>
                </div>

                 {voucherData.action_type === "fixed_amount" && (
                    <div className="mt-4">
                        <label htmlFor="formDiscountAmount" className={labelClass}>Số tiền giảm (VNĐ)</label>
                        <div className="relative">
                            <input id="formDiscountAmount" type="number" name="discount_amount" value={voucherData.discount_amount} onChange={handleChange} min="0" className={`${inputClass} pr-8`} />
                             <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">₫</span>
                        </div>
                    </div>
                 )}
                 {(voucherData.action_type === "percentage" || voucherData.action_type === "product_percentage") && (
                    <div className="mt-4">
                        <label htmlFor="formDiscountPercentage" className={labelClass}>Phần trăm giảm giá (%)</label>
                         <div className="relative">
                            <input id="formDiscountPercentage" type="number" name="discount_percentage" value={voucherData.discount_percentage} onChange={handleChange} min="0" max="100" className={`${inputClass} pr-8`} />
                             <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">%</span>
                        </div>
                    </div>
                 )}
                 {voucherData.action_type === "free_shipping" && (
                    <div className="mt-4">
                        <label htmlFor="formFreeShippingMax" className={labelClass}>Mức hỗ trợ vận chuyển tối đa (VNĐ)</label>
                         <div className="relative">
                            <input id="formFreeShippingMax" type="number" name="free_shipping_max" value={voucherData.free_shipping_max} onChange={handleChange} min="0" className={`${inputClass} pr-8`} />
                             <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">₫</span>
                        </div>
                    </div>
                 )}
                 {voucherData.action_type === "buy_x_get_y" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                         <div>
                            <label htmlFor="formBuyXAmount" className={labelClass}>Mua X sản phẩm</label>
                            <input id="formBuyXAmount" type="number" name="buy_x_amount" value={voucherData.buy_x_amount} onChange={handleChange} min="1" className={inputClass} />
                         </div>
                         <div>
                            <label htmlFor="formGetYAmount" className={labelClass}>Tặng Y sản phẩm</label>
                            <input id="formGetYAmount" type="number" name="get_y_amount" value={voucherData.get_y_amount} onChange={handleChange} min="1" className={inputClass} />
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
                        Đang tạo...
                    </>
                ) : (
                    <> <Save size={16} className="inline mr-1" /> Tạo Voucher </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};