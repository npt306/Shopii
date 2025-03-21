import { useEffect } from "react";
import icon from "./completed-icon.png";

type AddToCartNotificationProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const AddToCartNotification: React.FC<AddToCartNotificationProps> = ({
  open,
  setOpen,
}) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setOpen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="bg-black/75 p-6 rounded-lg shadow-lg w-80 text-center">
        <img className="w-20 h-20 mx-auto" src={icon} alt="completed" />
        <p className="mt-2 text-white">Sản phẩm đã được thêm vào giỏ hàng</p>
      </div>
    </div>
  );
};

export default AddToCartNotification;
