import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import PreviousRecords from "./pages/PreviousRecords";
import ManualAutomation from './pages/ManualAutomation';
import PestAlert from "./pages/PestForm";   
import CropRecommendation from './pages/CropRecommendation';
import CropPestAnalysis from './pages/CropPestAnalysis';
import DiseaseRecognition from './pages/DiseaseRecognition';
import AdminDashbaord from "./pages/AdminDashbaord";
import Shop from './pages/Shop';
import MyListings from './pages/MyListings';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import AdminFarmers from './pages/AdminFarmers';
import AdminMedicines from './pages/AdminMedicines';
import ProductDetail from './pages/ProductDetail';
import SidebarLayout from './components/Sidebar';
import AdminLayout from './components/AdminLayout';
import Toast from './components/Toast';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<SidebarLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/records" element={<PreviousRecords />} />
          <Route path="/manual-automation" element={<ManualAutomation />} />
          <Route path="/pestAlert" element={<PestAlert />} />
          <Route path="/CropRecommendation" element={<CropRecommendation />} />
          <Route path="/crop-analysis" element={<CropPestAnalysis />} />
          <Route path="/disease-recognition" element={<DiseaseRecognition />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:id" element={<ProductDetail />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failure" element={<PaymentFailure />} />
        </Route>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashbaord />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="farmers" element={<AdminFarmers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="medicines" element={<AdminMedicines />} />
        </Route>
      </Routes>
      <Toast />
    </Router>
  );
}
export default App;
