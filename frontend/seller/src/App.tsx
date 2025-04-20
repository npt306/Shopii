import MainLayout from './layouts/MainLayout';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProfileShop from './pages/ProfileShop/ProfileShop';
import DecorationShop from './pages/DecorationShop/DecorationShop';
import All from './pages/OrderManagement/All/All';
import AllProduct from './pages/ProductManagement/AllProduct/AllProduct';
import AllSettings from './pages/AllSettings/AllSettings';
import AddProduct from './pages/ProductManagement/AddProduct/AddProduct';
import Revenue from './pages/Finance/Revenue';
import Balance from './pages/Finance/Balance';
import Cards from './pages/Finance/Cards';
import BulkShipping from './pages/OrderManagement/BulkShipping/BulkShippingMain';
import OrderDelivery from './pages/OrderManagement/OrderDelivery/OrderDeliveryMain';
import OrderInteraction from './pages/OrderManagement/OrderInteraction/OrderInteractionMain';
import MediaStorage from './pages/DecorationShop/MediaStorage/MediaStorage';
import DeliverySetting from "./pages/OrderManagement/DeliverySetting/DeliverySettingMain";
import ShopRegister from './pages/RegisterShop/Register';
import ProtectedRoute from './components/hook/protectedRoute';
import { ShopVoucherPage } from './pages/MarketingChannel/ShopVoucher/ShopVoucher';
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from 'react';
import { EnvValue } from './env-value/envValue';

function App() {
  // Getting user's profile and saving it in localStorage
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading flag

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // const response = await fetch('http://localhost:3003/Users/my-profile/', {
        const response = await fetch(`${EnvValue.AUTH_SERVICE_URL}/Users/my-profile/`, {
          credentials: 'include', // Ensure cookies are sent
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        console.log('Fetched user data:', userData);

        // Save the entire user object in localStorage
        localStorage.setItem('user', JSON.stringify(userData));

        // Save individual top-level properties if needed
        localStorage.setItem('user_accountId', String(userData.accountId));
        localStorage.setItem('user_email', userData.email);
        localStorage.setItem('user_username', userData.username);
        localStorage.setItem('user_avatar', userData.avatar || '');
        localStorage.setItem('user_dateOfBirth', userData.dateOfBirth);
        localStorage.setItem('user_phoneNumber', userData.phoneNumber);
        localStorage.setItem('user_sex', String(userData.sex));
        localStorage.setItem('user_status', userData.status);
        localStorage.setItem('user_createdAt', userData.createdAt);
        localStorage.setItem('user_updatedAt', userData.updatedAt);

        // Save nested sellerInfo
        if (userData.sellerInfo) {
          localStorage.setItem('sellerInfo', JSON.stringify(userData.sellerInfo));
          localStorage.setItem('shopName', userData.sellerInfo.ShopName || '');
          localStorage.setItem('TaxCode', userData.sellerInfo.TaxCode || '');
          localStorage.setItem('sellerType', userData.sellerInfo.SellerType || '');
          // Followers might be null; check before saving
          localStorage.setItem(
            'followers',
            userData.sellerInfo.Followers !== null ? String(userData.sellerInfo.Followers) : '0'
          );
        }

        //address
        if (userData.address && userData.address.length > 0) {
          // Save the entire address array
          localStorage.setItem('address', JSON.stringify(userData.address));

          // Find the default address or use the first one
          const defaultAddress = userData.address.find((addr: { IsDefault: boolean }) => addr.IsDefault) || userData.address[0];

          // Save individual fields from the default address
          localStorage.setItem('addressId', String(defaultAddress.AddressId));
          localStorage.setItem('addressFullname', defaultAddress.Fullname);
          localStorage.setItem('addressPhoneNumber', defaultAddress.PhoneNumber);
          localStorage.setItem('addressProvince', defaultAddress.Province);
          localStorage.setItem('addressDistrict', defaultAddress.District);
          localStorage.setItem('addressWard', defaultAddress.Ward);
          localStorage.setItem('addressSpecific', defaultAddress.SpecificAddress);
          localStorage.setItem('addressIsDefault', String(defaultAddress.IsDefault));
          localStorage.setItem('addressCreatedAt', defaultAddress.CreatedAt);
          localStorage.setItem('addressUpdatedAt', defaultAddress.UpdatedAt);
        }

        // Optionally, save userInfo if needed
        if (userData.userInfo) {
          localStorage.setItem('userInfo', JSON.stringify(userData.userInfo));
        }

        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false); // Stop loading once done
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div>Loading user data...</div>; // Or a spinner
  }

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          {/* Public route for registration */}
          <Route path="/portal/register" element={<ShopRegister />} />

          {/* Default route */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <h1 className="text-black">Trang chủ</h1>
              </ProtectedRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/portal/settings/shop/profile/"
            element={
              <ProtectedRoute>
                <ProfileShop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/settings/shop/profile/:tab"
            element={
              <ProtectedRoute>
                <ProfileShop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/decoration"
            element={
              <ProtectedRoute>
                <DecorationShop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/decoration/:tab"
            element={
              <ProtectedRoute>
                <DecorationShop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/all-settings/"
            element={
              <ProtectedRoute>
                <AllSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/all-settings/:tab"
            element={
              <ProtectedRoute>
                <AllSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/decoration/mediastore"
            element={
              <ProtectedRoute>
                <MediaStorage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/sale/order"
            element={
              <ProtectedRoute>
                <All />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/sale/order/:type"
            element={
              <ProtectedRoute>
                <All />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/sale/bulkShipping"
            element={
              <ProtectedRoute>
                <BulkShipping />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/sale/bulkShipping/:tab"
            element={
              <ProtectedRoute>
                <BulkShipping />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/sale/OrderDelivery"
            element={
              <ProtectedRoute>
                <OrderDelivery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/sale/OrderDelivery/:tab"
            element={
              <ProtectedRoute>
                <OrderDelivery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/sale/ReturnRefundCancel"
            element={
              <ProtectedRoute>
                <OrderInteraction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/sale/ReturnRefundCancel/:tab"
            element={
              <ProtectedRoute>
                <OrderInteraction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/sale/DeliverySetting"
            element={
              <ProtectedRoute>
                <DeliverySetting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/sale/DeliverySetting/:tab"
            element={
              <ProtectedRoute>
                <DeliverySetting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/finance/balance"
            element={
              <ProtectedRoute>
                <Balance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/finance/revenue"
            element={
              <ProtectedRoute>
                <Revenue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/finance/cards"
            element={
              <ProtectedRoute>
                <Cards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/product/list/"
            element={
              <ProtectedRoute>
                <AllProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/product/list/:type"
            element={
              <ProtectedRoute>
                <AllProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/product/list/:type/:param?"
            element={
              <ProtectedRoute>
                <AllProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/product/new"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/product/new/:from"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />

          {/* ✨ Missing route added below */}
          <Route
            path="/portal/marketing/vouchers"
            element={
              <ProtectedRoute>
                <ShopVoucherPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
