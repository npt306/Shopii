// import { useEffect, useState } from "react";
// import axios from "axios";
// import { EnvValue } from "../../../../env-value/envValue";
// import { EditVoucherModal } from "./EditVoucherModal";
// import { FaPencilAlt } from "react-icons/fa";
// import { FaTrash } from "react-icons/fa";
// import "../../../../css/sellerVoucher.css";
// import { SellerVoucher } from "../Shared/Interfaces"; // Adjust the import path as necessary

// export const VoucherTable = () => {
//   const [vouchers, setVouchers] = useState<SellerVoucher[]>([]);
//   const [showVouchers, setShowVouchers] = useState<SellerVoucher[]>([]);
//   const [isModalOpen, setModalOpen] = useState(false);
//   const [selectedVoucher, setSelectedVoucher] = useState<SellerVoucher | null>(
//     null
//   );
//   const sellerid = 1;

//   const [selectedTab, setSelectedTab] = useState("Tất cả"); // State for the selected tab
//   const tabs = ["Tất cả", "Đang diễn ra", "Sắp diễn ra", "Đã kết thúc"];

//   const handleTabClick = (tabName: string) => {
//     if (selectedTab !== tabName) {
//       setSelectedTab(tabName);
//     }
//     if (tabName === "Tất cả") {
//       setShowVouchers(vouchers); // Show all vouchers
//     }
//     if (tabName === "Đang diễn ra") {
//       setShowVouchers(
//         vouchers.filter((voucher) => {
//           const currentDate = new Date();
//           return (
//             new Date(voucher.starts_at) <= currentDate &&
//             new Date(voucher.ends_at) >= currentDate
//           );
//         })
//       ); // Show only ongoing vouchers
//     }
//     if (tabName === "Sắp diễn ra") {
//       setShowVouchers(
//         vouchers.filter((voucher) => {
//           const currentDate = new Date();
//           return new Date(voucher.starts_at) > currentDate; // Show only upcoming vouchers
//         })
//       );
//     }
//     if (tabName === "Đã kết thúc") {
//       setShowVouchers(
//         vouchers.filter((voucher) => {
//           const currentDate = new Date();
//           return new Date(voucher.ends_at) < currentDate; // Show only ended vouchers
//         })
//       );
//     }
//   };
//   const fetchVouchers = async () => {
//     try {
//       console.log(
//         "Response data:",
//         `${EnvValue.API_GATEWAY_URL}/api/vouchers/seller-vouchers/all/${sellerid}`
//       ); // Log the response data
//       const response = await axios.get(
//         `${EnvValue.API_GATEWAY_URL}/api/vouchers/seller-vouchers/all/${sellerid}`
//       );
//       setVouchers(response.data); // Ensure the backend response is an array
//       setShowVouchers(response.data); // Set the vouchers state with the fetched data
//       console.log("Vouchers fetched:", response.data); // Log the fetched vouchers
//     } catch (error) {
//       console.error("Error fetching vouchers:", error);
//     }
//   };
//   useEffect(() => {
//     fetchVouchers();
//   }, []);

//   // Handle edit button click
//   const handleEdit = (id: number) => () => {
//     const voucher = vouchers.find((v) => v.id === id);
//     if (voucher) {
//       setSelectedVoucher(voucher); // Set the voucher to be edited
//       setModalOpen(true); // Open the modal
//     }
//   };

//   // Handle delete button click
//   const handleDelete = (id: number) => async () => {
//     try {
//       await axios.delete(
//         `${EnvValue.API_GATEWAY_URL}/api/vouchers/seller-vouchers/${id}`
//       );
//       fetchVouchers(); // Refresh the voucher list after deletion
//     } catch (error) {
//       console.error("Error deleting voucher:", error);
//     }
//   };

//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterBy, setFilterBy] = useState("name");
//   const [dropdownOpen, setDropdownOpen] = useState(false);

//   const handleSearch = () => {
//     console.log("Search for:", searchTerm, "Filter by:", filterBy);
//     const filteredVouchers = vouchers.filter((voucher) => {
//       if (filterBy === "name") {
//         return voucher.name.toLowerCase().includes(searchTerm.toLowerCase());
//       } else if (filterBy === "code") {
//         return voucher.code.toLowerCase().includes(searchTerm.toLowerCase());
//       }
//       return false;
//     });
//     setShowVouchers(filteredVouchers); // Update the displayed vouchers based on the search
//     setSearchTerm(""); // Clear the search term after searching
//     setSelectedTab("Tất cả"); // Reset the selected tab to "Tất cả"
//   };
//   return (
//     <>
//       {/* MENU */}
//       <div className="voucher-manage-menu mb-3">
//         <ul className="stardust-tabs-header flex">
//           {tabs.map((tab) => (
//             <li
//               key={tab}
//               className={`stardust-tabs-header__tab ${
//                 selectedTab === tab
//                   ? "stardust-tabs-header__tabactive border-transparent border-2 border-b-orange-600 !text-orange-600"
//                   : ""
//               }`}
//               onClick={() => handleTabClick(tab)}
//             >
//               <div className="flex flex-grow">
//                 <div className="flex flex-grow items-center justify-center">
//                   {tab}
//                 </div>
//               </div>
//               {/* <i
//                 className={`stardust-tabs-header__tab-indicator ${
//                   selectedTab === tab ? "" : "invisible"
//                 }`}
//               /> */}
//             </li>
//           ))}
//         </ul>
//       </div>

//       {/* SEARCHBAR */}
//       <div className="text-black mb-4">
//         <div className="flex flex-wrap items-center gap-2">
//           <label className="text-lg font-semibold mb-2">Tìm kiếm</label>
//           <select
//             className="border border-gray-300 rounded px-3 py-1 focus:outline-none  focus:border-orange-600"
//             value={filterBy}
//             onChange={(e) => setFilterBy(e.target.value)}
//           >
//             <option value="name">Tên Voucher</option>
//             <option value="code">Mã Voucher</option>
//           </select>

//           <input
//             type="text"
//             placeholder="Nhập từ khóa..."
//             className="border border-gray-300 rounded px-3 py-1 w-60 focus:outline-none focus:border-orange-600"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />

//           <button
//             className="bg-white border border-orange-600 text-orange-600 rounded px-4 py-1 hover:text-white hover:bg-orange-600 hover:border-orange-600 transition"
//             onClick={handleSearch}
//           >
//             Tìm
//           </button>
//         </div>
//       </div>

//       {/* TABLE */}
//       <div className="border border-gray-300 rounded-lg overflow-hidden">
//         {/* Header */}
//         <div className="grid grid-cols-10 bg-gray-100 text-gray-700 font-semibold p-3 border-b border-gray-300">
//           <div className="col-span-2">Tên Voucher | Mã voucher</div>
//           <div>Loại mã</div>
//           <div>Sản phẩm áp dụng</div>
//           <div>Người mua mục tiêu</div>
//           <div>Giảm giá</div>
//           <div>Tổng lượt sử dụng tối đa</div>
//           <div>Đã dùng</div>
//           <div>Thời gian lưu Mã giảm giá</div>
//           <div>Thao tác</div>
//         </div>

//         {/* Rows */}
//         {showVouchers.length > 0 ? (
//           showVouchers.map((voucher, index) => (
//             <div
//               key={voucher.id}
//               className="grid grid-cols-10 p-3 border-b border-gray-200 text-sm text-black"
//             >
//               <div className="col-span-2">
//                 <strong>{voucher.name}</strong> {" | "}
//                 <span className="text-gray-500">{voucher.code}</span>
//               </div>
//               <div>
//                 {voucher.voucher_type === "shop_wide"
//                   ? "Voucher toàn Shop"
//                   : "Voucher sản phẩm"}
//               </div>
//               <div>
//                 Tất cả sản phẩm
//                 {/* {voucher.products
//                   ? voucher.products.join(", ")
//                   : "Tất cả sản phẩm"} */}
//               </div>
//               <div>
//                 {voucher.is_public
//                   ? "Tất cả người mua"
//                   : "Chỉ những người có code"}
//               </div>
//               <div className="">
//                 {voucher.discount_type === "percentage"
//                   ? `${voucher.discount_value}%`
//                   : `${voucher.discount_value.toLocaleString()}₫`}
//               </div>
//               <div>{voucher.max_usage}</div>
//               <div>{voucher.used || 0}</div>
//               <div>
//                 {new Date(voucher.starts_at).toLocaleDateString()} -{" "}
//                 {new Date(voucher.ends_at).toLocaleDateString()}
//               </div>
//               <div className="flex justify-center items-center space-x-2">
//                 <button
//                   className="text-blue-600 hover:text-blue-800"
//                   onClick={handleEdit(voucher.id)}
//                 >
//                   <FaPencilAlt />
//                 </button>
//                 <button
//                   className="text-red-600 hover:text-red-800"
//                   onClick={handleDelete(voucher.id)}
//                 >
//                   <FaTrash />
//                 </button>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="p-3 text-center text-gray-500">
//             <svg
//               viewBox="0 0 1024 1024"
//               focusable="false"
//               className="w-20 h-20 mx-auto mb-2"
//             >
//               <path
//                 d="M42.67 906.67a480 53.33 0 10960 0 480 53.33 0 10-960 0z"
//                 fill="#F2F2F2"
//               ></path>
//               <path
//                 d="M730.56 347.43l-277.12-160a26.67 26.67 0 00-36.43 9.76l-58.66 101.62a26.67 26.67 0 009.76 36.42l277.12 160a26.67 26.67 0 0036.42-9.76l58.67-101.6a26.67 26.67 0 00-9.76-36.44zM448.11 196.67l277.12 160a16 16 0 015.86 21.86l-58.66 101.6a16 16 0 01-21.87 5.88L373.44 326a16 16 0 01-5.87-21.87l58.67-101.61a16 16 0 0121.87-5.87z"
//                 fill="#6B7280"
//               ></path>
//               <path
//                 d="M619.48 309.6l-298.79-80.05a26.67 26.67 0 00-32.66 18.84l-30.37 113.35a26.67 26.67 0 0018.86 32.66l298.79 80.05a26.67 26.67 0 0032.66-18.84l30.37-113.35a26.67 26.67 0 00-18.86-32.66zm-301.55-69.76l298.8 80.06a16 16 0 0111.3 19.6l-30.37 113.34a16 16 0 01-19.6 11.3l-298.79-80.03a16 16 0 01-11.3-19.6l30.37-113.34a16 16 0 0119.6-11.3z"
//                 fill="#6B7280"
//               ></path>
//               <path
//                 d="M885.33 266.67H160A21.33 21.33 0 00138.67 288v170.5l4.98.33a74.67 74.67 0 010 149.01l-4.98.32v170.5A21.33 21.33 0 00160 800h725.33a21.33 21.33 0 0021.34-21.33v-171.2l-5.68.37a74.67 74.67 0 110-149.01l5.69.38-.01-171.21a21.33 21.33 0 00-21.34-21.33zM160 277.33h725.33A10.67 10.67 0 01896 288v160a85.33 85.33 0 100 170.67v160a10.67 10.67 0 01-10.67 10.66H160l-1.25-.07a10.67 10.67 0 01-9.42-10.6V618.02l.33-.05A85.35 85.35 0 00224 533.33l-.04-2.68a85.37 85.37 0 00-71.62-81.56l-3-.43V288A10.67 10.67 0 01160 277.33z"
//                 fill="#6B7280"
//               ></path>
//               <path
//                 d="M762.67 629.33a5.33 5.33 0 110 10.67H432a5.33 5.33 0 110-10.67h330.67zm-128-106.66a5.33 5.33 0 110 10.66H432a5.33 5.33 0 110-10.66h202.67zm128-106.67a5.33 5.33 0 110 10.67H432a5.33 5.33 0 110-10.67h330.67zm-464-138.67V320h10.66v-42.67h-10.66zm0 85.34v42.66h10.66v-42.66h-10.66zm0 85.33v42.67h10.66V448h-10.66zm0 85.33V576h10.66v-42.67h-10.66zm0 85.34v42.66h10.66v-42.66h-10.66zm0 85.33v42.67h10.66V704h-10.66zm0 85.33V800h10.66v-10.67h-10.66z"
//                 fill="#6B7280"
//               ></path>
//               <path
//                 d="M951.04 181.76a32 32 0 1064 0 32 32 0 10-64 0z"
//                 fill="#6B7280"
//                 opacity=".5"
//               ></path>
//               <path
//                 d="M876.37 139.1a21.33 21.33 0 1042.67 0 21.33 21.33 0 10-42.67 0zM967.04 53.76a16 16 0 100 32 16 16 0 000-32zm0-10.67a26.67 26.67 0 110 53.34 26.67 26.67 0 010-53.34z"
//                 fill="#6B7280"
//                 opacity=".3"
//               ></path>
//             </svg>
//             Không có Mã giảm giá nào
//           </div>
//         )}
//       </div>
//       {/* EDIT MODAL */}
//       {selectedVoucher && (
//         <EditVoucherModal
//           isOpen={isModalOpen}
//           onClose={() => setModalOpen(false)}
//           voucherData={selectedVoucher}
//           onSave={fetchVouchers}
//         />
//       )}
//     </>
//   );
// };
