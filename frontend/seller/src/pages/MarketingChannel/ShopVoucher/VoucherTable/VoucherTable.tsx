import { useEffect, useState } from "react";
import axios from "axios";
import { EnvValue } from "../../../../env-value/envValue";
import { EditVoucherModal } from "./EditVoucherModal";
import { FaPencilAlt } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import "../../../../css/sellerVoucher.css";
import { SellerVoucher } from "../Shared/Interfaces"; // Adjust the import path as necessary
import { TabBar } from "./TabBar";
import { SearchBar } from "./SearchBar";
import { toast } from "react-toastify";
import ConfirmModal from "../Shared/ConfirmModal";

export const VoucherTable = () => {
  const [vouchers, setVouchers] = useState<SellerVoucher[]>([]);
  const [showVouchers, setShowVouchers] = useState<SellerVoucher[]>([]);
  const sellerid = Number(localStorage.getItem("user_accountId")) || 1;

  const currentDate = new Date();
  // Vouchers
  const fetchVouchers = async () => {
    try {
      const response = await axios.get(
        `${EnvValue.API_GATEWAY_URL}/api/vouchers/seller-vouchers/all/${sellerid}`
      );
      setVouchers(response.data); // Ensure the backend response is an array
      setShowVouchers(response.data); // Set the vouchers state with the fetched data
    } catch (error) {
      console.error("Error fetching vouchers:", error);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);
  // Tab bar
  const [selectedTab, setSelectedTab] = useState("Tất cả"); // State for the selected tab
  const tabs = ["Tất cả", "Đang diễn ra", "Sắp diễn ra", "Đã kết thúc"];
  const handleTabClick = (tabName: string) => {
    if (selectedTab !== tabName) {
      setSelectedTab(tabName);
    }
    if (tabName === "Tất cả") {
      setShowVouchers(vouchers); // Show all vouchers
    }
    if (tabName === "Đang diễn ra") {
      setShowVouchers(
        vouchers.filter((voucher) => {
          return (
            new Date(voucher.starts_at) <= currentDate &&
            new Date(voucher.ends_at) >= currentDate
          );
        })
      ); // Show only ongoing vouchers
    }
    if (tabName === "Sắp diễn ra") {
      setShowVouchers(
        vouchers.filter((voucher) => {
          return new Date(voucher.starts_at) > currentDate; // Show only upcoming vouchers
        })
      );
    }
    if (tabName === "Đã kết thúc") {
      setShowVouchers(
        vouchers.filter((voucher) => {
          return new Date(voucher.ends_at) < currentDate; // Show only ended vouchers
        })
      );
    }
  };

  // Search bar
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("name");
  const handleSearch = () => {
    const filteredVouchers = vouchers.filter((voucher) => {
      if (filterBy === "name") {
        return voucher.name.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (filterBy === "code") {
        return voucher.code.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
    setShowVouchers(filteredVouchers); // Update the displayed vouchers based on the search
    setSearchTerm(""); // Clear the search term after searching
    setSelectedTab("Tất cả"); // Reset the selected tab to "Tất cả"
  };

  // Edit Delete
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<SellerVoucher | null>(
    null
  );
  const [deleteVoucher, setDeleteVoucher] = useState(0);

  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  const handleEdit = (id: number) => () => {
    const voucher = vouchers.find((v) => v.id === id);
    if (voucher) {
      if (new Date(voucher.ends_at) < currentDate)
        return toast.info("Không thể chỉnh sửa voucher đã kết thúc");
      setSelectedVoucher(voucher); // Set the voucher to be edited
      setModalOpen(true); // Open the modal
    }
  };
  const onConfirmDelete = (id: number) => () => {
    setDeleteVoucher(id);
    const voucher = vouchers.find((v) => v.id === id);
    if (voucher) {
      if (new Date(voucher.ends_at) < currentDate)
        return toast.info("Không thể xóa voucher đã kết thúc");
      setConfirmModalOpen(true);
    } else toast.error("Không tìm thấy voucher");
  };
  const handleDelete = () => async () => {
    const id = deleteVoucher;
    const voucher = vouchers.find((v) => v.id === id);
    if (voucher) {
      if (new Date(voucher.ends_at) < currentDate)
        return toast.info("Không thể xóa voucher đã kết thúc");
      try {
        await axios.delete(
          `${EnvValue.API_GATEWAY_URL}/api/vouchers/seller-vouchers/${id}`
        );
        fetchVouchers(); // Refresh the voucher list after deletion
        toast.success("Xóa voucher thành công");
        setConfirmModalOpen(false);
      } catch (error) {
        console.error("Error deleting voucher:", error);
        toast.error("Không thể xóa voucher");
      }
    }
  };

  return (
    <>
      {/* Tab Bar */}
      <TabBar
        tabs={tabs}
        selectedTab={selectedTab}
        onTabClick={handleTabClick}
      />

      {/* Search Bar */}
      <SearchBar
        searchTerm={searchTerm}
        filterBy={filterBy}
        onSearchTermChange={setSearchTerm}
        onFilterByChange={setFilterBy}
        onSearch={handleSearch}
      />
      {/* TABLE */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-10 bg-gray-100 text-gray-700 font-semibold p-3 border-b border-gray-300">
          <div className="col-span-2">Tên Voucher | Mã voucher</div>
          <div>Loại mã</div>
          <div>Sản phẩm áp dụng</div>
          <div>Người mua mục tiêu</div>
          <div>Giảm giá</div>
          <div>Tổng lượt sử dụng tối đa</div>
          <div>Đã dùng</div>
          <div>Thời gian lưu Mã giảm giá</div>
          <div>Thao tác</div>
        </div>

        {/* Rows */}
        {showVouchers.length > 0 ? (
          showVouchers.map((voucher) => (
            <div
              key={voucher.id}
              className="grid grid-cols-10 p-3 border-b border-gray-200 text-sm text-black"
            >
              <div className="col-span-2">
                <strong>{voucher.name}</strong> {" | "}
                <span className="text-gray-500">{voucher.code}</span>
              </div>
              <div>
                {voucher.voucher_type === "shop_wide"
                  ? "Voucher toàn Shop"
                  : "Voucher sản phẩm"}
              </div>
              <div>
                {voucher.voucher_type === "shop_wide"
                  ? "Tất cả sản phẩm"
                  : "Một số sản phẩm"}{" "}
              </div>
              <div>
                {voucher.is_public
                  ? "Tất cả người mua"
                  : "Chỉ những người có code"}
              </div>
              <div>
                {voucher.discount_type === "percentage"
                  ? `${voucher.discount_value}%`
                  : `${voucher.discount_value.toLocaleString()}₫`}
              </div>
              <div>{voucher.max_usage}</div>
              <div>{voucher.used || 0}</div>
              <div>
                {new Date(voucher.starts_at).toLocaleDateString()} -{" "}
                {new Date(voucher.ends_at).toLocaleDateString()}
              </div>
              <div className="flex justify-center items-center space-x-2">
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={handleEdit(voucher.id ? voucher.id : 0)}
                >
                  <FaPencilAlt />
                </button>
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={onConfirmDelete(voucher.id ? voucher.id : 0)}
                >
                  <FaTrash />
                </button>
              </div>{" "}
            </div>
          ))
        ) : (
          <div className="p-3 text-center text-gray-500">
            Không có Mã giảm giá nào
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModalOpen}
        text="Bạn có muốn xóa voucher?"
        onConfirm={() => handleDelete()()}
        onCancel={() => setConfirmModalOpen(false)}
      />
      {/* EDIT MODAL */}
      {selectedVoucher && (
        <EditVoucherModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          voucherData={selectedVoucher}
          onSave={fetchVouchers}
        />
      )}
    </>
  );
};
