import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import PreviousRecords from "./pages/PreviousRecords";
import ManualAutomation from './pages/ManualAutomation';
import AboutPage from "./pages/AboutPage";
import PestAlert from "./pages/PestForm";   
import CropRecommendation from './pages/CropRecommendation';
import AdminDashbaord from "./pages/AdminDashbaord";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path ="/admindashboard" element={<AdminDashbaord/>}/>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/records" element={<PreviousRecords />} />
        <Route path="/manual-automation" element={<ManualAutomation />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pestAlert" element={<PestAlert />} />
        <Route path="/CropRecommendation" element={<CropRecommendation />} />

      </Routes>
    </Router>
  );
}
export default App;
