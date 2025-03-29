import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Plus, Eye, Edit, Trash2, X } from 'lucide-react'; // Import icons

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

export const VoucherListPage = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // For modal delete
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Quản lý Voucher';
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    setError(null); // Reset error before fetch
    setIsProcessing(false);
    try {
      const response = await fetch('/api/vouchers');
      if (response.ok) {
        const data = await response.json();
        setVouchers(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(`Không thể tải danh sách voucher: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      setError(`Đã xảy ra lỗi khi tải danh sách voucher: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setError(null); // Clear previous errors
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
        setVouchers(vouchers.filter((v) => v.id !== voucherToDelete));
        handleCloseModal(); // Close modal on success
      } else {
        const errorData = await response.json().catch(() => ({}));
        // Display error on the main page after closing modal might be better UX
        setError(`Không thể xóa voucher: ${errorData.message || response.statusText}`);
        handleCloseModal(); // Close modal even on error
      }
    } catch (err) {
      setError(`Đã xảy ra lỗi khi xóa voucher: ${err instanceof Error ? err.message : String(err)}`);
      handleCloseModal(); // Close modal on error
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

  // --- Render ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
         <span className="ml-3 text-gray-600">Đang tải...</span>
      </div>
    );
  }

  // Show full page error if initial fetch failed
  if (error && vouchers.length === 0) {
    return (
       <div className="container mx-auto px-4 py-6">
            <div className="mb-4 text-sm text-gray-600 flex items-center">
                <Link to="/admin" className="hover:text-orange-600 transition-colors">Trang chủ</Link>
                <ChevronRight size={16} className="mx-1 text-gray-400" />
                <span className="font-medium text-gray-800">Quản lý voucher</span>
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
          <span className="font-medium text-gray-800">Quản lý voucher</span>
      </div>

      {/* Card */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
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
          {/* Display error if delete failed */}
          {error && <div className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>}

          {/* Table */}
          <div className="overflow-x-auto">
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
                {vouchers.length === 0 ? (
                     <tr>
                         <td colSpan={7} className="px-4 py-4 text-center text-sm text-gray-500">Không có voucher nào.</td>
                    </tr>
                ) : (
                    vouchers.map((voucher) => {
                        const now = new Date();
                        const startsAt = new Date(voucher.starts_at);
                        const endsAt = new Date(voucher.ends_at);
                        let status = 'Sắp diễn ra';
                        let statusClass = 'bg-yellow-100 text-yellow-800'; // Upcoming
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
      </div>

      {/* Delete Confirmation Modal */}
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