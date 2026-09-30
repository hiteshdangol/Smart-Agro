import React, { useEffect, useState, useMemo } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { showToast } from '../utils/toast';
import '../styles/AdminFarmers.css';

const VERIFY_ICONS = { verified: '✅', pending: '⏳', suspended: '🚫' };

function AdminFarmers() {
  const [farmers, setFarmers] = useState([]);
  const [search, setSearch] = useState('');

  const fetchFarmers = async () => {
    try {
      const res = await axiosInstance.get('/admin/farmers');
      setFarmers(res.data.farmers || []);
    } catch (err) {
      console.error('Failed to fetch farmers', err);
    }
  };

  useEffect(() => { fetchFarmers(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return farmers;
    return farmers.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.farmName.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q)
    );
  }, [farmers, search]);

  const handleVerify = async (id, status) => {
    try {
      await axiosInstance.put(`/admin/farmers/${id}/verify`, { status });
      fetchFarmers();
    } catch (err) {
      showToast('Failed to update verification status', 'error');
    }
  };

  return (
    <div className="admin-farmers-page">
      <h1>🌾 Farmers Management</h1>
      <p>View and manage all registered farmers — verify or suspend accounts.</p>

      <input
        className="admin-farmers-search"
        placeholder="Search by name, farm, location or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 && (
        <div className="admin-farmers-empty">No farmers found</div>
      )}

      <div className="admin-farmers-grid">
        {filtered.map((farmer) => (
          <div key={farmer._id} className="admin-farmer-card">
            <div className="farmer-card-header">
              <div className="farmer-avatar">
                {farmer.name ? farmer.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="farmer-card-info">
                <h3>{farmer.farmName || farmer.name}</h3>
                <p>{farmer.email}</p>
              </div>
              <span className={`farmer-verification-badge ${farmer.verificationStatus || 'pending'}`}>
                {VERIFY_ICONS[farmer.verificationStatus] || '⏳'} {farmer.verificationStatus || 'pending'}
              </span>
            </div>

            <div className="farmer-card-stats">
              <div className="farmer-stat">
                <span className="farmer-stat-label">Location</span>
                <span className="farmer-stat-value">{farmer.location || '—'}</span>
              </div>
              <div className="farmer-stat">
                <span className="farmer-stat-label">Products</span>
                <span className="farmer-stat-value">{farmer.productCount ?? 0}</span>
              </div>
              <div className="farmer-stat">
                <span className="farmer-stat-label">Name</span>
                <span className="farmer-stat-value">{farmer.name}</span>
              </div>
              <div className="farmer-stat">
                <span className="farmer-stat-label">Joined</span>
                <span className="farmer-stat-value">
                  {farmer.createdAt ? new Date(farmer.createdAt).toLocaleDateString() : '—'}
                </span>
              </div>
            </div>

            <div className="farmer-card-actions">
              {farmer.verificationStatus !== 'verified' && (
                <button className="btn btn-primary btn-sm" onClick={() => handleVerify(farmer._id, 'verified')}>
                  ✅ Verify
                </button>
              )}
              {farmer.verificationStatus !== 'suspended' && (
                <button className="btn btn-danger btn-sm" onClick={() => handleVerify(farmer._id, 'suspended')}>
                  🚫 Suspend
                </button>
              )}
              {farmer.verificationStatus === 'suspended' && (
                <button className="btn btn-secondary btn-sm" onClick={() => handleVerify(farmer._id, 'pending')}>
                  ↩️ Re-activate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminFarmers;
