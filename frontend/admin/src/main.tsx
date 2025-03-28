import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import { AdminLoginPage } from './page/admin_login.tsx';
import { AddVoucherPage } from './page/AddVoucher.tsx';
import { VoucherListPage } from './page/VoucherListPage.tsx';
import { VoucherDetailPage } from './page/VoucherDetailPage.tsx';
import { EditVoucherPage } from './page/EditVoucher.tsx';
import { AdminProductListPage } from './page/AdminProductListPage.tsx';
import { AdminProductDetailPage } from './page/AdminProductDetailPage.tsx';
import UserManagement from './page/user-management/main_page.tsx';
import { CategoryManagementPage } from './page/AdminCategoryManage.tsx';

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
      path: "/admin/vouchers",
      element: <VoucherListPage />,
    },
    {
      path: "/admin/vouchers/add",
      element: <AddVoucherPage />,
    },
    {
      path: "/admin/vouchers/:id",
      element: <VoucherDetailPage />,
    },
    {
      path: "/admin/vouchers/edit/:id",
      element: <EditVoucherPage />,
    },
    {
      path: '/admin/products',
      element: <AdminProductListPage />,
    },
    {
      path: '/admin/products/:id',
      element: <AdminProductDetailPage />,
    },
    {
      path: '/admin/users',
      element: <UserManagement />,
    },
    {
      path: '/admin/categories/*',
      element: <CategoryManagementPage />,
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
  </StrictMode>,
);