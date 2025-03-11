import React, { useState } from "react";

// Define prop types for the component
interface TaxRegisterProps {
  onNextStep: () => void;
  onPreviousStep: () => void;
}

const TaxRegister: React.FC<TaxRegisterProps> = ({ onNextStep, onPreviousStep }) => {
  const [taxData, setTaxData] = useState({
    businessType: "", // e.g. "ca-nhan", "ho-kinh-doanh", "cong-ty"
    businessAddress: "",
    email: "",
    taxCode: ""
  });

  // Handle changes in the form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaxData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Tax Data submitted:", taxData);
    // Perform your submission logic here
    onNextStep();
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 mt-8">
      {/* Header / Note */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md text-sm text-blue-900 mb-6">
        <p>
          Vui lòng nhập thông tin Thuế và Thông Tin Định Danh để tuân thủ quy định của
          Luật an ninh mạng, Thương mại điện tử và Thuế của Việt Nam.
        </p>
        <p className="mt-1">
          Thông tin này sẽ được bảo vệ và chỉ sử dụng để xuất hóa đơn điện tử hợp lệ.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="text-red-500 mr-1">*</span>
            Loại hình kinh doanh
          </label>
          <div className="flex items-center space-x-4">
            {/* Cá nhân */}
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="businessType"
                value="ca-nhan"
                checked={taxData.businessType === "ca-nhan"}
                onChange={handleChange}
                className="hidden"
              />
              <span
                className={`w-4 h-4 inline-block border-2 border-orange-600 rounded-full flex items-center justify-center ${
                  taxData.businessType === "ca-nhan" ? "bg-orange-600" : ""
                }`}
              >
                {taxData.businessType === "ca-nhan" && (
                  <span className="w-2 h-2 bg-white rounded-full" />
                )}
              </span>
              <span className="ml-2 text-sm text-gray-700">Cá nhân</span>
            </label>

            {/* Hộ kinh doanh */}
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="businessType"
                value="ho-kinh-doanh"
                checked={taxData.businessType === "ho-kinh-doanh"}
                onChange={handleChange}
                className="hidden"
              />
              <span
                className={`w-4 h-4 inline-block border-2 border-orange-600 rounded-full flex items-center justify-center ${
                  taxData.businessType === "ho-kinh-doanh" ? "bg-orange-600" : ""
                }`}
              >
                {taxData.businessType === "ho-kinh-doanh" && (
                  <span className="w-2 h-2 bg-white rounded-full" />
                )}
              </span>
              <span className="ml-2 text-sm text-gray-700">Hộ kinh doanh</span>
            </label>

            {/* Công ty */}
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="businessType"
                value="cong-ty"
                checked={taxData.businessType === "cong-ty"}
                onChange={handleChange}
                className="hidden"
              />
              <span
                className={`w-4 h-4 inline-block border-2 border-orange-600 rounded-full flex items-center justify-center ${
                  taxData.businessType === "cong-ty" ? "bg-orange-600" : ""
                }`}
              >
                {taxData.businessType === "cong-ty" && (
                  <span className="w-2 h-2 bg-white rounded-full" />
                )}
              </span>
              <span className="ml-2 text-sm text-gray-700">Công ty</span>
            </label>
          </div>
        </div>

        {/* Business Address */}
        <div>
          <label
            htmlFor="businessAddress"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            <span className="text-red-500 mr-1">*</span>
            Địa chỉ đăng ký kinh doanh
          </label>
          <input
            type="text"
            id="businessAddress"
            name="businessAddress"
            value={taxData.businessAddress}
            onChange={handleChange}
            placeholder="Nhập địa chỉ đăng ký kinh doanh"
            className="bg-white block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Email for E-Invoice */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            <span className="text-red-500 mr-1">*</span>
            Email nhận hóa đơn điện tử
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={taxData.email}
            onChange={handleChange}
            placeholder="Nhập email"
            className="bg-white block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Tax Code */}
        <div>
          <label
            htmlFor="taxCode"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            <span className="text-red-500 mr-1">*</span>
            Mã số thuế
          </label>
          <div className="relative">
            <input
              type="text"
              id="taxCode"
              name="taxCode"
              value={taxData.taxCode}
              onChange={(e) => {
                // limit to 14 characters
                if (e.target.value.length <= 14) {
                  handleChange(e);
                }
              }}
              placeholder="Nhập mã số thuế"
              className="bg-white block w-full pr-16 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-400">
              {taxData.taxCode.length}/14
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onPreviousStep}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Quay lại
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaxRegister;
