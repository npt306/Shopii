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
import CategoryManagement from './page/category-management/category.tsx';
import { ToastContainer } from "react-toastify";

import { AuthProvider } from './components/authContext.tsx';
import { ProtectedRoute } from './components/protectedRoute.tsx';

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
      element: <ProtectedRoute />,
      children: [
        {
          element: <HomeLayout />,
          children: [

            {
              index: true,
              element: <Navigate to="products" replace />,
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
              path: "categories",
              element: <CategoryManagement />,
            },

          ]
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

// 1) pull off the real fetch
const nativeFetch = window.fetch.bind(window);

// 2) override it once
window.fetch = async (input, init = {}) => {
  // always include cookies
  const res = await nativeFetch(input, { credentials: 'include', ...init });

  // if the server tells us “401 Unauthorized,” send them to login
  if (res.status === 401) {
    // hard-reload to clear any bad state + show the login page
    window.location.href = '/login';
  }

  return res;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </AuthProvider>
  </StrictMode>,
);