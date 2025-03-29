import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react'; 

interface ProductDetail {
    type_id: number;
    type_1: string; 
    type_2: string; 
    image: string;  
    price: number;  
    quantity: number; 
}

interface Classification {
    classTypeName: string; 
    level: number;         
}

interface Product {

    id: number;
    name: string;
    description: string;
    categories: string[]; 
    images: string[];     
    soldQuantity: number;
    rating: number;
    coverImage: string;   
    video: string | null; 
    quantity: number;     
    reviews: number;      
    classifications: Classification[]; 
    details: ProductDetail[];           

}

export const AdminProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = `Chi tiết sản phẩm #${id}`; 

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {

        const response = await fetch(`/api/product/admin/products/${id}`); 

        if (response.ok) {
          const data: Product = await response.json();
          setProduct(data);
        } else if (response.status === 404) {
            setError('Sản phẩm không tồn tại.');
        } else {
          const errorData = await response.json().catch(() => ({}));
          setError(`Không thể tải thông tin sản phẩm: ${errorData.message || response.statusText}`);
        }
      } catch (err) {
        setError(`Đã xảy ra lỗi khi tải thông tin sản phẩm: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        <span className="ml-3 text-gray-600">Đang tải...</span>
      </div>
    );
  }

   if (error) {
    return (
        <div className="container mx-auto px-4 py-6">
             <div className="mb-4 text-sm text-gray-600 flex items-center">
                <Link to="/admin" className="hover:text-orange-600 transition-colors">Trang chủ</Link>
                <ChevronRight size={16} className="mx-1 text-gray-400" />
                <Link to="/admin/products" className="hover:text-orange-600 transition-colors">Quản lý sản phẩm</Link>
                <ChevronRight size={16} className="mx-1 text-gray-400" />
                <span className="font-medium text-gray-800">Lỗi</span>
             </div>
             <div className="p-4 bg-red-100 text-red-700 border border-red-400 rounded">
                 {error}
             </div>
             <Link
                to="/admin/products"
                className="mt-4 inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                <ArrowLeft size={16} className="mr-1" /> Quay lại danh sách
            </Link>
        </div>
    );
   }

   if (!product) {
      return (
          <div className="container mx-auto px-4 py-6">
               <div className="p-4 bg-yellow-100 text-yellow-700 border border-yellow-400 rounded">
                   Sản phẩm không tồn tại.
               </div>
                 <Link
                    to="/admin/products"
                    className="mt-4 inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                  >
                    <ArrowLeft size={16} className="mr-1" /> Quay lại danh sách
                </Link>
          </div>
      );
   }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <div className="mb-4 text-sm text-gray-600 flex items-center">
        <Link to="/admin" className="hover:text-orange-600 transition-colors">Trang chủ</Link>
        <ChevronRight size={16} className="mx-1 text-gray-400" />
        <Link to="/admin/products" className="hover:text-orange-600 transition-colors">Quản lý sản phẩm</Link>
        <ChevronRight size={16} className="mx-1 text-gray-400" />
        <span className="font-medium text-gray-800">Chi tiết sản phẩm</span>
      </div>

      {/* Main Content Card */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h4 className="text-xl font-semibold text-gray-800">Chi tiết sản phẩm - #{product.id}</h4>
        </div>
        <div className="p-6 space-y-6">
          {/* Basic Info Section - Removed fields not in detail API */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cover Image */}
            <div className="md:col-span-1">
                <h5 className="font-medium text-gray-700 mb-2">Ảnh bìa</h5>
                <img
                    src={product.coverImage}
                    alt={`Ảnh bìa ${product.name}`}
                    className="w-full h-auto max-h-80 object-contain rounded border"
                />
            </div>

            {/* Text Details */}
            <div className="md:col-span-1 space-y-4 text-sm">
                 <div>
                  <h5 className="font-medium text-gray-500 mb-1">Tên sản phẩm</h5>
                  <p className="text-gray-900 font-semibold text-base">{product.name}</p>
                </div>
                 <div>
                  <h5 className="font-medium text-gray-500 mb-1">Danh mục</h5>
                  <p className="text-gray-600">{product.categories?.join(', ') || 'N/A'}</p>
                </div>
                 <div>
                  <h5 className="font-medium text-gray-500 mb-1">Đánh giá</h5>
                  <p className="text-gray-600">{product.rating} ⭐ ({product.reviews} đánh giá)</p>
                </div>
                 <div>
                  <h5 className="font-medium text-gray-500 mb-1">Đã bán / Tổng tồn kho</h5>
                  <p className="text-gray-600">{product.soldQuantity} / {product.quantity}</p>
                </div>
                {/* Removed Status, Dates, Min/Max Price */}
            </div>

            <div className="md:col-span-2 pt-4 border-t">
              <h5 className="font-medium text-gray-700 mb-1">Mô tả</h5>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{product.description}</p>
            </div>

             {/* Other Images Section */}
              {product.images && product.images.length > 0 && (
                <div className="md:col-span-2 pt-4 border-t">
                    <h5 className="font-medium text-gray-700 mb-2">Hình ảnh khác</h5>
                    <div className="flex flex-wrap gap-2">
                        {product.images.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`Hình ảnh ${index + 1} của ${product.name}`}
                                className="h-20 w-20 object-cover rounded border cursor-pointer hover:opacity-80"
                                onClick={() => window.open(img, '_blank')} 
                            />
                        ))}
                    </div>
                </div>
              )}

             {/* Video Section - Added */}
              {product.video && (
                <div className="md:col-span-2 pt-4 border-t">
                    <h5 className="font-medium text-gray-700 mb-2">Video sản phẩm</h5>
                    <div className="aspect-video w-full max-w-xl"> {/* Maintain aspect ratio */}
                        <video
                            controls
                            src={product.video}
                            className="w-full h-full rounded border bg-black" 
                        >
                            Trình duyệt của bạn không hỗ trợ thẻ video.
                        </video>
                    </div>
                </div>
              )}

          </div>

          {/* Classifications */}
           {product.classifications && product.classifications.length > 0 && (
            <div className="pt-4 border-t">
                 <h5 className="font-medium text-lg text-gray-800 mb-3">Phân loại</h5>
                 <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                     {product.classifications.map((c, index) => (
                        <li key={index}>{c.classTypeName} (Cấp độ: {c.level})</li>
                    ))}
                 </ul>
            </div>
           )}

          {/* Product Details Table */}
           {product.details && product.details.length > 0 && (
            <div className="pt-4 border-t">
                 <h5 className="font-medium text-lg text-gray-800 mb-3">Chi tiết biến thể</h5>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#ID</th>
                          {/* Dynamically add headers based on classifications */}
                          {product.classifications?.find(c => c.level === 1) && <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{product.classifications.find(c => c.level === 1)?.classTypeName}</th>}
                          {product.classifications?.find(c => c.level === 2) && <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{product.classifications.find(c => c.level === 2)?.classTypeName}</th>}
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ảnh</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {product.details.map((detail) => (
                          <tr key={detail.type_id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{detail.type_id}</td>
                            {product.classifications?.find(c => c.level === 1) && <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{detail.type_1}</td>}
                            {product.classifications?.find(c => c.level === 2) && <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{detail.type_2}</td>}
                            <td className="px-4 py-2 whitespace-nowrap">
                              {detail.image ? (
                                 <img src={detail.image} alt={`${detail.type_1 || ''} ${detail.type_2 || ''}`} className="h-10 w-10 object-cover rounded" />
                              ) : (
                                <div className='h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500'>No Img</div>
                              )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{detail.price.toLocaleString()} ₫</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{detail.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              </div>
            )}

          {/* Back Button */}
          <div className="mt-6 border-t pt-4">
            <Link
              to="/admin/products"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm transition-colors"
            >
               <ArrowLeft size={16} className="mr-1" /> Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};