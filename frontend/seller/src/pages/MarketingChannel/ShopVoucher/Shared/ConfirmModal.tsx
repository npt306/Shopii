import React from "react";
import { ImCancelCircle } from "react-icons/im";

interface ConfirmModalProps {
  isOpen: boolean;
  text: string;
  onConfirm: (a?: any) => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  text,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-white rounded w-96 shadow-xl">
        <div className="w-full flex justify-end mb-3 px-4 py-2 border-b shadow-sm" onClick={onCancel}>
          <ImCancelCircle className="text-gray-500 text-lg" />
        </div>
        <p className="text-normal mb-4 px-4 py-2 text-black">{text}</p>
        <div className="flex justify-end gap-3 border-t px-4 py-2">
          <button
            onClick={onCancel}
            className="text-sm px-4 py-2 border border-gray-700 bg-white text-gray-700 hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="text-sm px-4 py-2 border bg-white border-orange-600 text-orange-600"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
