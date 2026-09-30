import React, { useEffect, useState, useCallback } from "react";
import "../styles/AdminDashboard.css";
import axiosInstance from "../utils/axiosInstance";
import { showToast } from "../utils/toast";
import RoleFormModal from "../components/RoleFormModal";
import UserPermissionModal from "../components/UserPermissionModal";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "crops", label: "Crop Records" },
  { key: "roles", label: "Roles" },
];

function AdminDashbaord() {
  const [farmers, setFarmers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [roles, setRoles] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [roleModal, setRoleModal] = useState(null);
  const [permModal, setPermModal] = useState(null);

  const fetchFarmers = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/users");
      setFarmers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  }, []);

  const fetchCrops = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/records/getAllCrop");
      setCrops(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch crops", err);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/roles");
      setRoles(res.data.roles || []);
    } catch (err) {
      console.error("Failed to fetch roles", err);
    }
  }, []);

  useEffect(() => {
    fetchFarmers();
    fetchCrops();
    fetchRoles();
  }, [fetchFarmers, fetchCrops, fetchRoles]);

  const handleDeleteUser = async (email) => {
    if (!window.confirm(`Delete user ${email}?`)) return;
    try {
      await axiosInstance.delete(`/records/deleteFarmer/${email}`);
      showToast("User deleted successfully", "success");
      fetchFarmers();
    } catch (err) {
      showToast("Failed to delete user", "error");
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await axiosInstance.put(`/users/${userId}/role`, { role });
      fetchFarmers();
    } catch (err) {
      showToast("Failed to update role", "error");
    }
  };

  const handleSaveRole = async (data) => {
    try {
      if (roleModal._id) {
        await axiosInstance.put(`/roles/${roleModal._id}`, data);
      } else {
        await axiosInstance.post("/roles", data);
      }
      setRoleModal(null);
      fetchRoles();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save role", "error");
    }
  };

  const handleDeleteCrop = async (id) => {
    if (!window.confirm("Delete this crop record?")) return;
    try {
      await axiosInstance.delete(`/records/deleteCrop/${id}`);
      fetchCrops();
    } catch (err) {
      showToast("Failed to delete crop record", "error");
    }
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm("Delete this role?")) return;
    try {
      await axiosInstance.delete(`/roles/${id}`);
      fetchRoles();
    } catch (err) {
      showToast("Failed to delete role", "error");
    }
  };

  const handleSavePerms = async (data) => {
    try {
      await axiosInstance.put(`/users/${permModal._id}/permissions`, {
        permissionsOverride: data.permissionsOverride,
      });
      if (data.role && data.role !== permModal.role) {
        await axiosInstance.put(`/users/${permModal._id}/role`, { role: data.role });
      }
      setPermModal(null);
      fetchFarmers();
    } catch (err) {
      showToast("Failed to update permissions", "error");
    }
  };

  const usersCount = farmers.length;
  const cropsCount = crops.length;

  return (
    <div className="admin-dashboard-container">
      <header className="admin-dashboard-header">
        <h1 className="admin-site-title">Smart Farming</h1>
        <p className="admin-site-subtitle">Admin Dashboard</p>
        <div className="admin-tab-bar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`admin-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="admin-dashboard-content">
        {/* === OVERVIEW TAB === */}
        {activeTab === "overview" && (
          <>
            <div className="admin-stats-section">
              <div className="admin-stat-card">
                <div className="admin-stat-icon">👥</div>
                <div className="admin-stat-info">
                  <h3>Total Users</h3>
                  <p className="admin-stat-number">{usersCount}</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon">🌾</div>
                <div className="admin-stat-info">
                  <h3>Total Crop Records</h3>
                  <p className="admin-stat-number">{cropsCount}</p>
                </div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-icon">🛡️</div>
                <div className="admin-stat-info">
                  <h3>Roles</h3>
                  <p className="admin-stat-number">{roles.length}</p>
                </div>
              </div>
            </div>

            <div className="admin-data-preview">
              <div className="admin-preview-card">
                <h3>Recent Users</h3>
                <div className="admin-data-list">
                  {farmers.slice(0, 5).map((user) => (
                    <div key={user._id} className="admin-data-item">
                      <span>{user.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="admin-preview-card">
                <h3>Recent Crop Records</h3>
                <div className="admin-data-list">
                  {crops.slice(0, 5).map((crop) => (
                    <div key={crop._id} className="admin-data-item">
                      <span>{crop.crop}</span>
                      <span>{crop.quantity} kg</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* === CROPS TAB === */}
        {activeTab === "crops" && (
          <div className="admin-management-section">
            <div className="admin-management-card">
              <h3>All Farmer Crop Records</h3>
              <div className="admin-table-responsive">
                <table className="glass-table">
                  <thead>
                    <tr>
                      <th>Crop</th>
                      <th>Quantity (kg)</th>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crops.map((crop) => (
                      <tr key={crop._id}>
                        <td><strong>{crop.crop}</strong></td>
                        <td>{crop.quantity}</td>
                        <td>{crop.cultivationDate ? new Date(crop.cultivationDate).toLocaleDateString() : "N/A"}</td>
                        <td>{crop.description || "—"}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCrop(crop._id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* === ROLES TAB === */}
        {activeTab === "roles" && (
          <div className="admin-management-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3>Role Management</h3>
              <button className="btn btn-primary" onClick={() => setRoleModal({})}>
                + Create Role
              </button>
            </div>
            <div className="admin-roles-grid">
              {roles.map((role) => (
                <div key={role._id} className="admin-role-card">
                  <div className="admin-role-card-header">
                    <h4>{role.name}</h4>
                    <span className="badge badge-confirmed">{role.permissions.length} perms</span>
                  </div>
                  {role.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      {role.description}
                    </p>
                  )}
                  <div className="admin-role-perms">
                    {role.permissions.slice(0, 8).map((p) => (
                      <span key={p} className="admin-role-perm-tag">{p}</span>
                    ))}
                    {role.permissions.length > 8 && (
                      <span className="admin-role-perm-tag" style={{ background: 'rgba(0,0,0,0.05)' }}>
                        +{role.permissions.length - 8} more
                      </span>
                    )}
                  </div>
                  {role.name !== 'Admin' && role.name !== 'Farmer' && (
                    <div className="admin-role-card-actions">
                      <button className="btn btn-primary btn-sm" onClick={() => setRoleModal(role)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRole(role._id)}>Delete</button>
                    </div>
                  )}
                  {(role.name === 'Admin' || role.name === 'Farmer') && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', fontStyle: 'italic' }}>
                      System role — cannot be deleted
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {roleModal && (
        <RoleFormModal
          role={roleModal._id ? roleModal : null}
          onSave={handleSaveRole}
          onCancel={() => setRoleModal(null)}
        />
      )}

      {permModal && (
        <UserPermissionModal
          user={permModal}
          roles={roles}
          onSave={handleSavePerms}
          onCancel={() => setPermModal(null)}
        />
      )}
    </div>
  );
}

export default AdminDashbaord;
