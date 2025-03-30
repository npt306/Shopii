import { Link, useLocation, Outlet } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { IoMdCart } from "react-icons/io";
import { IoLogOutSharp } from "react-icons/io5";
import { IoTicket } from "react-icons/io5";
import { BiSolidCategory } from "react-icons/bi";
import adminLogo from '../assets/shopee-admin-logo.svg';

export const HomeLayout = () => {
  const location = useLocation();

  const menuItems = [
    // { icon: <MdDashboard size={22} />, name: "Dashboard", link: "/admin/dashboard" },
    { icon: <IoMdCart size={22} />, name: "Products", link: "/admin/products" },
    { icon: <FaUsers size={20} />, name: "Users", link: "/admin/users" },
    { icon: <IoTicket size={22} />, name: "Vouchers", link: "/admin/vouchers" },
    { icon: <BiSolidCategory size={20} />, name: "Categories", link: "/admin/categories" },
    { icon: <IoLogOutSharp size={20} />, name: "Logout", link: "/login" },
  ];

  return (
    <div className="relative min-h-screen">

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 z-20 w-60 h-full bg-white text-gray-800 p-5 shadow-lg flex flex-col">
        {/* Logo and Title */}
        <div className="flex items-center gap-2 mb-8 border-b pb-4">
          <img
            src={adminLogo}
            alt="Admin Panel Logo"
            className="w-auto ps-1"
            style={{ height: '35px' }}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-grow mt-4">
          <ul className="space-y-2">
            {menuItems
              .filter(item => item.name !== 'Logout')
              .map(({ icon, name, link }) => (
              <li key={name}>
                <Link
                  to={link}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all text-sm font-medium no-underline
                    ${
                      location.pathname.startsWith(link)
                        ? "bg-orange-100 text-orange-700 font-semibold"
                        : "text-gray-800 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                >
                  {icon}
                  <span>{name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Item */}
        <div className="mt-auto pt-4 border-t">
           {menuItems
              .filter(item => item.name === 'Logout')
              .map(({ icon, name, link }) => (
              <li key={name} className="list-none">
                <Link
                  to={link}
                   className={`flex items-center gap-3 p-3 rounded-lg transition-all text-sm font-medium no-underline text-gray-800 hover:bg-gray-100 hover:text-gray-900`}
                >
                  {icon}
                  <span>{name}</span>
                </Link>
              </li>
            ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-60 flex-1 overflow-y-auto p-6 bg-gray-100">
          <Outlet />
      </main>

    </div>
  );
};