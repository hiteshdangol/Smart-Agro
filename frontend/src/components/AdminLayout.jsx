import React, { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Footer from './Footer';
import '../styles/Sidebar.css';
import '../styles/AdminSidebar.css';

const Icons = {
  dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  farmers: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M2 21h20"/></svg>,
  products: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  orders: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  back: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const ADMIN_NAV = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: Icons.dashboard },
  { path: '/admin/users', label: 'Users', icon: Icons.users },
  { path: '/admin/farmers', label: 'Farmers', icon: Icons.farmers },
  { path: '/admin/products', label: 'Products', icon: Icons.products },
  { path: '/admin/medicines', label: 'Medicines', icon: Icons.shield },
  { path: '/admin/orders', label: 'Orders', icon: Icons.orders },
];

function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/admin/dashboard') return location.pathname === '/admin/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`sidebar admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon admin-logo-icon">🛡️</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-brand">Admin Panel</span>
          <span className="sidebar-tagline">smart farming</span>
        </div>
      </div>

      <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}>
        ◀
      </button>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">Admin Menu</div>
        {ADMIN_NAV.map((item, i) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive: navActive }) =>
              `sidebar-link ${(navActive || isActive(item.path)) ? 'active' : ''} sidebar-link-animate`
            }
            style={{ animationDelay: `${i * 0.04}s` }}
            onClick={onMobileClose}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-text">{item.label}</span>
          </NavLink>
        ))}

      </nav>

      <div className="sidebar-footer">
        <AdminUserCard collapsed={collapsed} />
      </div>
    </aside>
  );
}

function AdminUserCard({ collapsed }) {
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

  const initial = farmer?.name ? farmer.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="sidebar-user-card">
      <div className="sidebar-user-avatar admin-avatar">{initial}</div>
      <div className="sidebar-user-info">
        <div className="sidebar-user-name">{farmer?.name || 'Admin'}</div>
        <div className="sidebar-user-role">Admin</div>
      </div>
      <div className="sidebar-user-actions">
        <Link to="/" className="sidebar-icon-btn" title="Logout">
          {Icons.logout}
        </Link>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authorized, setAuthorized] = useState(null);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get('/auth/profile');
        const farmer = res.data.farmer;
        const overridePerms = farmer.permissionsOverride || [];
        if (farmer.role === 'Admin' || overridePerms.includes('admin:access')) {
          setAuthorized(true);
          return;
        }
        const rolesRes = await axiosInstance.get('/roles');
        const roleDoc = (rolesRes.data.roles || []).find(r => r.name === farmer.role);
        const merged = new Set([...(roleDoc?.permissions || []), ...overridePerms]);
        setAuthorized(merged.has('admin:access'));
      } catch {
        setAuthorized(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (authorized === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
        Checking access...
      </div>
    );
  }

  if (!authorized) return <Navigate to="/dashboard" replace />;

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
      <AdminSidebar
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
