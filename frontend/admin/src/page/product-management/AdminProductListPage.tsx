import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, X } from 'lucide-react'; // Added icons

interface Product {
  id: number;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  minPrice: number;
  maxPrice: number;
}

interface AdminProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export const AdminProductListPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToBlock, setProductToBlock] = useState<number | null>(null);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false); // For modal buttons

  // Fetch data effect
  useEffect(() => {
    document.title = 'Quản lý sản phẩm';
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusFilter]); // Trigger fetch when these change

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    setIsProcessing(false); // Reset processing state on new fetch
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const url = `/api/product/admin/products?${params.toString()}`;
      const response = await fetch(url);

      if (response.ok) {
        const data: AdminProductListResponse = await response.json();
        setProducts(data.products);
        setTotal(data.total);
        // Adjust page if current page becomes invalid
        const calculatedTotalPages = Math.ceil(data.total / limit);
        if (data.total > 0 && page > calculatedTotalPages) {
          setPage(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
        } else if (data.total === 0 && page !== 1) {
          setPage(1); // Reset to page 1 if no results
        }
      } else {
        const errorData = await response.json().catch(() => ({})); // Catch JSON parse error
        setError(`Không thể tải danh sách sản phẩm: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      setError(`Đã xảy ra lỗi khi tải danh sách sản phẩm: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Event Handlers ---
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
    }
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1); // Reset page when limit changes
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value);
    setPage(1); // Reset page on filter change
    // Fetch is triggered by useEffect dependency change
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    setPage(1); // Reset page on new search
    fetchProducts(); // Manually trigger fetch
  };

  const handleApprove = async (id: number) => {
    setError(null);
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/product/admin/products/${id}/approve`, { method: 'PATCH' });
      if (response.ok) {
        setProducts(products.map((p) => (p.id === id ? { ...p, status: 'Approved' } : p)));
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(`Không thể duyệt sản phẩm: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      setError(`Đã xảy ra lỗi khi duyệt sản phẩm: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBlockClick = (id: number) => {
    setProductToBlock(id);
    setBlockReason(''); // Clear previous reason
    setError(null); // Clear previous modal errors
    setShowBlockModal(true);
  };

  const confirmBlock = async () => {
    if (!productToBlock || !blockReason) return; // Ensure reason is provided
    setError(null);
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/product/admin/products/${productToBlock}/block`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: blockReason }),
      });
      if (response.ok) {
        setProducts(products.map((p) => (p.id === productToBlock ? { ...p, status: 'Violated' } : p)));
        handleCloseBlockModal();
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Show error inside the modal
        setError(`Không thể chặn sản phẩm: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      setError(`Đã xảy ra lỗi khi chặn sản phẩm: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false); // Re-enable button even on error
    }
  };

  const handleDeleteClick = (id: number) => {
    setProductToDelete(id);
    setDeleteReason('');
    setError(null);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    setError(null);
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/product/admin/products/${productToDelete}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: deleteReason }),
      });
      if (response.ok || response.status === 204) {
        handleCloseDeleteModal();
        fetchProducts(); // Refetch to update list and pagination
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(`Không thể xóa sản phẩm: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      setError(`Đã xảy ra lỗi khi xóa sản phẩm: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseBlockModal = () => {
    setShowBlockModal(false);
    setProductToBlock(null);
    setBlockReason('');
    // setError(null); // Clear error only when closing manually if desired
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
    setDeleteReason('');
  };

  // --- Pagination Logic ---
  const totalPages = Math.ceil(total / limit);

  const renderPaginationItems = () => {
    const items = [];
    const maxPagesToShow = 5;
    let startPage, endPage;

    if (totalPages <= 1) return null; // No pagination if only 1 page or less

    if (totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
      const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;
      if (page <= maxPagesBeforeCurrent) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (page + maxPagesAfterCurrent >= totalPages) {
        startPage = totalPages - maxPagesToShow + 1;
        endPage = totalPages;
      } else {
        startPage = page - maxPagesBeforeCurrent;
        endPage = page + maxPagesAfterCurrent;
      }
    }

    // First and Previous
    items.push(
      <button key="first" onClick={() => handlePageChange(1)} disabled={page === 1} className="px-3 py-1 border rounded-l-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">First</button>
    );
    items.push(
      <button key="prev" onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="px-3 py-1 border-t border-b bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Prev</button>
    );

    if (startPage > 1) {
      items.push(<span key="start-ellipsis" className="px-3 py-1 border-t border-b border-l bg-white text-gray-500">...</span>);
    }

    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <button key={number} onClick={() => handlePageChange(number)} disabled={number === page} className={`px-3 py-1 border-t border-b border-l ${number === page ? 'bg-orange-600 text-white border-orange-600 z-10' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
          {number}
        </button>
      );
    }

    if (endPage < totalPages) {
        // Ensure border-l is added to the ellipsis if it follows numbered pages
      items.push(<span key="end-ellipsis" className={`px-3 py-1 border-t border-b ${endPage >= startPage ? 'border-l' : ''} bg-white text-gray-500`}>...</span>);
    }

    // Next and Last
    items.push(
      <button key="next" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="px-3 py-1 border-t border-b border-l bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
    );
    items.push(
        <button key="last" onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} className="px-3 py-1 border rounded-r-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Last</button>
    );

    return <div className="inline-flex rounded-md shadow-sm -space-x-px">{items}</div>;
  };


  // --- Render ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        <span className="ml-3 text-gray-600">Đang tải...</span>
      </div>
    );
  }

    // Display main error if fetch failed
    if (error && products.length === 0) {
        return (
            <div className="p-4">
                <div className="mb-4 text-sm text-gray-600 flex items-center">
                    <Link to="/admin" className="hover:text-orange-600 transition-colors">Trang chủ</Link>
                    <ChevronRight size={16} className="mx-1 text-gray-400" />
                    <span className="font-medium text-gray-800">Quản lý sản phẩm</span>
                </div>
                <div className="p-4 bg-red-100 text-red-700 border border-red-400 rounded">
                    {error}
                </div>
            </div>
        );
    }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <div className="mb-4 text-sm text-gray-600 flex items-center">
        <Link to="/admin" className="hover:text-orange-600 transition-colors">Trang chủ</Link>
        <ChevronRight size={16} className="mx-1 text-gray-400" />
        <span className="font-medium text-gray-800">Quản lý sản phẩm</span>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h4 className="mb-0 text-xl font-semibold text-gray-800">Danh sách sản phẩm</h4>
        </div>
        <div className="p-6">
          {/* Filters Row */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Status Filter */}
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="productStatusFilter" className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                id="productStatusFilter"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="">Tất cả</option>
                <option value="Pending">Chờ duyệt</option>
                <option value="Approved">Đã duyệt</option>
                <option value="Violated">Vi phạm</option>
              </select>
            </div>
            {/* Search Form */}
            <div className="flex-1 min-w-[300px]">
              <form onSubmit={handleSearchSubmit}>
                <label htmlFor="productSearchInput" className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                <div className="flex">
                  <input
                    id="productSearchInput"
                    type="text"
                    placeholder="Nhập tên sản phẩm"
                    className="flex-grow p-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-orange-500 focus:border-orange-500 outline-none"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 text-white rounded-r-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 inline-flex items-center"
                  >
                    <Search size={18} className="mr-1" /> Tìm
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Display error if fetch succeeded but actions failed */}
          {error && <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày cập nhật</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Giá thấp nhất</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Giá cao nhất</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{product.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800 max-w-xs truncate"> {/* Added max-w/truncate */}
                        <Link to={`/admin/products/${product.id}`} title={product.name}>
                          {product.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.status === 'Approved' ? 'bg-green-100 text-green-800'
                            : product.status === 'Pending' ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.status === 'Approved' ? 'Đã duyệt'
                            : product.status === 'Pending' ? 'Chờ duyệt'
                            : 'Vi phạm'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(product.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(product.updatedAt).toLocaleString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{product.minPrice.toLocaleString()} ₫</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{product.maxPrice.toLocaleString()} ₫</td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium space-x-1">
                        {/* Action Buttons */}
                        {['Pending', 'Violated'].includes(product.status) && (
                          <button
                            className="px-2 py-1 text-xs border border-green-500 text-green-600 rounded hover:bg-green-50 disabled:opacity-50"
                            onClick={() => handleApprove(product.id)}
                            title="Duyệt sản phẩm"
                            disabled={isProcessing}
                          >
                            Duyệt
                          </button>
                        )}
                        {['Pending','Approved'].includes(product.status) && (
                          <button
                            className="px-2 py-1 text-xs border border-yellow-500 text-yellow-600 rounded hover:bg-yellow-50 disabled:opacity-50"
                            onClick={() => handleBlockClick(product.id)}
                            title="Chặn sản phẩm"
                            disabled={isProcessing}
                          >
                            Chặn
                          </button>
                        )}
                        <button
                          className="px-2 py-1 text-xs border border-red-500 text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
                          onClick={() => handleDeleteClick(product.id)}
                          title="Xóa sản phẩm"
                          disabled={isProcessing}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-4 text-center text-sm text-gray-500">Không tìm thấy sản phẩm nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mt-4">
            <div className='text-sm text-gray-600 mb-2 md:mb-0'>
              {total > 0
                ? `Hiển thị ${ (page - 1) * limit + 1 } đến ${Math.min( page * limit, total )} trong tổng số ${total} sản phẩm`
                : 'Không có sản phẩm nào'
              }
            </div>
            <div className="flex items-center space-x-2">
                <label htmlFor="itemsPerPageSelect" className="text-sm text-gray-600">Hiển thị:</label>
                <select
                    id="itemsPerPageSelect"
                    value={limit}
                    onChange={handleLimitChange}
                    className="p-1 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
                    aria-label="Số sản phẩm hiển thị mỗi trang"
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">/ trang</span>
                <div className="ml-4">
                    {renderPaginationItems()}
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-60 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
               <h3 className="text-lg font-semibold text-gray-800">Chặn sản phẩm</h3>
               <button onClick={handleCloseBlockModal} className="text-gray-400 hover:text-gray-600" disabled={isProcessing}>
                    <X size={20} />
               </button>
            </div>
            {/* Error display inside modal */}
            {error && showBlockModal && <div className="p-3 mb-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>}
            <div className="mb-4">
                <label htmlFor="blockReasonTextarea" className="block text-sm font-medium text-gray-700 mb-1">Lý do chặn:<span className="text-red-500">*</span></label>
                <textarea
                  id="blockReasonTextarea"
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  required
                  aria-describedby="blockReasonHelp"
                />
                <p id="blockReasonHelp" className="mt-1 text-xs text-gray-500">Vui lòng nhập lý do chặn sản phẩm.</p>
            </div>
            <div className="flex justify-end gap-3 mt-5">
               <button type="button" onClick={handleCloseBlockModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium" disabled={isProcessing}>Hủy</button>
               <button
                    type="button"
                    onClick={confirmBlock}
                    disabled={!blockReason || isProcessing}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
               >
                 {isProcessing ? (
                   <>
                     <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                     Đang xử lý...
                   </>
                 ) : 'Chặn'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
       {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-60 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
               <h3 className="text-lg font-semibold text-gray-800">Xác nhận xóa</h3>
               <button onClick={handleCloseDeleteModal} className="text-gray-400 hover:text-gray-600" disabled={isProcessing}>
                  <X size={20} />
               </button>
            </div>
             {/* Error display inside modal */}
            {error && showDeleteModal && <div className="p-3 mb-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>}
             <div className="mb-4">
                <label htmlFor="deleteReasonTextarea" className="block text-sm font-medium text-gray-700 mb-1">Lý do xóa (không bắt buộc):</label>
                <textarea
                  id="deleteReasonTextarea"
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  aria-describedby="deleteReasonHelp"
                />
                <p id="deleteReasonHelp" className="mt-1 text-xs text-gray-500">Nhập lý do xóa (nếu có).</p>
             </div>
             <p className="text-red-600 font-medium mb-5">Bạn có chắc chắn muốn xóa sản phẩm này vĩnh viễn?</p>
             <div className="flex justify-end gap-3 mt-5">
               <button type="button" onClick={handleCloseDeleteModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium" disabled={isProcessing}>Hủy</button>
               <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                >
                  {isProcessing ? (
                   <>
                     <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                     Đang xử lý...
                   </>
                 ) : 'Xóa vĩnh viễn'}
               </button>
             </div>
          </div>
        </div>
       )}

    </div>
  );
};