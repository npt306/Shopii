import "../../../../css/sellerVoucher.css";
import { useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import { useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { AiFillShop } from "react-icons/ai";
import { SiShopee } from "react-icons/si";
import axios from "axios";
import { EnvValue } from "../../../../env-value/envValue";
import { SellerProductsModal } from "../Shared/SellerProductsModal";
import { SellerVoucher } from "../Shared/Interfaces";
import { Product } from "../Shared/Interfaces";
import {toast} from "react-toastify";

export const AddVoucherPage = () => {
  const user_accountId = Number(localStorage.getItem('user_accountId')) || 1;
  const [formData, setFormData] = useState<SellerVoucher>({
    name: "",
    code: "",
    voucher_type: "shop_wide",
    discount_type: "fixed_amount",
    discount_value: 0,
    min_order: 0,
    max_usage: 0,
    usage_per_user: 1,
    starts_at: "",
    ends_at: "",
    is_public: true,
    sellerid: user_accountId,
    product_id: [],
    used: 0,
  });
  const [isModalOpen, setModalOpen] = useState(false);
  // const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const sellerid = Number(localStorage.getItem('user_accountId')) || 1;;
  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        // `${EnvValue.API_GATEWAY_URL}/api/product/seller/${sellerid}`
        `http://localhost:3001/product/seller/${sellerid}`
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as
      | HTMLInputElement
      | HTMLSelectElement;
    console.log(formData);
    // Convert number fields to actual numbers
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

  const checkFormValidation = (): string => {
    // Check required string fields
    if (!formData.name.trim()) return "Tên không được để trống.";
    if (!formData.code.trim()) return "Mã không được để trống.";
    if (formData.code.length !== 5) return "Mã phải có đúng 5 ký tự.";
  
    // Check required numbers
    if (formData.discount_value <= 0) return "Giá trị giảm giá phải lớn hơn 0.";
    if (formData.max_usage <= 0) return "Số lượng sử dụng tối đa phải lớn hơn 0.";
    if (formData.usage_per_user <= 0)
      return "Số lần sử dụng trên mỗi người phải lớn hơn 0.";
  
    if (formData.discount_type === "percentage" && formData.discount_value > 100)
      return "Giá trị giảm giá theo phần trăm không được lớn hơn 100%.";
  
    // Validate dates
    if (!formData.starts_at.trim()) return "Ngày bắt đầu không được để trống.";
    if (!formData.ends_at.trim()) return "Ngày kết thúc không được để trống.";
    if (new Date(formData.starts_at) >= new Date(formData.ends_at))
      return "Ngày kết thúc phải sau ngày bắt đầu.";
  
    return ""; // No errors found
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
    const error = checkFormValidation();

    if (error !== "") {
      toast.warn(error);
      return;
    }
    console.log("Form Data Submitted:", formData);

    try {
      console.log("" );
      const response = await axios.post(
        `${EnvValue.API_GATEWAY_URL}/api/vouchers/seller-vouchers`,
        formData
      );
      console.log("Voucher created:", response.data);
    } catch (error) {
      console.error("Error creating voucher:", error);
    }
  };

  return (
    <>
      <form
        className="add-voucher-form grid grid-cols-9 gap-4 bg-white shadow-sm text-black p-4"
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
            <label
              className={`relative cursor-pointer p-4 border shadow-md w-1/2 text-center transition ${
                formData.voucher_type === "product_specific"
                  ? "border-orange-600 bg-orange-100 text-orange-600"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
              onClick={() =>
                setFormData({ ...formData, voucher_type: "product_specific" })
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
              className="w-full p-2"
              value={formData.code}
              onChange={handleChange}
            />
            <div className="text-right text-sm text-gray-500 mr-2">
              {formData.code.length}/5
            </div>
          </div>
          <span className="text-gray-500 text-xs mt-2">
            Vui lòng chỉ nhập các kí tự chữ cái (A-Z), số (0-9); tối đa 5 kí tự.
            <br />
            Mã giảm giá đầy đủ là: VOU
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
              min={new Date().toISOString().slice(0, -8)}
              value={formData.starts_at}
              onChange={handleChange}
            />
            <input
              type="datetime-local"
              name="ends_at"
              className="w-1/2 p-2 border border-gray-300"
              required
              min={formData.starts_at === "" ? new Date().toISOString().slice(0, -8) : formData.starts_at}
              value={formData.ends_at}
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
            >
              <option value="fixed_amount">Theo số tiền</option>
              <option value="percentage">Theo phần trăm</option>
            </select>
            <span>{formData.discount_type === "fixed_amount" ? "₫" : "%"}</span>
            <input
              type="number"
              name="discount_value"
              min={1}
              max={formData.discount_type === "percentage" ? 100 : undefined}
              className="w-full p-2 border border-gray-300"
              required
              value={formData.discount_value}
              onChange={handleChange}
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
            min={1}
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
            min={1}
            // defaultValue="1"
            className="w-full p-2 border border-gray-300"
            required
            value={formData.usage_per_user}
            onChange={handleChange}
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
        <div className="input-body col-span-7 flex gap-1">
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
        </div>

        {/* Sản phẩm được áp dụng */}
        <div className="input-label col-span-2 flex items-center justify-end mr-1">
          Sản phẩm được áp dụng
        </div>
        <div className="input-body col-span-7">
          {formData.voucher_type === "product_specific" ? (
                      <button
            type="button"
            className=" font-normal p-2 border border-orange-600 text-orange-600 bg-white hover:bg-orange-100 hover:border-orange-500 rounded flex items-center space-x-2"
            onClick={() => setModalOpen(true)}
          >
            <IoMdAdd className="text-orange-600" /> <span>Thêm sản phẩm</span>
          </button>

          ): (
            <div className="flex flex-col  space-x-2">
              Tất cả sản phẩm
              <div className="text-yellow-600 text-sm">
              Trong các sản phẩm đã chọn có một số sản phẩm không được chạy khuyến mãi theo quy định của pháp luật hoặc đây là sản phẩm độc quyền dành cho thành viên.
              </div>

            </div>)}
        </div>

        {/* Submit Buttons */}
        <div className="col-span-full flex justify-end space-x-4 mt-6">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-gray-300 bg-orange-600 text-white"
          >
            Xác nhận
          </button>
        </div>
      </form>

      <SellerProductsModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        products={products}
        selected={formData.product_id}
        onConfirm={handleConfirm}
        
      />
    </>
  );
};
