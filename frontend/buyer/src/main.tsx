import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import { LoginPage } from "./page/loginPage.tsx";
import { HomePage } from "./page/homePage.tsx";
import { SearchProductPage } from "./page/search_product.tsx";
import { CartPage } from "./page/cartPage.tsx";
import { ProductDetailPage } from "./page/productDetailPage.tsx";
import { UserPage } from "./page/userPage.tsx";
import { OrderPage } from "./page/orderPage.tsx";

import CallbackPage from "./page/callback.tsx";
import { store, persistor } from "./redux/authStore.ts";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { CartProvider } from "./context/cartContext.tsx";

import { AuthProvider } from './components/protectedRoute/authContext.tsx';
import { ProtectedRoute } from './components/protectedRoute/protectedRoute.tsx';

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

    // {
    //   path: "/detail-product/:id",
    //   element: <ProductDetailPage />,
    // },

    {
      element: <ProtectedRoute />,
      children: [
        {
          path: "/detail-product/:id",
          element: <ProductDetailPage />,
        },
        {
          path: "/user",
          element: <UserPage />,
        },
        {
          path: "/user/:id",
          element: <UserPage />,
        },
        {
          path: "/cart/:id",
          element: <CartPage />,
        },
        {
          path: "/order/:id",
          element: <OrderPage />,
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </PersistGate>
      </Provider>
    </AuthProvider>
  </StrictMode>
);
