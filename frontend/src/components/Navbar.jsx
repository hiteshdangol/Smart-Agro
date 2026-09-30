import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';
import { useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };
   const[farmer,setFarmer]= useState()
  useEffect(() => {
     fetchProfile();
   }, []);

   const fetchProfile = async () => {
     try {
       const response = await axiosInstance.get('/auth/profile');
       setFarmer(response.data.farmer);
     } catch (error) {
       console.error('Error fetching profile:', error);
     }
   };
   


  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src="/image/fulllogo.jpg" alt="Smart Farming Logo" className="navbar-logo-image" />
        <div className="navbar-logo">Smart Farming </div>
      </div>
      <div className={`nav-links ${isDropdownOpen ? 'open' : ''}`}>
        {farmer?.role==="Admin"?(<Link to="/admindashboard" className='nav-link'>Dashboard</Link>):(null)}
        <Link to="/dashboard" className="nav-link">Home</Link>
        <Link to="/shop" className="nav-link">Shop</Link>
        <Link to="/my-listings" className="nav-link">My Listings</Link>
        <Link to="/cart" className="nav-link">Cart</Link>
        <Link to="/my-orders" className="nav-link">My Orders</Link>
        <Link to="/profile" className="nav-link">Profile</Link>
        <Link to="/records" className="nav-link">Previous Records</Link>
        <Link to="/manual-automation" className="nav-link">Manual Automation</Link>
        <Link to="/pestAlert" className="nav-link">Pest Alert</Link>
        <Link to="/CropRecommendation" className="nav-link">Crop Recommendataion</Link>
        <Link to="/" className="nav-link">Logout</Link>
        {farmer?.role==="Admin" && (
          <div className="nav-link" style={{ fontWeight: 'bold', borderTop: '1px solid #555', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
            <Link to="/admin/products" className="nav-link">Admin-Products</Link>
            <Link to="/admin/orders" className="nav-link">Admin-Orders</Link>
          </div>
        )}
      </div>
      <div className="navbar-dropdown">
        <button className="dropdown-toggle" onClick={toggleDropdown}>
          &#9776;
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
