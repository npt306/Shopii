import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import { LoginPage } from './page/login.tsx';
import { HomePage } from './page/home.tsx';
import { SearchProductPage } from './page/search_product.tsx';
import { DetailProductPage } from './page/detail_product.tsx';
import { CartPage } from './page/cart.tsx';
import CallbackPage from './page/callback.tsx';
import { UserPage } from './page/user.tsx';
import { store, persistor } from './redux/authStore.ts';
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Navigate to="/home" replace />,
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/callback",
      element: <CallbackPage />,
    },
    {
      path: "/home",
      element: <HomePage />,
    },
    {
      path: "/search",
      element: <SearchProductPage />,
    },
    {
      path: "/detail-product/:id",
      element: <DetailProductPage />,
    },
    {
      path: "/user",
      element: <UserPage />,
    },
    {
      path: "/cart",
      element: <CartPage />,
    }
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </StrictMode>,
);
