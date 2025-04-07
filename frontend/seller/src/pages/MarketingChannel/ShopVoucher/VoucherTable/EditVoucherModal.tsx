import React, { useState, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import { FaCheck } from "react-icons/fa6";
import { AiFillShop } from "react-icons/ai";
import { SiShopee } from "react-icons/si";
import axios from "axios";
import { EnvValue } from "../../../../env-value/envValue";
import { EditVoucherModalProps, SellerVoucher } from "../Shared/Interfaces";
import ConfirmModal from "../Shared/ConfirmModal";
import { toast } from "react-toastify";
import { SellerProductsModal } from "../Shared/SellerProductsModal";
import { Product } from "../Shared/Interfaces";

export const EditVoucherModal: React.FC<EditVoucherModalProps> = ({
  isOpen,
  onClose,
  voucherData,
  onSave,
}) => {
  const [formData, setFormData] = useState<SellerVoucher>(voucherData);
  const [prevFormData, setPrevFormData] = useState<SellerVoucher>(voucherData);
  const started = new Date(prevFormData.starts_at) < new Date() ? true : false;
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        // `${EnvValue.API_GATEWAY_URL}/api/product/seller/${sellerid}`
        `http://localhost:3001/product/seller/${voucherData.sellerid}`
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  useEffect(() => {
    if (voucherData) {
      setFormData(voucherData);
      setPrevFormData(voucherData);
    }
  }, [voucherData]);

  if (!voucherData) {
    return null; // Do not render the modal if voucherData is null
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as
      | HTMLInputElement
      | HTMLSelectElement;
    console.log(formData);

    let parsedValue: string | number | boolean = value;

    if (type === "number") {
      parsedValue = parseFloat(value);
    } else if (name === "is_public") {
      // Convert string "true"/"false" to boolean
      parsedValue = value === "true";
    } else if (type === "checkbox") {
      parsedValue = checked;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: parsedValue,
    }));
  };

  const checkFormValidation = () => {
    const errors: Record<string, string> = {};

    // Check required string fields
    if (!formData.name.trim()) errors.name = "Tên không được để trống.";
    if (!formData.code.trim()) errors.code = "Mã không được để trống.";
    if (formData.code.length !== 5) errors.code = "Mã phải có đúng 5 ký tự.";

    // Check required numbers
    if (formData.discount_value <= 0)
      errors.discount_value = "Giá trị giảm giá phải lớn hơn 0.";
    if (formData.max_usage <= 0)
      errors.max_usage = "Số lượng sử dụng tối đa phải lớn hơn 0.";
    if (formData.usage_per_user <= 0)
      errors.usage_per_user = "Số lần sử dụng trên mỗi người phải lớn hơn 0.";

    if (
      formData.discount_type === "percentage" &&
      formData.discount_value > 100
    )
      errors.discount_value =
        "Giá trị giảm giá theo phần trăm không được lớn hơn 100%.";
    // Validate dates
    if (!formData.starts_at.trim())
      errors.starts_at = "Ngày bắt đầu không được để trống.";
    if (!formData.ends_at.trim())
      errors.ends_at = "Ngày kết thúc không được để trống.";
    else if (new Date(formData.starts_at) >= new Date(formData.ends_at)) {
      errors.ends_at = "Ngày kết thúc phải sau ngày bắt đầu.";
    }

    // Return validation result
    return errors;
  };

  const formatVoucherData = () => {
    formData.starts_at = new Date(formData.starts_at).toISOString();
    formData.ends_at = new Date(formData.ends_at).toISOString();
    formData.discount_value = Number(formData.discount_value);
    formData.min_order = Number(formData.min_order);
    formData.max_usage = Number(formData.max_usage);
    formData.usage_per_user = Number(formData.usage_per_user);
  };
  const handleConfirm = (selectedProductIds: number[]) => {
    setFormData((prevData) => ({
      ...prevData,
      product_id: selectedProductIds,
    }));
    console.log("Selected Product IDs:", selectedProductIds);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    formatVoucherData();
    const errors = checkFormValidation();
    if (Object.keys(errors).length > 0) {
      console.log("Validation Errors:", errors);
      alert("Vui lòng kiểm tra lại thông tin.");
      return;
    }

    try {
      const { CreatedAt, UpdatedAt, id, ...filteredData } = formData;
      console.log("Form data to be submitted:", filteredData);
      const response = await axios.put(
        `${EnvValue.API_GATEWAY_URL}/api/vouchers/seller-vouchers/${formData.id}`,
        filteredData
      );
      console.log("Voucher updated:", response.data);
      toast.success("Cập nhật voucher thành công");
      setPrevFormData(formData);

      onSave();
      onClose();
      setModalOpen(false);
    } catch (error) {
      console.error("Error updating voucher:", error);
      toast.error("Cập nhật voucher thất bại");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="text-black fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="max-h-[90vh] bg-white w-3/4 max-w-5xl p-6 rounded shadow-lg ">
        <h2 className="text-2xl font-bold mb-4">Chỉnh sửa Voucher</h2>
        <form
          className="max-h-[75vh] overflow-y-auto add-voucher-form grid grid-cols-9 gap-4 bg-white shadow-sm text-black p-4"
          onSubmit={handleSubmit}
        >
          {/* Section Title */}
          <div className="form-title col-span-full text-2xl mb-4">
            Thông tin cơ bản
          </div>

          {/* Loại mã */}
          <div className="input-label col-span-2 flex items-center justify-end mr-1">
            Loại mã
          </div>
          <div className="input-body col-span-7">
            <div className="flex space-x-4">
              {/* Public Card */}
              <label
                className={`relative cursor-pointer p-4 border shadow-md w-1/2 text-center transition ${
                  formData.voucher_type === "shop_wide"
                    ? "border-orange-600 bg-orange-100 text-orange-600"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
                onClick={() =>
                  setFormData({ ...formData, voucher_type: "shop_wide" })
                }
              >
                <input
                  type="radio"
                  name="voucher_type"
                  value="shop_wide"
                  checked={formData.voucher_type === "shop_wide"}
                  onChange={handleChange}
                  className="hidden"
                />
                <div className="flex items-center justify-center mb-2">
                  <AiFillShop
                    className={`w-5 h-5 mr-2 ${
                      formData.voucher_type === "shop_wide" ? "#EE4D2D" : "#000"
                    }`}
                  />
                  Voucher toàn Shop
                </div>
                {/* Check Icon Appears When Selected */}
                {formData.voucher_type === "shop_wide" && (
                  <div className="absolute top-0 right-0">
                    <div className="triangle-bg" />
                    <FaCheck className="absolute top-0 right-0 text-white text-sm" />
                  </div>
                )}
              </label>

              {/* Private Card */}
              {prevFormData.voucher_type === "product_specific" && (
                <label
                  className={`relative cursor-pointer p-4 border shadow-md w-1/2 text-center transition ${
                    formData.voucher_type === "product_specific"
                      ? "border-orange-600 bg-orange-100 text-orange-600"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                  onClick={() =>
                    voucherData.voucher_type === "product_specific" &&
                    setFormData({
                      ...formData,
                      voucher_type: "product_specific",
                    })
                  }
                >
                  <input
                    type="radio"
                    name="voucher_type"
                    value="product_specific"
                    checked={formData.voucher_type === "product_specific"}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center mb-2">
                    <SiShopee
                      className={`w-5 h-5 mr-2 ${
                        formData.voucher_type === "product_specific"
                          ? "#EE4D2D"
                          : "#000"
                      }`}
                    />
                    Voucher sản phẩm
                  </div>
                  {/* Check Icon Appears When Selected */}
                  {formData.voucher_type === "product_specific" && (
                    <div className="absolute top-0 right-0 ">
                      <div className="triangle-bg" />
                      <FaCheck className="absolute top-0 right-0 text-white text-sm" />
                    </div>
                  )}
                </label>
              )}
            </div>
          </div>

          {/* Tên chương trình giảm giá */}
          <div className="input-label col-span-2 flex items-center justify-end mr-1">
            Tên chương trình giảm giá
          </div>
          <div className="input-body col-span-7 flex flex-col">
            <div className="flex items-center border border-gray-300">
              <input
                type="text"
                name="name"
                maxLength={100}
                required
                placeholder="Nhập tên chương trình"
                className="w-full p-2"
                value={formData.name}
                onChange={handleChange}
              />
              <div className="text-right text-sm text-gray-500 mr-2">
                {formData.name.length}/100
              </div>
            </div>
            <span className="text-gray-500 text-xs mt-2">
              Tên Voucher sẽ không được hiển thị cho Người mua
            </span>
          </div>

          {/* Mã voucher */}
          <div className="input-label col-span-2 flex items-center justify-end mr-1">
            Mã voucher
          </div>
          <div className="input-body col-span-7 flex flex-col">
            <div className="flex items-center border border-gray-300">
              <span className="p-2 border-r border-gray-300 text-gray-400">
                VOU
              </span>
              <input
                type="text"
                name="code"
                maxLength={5}
                pattern="[A-Z0-9]{1,5}"
                required
                placeholder="Nhập mã"
                className="w-full p-2 "
                value={formData.code}
                onChange={handleChange}
                disabled={started}
              />
              <div className="text-right text-sm text-gray-500 mr-2">
                {formData.code.length}/5
              </div>
            </div>
            <span className="text-gray-500 text-xs mt-2">
              Vui lòng chỉ nhập các kí tự chữ cái (A-Z), số (0-9); tối đa 5 kí
              tự.
              <br />
              Mã giảm giá đầy đủ là: {formData.code}
            </span>
          </div>

          {/* Thời gian sử dụng mã */}
          <div className="input-label col-span-2 flex items-center justify-end mr-1">
            Thời gian sử dụng mã
          </div>
          <div className="input-body col-span-7">
            <div className="flex space-x-4">
              <input
                type="datetime-local"
                name="starts_at"
                className="w-1/2 p-2 border border-gray-300"
                required
                min={new Date().toISOString().split("T")[0]}
                value={new Date(formData.starts_at).toISOString().slice(0, 16)}
                onChange={handleChange}
                disabled={started}
              />
              <input
                type="datetime-local"
                name="ends_at"
                className="w-1/2 p-2 border border-gray-300"
                required
                min={new Date(prevFormData.ends_at).toISOString().split("T")[0]}
                value={new Date(formData.ends_at).toISOString().slice(0, 16)}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Section Title: Thiết lập mã giảm giá */}
          <div className="form-title col-span-full text-2xl mt-6 mb-4">
            Thiết lập mã giảm giá
          </div>

          {/* Loại giảm giá | Mức giảm */}
          <div className="input-label col-span-2 flex items-center justify-end mr-1">
            Loại giảm giá | Mức giảm
          </div>
          <div className="input-body col-span-7">
            <div className="flex items-center space-x-2">
              <select
                name="discount_type"
                className="p-2 border border-gray-300"
                value={formData.discount_type}
                onChange={handleChange}
                disabled={started}
              >
                <option value="fixed_amount">Theo số tiền</option>
                <option value="percentage">Theo phần trăm</option>
              </select>
              <span>₫</span>
              <input
                type="number"
                name="discount_value"
                min={1}
                className="w-full p-2 border border-gray-300"
                required
                value={formData.discount_value}
                onChange={handleChange}
                disabled={started}
              />
            </div>
          </div>

          {/* Giá trị đơn hàng tối thiểu */}
          <div className="input-label col-span-2 flex items-center justify-end mr-1">
            Giá trị đơn hàng tối thiểu
          </div>
          <div className="input-body col-span-7">
            <div className="flex items-center space-x-2">
              <span>₫</span>
              <input
                type="number"
                name="min_order"
                min={1}
                className="w-full p-2 border border-gray-300"
                required
                value={formData.min_order}
                onChange={handleChange}
                disabled={started}
              />
            </div>
          </div>

          {/* Tổng lượt sử dụng tối đa */}
          <div className="input-label col-span-2 flex items-center justify-end mr-1">
            Tổng lượt sử dụng tối đa
          </div>
          <div className="input-body col-span-7">
            <input
              type="number"
              name="max_usage"
              min={prevFormData.max_usage}
              className="w-full p-2 border border-gray-300"
              required
              value={formData.max_usage}
              onChange={handleChange}
            />
          </div>

          {/* Lượt sử dụng tối đa/Người mua */}
          <div className="input-label col-span-2 flex items-center justify-end mr-1">
            Lượt sử dụng tối đa/Người mua
          </div>
          <div className="input-body col-span-7">
            <input
              type="number"
              name="usage_per_user"
              min={prevFormData.usage_per_user}
              // defaultValue="1"
              className="w-full p-2 border border-gray-300"
              required
              value={formData.usage_per_user}
              onChange={handleChange}
              disabled={started}
            />
          </div>

          {/* Section Title: Hiển thị mã giảm giá và các sản phẩm áp dụng */}
          <div className="form-title col-span-full text-2xl mt-6 mb-4">
            Hiển thị mã giảm giá và các sản phẩm áp dụng
          </div>

          {/* Thiết lập hiển thị */}
          <div className="input-label col-span-2 flex items-center justify-end mr-1">
            Thiết lập hiển thị
          </div>

          {/* Hiển thị mã giảm giá */}
          <div className="input-body col-span-7">
            {prevFormData.is_public === true ? (
              <label className="flex items-center">Hiển thị nhiều nơi</label>
            ) : (
              <>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="is_public"
                    value={"true"}
                    checked={formData.is_public}
                    onChange={handleChange}
                    className="mr-1"
                  />
                  Hiển thị nhiều nơi
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="is_public"
                    value={"false"}
                    checked={!formData.is_public}
                    onChange={handleChange}
                    className="mr-1"
                  />
                  Không công khai
                </label>
              </>
            )}
          </div>

          {/* Sản phẩm được áp dụng */}
          <div className="input-label col-span-2 flex items-center justify-end mr-1">
            Sản phẩm được áp dụng
          </div>
          <div className="input-body col-span-7">
            {formData.voucher_type === "product_specific" && !started && (
              <button
                type="button"
                className="font-normal p-2 border border-orange-600 text-orange-600 bg-white hover:bg-orange-100 hover:border-orange-500 rounded flex items-center space-x-2"
                onClick={() => setProductModalOpen(true)}
              >
                <IoMdAdd className="text-orange-600" />
                <span>Thêm sản phẩm</span>
              </button>
            )}
            {formData.voucher_type === "shop_wide" && (
              <div className="flex flex-col space-y-2">
                <span>Tất cả sản phẩm</span>
                <div className="text-yellow-600 text-sm">
                  Trong các sản phẩm đã chọn có một số sản phẩm không được chạy
                  khuyến mãi theo quy định của pháp luật hoặc đây là sản phẩm
                  độc quyền dành cho thành viên.
                </div>
              </div>
            )}

            {formData.voucher_type === "product_specific" && started && (
              <div className="mt-4 space-y-1">
                {products
                  .filter((product) =>
                    formData.product_id.includes(product.productID)
                  )
                  .map((product) => (
                    <div key={product.productID} className="text-gray-800">
                      {product.name}
                    </div>
                  ))}
              </div>
            )}
          </div>
          {/* Submit Buttons */}
          <div className="col-span-full flex justify-end space-x-4 mt-6">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 bg-orange-600 text-white"
              onClick={() => setModalOpen(true)}
            >
              Xác nhận
            </button>
          </div>
          <ConfirmModal
            isOpen={modalOpen}
            text="Bạn có muốn thay đổi thông tin của voucher?"
            onConfirm={(e: React.FormEvent) => handleSubmit(e)}
            onCancel={() => setModalOpen(false)}
          />
        </form>
        <SellerProductsModal
          isOpen={productModalOpen}
          onClose={() => setProductModalOpen(false)}
          products={products}
          selected={formData.product_id}
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  );
};
