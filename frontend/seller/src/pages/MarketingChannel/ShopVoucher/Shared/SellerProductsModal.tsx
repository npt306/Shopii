import React, { useState, useEffect } from "react";
import { SellerProductsModalProps } from "./Interfaces"; // Adjust the import path as necessary

export const SellerProductsModal: React.FC<SellerProductsModalProps> = ({
  isOpen,
  onClose,
  products,
  selected,
  onConfirm,
}) => {
  const [prevSelectedProductIds, setPrevSelectedProductIds] = useState<number[]>(selected);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>(selected);

  // Reset selection when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedProductIds(prevSelectedProductIds); // Clear selected products when modal is closed
    }
  }, [isOpen]);

  const handleCheckboxChange = (productId: number) => {
    setSelectedProductIds((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId) // Remove if already selected
        : [...prevSelected, productId] // Add if not selected
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedProductIds); // Pass selected product IDs to parent
    onClose(); // Close the modal
    setPrevSelectedProductIds(selectedProductIds);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-7/10 max-w-4xl p-6 rounded shadow-lg text-black">
        <h2 className="text-2xl font-bold mb-4">Chọn sản phẩm</h2>
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full border-collapse border border-gray-300 text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-center">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProductIds(products.map((p) => p.productID)); // Select all
                      } else {
                        setSelectedProductIds([]); // Deselect all
                      }
                    }}
                    checked={
                      selectedProductIds.length === products.length &&
                      products.length > 0
                    }
                  />
                </th>
                <th className="border border-gray-300 p-2">Sản Phẩm</th>
                <th className="border border-gray-300 p-2">Doanh số</th>
                <th className="border border-gray-300 p-2">Kho hàng</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.productID}>
                  <td className="border border-gray-300 p-2 text-center">
                    <input
                      type="checkbox"
                      value={product.productID}
                      onChange={() => handleCheckboxChange(product.productID)}
                      checked={selectedProductIds.includes(product.productID)}
                    />
                  </td>
                  <td className="border border-gray-300 p-2">{product.name}</td>
                  <td className="border border-gray-300 p-2">
                    {product.soldQuantity}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {product.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end space-x-4 mt-4">
          <button
            className="px-4 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
            onClick={() => onClose()} // This will just close the modal
          >
            Hủy
          </button>
          <button
            className="px-4 py-2 border border-gray-300 bg-orange-600 text-white"
            onClick={handleConfirm}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};
