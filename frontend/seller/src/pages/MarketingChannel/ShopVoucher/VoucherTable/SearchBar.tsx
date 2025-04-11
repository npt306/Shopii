import React from "react";

interface SearchBarProps {
  searchTerm: string;
  filterBy: string;
  onSearchTermChange: (value: string) => void;
  onFilterByChange: (value: string) => void;
  onSearch: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  filterBy,
  onSearchTermChange,
  onFilterByChange,
  onSearch,
}) => {
  return (
    <div className="text-black mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-lg font-semibold mb-2">Tìm kiếm</label>
        <select
          className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:border-orange-600"
          value={filterBy}
          onChange={(e) => onFilterByChange(e.target.value)}
        >
          <option value="name">Tên Voucher</option>
          <option value="code">Mã Voucher</option>
        </select>

        <input
          type="text"
          placeholder="Nhập từ khóa..."
          className="border border-gray-300 rounded px-3 py-1 w-60 focus:outline-none focus:border-orange-600"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />

        <button
          className="bg-white border border-orange-600 text-orange-600 rounded px-4 py-1 hover:text-white hover:bg-orange-600 hover:border-orange-600 transition"
          onClick={onSearch}
        >
          Tìm
        </button>
      </div>
    </div>
  );
};