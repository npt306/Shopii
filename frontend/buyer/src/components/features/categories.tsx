import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import logoShopee from "../../assets/logo_shopee_1.png";

const categories = [
  {
    id: 1,
    name: "Thời Trang Nam",
    image:
      "https://down-vn.img.susercontent.com/file/687f3967b7c2fe6a134a2c11894eea4b",
  },
  {
    id: 2,
    name: "Điện Thoại & Phụ Kiện",
    image:
      "https://down-vn.img.susercontent.com/file/31234a27876fb89cd522d7e3db1ba5ca@resize_w640_nl.webp",
  },
  {
    id: 3,
    name: "Thiết Bị Điện Tử",
    image:
      "https://down-vn.img.susercontent.com/file/978b9e4cb61c611aaaf58664fae133c5@resize_w640_nl.webp",
  },
  {
    id: 4,
    name: "Máy Tính & Laptop",
    image:
      "https://down-vn.img.susercontent.com/file/c3f3edfaa9f6dafc4825b77d8449999d@resize_w640_nl.webp",
  },
  {
    id: 5,
    name: "Máy Ảnh & Máy Quay Phim",
    image:
      "https://down-vn.img.susercontent.com/file/ec14dd4fc238e676e43be2a911414d4d@resize_w640_nl.webp",
  },
  {
    id: 6,
    name: "Đồng Hồ",
    image:
      "https://down-vn.img.susercontent.com/file/86c294aae72ca1db5f541790f7796260@resize_w640_nl.webp",
  },
  {
    id: 7,
    name: "Giày Dép Nam",
    image:
      "https://down-vn.img.susercontent.com/file/74ca517e1fa74dc4d974e5d03c3139de@resize_w640_nl.webp",
  },
  {
    id: 8,
    name: "Thiết Bị Điện Gia Dụng",
    image:
      "https://down-vn.img.susercontent.com/file/7abfbfee3c4844652b4a8245e473d857@resize_w640_nl.webp",
  },
  {
    id: 9,
    name: "Thể Thao & Du Lịch",
    image:
      "https://down-vn.img.susercontent.com/file/6cb7e633f8b63757463b676bd19a50e4@resize_w640_nl.webp",
  },
  {
    id: 10,
    name: "Ô Tô & Xe Máy & Xe Đạp",
    image:
      "https://down-vn.img.susercontent.com/file/3fb459e3449905545701b418e8220334@resize_w640_nl.webp",
  },
  {
    id: 11,
    name: "Thời Trang Nữ",
    image:
      "https://down-vn.img.susercontent.com/file/75ea42f9eca124e9cb3cde744c060e4d@resize_w640_nl.webp",
  },
  {
    id: 12,
    name: "Mẹ & Bé",
    image:
      "https://down-vn.img.susercontent.com/file/099edde1ab31df35bc255912bab54a5e@resize_w640_nl.webp",
  },
  {
    id: 13,
    name: "Nhà cửa & Đời sống",
    image:
      "https://down-vn.img.susercontent.com/file/24b194a695ea59d384768b7b471d563f@resize_w640_nl.webp",
  },
  {
    id: 14,
    name: "Sắc Đẹp",
    image:
      "https://down-vn.img.susercontent.com/file/ef1f336ecc6f97b790d5aae9916dcb72@resize_w640_nl.webp",
  },
  {
    id: 15,
    name: "Sức Khỏe",
    image:
      "https://down-vn.img.susercontent.com/file/49119e891a44fa135f5f6f5fd4cfc747@resize_w640_nl.webp",
  },
  {
    id: 16,
    name: "Giày Dép Nữ",
    image:
      "https://down-vn.img.susercontent.com/file/48630b7c76a7b62bc070c9e227097847@resize_w640_nl.webp",
  },
  {
    id: 17,
    name: "Túi Ví Nữ",
    image:
      "https://down-vn.img.susercontent.com/file/fa6ada2555e8e51f369718bbc92ccc52@resize_w640_nl.webp",
  },
  {
    id: 18,
    name: "Phụ Kiện & Trang Sức Nữ",
    image:
      "https://down-vn.img.susercontent.com/file/8e71245b9659ea72c1b4e737be5cf42e@resize_w640_nl.webp",
  },
  {
    id: 19,
    name: "Bách Hóa Online",
    image:
      "https://down-vn.img.susercontent.com/file/c432168ee788f903f1ea024487f2c889@resize_w640_nl.webp",
  },
  {
    id: 20,
    name: "Nhà sách Online",
    image:
      "https://down-vn.img.susercontent.com/file/36013311815c55d303b0e6c62d6a8139@resize_w640_nl.webp",
  },
  {
    id: 21,
    name: "Balo & Túi Ví Nam",
    image:
      "https://down-vn.img.susercontent.com/file/18fd9d878ad946db2f1bf4e33760c86f@resize_w640_nl.webp",
  },
  {
    id: 22,
    name: "Đồ Chơi",
    image:
      "https://down-vn.img.susercontent.com/file/ce8f8abc726cafff671d0e5311caa684@resize_w640_nl.webp",
  },
  {
    id: 23,
    name: "Chăm Sóc Thú Cưng",
    image:
      "https://down-vn.img.susercontent.com/file/cdf21b1bf4bfff257efe29054ecea1ec@resize_w640_nl.webp",
  },
  {
    id: 24,
    name: "Dụng Cụ & Thiết Bị Tiện Ích",
    image:
      "https://down-vn.img.susercontent.com/file/e4fbccba5e1189d1141b9d6188af79c0@resize_w640_nl.webp",
  },
  {
    id: 25,
    name: "Thời Trang Trẻ Em",
    image:
      "https://down-vn.img.susercontent.com/file/4540f87aa3cbe99db739f9e8dd2cdaf0@resize_w640_nl.webp",
  },
  {
    id: 26,
    name: "Giặt giũ & Chăm Sóc Nhà Cửa",
    image:
      "https://down-vn.img.susercontent.com/file/cd8e0d2e6c14c4904058ae20821d0763@resize_w640_nl.webp",
  },
  {
    id: 27,
    name: "Voucher & Dịch Vụ",
    image:
      "https://down-vn.img.susercontent.com/file/b0f78c3136d2d78d49af71dd1c3f38c1@resize_w640_nl.webp",
  },
];

export const Categories = () => {
  const [showExtended, setShowExtended] = useState(false);
  const visibleCategories = showExtended
    ? [
        ...categories.slice(4, 10),
        ...categories.slice(14, 20),
        ...categories.slice(20, 27),
      ]
    : categories.slice(0, 20);

  return (
    <div className="relative bg-white">
      <p className="text-base p-3">Danh mục</p>
      <div className="relative flex items-center">
        {showExtended && (
          <button
            className="absolute left-[-20px] z-10 bg-white p-2 rounded-full shadow-md transition-transform duration-300 hover:scale-120 hover:shadow-lg cursor-pointer"
            onClick={() => setShowExtended(false)}
          >
            <FaChevronLeft size={15} />
          </button>
        )}

        <div className="grid grid-cols-10">
          {visibleCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white shadow-md p-1 text-center transition-transform duration-300 hover:scale-105 hover:shadow-lg"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-15 h-20 mx-auto object-cover"
              />
              <p className="mt-2 text-[0.8rem]">{category.name}</p>
            </div>
          ))}
        </div>

        {!showExtended && (
          <button
            className="absolute right-[-20px] z-10 bg-white p-2 rounded-full shadow-md transition-transform duration-300 hover:scale-120 hover:shadow-lg cursor-pointer"
            onClick={() => setShowExtended(true)}
          >
            <FaChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
};
