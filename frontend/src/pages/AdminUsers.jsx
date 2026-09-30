import React, { useEffect, useState, useMemo } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { showToast } from '../utils/toast';
import '../styles/AdminUsers.css';

const PAGE_SIZE = 10;

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [viewUser, setViewUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter === 'blocked' && !u.isBlocked) return false;
      if (statusFilter === 'active' && u.isBlocked) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

  const handleBlock = async (id) => {
    try {
      await axiosInstance.put(`/admin/users/${id}/block`);
      fetchUsers();
    } catch (err) {
      showToast('Failed to update user status', 'error');
    }
  };

  const handleDelete = async (id, name, email) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(`/records/deleteFarmer/${encodeURIComponent(email)}`);
      fetchUsers();
    } catch (err) {
      showToast('Failed to delete user', 'error');
    }
  };

  return (
    <div className="admin-users-page">
      <h1>👥 Users Management</h1>
      <p>Manage all registered users — view, block, or remove accounts.</p>

      <div className="admin-users-toolbar">
        <input
          className="admin-users-search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="admin-users-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Farmer">Farmer</option>
        </select>
        <select className="admin-users-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <div className="admin-users-table-wrapper">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  No users found
                </td>
              </tr>
            )}
            {paginated.map((user) => (
              <tr key={user._id}>
                <td className="user-id-cell">#{user._id.slice(-6)}</td>
                <td className="user-name-cell">{user.name}</td>
                <td style={{ fontSize: '0.85rem' }}>{user.email}</td>
                <td>
                  <span className={`user-role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
                </td>
                <td>
                  <span className={`user-status-badge ${user.isBlocked ? 'blocked' : 'active'}`}>
                    {user.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td>
                  <div className="admin-users-actions">
                    <button className="admin-action-btn view" title="View" onClick={() => setViewUser(user)}>
                      👁
                    </button>
                    <button
                      className={`admin-action-btn ${user.isBlocked ? 'unblock' : 'block'}`}
                      title={user.isBlocked ? 'Unblock' : 'Block'}
                      onClick={() => handleBlock(user._id)}
                    >
                      {user.isBlocked ? '🔓' : '⛔'}
                    </button>
                    {user.role !== 'Admin' && (
                      <button className="admin-action-btn delete" title="Delete" onClick={() => handleDelete(user._id, user.name, user.email)}>
                        🗑
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="admin-users-pagination">
            <button className="pagination-btn" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
              ◀ Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="pagination-info">...</span>}
                  <button className={`pagination-btn ${p === safePage ? 'active' : ''}`} onClick={() => setPage(p)}>
                    {p}
                  </button>
                </React.Fragment>
              ))}
            <button className="pagination-btn" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>
              Next ▶
            </button>
            <span className="pagination-info">{filtered.length} total users</span>
          </div>
        )}
      </div>

      {viewUser && (
        <div className="user-view-modal-overlay" onClick={() => setViewUser(null)}>
          <div className="user-view-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setViewUser(null)}>✕</button>
            <h2>👤 User Details</h2>
            <div className="user-view-details">
              <div className="detail-row">
                <span className="detail-label">ID</span>
                <span className="detail-value">#{viewUser._id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Name</span>
                <span className="detail-value">{viewUser.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-value">{viewUser.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Role</span>
                <span className="detail-value">{viewUser.role}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className="detail-value">{viewUser.isBlocked ? 'Blocked' : 'Active'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Joined</span>
                <span className="detail-value">{viewUser.createdAt ? new Date(viewUser.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
