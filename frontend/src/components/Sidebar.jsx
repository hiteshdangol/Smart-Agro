import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Link, useLocation, Outlet } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Footer from './Footer';
import '../styles/Sidebar.css';

const Icons = {
  home: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  shop: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  list: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  cart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  package: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.8V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z"/><polyline points="2.32 6.16 12 11 21.68 6.16"/><line x1="12" y1="22.76" x2="12" y2="11"/></svg>,
  user: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  clipboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  sliders: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>,
  bug: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M4 14l-2-2"/><path d="M20 14l2-2"/><path d="M4 10a8 8 0 0 1 16 0v2a8 8 0 0 1-16 0z"/><path d="M4 20l2-2"/><path d="M20 20l-2-2"/><path d="M12 16v6"/><path d="M8 22h8"/></svg>,
  leaf: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
  search: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>,
  info: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Home', icon: Icons.home },
  { path: '/shop', label: 'Shop', icon: Icons.shop },
  { path: '/my-listings', label: 'My Listings', icon: Icons.list },
  { path: '/cart', label: 'Cart', icon: Icons.cart },
  { path: '/my-orders', label: 'My Orders', icon: Icons.package },
  { path: '/profile', label: 'Profile', icon: Icons.user },
  { path: '/records', label: 'Records', icon: Icons.clipboard },
  { path: '/crop-analysis', label: 'Crop Analysis', icon: Icons.leaf },
  { path: '/disease-recognition', label: 'Disease Recognition', icon: Icons.search },
];

function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const location = useLocation();
  const [farmer, setFarmer] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/auth/profile');
        setFarmer(res.data.farmer);
      } catch {
        // not logged in
      }
    };
    fetchProfile();
  }, []);

  const isAdmin = farmer?.role === 'Admin';

  const [cartCount, setCartCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [pendingWishlist, setPendingWishlist] = useState(0);

  useEffect(() => {
    const update = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.reduce((sum, item) => sum + (item.quantity || 1), 0));
      } catch { setCartCount(0); }
    };
    update();
    window.addEventListener('storage', update);
    window.addEventListener('cart-updated', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('cart-updated', update);
    };
  }, [location]);

  useEffect(() => {
    if (!farmer) return;
    const fetchPendingOrders = async () => {
      try {
        const res = await axiosInstance.get('/orders/pending-count');
        setPendingOrders(res.data.count || 0);
      } catch { /* ignore */ }
    };
    fetchPendingOrders();
  }, [farmer]);

  useEffect(() => {
    if (!farmer) return;
    const fetchPendingWishlist = async () => {
      try {
        const res = await axiosInstance.get('/wishlist/pending-count');
        setPendingWishlist(res.data.count || 0);
      } catch { /* ignore */ }
    };
    fetchPendingWishlist();
  }, [farmer]);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchPending = async () => {
      try {
        const res = await axiosInstance.get('/admin/wishlist?status=pending');
        setPendingRequests((res.data.wishlist || []).length);
      } catch { /* ignore */ }
    };
    fetchPending();
  }, [isAdmin]);

  const isActive = useCallback((path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🌿</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-brand">Smart Agro</span>
          <span className="sidebar-tagline">smart farming</span>
        </div>
      </div>

      <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}>
        ◀
      </button>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Main Menu</div>
        {NAV_ITEMS.map((item, i) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive: navActive }) =>
              `sidebar-link ${(navActive || isActive(item.path)) ? 'active' : ''} sidebar-link-animate`
            }
            style={{ animationDelay: `${i * 0.04}s` }}
            onClick={onMobileClose}
          >
            <span className="sidebar-link-icon">
              {item.icon}
              {item.path === '/cart' && cartCount > 0 && (
                <span className="sidebar-cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
              {item.path === '/my-orders' && (pendingOrders + pendingWishlist) > 0 && (
                <span className="sidebar-cart-badge">{(pendingOrders + pendingWishlist) > 99 ? '99+' : (pendingOrders + pendingWishlist)}</span>
              )}
            </span>
            <span className="sidebar-link-text">{item.label}</span>
            {item.path === '/my-orders' && (pendingOrders + pendingWishlist) > 0 && (
              <div className="sidebar-orders-popup">
                {pendingOrders > 0 && <p>{pendingOrders} pending order{pendingOrders !== 1 ? 's' : ''}</p>}
                {pendingWishlist > 0 && <p>{pendingWishlist} pending wishlist request{pendingWishlist !== 1 ? 's' : ''}</p>}
              </div>
            )}
          </NavLink>
        ))}
        {isAdmin && (
          <>
            <div className="sidebar-nav-label" style={{ marginTop: '0.75rem' }}>Admin</div>
            <Link to="/admin/dashboard" className="sidebar-link" onClick={onMobileClose}>
              <span className="sidebar-link-icon">{Icons.shield}
                {pendingRequests > 0 && (
                  <span className="sidebar-cart-badge">{pendingRequests > 99 ? '99+' : pendingRequests}</span>
                )}
              </span>
              <span className="sidebar-link-text">Admin Panel</span>
            </Link>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <UserCard collapsed={collapsed} farmer={farmer} />
      </div>
    </aside>
  );
}

function UserCard({ collapsed, farmer }) {
  const initial = farmer?.name ? farmer.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="sidebar-user-card">
      <div className="sidebar-user-avatar">{initial}</div>
      <div className="sidebar-user-info">
        <div className="sidebar-user-name">{farmer?.name || 'User'}</div>
        <div className="sidebar-user-role">{farmer?.role || 'Guest'}</div>
      </div>
      <div className="sidebar-user-actions">
        <Link to="/profile" className="sidebar-icon-btn" title="Settings">
          {Icons.settings}
        </Link>
        <Link to="/" className="sidebar-icon-btn" title="Logout">
          {Icons.logout}
        </Link>
      </div>
    </div>
  );
}

export default function SidebarLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="sidebar-layout">
      {mobileOpen && (
        <div className="sidebar-mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}
      <button
        className="sidebar-mobile-hamburger"
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {mobileOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <main className={`sidebar-main ${collapsed ? 'expanded' : ''}`}>
        <div className="sidebar-main-content">
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
}
