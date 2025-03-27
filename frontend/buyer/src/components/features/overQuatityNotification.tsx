type AddToCartNotificationProps = {
  open: boolean;
  quantity: number;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const OverQuantityNotification: React.FC<AddToCartNotificationProps> = ({
  open,
  quantity,
  setOpen,
}) => {
  const handleCloseDialog = () => setOpen(false);

  if (!open) return null; // Nếu không mở thì return null luôn để tránh lỗi

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative bg-white p-10 w-[20rem] text-center z-10">
        <p className="mt-2 pb-10 text-black">
          Rất tiếc bạn chỉ có thể mua {quantity} sản phẩm của chương trình này
        </p>
        <button
          onClick={handleCloseDialog}
          className="px-4 py-2 mt-4 bg-orange-400 w-full"
        >
          <div className="text-white">OK</div>
        </button>
      </div>
    </div>
  );
};

export default OverQuantityNotification;
