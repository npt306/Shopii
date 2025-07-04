import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { X } from 'lucide-react';
import EditProductVariantModal from '../EditProduct/EditProduct';
import { toast } from "react-toastify";
import { EnvValue } from '../../../env-value/envValue'


interface Dimension {
  weight: string;
  length: string;
  width: string;
  height: string;
}

interface ProductDetail {
  type_id: number;
  type_1: string;
  type_2: string;
  image: string;
  price: number;
  quantity: number;
  dimension: Dimension;
}

interface Classification {
  classTypeName: string;
  level: number;
}

interface Product {
  productID: number;
  name: string;
  description: string;
  categories: string[];
  images: string[];
  soldQuantity: number;
  rating: string;
  coverImage: string;
  video: string;
  quantity: number;
  reviews: number;
  classifications: Classification[];
  details: ProductDetail[];
}

interface AllProps {
  products: Product[];
}

interface ExpandedDescriptions {
  [key: string]: boolean;
}

const AllActived: React.FC<AllProps> = ({ products: initialProducts }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [expandedDescriptions, setExpandedDescriptions] = useState<ExpandedDescriptions>({});


  const [activeView, setActiveView] = useState('list');
  const [showHeader, setShowHeader] = useState(true);

  const [isTooltipVisible1, setIsTooltipVisible1] = useState(false);
  const [isTooltipVisible2, setIsTooltipVisible2] = useState(false);
  const [isTooltipVisible3, setIsTooltipVisible3] = useState(false);
  const [isPermanentTooltip, setIsPermanentTooltip] = useState(false);

  const handleMouseEnter1 = () => {
    setIsTooltipVisible1(true);
  };

  const handleMouseLeave1 = () => {
    setIsTooltipVisible1(false);
  };

  const handleMouseEnter2 = () => {
    setIsTooltipVisible2(true);
  };

  const handleMouseLeave2 = () => {
    setIsTooltipVisible2(false);
  };

  const handleMouseEnter3 = () => {
    setIsTooltipVisible3(true);
  };

  const handleMouseLeave3 = () => {
    setIsTooltipVisible3(false);
  };

  const handleCloseTooltip = () => {
    setIsPermanentTooltip(false);
  };


  const handleViewChange = (view: 'list' | 'grid') => {
    setActiveView(view);
    setShowHeader(view === 'list');
  };

  const fallbackImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAAO0lEQVR4nO3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMA3/DkmAAGOkw0xAAAAAElFTkSuQmCC';
  const totalDetailsLength = products.reduce((total, product) => {
    const detailsLength = Array.isArray(product.details) ? (product.details as ProductDetail[]).flat().length : (product.details as ProductDetail[]).length;
    return total + detailsLength;
  }, 0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedProductID, setSelectedProductID] = useState<number | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  const handleEdit = (productName: string, productId: number, typeId: number) => {
    setSelectedProduct(productName);
    setSelectedProductID(productId);
    setSelectedVariantId(typeId);
    setIsModalOpen(true);
  };

  const handleSave = async (productName: string | null, productId: number, detailId: number, updatedData: Partial<ProductDetail>) => {
    try {
      const response = await fetch(`${EnvValue.API_GATEWAY_URL}/api/product/detail/${detailId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update detail ${detailId} of product ${productName}`);
      }

      setProducts(prevProducts => {
        return prevProducts.map(product => {
          if (product.productID === productId) {
            return {
              ...product,
              details: product.details.map(detail =>
                detail.type_id === detailId ? { ...detail, ...updatedData } : detail
              )
            };
          }
          return product;
        });
      });

    } catch (error) {
      console.error(`Error updating detail ${detailId} of product ${productId}:`, error);
    }
  };

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);


  const handleDelete = async (productId: number, typeId: number) => {
    try {
      const response = await fetch(`${EnvValue.API_GATEWAY_URL}/api/product/${productId}/detail/${typeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete detail ${typeId} of product ${productId}`);
      }

      // Cập nhật state để UI tự động refresh mà không cần reload trang
      setProducts(prevProducts => {
        return prevProducts.map(product => {
          if (product.productID === productId) {
            // Lọc bỏ detail có type_id tương ứng
            return {
              ...product,
              details: product.details.filter(detail => detail.type_id !== typeId)
            };
          }
          return product;
        });
      });

      toast.success(`Xóa sản phẩm thành công`, {
        autoClose: 2000
      });

    } catch (error) {
      console.error(`Error deleting detail ${typeId} of product ${productId}:`, error);
      toast.error(`Failed to delete: ${error}`);
    }
  };

  const toggleDescription = (productId: string, detailIndex: number) => {
    const key = `${productId}-${detailIndex}`;
    setExpandedDescriptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isDescriptionExpanded = (productId: string, detailIndex: number) => {
    const key = `${productId}-${detailIndex}`;
    return expandedDescriptions[key] || false;
  };


  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 text-black">
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-bold">{totalDetailsLength} Sản Phẩm</h1>
        </div>

        {/* Table-item */}
        <div className="flex border rounded-lg overflow-hidden">
          <button
            onClick={() => handleViewChange('list')}
            className={`p-2 ${activeView === 'list' ? 'bg-white' : 'bg-gray-100'}`}
            style={{ outline: 'none' }}
          >
            <svg data-name="图层 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="24" height="24">
              <g data-name="Layer 1">
                <path
                  d="M864 256H352a32 32 0 0 1 0-64h512a32 32 0 0 1 0 64zM864 544H352a32 32 0 0 1 0-64h512a32 32 0 0 1 0 64zM864 832H352a32 32 0 0 1 0-64h512a32 32 0 0 1 0 64z"
                  fill={activeView === 'list' ? 'orange' : 'gray'}
                />
                <circle cx="176" cy="224" r="48" fill={activeView === 'list' ? 'orange' : 'gray'} />
                <circle cx="176" cy="800" r="48" fill={activeView === 'list' ? 'orange' : 'gray'} />
                <circle cx="176" cy="512" r="48" fill={activeView === 'list' ? 'orange' : 'gray'} />
              </g>
            </svg>
          </button>
          <button
            onClick={() => handleViewChange('grid')}
            className={`p-2 ${activeView === 'grid' ? 'bg-white' : 'bg-gray-100'}`}
            style={{ outline: 'none' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24">
              <path
                d="M27 15h-8c-1.1 0-2-1.2-2-2.3V5c0-1.1.9-2 2-2h8.1c1 0 1.9.9 1.9 1.9V13c0 1.1-.9 2-2 2zm0-9c0-.6-.4-1-1-1h-6c-.6 0-1 .4-1 1v6c0 .6.4 1 1 1h6.1c.6 0 .9-.4.9-1V6zm-14 9H5c-1.1 0-2-1.2-2-2.3V5c0-1.1.9-2 2-2h8.1c1 0 1.9.9 1.9 1.9V13c0 1.1-.9 2-2 2zm0-9c0-.6-.4-1-1-1H6c-.6 0-1 .4-1 1v6c0 .6.4 1 1 1h6.1c.6 0 .9-.4.9-1V6zm14 23h-8c-1.1 0-2-1.2-2-2.3V19c0-1.1.9-2 2-2h8.1c1.1 0 1.9.9 1.9 1.9V27c0 1.1-.9 2-2 2zm0-9c0-.6-.4-1-1-1h-6c-.6 0-1 .4-1 1v6c0 .6.4 1 1 1h6.1c.6 0 .9-.4.9-1v-6zm-14 9H5c-1.1 0-2-1.2-2-2.3V19c0-1.1.9-2 2-2h8.1c1.1 0 1.9.9 1.9 1.9V27c0 1.1-.9 2-2 2zm0-9c0-.6-.4-1-1-1H6c-.6 0-1 .4-1 1v6c0 .6.4 1 1 1h6.1c.6 0 .9-.4.9-1v-6z"
                fill={activeView === 'grid' ? 'orange' : 'gray'}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full table-auto">
          {showHeader && (
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="peer hidden"
                      id="select-checkbox"
                    />
                    <label
                      htmlFor="select-checkbox"
                      className="block w-4 h-4 border border-gray-300 bg-white rounded-md cursor-pointer peer-checked:bg-orange-500 peer-checked:border-orange-500 flex items-center justify-center transition duration-150"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 peer-checked:text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </label>
                  </div>
                </th>

                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  <div className="flex items-center">
                    Tên sản phẩm
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  <div className="flex items-center">
                    Tên ngành hàng
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  <div className="relative flex items-center">
                    Doanh số
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 32 32"
                      className="w-3 h-3 ml-2 text-gray-600"
                      onMouseEnter={handleMouseEnter1}
                      onMouseLeave={handleMouseLeave1}
                    >
                      <path d="M32 16a16 16 0 1 0-16 16 16 16 0 0 0 16-16zm-2 0A14 14 0 1 1 16 2a14 14 0 0 1 14 14zm-19.44-3.88a5.51 5.51 0 0 1 1.68-3.74A5.33 5.33 0 0 1 16 7a5.6 5.6 0 0 1 3.92 1.36 4.47 4.47 0 0 1 1.49 3.46 4.81 4.81 0 0 1-.51 2.2 8 8 0 0 1-1.9 2.24 6.82 6.82 0 0 0-1.74 2 6.57 6.57 0 0 0-.32 2.43h-2a8.15 8.15 0 0 1 .49-3.29 7.41 7.41 0 0 1 1.82-2.23 7.65 7.65 0 0 0 1.65-1.82 2.93 2.93 0 0 0 .31-1.35 3.15 3.15 0 0 0-.87-2.29A3 3 0 0 0 16 8.79q-2.76 0-3.24 3.33h-2.2zM17.18 25h-2.35v-2.48h2.36V25z" />
                    </svg>
                    {(isTooltipVisible1 || isPermanentTooltip) && (
                      <div
                        className="absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isPermanentTooltip && (
                          <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            onClick={handleCloseTooltip}
                          >
                            <X size={16} />
                          </button>
                        )}
                        <div
                          className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 
                          border-l-8 border-l-transparent 
                          border-b-8 border-b-gray-300 
                          border-r-8 border-r-transparent"
                        />
                        <div
                          className="absolute -top-[6px] left-1/2 transform -translate-x-1/2 w-0 h-0 
                          border-l-[6px] border-l-transparent 
                          border-b-[6px] border-b-white 
                          border-r-[6px] border-r-transparent"
                        />
                        <div className="font-semibold mb-2 select-text">Thông tin doanh số của sản phẩm đã bao gồm cả doanh số của từng phân loại (kể cả những phân loại đã bị xóa)</div>
                      </div>
                    )}
                    <div className="flex flex-col ml-1 p-1 space-y-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 -5 16 16"
                        className="w-4 h-4 text-gray-600"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.57253679,6.40074676 L5.1530248,8.66903925 C4.90120463,8.90512066 4.88844585,9.30064304 5.12452726,9.55246321 C5.24268191,9.67849483 5.40773242,9.75 5.58048801,9.75 L10.419512,9.75 C10.76469,9.75 11.044512,9.47017797 11.044512,9.125 C11.044512,8.95224442 10.9730068,8.7871939 10.8469752,8.66903925 L8.42746321,6.40074676 C8.18705183,6.17536109 7.81294817,6.17536109 7.57253679,6.40074676 Z"
                        ></path>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 5 16 16"
                        className="w-4 h-4 text-gray-600"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.42746321,9.59925324 L10.8469752,7.33096075 C11.0987954,7.09487934 11.1115542,6.69935696 10.8754727,6.44753679 C10.7573181,6.32150517 10.5922676,6.25 10.419512,6.25 L5.58048801,6.25 C5.23531002,6.25 4.95548797,6.52982203 4.95548797,6.875 C4.95548797,7.04775558 5.0269932,7.2128061 5.1530248,7.33096075 L7.57253679,9.59925324 C7.81294817,9.82463891 8.18705183,9.82463891 8.42746321,9.59925324 Z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  <div className="flex items-center">
                    Giá
                    <div className="flex flex-col ml-1 p-1 space-y-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 -5 16 16"
                        className="w-4 h-4 text-gray-600"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.57253679,6.40074676 L5.1530248,8.66903925 C4.90120463,8.90512066 4.88844585,9.30064304 5.12452726,9.55246321 C5.24268191,9.67849483 5.40773242,9.75 5.58048801,9.75 L10.419512,9.75 C10.76469,9.75 11.044512,9.47017797 11.044512,9.125 C11.044512,8.95224442 10.9730068,8.7871939 10.8469752,8.66903925 L8.42746321,6.40074676 C8.18705183,6.17536109 7.81294817,6.17536109 7.57253679,6.40074676 Z"
                        ></path>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 5 16 16"
                        className="w-4 h-4 text-gray-600"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.42746321,9.59925324 L10.8469752,7.33096075 C11.0987954,7.09487934 11.1115542,6.69935696 10.8754727,6.44753679 C10.7573181,6.32150517 10.5922676,6.25 10.419512,6.25 L5.58048801,6.25 C5.23531002,6.25 4.95548797,6.52982203 4.95548797,6.875 C4.95548797,7.04775558 5.0269932,7.2128061 5.1530248,7.33096075 L7.57253679,9.59925324 C7.81294817,9.82463891 8.18705183,9.82463891 8.42746321,9.59925324 Z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  <div className="relative flex items-center">
                    Kho hàng
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 32 32"
                      className="w-3 h-3 ml-2 text-gray-600"
                      onMouseEnter={handleMouseEnter2}
                      onMouseLeave={handleMouseLeave2}
                    >
                      <path d="M32 16a16 16 0 1 0-16 16 16 16 0 0 0 16-16zm-2 0A14 14 0 1 1 16 2a14 14 0 0 1 14 14zm-19.44-3.88a5.51 5.51 0 0 1 1.68-3.74A5.33 5.33 0 0 1 16 7a5.6 5.6 0 0 1 3.92 1.36 4.47 4.47 0 0 1 1.49 3.46 4.81 4.81 0 0 1-.51 2.2 8 8 0 0 1-1.9 2.24 6.82 6.82 0 0 0-1.74 2 6.57 6.57 0 0 0-.32 2.43h-2a8.15 8.15 0 0 1 .49-3.29 7.41 7.41 0 0 1 1.82-2.23 7.65 7.65 0 0 0 1.65-1.82 2.93 2.93 0 0 0 .31-1.35 3.15 3.15 0 0 0-.87-2.29A3 3 0 0 0 16 8.79q-2.76 0-3.24 3.33h-2.2zM17.18 25h-2.35v-2.48h2.36V25z" />
                    </svg>
                    {(isTooltipVisible2 || isPermanentTooltip) && (
                      <div
                        className="absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isPermanentTooltip && (
                          <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            onClick={handleCloseTooltip}
                          >
                            <X size={16} />
                          </button>
                        )}
                        <div
                          className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 
                border-l-8 border-l-transparent 
                border-b-8 border-b-gray-300 
                border-r-8 border-r-transparent"
                        />
                        <div
                          className="absolute -top-[6px] left-1/2 transform -translate-x-1/2 w-0 h-0 
                border-l-[6px] border-l-transparent 
                border-b-[6px] border-b-white 
                border-r-[6px] border-r-transparent"
                        />
                        <div className="font-semibold mb-2 select-text">Tồn kho là tổng số lượng sản phẩm có sẵn để bán, bao gồm cả số lượng hàng được đăng ký khuyến mãi. Nếu sản phẩm đang tham gia khuyến mãi, hệ thống sẽ hiển thị cả số tồn kho đang không tham gia chương trình.</div>
                      </div>
                    )}
                    <div className="flex flex-col ml-1 p-1 space-y-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 -5 16 16"
                        className="w-4 h-4 text-gray-600"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.57253679,6.40074676 L5.1530248,8.66903925 C4.90120463,8.90512066 4.88844585,9.30064304 5.12452726,9.55246321 C5.24268191,9.67849483 5.40773242,9.75 5.58048801,9.75 L10.419512,9.75 C10.76469,9.75 11.044512,9.47017797 11.044512,9.125 C11.044512,8.95224442 10.9730068,8.7871939 10.8469752,8.66903925 L8.42746321,6.40074676 C8.18705183,6.17536109 7.81294817,6.17536109 7.57253679,6.40074676 Z"
                        ></path>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 5 16 16"
                        className="w-4 h-4 text-gray-600"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.42746321,9.59925324 L10.8469752,7.33096075 C11.0987954,7.09487934 11.1115542,6.69935696 10.8754727,6.44753679 C10.7573181,6.32150517 10.5922676,6.25 10.419512,6.25 L5.58048801,6.25 C5.23531002,6.25 4.95548797,6.52982203 4.95548797,6.875 C4.95548797,7.04775558 5.0269932,7.2128061 5.1530248,7.33096075 L7.57253679,9.59925324 C7.81294817,9.82463891 8.18705183,9.82463891 8.42746321,9.59925324 Z"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  <div className="relative flex items-center">
                    Chất lượng nội dung
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 32 32"
                      className="w-3 h-3 ml-2 text-gray-600"
                      onMouseEnter={handleMouseEnter3}
                      onMouseLeave={handleMouseLeave3}
                    >
                      <path d="M32 16a16 16 0 1 0-16 16 16 16 0 0 0 16-16zm-2 0A14 14 0 1 1 16 2a14 14 0 0 1 14 14zm-19.44-3.88a5.51 5.51 0 0 1 1.68-3.74A5.33 5.33 0 0 1 16 7a5.6 5.6 0 0 1 3.92 1.36 4.47 4.47 0 0 1 1.49 3.46 4.81 4.81 0 0 1-.51 2.2 8 8 0 0 1-1.9 2.24 6.82 6.82 0 0 0-1.74 2 6.57 6.57 0 0 0-.32 2.43h-2a8.15 8.15 0 0 1 .49-3.29 7.41 7.41 0 0 1 1.82-2.23 7.65 7.65 0 0 0 1.65-1.82 2.93 2.93 0 0 0 .31-1.35 3.15 3.15 0 0 0-.87-2.29A3 3 0 0 0 16 8.79q-2.76 0-3.24 3.33h-2.2zM17.18 25h-2.35v-2.48h2.36V25z" />
                    </svg>
                    {(isTooltipVisible3 || isPermanentTooltip) && (
                      <div
                        className="absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isPermanentTooltip && (
                          <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            onClick={handleCloseTooltip}
                          >
                            <X size={16} />
                          </button>
                        )}
                        <div
                          className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 
                border-l-8 border-l-transparent 
                border-b-8 border-b-gray-300 
                border-r-8 border-r-transparent"
                        />
                        <div
                          className="absolute -top-[6px] left-1/2 transform -translate-x-1/2 w-0 h-0 
                border-l-[6px] border-l-transparent 
                border-b-[6px] border-b-white 
                border-r-[6px] border-r-transparent"
                        />
                        <div className="font-semibold mb-2 select-text">Chất lượng nội dung bao gồm chất lượng hình ảnh, mô tả, thông tin sản phẩm,... Chất lượng nội dung sản phẩm càng cao sẽ đem đến càng nhiều lượng truy cập và doanh số cho sản phẩm.</div>
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                  Thao tác
                </th>
              </tr>
            </thead>
          )}
          <tbody>
            {products.length > 0 ? (
              products.map((product) =>
                product.details.map((detail, detailIndex) => (
                  <tr key={`${product.name}-${detailIndex}`} className="border-b hover:bg-gray-50">
                    <td className="p-3 border text-black"></td>
                    <td className="p-3 border text-black">
                      {`${product.name} - ${detail.type_1}${detail.type_2 ? ` - ${detail.type_2}` : ''}`}
                    </td>
                    <td className="p-3 border text-black">
                      {product.categories.join(' - ')}
                    </td>
                    <td className="p-3 border text-black">{product.soldQuantity}</td>
                    <td className="p-3 border text-black">{detail.price.toLocaleString()} VND</td>
                    <td className="p-3 border text-black">{detail.quantity}</td>
                    <td className="p-3 border text-black">
                      <div className="flex flex-col">
                        <div className="mb-2 text-black">
                          {isDescriptionExpanded(product.name, detailIndex)
                            ? product.description
                            : (<>{product.description.slice(0, 100)}
                              <span
                                className="text-blue-500 cursor-pointer ml-1"
                                onClick={() => toggleDescription(product.name, detailIndex)}
                              >
                                ...
                              </span></>
                            )
                          }
                          {isDescriptionExpanded(product.name, detailIndex) && (
                            <span
                              className="text-blue-500 cursor-pointer ml-1"
                              onClick={() => toggleDescription(product.name, detailIndex)}
                            >
                              [Thu gọn]
                            </span>
                          )}
                        </div>
                        {detail.image && (
                          <img
                            src={detail.image}
                            alt={`${product.name} - ${detail.type_1}`}
                            className="w-24 h-24 object-cover bg-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = fallbackImageBase64;
                            }}
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-3 border text-black">
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleEdit(product.name, product.productID, detail.type_id)}
                          className="bg-white text-black p-1 rounded focus:outline-none"
                          title="Edit"
                          style={{ border: 'none', boxShadow: 'none' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this item?")) {
                              handleDelete(product.productID, detail.type_id);
                            }
                          }}
                          className="bg-white text-black p-1 rounded focus:outline-none"
                          title="Delete"
                          style={{ border: 'none', boxShadow: 'none' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center">
                    <Package className="w-16 h-16 text-gray-400 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">
                      Không tìm thấy sản phẩm
                    </h2>
                    <p className="text-gray-500">
                      Rất tiếc, chúng tôi không thể tìm thấy sản phẩm bạn đang tìm kiếm.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <EditProductVariantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={selectedProduct}
        productId={selectedProductID}
        variantId={selectedVariantId}
        products={products}
        onSave={handleSave}
      />
    </div>
  );
};

export default AllActived;