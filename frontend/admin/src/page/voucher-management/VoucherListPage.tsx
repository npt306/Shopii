import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Plus, Eye, Edit, Trash2, X, Search } from 'lucide-react';

// Interface Voucher remains the same
interface Voucher {
  id: number;
  name: string;
  code: string;
  starts_at: string;
  ends_at: string;
  per_customer_limit: number;
  total_usage_limit: number;
  condition_type: string;
  action_type: string;
  discount_amount?: number;
  discount_percentage?: number;
  min_order_amount?: number;
  created_at: string;
  updated_at: string;
}

// Interface VoucherListResponse remains the same
interface VoucherListResponse {
    data: Voucher[];
    total: number;
}


export const VoucherListPage = () => {
  // --- State variables remain the same ---
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Quản lý Voucher';
    fetchVouchers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, statusFilter, currentSearch]);

  // --- fetchVouchers function with improved safety ---
  const fetchVouchers = async () => {
    setLoading(true);
    setError(null);
    setIsProcessing(false);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      if (currentSearch) {
        params.append('search', currentSearch);
      }

      const url = `/api/vouchers?${params.toString()}`;
      console.log("Fetching:", url);

      const response = await fetch(url);

      if (response.ok) {
        const result: VoucherListResponse = await response.json();

        // --- FIX: Ensure data and total are set safely ---
        const fetchedData = result.data || []; // Default to empty array if data is missing/null/undefined
        const fetchedTotal = result.total || 0;   // Default to 0 if total is missing/null/undefined

        setVouchers(fetchedData);
        setTotal(fetchedTotal);
        // ----------------------------------------------------

        // Adjust page if current page becomes invalid
        const calculatedTotalPages = Math.ceil(fetchedTotal / limit);
         if (fetchedTotal > 0 && page > calculatedTotalPages) {
            // Fetch again for the last valid page if current page is out of bounds
             setPage(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
             // Note: This might cause a double fetch if the API call itself adjusts the page.
             // Consider if the backend already handles invalid page numbers gracefully.
             // If the backend returns data for page 1 when page > totalPages is requested,
             // you might not need this client-side adjustment.
         } else if (fetchedTotal === 0 && page !== 1) {
             setPage(1); // Reset to page 1 if no results
         }

      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(`Không thể tải danh sách voucher: ${errorData.message || response.statusText}`);
        setVouchers([]); // Ensure vouchers is an empty array on error
        setTotal(0);     // Ensure total is 0 on error
      }
    } catch (err) {
      setError(`Đã xảy ra lỗi khi tải danh sách voucher: ${err instanceof Error ? err.message : String(err)}`);
       setVouchers([]); // Ensure vouchers is an empty array on catch
       setTotal(0);     // Ensure total is 0 on catch
    } finally {
      setLoading(false);
    }
  };

  // --- Other handlers remain the same ---
  const handleDeleteClick = (id: number) => {
    setError(null);
    setVoucherToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (voucherToDelete === null) return;
    setError(null);
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/vouchers/${voucherToDelete}`, { method: 'DELETE' });
      if (response.ok || response.status === 204) {
        // Instead of filtering, refetch to get the correct total and potentially new page data
        fetchVouchers();
        handleCloseModal();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(`Không thể xóa voucher: ${errorData.message || response.statusText}`);
        handleCloseModal();
      }
    } catch (err) {
      setError(`Đã xảy ra lỗi khi xóa voucher: ${err instanceof Error ? err.message : String(err)}`);
      handleCloseModal();
    } finally {
        setIsProcessing(false);
    }
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setVoucherToDelete(null);
  };

  const handleEditClick = (id: number) => {
    navigate(`/admin/vouchers/edit/${id}`);
  };

  const handlePageChange = (newPage: number) => {
    const calculatedTotalPages = Math.ceil(total / limit);
    if (newPage >= 1 && newPage <= calculatedTotalPages && newPage !== page) {
      setPage(newPage);
    } else if (newPage < 1 && page !== 1) {
        setPage(1); // Go to first page if trying to go below 1
    } else if (newPage > calculatedTotalPages && page !== calculatedTotalPages && calculatedTotalPages > 0) {
        setPage(calculatedTotalPages); // Go to last page if trying to go beyond
    }
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    setPage(1);
    setCurrentSearch(searchQuery);
  };

  // --- Pagination Logic (totalPages calculation moved here) ---
  const totalPages = Math.ceil(total / limit);

  const renderPaginationItems = () => {
        // ... (Keep the existing pagination rendering logic) ...
        const items = [];
        const maxPagesToShow = 5;
        let startPage, endPage;

        if (totalPages <= 1) return null;

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
          items.push(<span key="end-ellipsis" className={`px-3 py-1 border-t border-b ${endPage >= startPage ? 'border-l' : ''} bg-white text-gray-500`}>...</span>);
        }

        items.push(
          <button key="next" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="px-3 py-1 border-t border-b border-l bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
        );
        items.push(
            <button key="last" onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} className="px-3 py-1 border rounded-r-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Last</button>
        );

        return <div className="inline-flex rounded-md shadow-sm -space-x-px">{items}</div>;
  };


  // --- Render Section (ensure checks for vouchers array) ---
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumbs */}
      <div className="mb-4 text-sm text-gray-600 flex items-center">
          <Link to="/admin" className="hover:text-orange-600 transition-colors">Trang chủ</Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="font-medium text-gray-800">Quản lý voucher</span>
      </div>

      {/* Card */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex flex-col md:flex-row justify-between md:items-center gap-4">
          <h4 className="mb-0 text-xl font-semibold text-gray-800">Danh sách Voucher</h4>
          <Link
            to="/admin/vouchers/add"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 text-sm font-medium"
          >
            <Plus size={18} className="mr-1"/> Thêm Voucher
          </Link>
        </div>
        {/* Body */}
        <div className="p-6">
            {/* Filters Row */}
            <div className="flex flex-wrap gap-4 mb-6">
              {/* Status Filter */}
              <div className="flex-1 min-w-[180px]">
                <label htmlFor="voucherStatusFilter" className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  id="voucherStatusFilter"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="">Tất cả</option>
                  <option value="active">Đang diễn ra</option>
                  <option value="upcoming">Sắp diễn ra</option>
                  <option value="expired">Đã kết thúc</option>
                </select>
              </div>
              {/* Search Form */}
              <div className="flex-1 min-w-[300px]">
                <form onSubmit={handleSearchSubmit}>
                  <label htmlFor="voucherSearchInput" className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                  <div className="flex">
                    <input
                      id="voucherSearchInput"
                      type="text"
                      placeholder="Nhập tên hoặc mã voucher"
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

          {/* Display error */}
          {error && <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>}

          {/* Table Area */}
           <div className="relative">
               {loading && ( // Show overlay during loading
                 <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                 </div>
               )}
               <div className={`overflow-x-auto ${loading ? 'opacity-50' : ''}`}> {/* Optional: reduce opacity while loading */}
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Voucher</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày bắt đầu</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày kết thúc</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* --- FIX: Check if vouchers is an array before using .length or .map --- */}
                        {Array.isArray(vouchers) && vouchers.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-4 text-center text-sm text-gray-500">Không có voucher nào khớp.</td>
                            </tr>
                        ) : (
                            Array.isArray(vouchers) && vouchers.map((voucher) => { // Also check before map
                                // ... (status calculation logic remains the same) ...
                                const now = new Date();
                                const startsAt = new Date(voucher.starts_at);
                                const endsAt = new Date(voucher.ends_at);
                                let status = 'Sắp diễn ra';
                                let statusClass = 'bg-blue-100 text-blue-800'; // Upcoming
                                if (now >= startsAt && now <= endsAt) {
                                status = 'Đang diễn ra';
                                statusClass = 'bg-green-100 text-green-800'; // Active
                                } else if (now > endsAt) {
                                status = 'Đã kết thúc';
                                statusClass = 'bg-gray-100 text-gray-600'; // Expired
                                }

                                return (
                                <tr key={voucher.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{voucher.id}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{voucher.name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 uppercase">{voucher.code}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{startsAt.toLocaleString()}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{endsAt.toLocaleString()}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${statusClass}`}>
                                        {status}
                                    </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium space-x-1">
                                    {/* Action buttons */}
                                    <Link
                                        to={`/admin/vouchers/${voucher.id}`}
                                        className="inline-flex items-center px-2 py-1 text-xs border border-blue-500 text-blue-600 rounded hover:bg-blue-50"
                                        title="Xem chi tiết"
                                    >
                                        <Eye size={14} className="mr-1"/> Xem
                                    </Link>
                                    <button
                                        onClick={() => handleEditClick(voucher.id)}
                                        className="inline-flex items-center px-2 py-1 text-xs border border-gray-500 text-gray-600 rounded hover:bg-gray-100"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit size={14} className="mr-1"/> Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(voucher.id)}
                                        className="inline-flex items-center px-2 py-1 text-xs border border-red-500 text-red-600 rounded hover:bg-red-50"
                                        title="Xóa"
                                    >
                                        <Trash2 size={14} className="mr-1"/> Xóa
                                    </button>
                                    </td>
                                </tr>
                                );
                            })
                        )}
                    </tbody>
                    </table>
                </div>
            </div>


          {/* Pagination Controls */}
           <div className="flex flex-col md:flex-row justify-between items-center mt-4">
                <div className='text-sm text-gray-600 mb-2 md:mb-0'>
                {/* --- FIX: Check if vouchers is an array before accessing length --- */}
                {total > 0 && Array.isArray(vouchers)
                    ? `Hiển thị ${ (page - 1) * limit + 1 } đến ${Math.min( page * limit, total )} trong tổng số ${total} voucher`
                    : 'Không có voucher nào'
                }
                </div>
                <div className="flex items-center space-x-2">
                    {/* Items per page dropdown */}
                    <label htmlFor="itemsPerPageSelect" className="text-sm text-gray-600">Hiển thị:</label>
                    <select
                        id="itemsPerPageSelect"
                        value={limit}
                        onChange={handleLimitChange}
                        className="p-1 border border-gray-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
                        aria-label="Số voucher hiển thị mỗi trang"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-600">/ trang</span>
                    {/* Pagination buttons */}
                    <div className="ml-4">
                        {renderPaginationItems()}
                    </div>
                </div>
            </div>

        </div>
      </div>

      {/* Delete Confirmation Modal (remains the same) */}
       {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-60 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
             <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Xác nhận xóa</h3>
                 <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600" disabled={isProcessing}>
                    <X size={20} />
                 </button>
             </div>
             <p className="mb-6 text-gray-600">Bạn có chắc chắn muốn xóa voucher này?</p>
             <div className="flex justify-end gap-3 mt-5">
               <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium" disabled={isProcessing}>Hủy</button>
               <button
                    onClick={confirmDelete}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium disabled:opacity-50 inline-flex items-center"
                >
                 {isProcessing ? (
                   <>
                     <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                     Đang xóa...
                   </>
                 ) : 'Xóa'}
               </button>
             </div>
          </div>
        </div>
       )}

    </div>
  );
};