import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { showToast } from '../utils/toast';
import '../styles/MyOrders.css';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get('/orders/mine');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = useCallback(async () => {
    setWishlistLoading(true);
    try {
      const res = await axiosInstance.get('/wishlist/mine');
      setWishlist(res.data.wishlist || []);
    } catch (err) {
      console.error('Failed to load wishlist', err);
    } finally {
      setWishlistLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/wishlist/unread-count');
      setUnreadCount(res.data.count || 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchWishlist();
    fetchUnreadCount();
  }, [fetchWishlist, fetchUnreadCount]);

  useEffect(() => {
    if (unreadCount > 0 && activeTab === 'orders') {
      showToast(`You have ${unreadCount} updated wishlist request(s)`, 'info', 4500);
    }
  }, [unreadCount, activeTab]);

  const handleSwitchToWishlist = async () => {
    setActiveTab('wishlist');
    try {
      await axiosInstance.put('/wishlist/mark-read');
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const statusBadge = (status) => `badge badge-${status}`;

  const wishlistStatusBadge = (status) => {
    if (status === 'fulfilled') return 'badge badge-fulfilled';
    if (status === 'rejected') return 'badge badge-rejected';
    return 'badge badge-pending';
  };

  return (
    <>
      <div className="my-orders-page">
        <h1>My Orders</h1>
        <div className="my-orders-tabs">
          <button
            className={`my-orders-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            className={`my-orders-tab ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={handleSwitchToWishlist}
          >
            Wishlist Requests
            {unreadCount > 0 && (
              <span className="my-orders-tab-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>
        </div>

        {activeTab === 'orders' && (
          loading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <p><strong>Order:</strong> {order._id.slice(-8)}</p>
                    <span className={statusBadge(order.status)}>{order.status}</span>
                  </div>
                  <div className="order-details">
                    <p><strong>Total:</strong> NPR {order.totalAmount?.toFixed(2)}</p>
                    <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><strong>Shipping:</strong> {order.shippingAddress?.fullName}, {order.shippingAddress?.city}</p>
                  </div>
                  <div className="order-items">
                    <h4>Items</h4>
                    {order.items?.map((item, i) => (
                      <p key={i}>{item.name} x {item.quantity} = NPR {(item.price * item.quantity).toFixed(2)}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'wishlist' && (
          wishlistLoading ? (
            <p>Loading wishlist requests...</p>
          ) : wishlist.length === 0 ? (
            <p>No wishlist requests yet.</p>
          ) : (
            <div className="wishlist-list">
              {wishlist.map((item) => (
                <div key={item._id} className="wishlist-card">
                  <div className="wishlist-card-header">
                    <h3>{item.medicineName}</h3>
                    <span className={wishlistStatusBadge(item.status)}>{item.status}</span>
                  </div>
                  <div className="wishlist-card-details">
                    {item.diseaseName && <p><strong>Disease:</strong> {item.diseaseName}</p>}
                    <p><strong>Type:</strong> {item.type}</p>
                    <p><strong>Requested:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                  {item.status === 'fulfilled' && item.productId && (
                    <div className="wishlist-card-action">
                      <a href={`/shop/${item.productId}`} className="btn btn-primary btn-sm">
                        View Product
                      </a>
                    </div>
                  )}
                  {item.status === 'rejected' && (
                    <div className="wishlist-card-action">
                      <p className="wishlist-rejected">This request was not approved.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </>
  );
}

export default MyOrders;