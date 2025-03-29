import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";

import { HomeLayout } from './layout/home.tsx'; 
import { AdminLoginPage } from './page/admin_login.tsx';
import { AddVoucherPage } from './page/voucher-management/AddVoucher.tsx';
import { VoucherListPage } from './page/voucher-management/VoucherListPage.tsx';
import { VoucherDetailPage } from './page/voucher-management/VoucherDetailPage.tsx';
import { EditVoucherPage } from './page/voucher-management/EditVoucher.tsx';
import { AdminProductListPage } from './page/product-management/AdminProductListPage.tsx';
import { AdminProductDetailPage } from './page/product-management/AdminProductDetailPage.tsx';
import UserManagement from './page/user-management/main_page.tsx';
import { CategoryManagementApp } from './page/AdminCategoryManage.tsx';

const router = createBrowserRouter(
  [

    {
      path: "/",

      element: <Navigate to="/login" replace />,
    },
    {
      path: "/login",
      element: <AdminLoginPage />,
    },

    {
      path: "/admin", 
      element: <HomeLayout />, 
      children: [ 

        {
          index: true, 
          element: <Navigate to="vouchers" replace />,
        },

        {
          path: "vouchers", 
          element: <VoucherListPage />,
        },
        {
          path: "vouchers/add", 
          element: <AddVoucherPage />,
        },
        {
          path: "vouchers/:id", 
          element: <VoucherDetailPage />,
        },
        {
          path: "vouchers/edit/:id", 
          element: <EditVoucherPage />,
        },

        {
          path: 'products', 
          element: <AdminProductListPage />,
        },
        {
          path: 'products/:id', 
          element: <AdminProductDetailPage />,
        },

        {
          path: 'users', 
          element: <UserManagement />,

        },

        {
          path: "categories/*", 
          element: <CategoryManagementApp />,
        },

      ]
    },

  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    {/* <ToastContainer position="bottom-right" autoClose={3000} /> */}
  </StrictMode>,
);