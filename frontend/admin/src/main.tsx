import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import { AdminLoginPage } from './page/admin_login.tsx';
import { AddVoucherPage } from './page/AddVoucher.tsx';
import { VoucherListPage } from './page/VoucherListPage.tsx';
import { VoucherDetailPage } from './page/VoucherDetailPage.tsx';
import { EditVoucherPage } from './page/EditVoucher.tsx';

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