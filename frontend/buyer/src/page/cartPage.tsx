import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCommentDots, FaTicketAlt } from "react-icons/fa";

import { HeaderCart } from "../components/layout/headerCart";
import { Footer } from "../components/layout/footer";

import "../css/common/inputField.css";
import "../css/page/cartPage.css";

import OverQuantityNotification from "../components/features/overQuatityNotification";

import { Cart } from "../types/cart";
import { OrderData, ProductOrderData } from "../types/orderData";

import { useCart } from "../context/cartContext";
import { formatPrice } from "../helpers/utility/formatPrice";

import { EnvValue } from "../env-value/envValue";

export const CartPage = () => {
  let navigate = useNavigate();
  const { updateCart } = useCart();
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Cart[]>([]);

  const { id } = useParams<{ id: string }>();

  const [orderData, setOrderData] = useState<OrderData[]>([]);

  useEffect(() => {
    // console.log("Shop data: ", orderData);
    localStorage.setItem("order_data", JSON.stringify(orderData));
  }, [orderData]);

  useEffect(() => {
    document.title = "Giỏ hàng";
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${EnvValue.API_GATEWAY_URL}/order/carts/${id}`
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching product detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCart();
    }
  }, [id]);

  // const productSummary: any = data?.flatMap((shop: any) =>
  //   shop.items.map(({ productTypeId, price }: any) => ({
  //     productTypeId,
  //     price,
  //   }))
  // );
  // console.log(productSummary);

  const [overQuantityProductId, setOverQuantityProductId] = useState<
    number | null
  >(null);
  const [quantities, setQuantities] = useState<{
    [productTypeId: number]: number;
  }>({});

  useEffect(() => {
    if (data.length > 0) {
      const initialQuantities: { [productTypeId: number]: number } = {};
      data.forEach((shop) => {
        shop.items.forEach((item) => {
          initialQuantities[item.productTypeId] = item.quantity;
        });
      });
      setQuantities(initialQuantities);
    }
  }, [data]);

  const [updatedProductId, setUpdatedProductId] = useState<number | null>(null);
  // Hàm tăng số lượng
  const increase = (productId: number, maxQuantity: number) => {
    setQuantities((prev) => {
      const newQuantity = Math.min((prev[productId] || 1) + 1, maxQuantity);

      if (newQuantity === maxQuantity) {
        setOverQuantityProductId(productId);
      } else {
        setUpdatedProductId(productId);
      }
      return {
        ...prev,
        [productId]: newQuantity,
      };
    });
  };

  // Hàm giảm số lượng
  const decrease = (productId: number) => {
    setQuantities((prev) => {
      const newQuantity = Math.max((prev[productId] || 1) - 1, 1);
      setUpdatedProductId(productId);

      return {
        ...prev,
        [productId]: newQuantity,
      };
    });
  };

  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedShops, setSelectedShops] = useState<{
    [key: number]: boolean;
  }>({});
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<{
    [key: number]: { checked: boolean; price: number };
  }>({});

  const [totalItems, setTotalItems] = useState(0);
  useEffect(() => {
    // Tính tổng số items mỗi khi thay đổi
    const total = data.reduce((total, shop) => total + shop.items.length, 0);
    setTotalItems(total);
  }, [data]);

  // order data handle
  useEffect(() => {
    // Only proceed if we have data and selections
    if (data.length > 0) {
      // Create new orderData array
      const newOrderData: OrderData[] = [];
      let totalOrderPrice = 0; // Tổng giá trị của toàn bộ đơn hàng

      // Iterate through each shop
      data.forEach((shop, shopIndex) => {
        // Check if shop is selected or any products in the shop are selected
        const isShopSelected = selectedShops[shopIndex];
        const shopProducts: ProductOrderData[] = [];
        let shopTotalPrice = 0; // Biến để tính tổng giá trị của shop

        // Check each product in the shop
        shop.items.forEach((item) => {
          // If the product is selected (either individually or via shop selection)
          if (selectedCheckboxes[item.productTypeId]?.checked) {
            const quantity = quantities[item.productTypeId] || 1;
            const productPrice = item.price * quantity;

            // Cộng dồn giá sản phẩm vào tổng của shop
            shopTotalPrice += productPrice;

            // Add product to shopProducts array
            shopProducts.push({
              productTypeId: item.productTypeId.toString(),
              image: item.image,
              name: item.productName,
              type_1: item.type1 || undefined,
              type_2: item.type2 || undefined,
              quantity: quantity,
              price: item.price,
            });
          }
        });

        // If any products in the shop are selected, add the shop to orderData
        if (shopProducts.length > 0) {
          newOrderData.push({
            shopId: shop.sellerId.toString(),
            shopName: shop.shopName,
            message: "",
            totalPrice: shopTotalPrice,
            isPaid: false,
            products: shopProducts,
          });
        }
      });

      // Update orderData state
      setOrderData(newOrderData);
    }
  }, [data, selectedShops, selectedCheckboxes, quantities]);

  useEffect(() => {
    let price = 0;
    Object.entries(selectedCheckboxes).forEach(([key, value]) => {
      price += value.price * quantities[Number(key)];
      setTotalPrice(price);
    });
  }, [quantities]);

  const toggleShopCheckbox = (index_shop: number, items: any[]) => {
    setSelectedShops((prev) => {
      const newShopState = { ...prev };
      const isChecked = !prev[index_shop];

      newShopState[index_shop] = isChecked;

      setSelectedCheckboxes((prevSelected) => {
        const newState = { ...prevSelected };
        let newTotalPrice = totalPrice;

        items.forEach((item) => {
          const isItemSelected = prevSelected.hasOwnProperty(item.productTypeId)
            ? prevSelected[item.productTypeId].checked
            : false;

          if (isChecked) {
            // Nếu sản phẩm chưa được chọn trước đó, mới cộng vào totalPrice
            if (!isItemSelected) {
              newState[item.productTypeId] = {
                checked: true,
                price: item.price,
              };
              newTotalPrice += quantities[item.productTypeId] * item.price;
              setTotalPrice(newTotalPrice);
            }
          } else {
            // Bỏ chọn tất cả checkbox trong shop
            if (isItemSelected) {
              newTotalPrice -= quantities[item.productTypeId] * item.price;
              setTotalPrice(newTotalPrice);
            }
            delete newState[item.productTypeId];
          }
        });
        return newState;
      });

      return newShopState;
    });
  };

  const [toggleAll, setToggleAll] = useState(false);
  const handleToggleAll = () => {
    setToggleAll((prev) => !prev);

    const newShopState: { [key: number]: boolean } = {};
    const newProductState: {
      [key: string]: { checked: boolean; price: number };
    } = {};
    let newTotalPrice = 0;

    if (!toggleAll) {
      // Chọn tất cả
      data.forEach((shop, index_shop) => {
        newShopState[index_shop] = true; // Chọn toàn bộ shop
        shop.items.forEach((item) => {
          newProductState[item.productTypeId] = {
            checked: true,
            price: item.price,
          };
          newTotalPrice += item.price * quantities[item.productTypeId];
        });
      });
    }

    setSelectedShops(newShopState);
    setSelectedCheckboxes(newProductState);
    setTotalPrice(newTotalPrice);
  };

  useEffect(() => {
    if (data.length > 0) {
      const allSelected = data.every((_, index) => selectedShops[index]);
      setToggleAll(allSelected);
    }
  }, [selectedShops, data]);

  const handleDeleteProduct = async (
    sellerId: number,
    productTypeId: number
  ) => {
    // Lưu lại số lượng shop trước khi xóa
    const previousShopCount = data.length;

    setData((prevData) => {
      const newData = prevData
        .map((shop) => {
          if (shop.sellerId === sellerId) {
            return {
              ...shop,
              items: shop.items.filter(
                (item) => item.productTypeId !== productTypeId
              ),
            };
          }
          return shop;
        })
        .filter((shop) => shop.items.length > 0); // Xóa shop nếu không còn sản phẩm

      // Nếu số lượng shop giảm đi (một shop bị xóa)
      if (newData.length < previousShopCount) {
        // Cập nhật lại selectedShops để loại bỏ các index không hợp lệ và cập nhật lại index
        const updatedSelectedShops: { [key: number]: boolean } = {};

        newData.forEach((shop, index) => {
          // Tìm index cũ của shop trong prevData
          const oldIndex = prevData.findIndex(
            (s) => s.sellerId === shop.sellerId
          );
          // Chỉ giữ lại trạng thái những shop còn tồn tại
          if (selectedShops[oldIndex]) {
            updatedSelectedShops[index] = true;
          }
        });

        // Cập nhật lại state
        setTimeout(() => {
          setSelectedShops(updatedSelectedShops);
          // Cập nhật lại toggleAll dựa trên shop còn lại
          if (Object.keys(updatedSelectedShops).length === 0) {
            setToggleAll(false);
          } else {
            setToggleAll(
              Object.keys(updatedSelectedShops).length === newData.length
            );
          }
        }, 0);
      }

      return newData;
    });

    try {
      const res = await axios.post(
        `${EnvValue.API_GATEWAY_URL}/order/carts/delete-from-cart`,
        { id, productTypeId }
      );
    } catch (error) {
      console.error("Error delete product.", error);
    }
    updateCart();
  };

  const [selectedProductCount, setSelectedProductCount] = useState(0);

  useEffect(() => {
    const count = Object.values(selectedCheckboxes).filter(
      (item) => item.checked
    ).length;

    setSelectedProductCount(count);
  }, [selectedCheckboxes]);

  const handleDeleteSelectedProduct = () => {
    // Lưu lại số lượng shop trước khi xóa
    const previousShopCount = data.length;

    const selectedKeys = Object.keys(selectedCheckboxes).filter(
      (key) => selectedCheckboxes[Number(key)].checked
    );

    selectedKeys.map(async (productTypeId) => {
      try {
        const res = await axios.post(
          `${EnvValue.API_GATEWAY_URL}/order/carts/delete-from-cart`,
          { id, productTypeId }
        );
        console.log(res);
      } catch (error) {
        console.error("Error delete product.", error);
      }
      updateCart();
    });

    setData((prevData) => {
      const newData = prevData
        .map((shop) => {
          const newItems = shop.items.filter(
            (item) => !selectedCheckboxes[item.productTypeId]?.checked
          );

          return {
            ...shop,
            items: newItems,
          };
        })
        .filter((shop) => shop.items.length > 0); // Xóa shop nếu không còn sản phẩm

      // Reset các toggle nếu có shop bị xóa
      if (newData.length < previousShopCount) {
        setTimeout(() => {
          setSelectedShops({});
          setToggleAll(false);
        }, 0);
      }

      return newData;
    });

    // Reset lại state của checkbox đã chọn
    setSelectedCheckboxes({});
  };

  const handleUpdateProduct = async (
    productTypeId: number,
    quantity: number
  ) => {
    try {
      const res = await axios.post(
        `${EnvValue.API_GATEWAY_URL}/order/carts/update-cart`,
        {
          id,
          productTypeId,
          quantity,
        }
      );
      console.log(res);
    } catch (error) {
      console.error("Error update product.", error);
    }
    updateCart();
  };

  useEffect(() => {
    if (updatedProductId !== null) {
      handleUpdateProduct(updatedProductId, quantities[updatedProductId]);
      setUpdatedProductId(null); // Reset lại để tránh gọi lại không cần thiết
    }
  }, [updatedProductId, quantities]);

  return (
    <>
      <HeaderCart />
      <ToastContainer />
      {confirmDeleteAll && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-10 w-[35rem] h-[10rem] flex flex-col justify-center z-10">
            <p className="mt-2 pb-5 text-[1rem] text-black">
              Bạn có muốn bỏ {selectedProductCount} sản phẩm ?
            </p>
            <div className="flex flex-row justify-end">
              <button
                onClick={() => setConfirmDeleteAll(false)}
                className="px-4 py-3 bg-[#ee4d2d] w-[7rem]"
              >
                <div className="text-white">TRỞ LẠI</div>
              </button>
              <button
                onClick={() => {
                  handleDeleteSelectedProduct();
                  setConfirmDeleteAll(false);
                }}
                className="px-4 py-2 w-[7rem]"
              >
                <div className="text-black">CÓ</div>
              </button>
            </div>
          </div>
        </div>
      )}
      {loading ? (
        <>
          <div
            className="h-[60vh] flex justify-center items-center"
            role="status"
          >
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
          </div>
        </>
      ) : (
        <>
          {data.length != 0 ? (
            <>
              <div className="mx-30 p-5 mt-5 bg-white flex flex-row items-center justify-between ">
                <div className="flex flex-row items-center justify-items-center gap-5">
                  <input
                    type="checkbox"
                    checked={toggleAll ?? false}
                    onChange={handleToggleAll}
                    className="w-4 h-4 appearance-none border border-black checked:bg-orange-500 checked:border-orange-500 relative
             before:content-['✔'] before:absolute before:inset-0 before:flex before:items-center before:justify-center
             before:text-white before:opacity-0 checked:before:opacity-100"
                  />
                </div>

                <div className="grid grid-cols-8 w-full h-[1.5rem]">
                  <div className="col-span-4 px-5 flex items-center justify-start">
                    Sản phẩm
                  </div>
                  <div className="flex items-center justify-center">
                    Đơn giá
                  </div>
                  <div className="flex items-center justify-center">
                    Số lượng
                  </div>
                  <div className="flex items-center justify-center">
                    Số tiền
                  </div>
                  <div className="flex items-center justify-center">
                    Thao tác
                  </div>
                </div>
              </div>

              <div className="mx-30 bg-white flex flex-col">
                {/* map */}
                {data.map((product, index_shop) => (
                  // space line
                  <div key={index_shop}>
                    <div className="w-full h-5 bg-gray-100"></div>
                    <div className="flex flex-col">
                      <div className="flex flex-row items-center px-5 py-1 gap-5">
                        <input
                          type="checkbox"
                          checked={selectedShops[index_shop] ?? false}
                          onChange={() => {
                            toggleShopCheckbox(index_shop, product.items);
                          }}
                          className="w-4 h-4 appearance-none border border-black checked:bg-orange-500 checked:border-orange-500 relative
             before:content-['✔'] before:absolute before:inset-0 before:flex before:items-center before:justify-center
             before:text-white before:opacity-0 checked:before:opacity-100"
                        />
                        <div className="flex flex-row items-center gap-2">
                          <p className="font-bold text-base">
                            {product.shopName}
                          </p>
                          <div className="text-[#ee4d2d] cursor-pointer">
                            <FaCommentDots className="text-[1.2rem]" />
                          </div>
                        </div>
                      </div>
                      <div className="w-full h-0.5 bg-gray-100"></div>
                      {/* // product in present shop */}
                      {product.items.map((item) => (
                        <div
                          key={item.productTypeId}
                          className="p-5 flex flex-row items-center justify-items-center"
                        >
                          <OverQuantityNotification
                            open={overQuantityProductId === item.productTypeId} // Hiển thị dialog đúng sản phẩm
                            quantity={item.availableQuantity}
                            setOpen={() => setOverQuantityProductId(null)}
                          />
                          <input
                            type="checkbox"
                            checked={
                              selectedCheckboxes[item.productTypeId]?.checked ??
                              false
                            }
                            onChange={() => {
                              setSelectedCheckboxes((prev) => {
                                const newState = { ...prev };
                                let newTotalPrice = totalPrice;

                                if (prev[item.productTypeId]?.checked) {
                                  // Nếu checkbox đang được bỏ chọn, xóa key khỏi object
                                  delete newState[item.productTypeId];
                                  newTotalPrice -=
                                    quantities[item.productTypeId] * item.price;
                                } else {
                                  // Nếu checkbox được chọn, thêm vào object
                                  newState[item.productTypeId] = {
                                    checked: true,
                                    price: item.price,
                                  };
                                  newTotalPrice +=
                                    quantities[item.productTypeId] * item.price;
                                }
                                // Kiểm tra nếu tất cả checkbox trong shop đều được chọn thì chọn shop
                                const allItemsChecked = data[
                                  index_shop
                                ].items.every(
                                  (prod) =>
                                    newState[prod.productTypeId]?.checked
                                );
                                setSelectedShops((prev) => ({
                                  ...prev,
                                  [index_shop]: allItemsChecked,
                                }));

                                setTotalPrice(newTotalPrice);
                                return newState;
                              });
                            }}
                            className="w-4 h-4 appearance-none border border-black checked:bg-orange-500 checked:border-orange-500 relative
                  before:content-['✔'] before:absolute before:inset-0 before:flex before:items-center before:justify-center
                  before:text-white before:opacity-0 checked:before:opacity-100"
                          />

                          <div className="grid grid-cols-8 w-full h-auto">
                            <div className="col-span-4 px-5 gap-5 flex items-center justify-start">
                              <img
                                src={item.image}
                                className="w-[10rem] h-[10rem]"
                              />
                              <p
                                className="max-w-[15rem] line-clamp-2"
                                title={item.productName}
                              >
                                {item.productName}
                              </p>

                              {item.type1 ? (
                                <div className="relative">
                                  <div className="flex items-center gap-1">
                                    <div className="flex flex-col">
                                      <div className="flex flex-row items-center gap-x-3">
                                        <p>Phân loại hàng:</p>
                                      </div>
                                      <div>
                                        {item.type1 ? `${item.type1}` : null}
                                        {item.type2 ? `, ${item.type2}` : null}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <></>
                              )}
                            </div>
                            <div className="flex items-center justify-center">
                              <div className="flex flex-row justify-center items-center gap-2">
                                <div className="flex flex-row items-center text-gray-400 line-through mr-1">
                                  <div className="underline underline-offset-2">
                                    đ
                                  </div>
                                  <div className="">
                                    {formatPrice(item.price)}
                                  </div>
                                </div>

                                <div className="flex flex-row items-center text-black">
                                  <div className="underline underline-offset-2">
                                    đ
                                  </div>
                                  <div className="">
                                    {formatPrice(item.price)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-center">
                              <div className="flex flex-row items-center gap-3">
                                <div className="flex justify-items-center items-center">
                                  <button
                                    className={`bg-gray-100 border border-gray-400 hover:bg-gray-100 transition px-4 py-3 w-7 h-7 flex justify-center items-center`}
                                    onClick={() => {
                                      decrease(item.productTypeId);
                                    }}
                                  >
                                    <div className="text-base pb-4">_</div>
                                  </button>

                                  <input
                                    type="number"
                                    value={quantities[item.productTypeId] ?? 1}
                                    onChange={(e) => {
                                      let inputValue = Number(e.target.value);
                                      if (inputValue == 0) {
                                        inputValue = 1;
                                        e.target.value = "1";
                                      }
                                      if (inputValue > item.availableQuantity) {
                                        setOverQuantityProductId(
                                          item.productTypeId
                                        ); // Lưu ID sản phẩm bị lỗi
                                        setQuantities((prev) => ({
                                          ...prev,
                                          [item.productTypeId]:
                                            item.availableQuantity, // Giữ lại giá trị tối đa của sản phẩm này
                                        }));
                                      } else {
                                        setQuantities((prev) => ({
                                          ...prev,
                                          [item.productTypeId]: inputValue, // Cập nhật số lượng bình thường
                                        }));
                                      }
                                    }}
                                    onBlur={() =>
                                      handleUpdateProduct(
                                        item.productTypeId,
                                        quantities[item.productTypeId]
                                      )
                                    }
                                    className="text-center border border-gray-400 w-10 h-7 no-spinner focus:border-black"
                                  />

                                  <button
                                    className={`bg-gray-100 border border-gray-400 transition px-4 py-3 w-7 h-7 flex justify-center items-center`}
                                    onClick={() => {
                                      increase(
                                        item.productTypeId,
                                        item.availableQuantity
                                      );
                                    }}
                                  >
                                    <div className="text-base">+</div>
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-center">
                              <div className="flex flex-row items-center text-[#ee4d2d]">
                                <div className="underline underline-offset-2">
                                  đ
                                </div>
                                <div className="">
                                  {formatPrice(
                                    item.price *
                                      (quantities[item.productTypeId] ?? 1)
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-center">
                              <div className="flex flex-col p-3">
                                <p
                                  onClick={() =>
                                    handleDeleteProduct(
                                      product.sellerId,
                                      item.productTypeId
                                    )
                                  }
                                  className="text-center cursor-pointer"
                                >
                                  Xoá
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="w-full h-0.5 bg-gray-100"></div>
                      <div className="p-5 flex flex-row gap-7 justify-start items-center">
                        <FaTicketAlt size={20} className="text-orange-500" />
                        <p className="text-blue-500">Thêm Shop Voucher</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="w-full h-5 bg-gray-100"></div>
              </div>
              <div className="mx-30 p-5 mt-5 bg-white flex flex-row items-center justify-between ">
                <div className="flex flex-row items-center justify-items-center gap-5">
                  <input
                    type="checkbox"
                    checked={toggleAll ?? false}
                    onChange={handleToggleAll}
                    className="w-4 h-4 appearance-none border border-black checked:bg-orange-500 checked:border-orange-500 relative
             before:content-['✔'] before:absolute before:inset-0 before:flex before:items-center before:justify-center
             before:text-white before:opacity-0 checked:before:opacity-100"
                  />
                </div>

                <div className="grid grid-cols-8 w-full h-[3rem] text-[1rem]">
                  <div className="col-span-4 px-5 flex items-center justify-start">
                    <div className="flex flex-row gap-5">
                      <div>Chọn Tất Cả ({totalItems})</div>
                      <div
                        onClick={() => setConfirmDeleteAll(true)}
                        className="cursor-pointer"
                      >
                        Xóa
                      </div>
                    </div>
                  </div>

                  {totalPrice > 0 ? (
                    <>
                      <div className="flex flex-col col-span-3 mr-3">
                        <div className="flex items-center text-center">
                          <div className="w-2/3 flex justify-end">
                            Tổng thanh toán ({selectedProductCount} Sản phẩm):
                          </div>
                          <div className="w-1/3">
                            <div className="mketV9">
                              ₫{formatPrice(totalPrice)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center mt-1 px-auto">
                          <div className="w-2/3"></div>
                          <div className="w-1/3">
                            <div className="flex justify-center items-center">
                              <div className="text-[0.8rem]">Tiết kiệm: </div>
                              <div className="mketV8 ml-3">₫0</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center text-white">
                        <button
                          onClick={() => navigate(`/order/${id}`)}
                          className="w-full h-[2.5rem] bg-[#ee4d2d] hover:bg-orange-600"
                        >
                          <div className="text-[0.9rem] text-center">
                            Mua Hàng
                          </div>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="col-span-3 flex justify-end  mr-5">
                        <div className="flex items-center justify-center">
                          <div className="">Tổng thanh toán (0 Sản phẩm):</div>
                          <div className="mketV9">₫0</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center text-white">
                        <button
                          onClick={() => {
                            toast.warning(
                              "Vui lòng chọn sản phẩm trước khi thanh toán!",
                              {
                                position: "top-right",
                                autoClose: 1500,
                              }
                            );
                            return;
                          }}
                          className="w-full h-[2.5rem] bg-[#ee4d2d] hover:bg-orange-600"
                        >
                          <div className="text-[0.9rem] text-center">
                            Mua Hàng
                          </div>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mt-30 flex flex-col justify-center items-center gap-4">
                <img
                  className="object-contain flex items-center"
                  src="https://www.stickstuff.com/public/images/empty-cart.png"
                  alt=""
                />
                <div className="font-bold text-gray-400">
                  Giỏ hàng của bạn còn trống
                </div>
                <button className="px-10 h-[2.5rem] bg-[#ee4d2d] hover:bg-orange-600">
                  <div
                    onClick={() => navigate("/home")}
                    className="text-[1rem] text-center text-white"
                  >
                    MUA NGAY
                  </div>
                </button>
              </div>
            </>
          )}
        </>
      )}
      <Footer />
    </>
  );
};
