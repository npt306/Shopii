import { RadioButton } from "../common/radioButton";
import { useState } from "react";

type VoucherShopeeModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const VoucherShopeeModal: React.FC<VoucherShopeeModalProps> = ({
  open,
  setOpen,
}) => {
  if (!open) return null;

  const [selectedRadio, setSelectedRadio] = useState<Number | null>(null);
  const [disableApply, setDisableApply] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState("");

  const handleInputValue = (input: string) => {
    setInputValue(input);
  };

  const clearInputValue = () => {
    setInputValue("");
  };

  const handleButton = (inputValue: string) => {
    if (inputValue.trim() === "") {
      setDisableApply(false); // Khi input trống, disableApply = false
    } else {
      setDisableApply(true); // Khi có nội dung, enable button
    }
  };

  return (
    <>
      <div className="voucher-modal">
        <div className="z-1">
          <div className="voucher-modal-container w-[32rem]">
            <div className="voucher-modal-header flex justify-between">
              <div className="text-lg">Chọn Shopee Voucher</div>
              <div className="text-gray-500 flex flex-row justify-center items-center">
                <div className="w-[3rem]">Hỗ trợ</div>
                <svg
                  enableBackground="new 0 0 15 15"
                  viewBox="0 0 15 15"
                  x={0}
                  y={0}
                  className="shopee-svg-icon icon-help-1"
                >
                  <g>
                    <circle
                      cx="7.5"
                      cy="7.5"
                      fill="none"
                      r="6.5"
                      strokeMiterlimit={10}
                    />
                    <path
                      d="m5.3 5.3c.1-.3.3-.6.5-.8s.4-.4.7-.5.6-.2 1-.2c.3 0 .6 0 .9.1s.5.2.7.4.4.4.5.7.2.6.2.9c0 .2 0 .4-.1.6s-.1.3-.2.5c-.1.1-.2.2-.3.3-.1.2-.2.3-.4.4-.1.1-.2.2-.3.3s-.2.2-.3.4c-.1.1-.1.2-.2.4s-.1.3-.1.5v.4h-.9v-.5c0-.3.1-.6.2-.8s.2-.4.3-.5c.2-.2.3-.3.5-.5.1-.1.3-.3.4-.4.1-.2.2-.3.3-.5s.1-.4.1-.7c0-.4-.2-.7-.4-.9s-.5-.3-.9-.3c-.3 0-.5 0-.7.1-.1.1-.3.2-.4.4-.1.1-.2.3-.3.5 0 .2-.1.5-.1.7h-.9c0-.3.1-.7.2-1zm2.8 5.1v1.2h-1.2v-1.2z"
                      stroke="none"
                    />
                  </g>
                </svg>
              </div>
            </div>
            <div className="relative flex flex-row items-center p-3 gap-3 mx-6 mt-5 bg-gray-100">
              <div className="text-nowrap">Mã voucher</div>
              <input
                className="border border-gray-300 w-full p-3 hover:border-black bg-white"
                type="text"
                value={inputValue}
                placeholder="Mã Shopee Voucher"
                onChange={(e) => {
                  handleInputValue(e.target.value);
                  handleButton(e.target.value);
                }}
              />
              {inputValue && (
                <div
                  onClick={clearInputValue}
                  className="absolute right-[7.5rem] top-1/2 transform -translate-y-1/2 cursor-pointer"
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="shopee-svg-icon input-with-validator__cancel-button"
                  >
                    <g fill="none" fill-rule="evenodd">
                      <circle
                        cx="8"
                        cy="8"
                        r="8"
                        fill="#000"
                        fill-opacity=".26"
                      ></circle>
                      <path
                        fill="#FFF"
                        stroke="#FFF"
                        d="M8.28367221 7.99982154L10.7984046 10.51435c.0783177.0785216.0783177.2055839 0 .2839016-.0785217.0783177-.205584.0783177-.2839017 0L7.99997451 8.2837232l-2.51473237 2.5145284c-.07811375.0783177-.20538001.0783177-.28349376 0-.07852165-.0783177-.07852165-.20538 0-.2839016L7.7162768 7.99982154 5.20174838 5.48549708c-.07852165-.0783177-.07852165-.20558396 0-.28390166.07811375-.0783177.20538001-.0783177.28349376 0l2.51473237 2.51432446 2.51452839-2.51432446c.0783177-.0783177.20538-.0783177.2839017 0 .0783177.0783177.0783177.20558396 0 .28390166L8.28367221 7.99982154z"
                      ></path>
                    </g>
                  </svg>
                </div>
              )}

              <button
                disabled={!disableApply}
                className={`bg-white text-nowrap p-3 ${
                  disableApply && "text-black hover:bg-gray-200"
                }`}
                style={{
                  cursor: !disableApply ? "not-allowed" : "pointer",
                }} // Thay đổi con trỏ chuột
              >
                <div className={!disableApply ? "text-gray-300" : ""}>
                  ÁP DỤNG
                </div>
              </button>
            </div>

            <div className="max-h-[20rem] overflow-y-auto px-6 mt-3">
              <div className="flex flex-col mb-3">
                <div className="text-[1.1rem]">Mã Miễn Phí Vận Chuyển</div>
                <div className="text-gray-400">Có thể chọn 1 Voucher</div>
              </div>
              {Array.from({ length: 5 }).map((_, index) => (
                <div className="voucher-item">
                  <div className="voucher-badge">x2</div>
                  <div className="voucher-img">
                    <img
                      src="https://down-vn.img.susercontent.com/file/e6a3b7beffa95ca492926978d5235f79"
                      alt="Voucher"
                    />
                  </div>
                  <div className="voucher-content flex flex-col gap-1">
                    <div className="flex flex-row gap-2 items-center">
                      <div>Giảm tối đa</div>
                      <div className="row-start-1 col-start-4">
                        <span>₫15k</span>
                      </div>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <div>Đơn Tối Thiểu</div>
                      <div className="row-start-1 col-start-4">
                        <span>₫0</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">Đã dùng: 86%</div>
                    <div className="flex flex-row gap-2 items-center">
                      <div className="text-xs text-gray-500">
                        HSD: 06.04.2025
                      </div>
                      <div className="text-xs text-blue-500">Điều kiện</div>
                    </div>
                  </div>
                  <RadioButton
                    label=""
                    checked={selectedRadio === index}
                    onChange={() => setSelectedRadio(index)}
                  />
                </div>
              ))}
              <div className="flex flex-col my-3">
                <div className="text-[1.1rem]">Mã Voucher Sản Phẩm</div>
                <div className="text-gray-400">Có thể chọn 1 Voucher</div>
              </div>
              {Array.from({ length: 5 }).map((_, index) => (
                <div className="voucher-item">
                  <div className="voucher-badge">x2</div>
                  <div className="voucher-img">
                    <img
                      src="https://down-vn.img.susercontent.com/file/e6a3b7beffa95ca492926978d5235f79"
                      alt="Voucher"
                    />
                  </div>
                  <div className="voucher-content flex flex-col gap-1">
                    <div className="flex flex-row gap-2 items-center">
                      <div>Giảm tối đa</div>
                      <div className="row-start-1 col-start-4">
                        <span>₫15k</span>
                      </div>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <div>Đơn Tối Thiểu</div>
                      <div className="row-start-1 col-start-4">
                        <span>₫0</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">Đã dùng: 86%</div>
                    <div className="flex flex-row gap-2 items-center">
                      <div className="text-xs text-gray-500">
                        Sắp hết hạn: Còn 6 giờ
                      </div>
                      <div className="text-xs text-blue-500">Điều kiện</div>
                    </div>
                  </div>
                  <RadioButton
                    label=""
                    checked={selectedRadio === index}
                    onChange={() => setSelectedRadio(index)}
                  />
                </div>
              ))}
              <div className="text-gray-400 mb-15 mt-5">
                * Đã hiển thị tất cả Shopee voucher thuộc mục Ví Voucher của
                bạn.
              </div>
            </div>

            <div className="voucher-modal-footer">
              <button
                onClick={() => setOpen(false)}
                className="gray-button !mr-3"
              >
                Trở lại
              </button>
              <button onClick={() => setOpen(false)} className="color-button">
                OK
              </button>
            </div>
          </div>
        </div>

        <div className="modal-bg" onClick={() => setOpen(false)} />
      </div>
    </>
  );
};
