import React, { useEffect } from "react";
import { useState } from "react";
import "../styles/AdminDashboard.css";
import axiosInstance from "../utils/axiosInstance";
import axios from "axios";

const AdminDashbaord = () => {
  const [farmer, setFarmer] = useState();
  const [crop, setCrop] = useState();
  // const[farmer,setFarmer]= useState()
  // useEffect(() => {
  //    fetchProfile();
  //  }, []);

  //  const fetchProfile = async () => {
  //    try {
  //      const response = await axiosInstance.get('/auth/profile');
  //      setFarmer(response.data.farmer);
  //    } catch (error) {
  //      console.error('Error fetching profile:', error);
  //    }
  //  };

  useEffect(() => {
    const fetchFarmer = async () => {
      const res = await axios.get(
        "http://localhost:5000/api/records/getAllFarmer"
      );
      setFarmer(res.data);
    };
    fetchFarmer();
  }, []);

  useEffect(() => {
    const fetchCrop = async () => {
      const res = await axios.get(
        "http://localhost:5000/api/records/getAllCrop"
      );
      setCrop(res.data);
    };
    fetchCrop();
  }, []);
  console.log(crop);
  console.log(farmer);

  const handleDeleteUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const emailData = formData.get("email");
    await axios.delete(
      `http://localhost:5000/api/records/deleteFarmer/${emailData}`
    );
    alert("user deleted sucessfully");
  };

  return (
    <div className="admin-dashboard-container">
      <header className="admin-dashboard-header">
        <h1 className="admin-site-title">Smart Farming</h1>
        <p className="admin-site-subtitle">Admin Dashboard</p>
      </header>

      <div className="admin-dashboard-content">
        <div className="admin-stats-section">
          <div className="admin-stat-card">
            <div className="admin-stat-icon">👥</div>
            <div className="admin-stat-info">
              <h3>Total Users</h3>
              <p className="admin-stat-number">{farmer?.length}</p>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">🌾</div>
            <div className="admin-stat-info">
              <h3>Total Crops</h3>
              <p className="admin-stat-number">{crop?.length}</p>
            </div>
          </div>
        </div>

        <div className="admin-management-section">
          <div className="admin-management-card">
            <h3>Delete User</h3>
            <form onSubmit={(e) => handleDeleteUser(e)}>
              <div className="admin-delete-user-form">
                <input
                  type="text"
                  placeholder="Type the email of the user you want to delete"
                  name="email"
                />
                <button type="submit" className="admin-delete-btn">
                  Delete User
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="admin-data-preview">
          <div className="admin-preview-card">
            <h3>Users Preview</h3>
            <div className="admin-data-list">
              {farmer
  ? farmer.map((user) => (
      <div key={user._id || user.email} className="admin-data-item">
        <span>{user?.name}</span>
        <span>{user?.email}</span>
      </div>
    ))
  : <div>loading</div>}
            </div>
          </div>

          <div className="admin-preview-card">
            <h3>Crops Preview</h3>
            <div className="admin-data-list">
              {crop
  ? crop.map((cropItem) => (
      <div key={cropItem._id} className="admin-data-item">
        <span>{cropItem?.crop}</span>
        <span>{cropItem?.quantity}</span>
      </div>
    ))
  : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashbaord;
