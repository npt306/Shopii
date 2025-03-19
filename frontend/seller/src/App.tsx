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
import { ToastContainer } from "react-toastify";


function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          {/* Public route for registration */}
          <Route path="/portal/register" element={<ShopRegister />} />

          {/* Default route - redirect to profile */}
          <Route path="/" element={<Navigate to="/portal/settings/shop/profile/" replace />} />

          {/* Protected routes */}
          <Route path="/portal/settings/shop/profile/" element={
            <ProtectedRoute><ProfileShop /></ProtectedRoute>
          } />
          <Route path="/portal/settings/shop/profile/:tab" element={
            <ProtectedRoute><ProfileShop /></ProtectedRoute>
          } />
          <Route path="/portal/decoration" element={
            <ProtectedRoute><DecorationShop /></ProtectedRoute>
          } />
          <Route path="/portal/decoration/:tab" element={
            <ProtectedRoute><DecorationShop /></ProtectedRoute>
          } />
          <Route path="/portal/all-settings/" element={
            <ProtectedRoute><AllSettings /></ProtectedRoute>
          } />
          <Route path="/portal/all-settings/:tab" element={
            <ProtectedRoute><AllSettings /></ProtectedRoute>
          } />
          <Route path="/portal/decoration/mediastore" element={
            <ProtectedRoute><MediaStorage /></ProtectedRoute>
          } />
          <Route path="/portal/sale/order" element={
            <ProtectedRoute><All /></ProtectedRoute>
          } />
          <Route path="/portal/sale/order/:type" element={
            <ProtectedRoute><All /></ProtectedRoute>
          } />
          <Route path="/portal/sale/bulkShipping" element={
            <ProtectedRoute><BulkShipping /></ProtectedRoute>
          } />
          <Route path="/portal/sale/bulkShipping/:tab" element={
            <ProtectedRoute><BulkShipping /></ProtectedRoute>
          } />
          <Route path="/portal/sale/OrderDelivery" element={
            <ProtectedRoute><OrderDelivery /></ProtectedRoute>
          } />
          <Route path="/portal/sale/OrderDelivery/:tab" element={
            <ProtectedRoute><OrderDelivery /></ProtectedRoute>
          } />
          <Route path="/portal/sale/ReturnRefundCancel" element={
            <ProtectedRoute><OrderInteraction /></ProtectedRoute>
          } />
          <Route path="/portal/sale/ReturnRefundCancel/:tab" element={
            <ProtectedRoute><OrderInteraction /></ProtectedRoute>
          } />
          <Route path="/portal/sale/DeliverySetting" element={
            <ProtectedRoute><DeliverySetting /></ProtectedRoute>
          } />
          <Route path="/portal/sale/DeliverySetting/:tab" element={
            <ProtectedRoute><DeliverySetting /></ProtectedRoute>
          } />
          <Route path="/portal/finance/balance" element={
            <ProtectedRoute><Balance /></ProtectedRoute>
          } />
          <Route path="/portal/finance/revenue" element={
            <ProtectedRoute><Revenue /></ProtectedRoute>
          } />
          <Route path="/portal/finance/cards" element={
            <ProtectedRoute><Cards /></ProtectedRoute>
          } />
          <Route path="/portal/product/list/" element={
            <ProtectedRoute><AllProduct /></ProtectedRoute>
          } />
          <Route path="/portal/product/list/:type" element={
            <ProtectedRoute><AllProduct /></ProtectedRoute>
          } />
          <Route path="/portal/product/list/:type/:param?" element={
            <ProtectedRoute><AllProduct /></ProtectedRoute>
          } />
          <Route path="/portal/product/new" element={
            <ProtectedRoute><AddProduct /></ProtectedRoute>
          } />
          <Route path="/portal/product/new/:from" element={
            <ProtectedRoute><AddProduct /></ProtectedRoute>
          } />
        </Routes>
        <ToastContainer position="bottom-right" autoClose={3000} />

      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
