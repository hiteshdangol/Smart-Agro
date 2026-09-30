import React, { useEffect, useState, useMemo } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { showToast } from '../utils/toast';
import '../styles/AdminOrders.css';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#e67e22', bg: 'rgba(243,156,18,0.12)' },
  confirmed: { label: 'Confirmed', color: '#2980b9', bg: 'rgba(52,152,219,0.12)' },
  shipped: { label: 'Shipped', color: '#8e44ad', bg: 'rgba(142,68,173,0.12)' },
  delivered: { label: 'Delivered', color: '#27ae60', bg: 'rgba(46,204,113,0.12)' },
  cancelled: { label: 'Cancelled', color: '#c0392b', bg: 'rgba(231,76,60,0.12)' },
};

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewOrder, setViewOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get('/admin/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const buyerName = o.buyer?.name?.toLowerCase() || '';
        const orderId = o._id.toLowerCase();
        if (!buyerName.includes(q) && !orderId.includes(q)) return false;
      }
      return true;
    });
  }, [orders, search, statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch (err) {
      showToast('Failed to update order status', 'error');
    }
  };

  const itemSummary = (items) => {
    if (!items || items.length === 0) return '—';
    if (items.length === 1) return items[0].name;
    return `${items[0].name} +${items.length - 1} more`;
  };

  return (
    <div className="admin-orders-page">
      <h1>📋 Orders Management</h1>
      <p>View and manage all marketplace transactions.</p>

      <div className="admin-orders-toolbar">
        <input
          className="admin-orders-search"
          placeholder="Search by order ID or buyer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="admin-orders-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="admin-orders-table-wrapper">
        <table className="glass-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Buyer</th>
              <th>Products</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  No orders found
                </td>
              </tr>
            )}
            {filtered.map((order) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              return (
                <tr key={order._id}>
                  <td className="orders-id-cell">#{order._id.slice(-8)}</td>
                  <td>
                    <strong>{order.buyer?.name || 'Unknown'}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{order.buyer?.email || ''}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{itemSummary(order.items)}</td>
                  <td className="orders-amount">NPR {order.totalAmount?.toFixed(2)}</td>
                  <td>
                    <span className="orders-status-badge" style={{ color: cfg.color, background: cfg.bg }}>
                      {cfg.label}
                    </span>
                  </td>
                  <td>
                    <div className="admin-prod-actions">
                      <button className="admin-action-btn view" title="View Details" onClick={() => setViewOrder(order)}
                        style={{ color: 'var(--primary)', borderColor: 'var(--primary)', background: 'var(--primary-light)' }}>
                        👁
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {viewOrder && (
        <div className="order-modal-overlay" onClick={() => setViewOrder(null)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setViewOrder(null)}>✕</button>
            <h2>📋 Order Details</h2>
            <p className="order-modal-subtitle">#{viewOrder._id}</p>

            <div className="order-modal-section">
              <h4>👤 Buyer</h4>
              <p><strong>{viewOrder.buyer?.name}</strong></p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{viewOrder.buyer?.email}</p>
            </div>

            <div className="order-modal-section">
              <h4>📦 Items</h4>
              <div className="order-modal-items">
                {viewOrder.items?.map((item, i) => (
                  <div key={i} className="order-modal-item">
                    <span>{item.name}</span>
                    <span>x{item.quantity}</span>
                    <span>NPR {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="order-modal-total">
                <strong>Total</strong>
                <strong>NPR {viewOrder.totalAmount?.toFixed(2)}</strong>
              </div>
            </div>

            <div className="order-modal-section">
              <h4>📍 Shipping Address</h4>
              <p>{viewOrder.shippingAddress?.fullName}</p>
              <p style={{ color: 'var(--text-secondary)' }}>{viewOrder.shippingAddress?.address}</p>
              <p style={{ color: 'var(--text-secondary)' }}>{viewOrder.shippingAddress?.city}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>📞 {viewOrder.shippingAddress?.phone}</p>
            </div>

            <div className="order-modal-section">
              <h4>📅 Timeline</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Ordered: {viewOrder.createdAt ? new Date(viewOrder.createdAt).toLocaleString() : 'N/A'}
              </p>
              {viewOrder.updatedAt && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Updated: {new Date(viewOrder.updatedAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="order-modal-actions">
              <span className="orders-status-badge" style={{
                color: (STATUS_CONFIG[viewOrder.status] || STATUS_CONFIG.pending).color,
                background: (STATUS_CONFIG[viewOrder.status] || STATUS_CONFIG.pending).bg,
                fontSize: '0.9rem', padding: '0.35rem 1rem',
              }}>
                {(STATUS_CONFIG[viewOrder.status] || STATUS_CONFIG.pending).label}
              </span>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {['confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
                  <button
                    key={s}
                    className={`order-modal-status-btn ${viewOrder.status === s ? 'active' : ''}`}
                    onClick={() => updateStatus(viewOrder._id, s)}
                    disabled={viewOrder.status === s}
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
