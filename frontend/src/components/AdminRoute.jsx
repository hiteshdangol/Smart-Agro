import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

function AdminRoute({ children }) {
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const check = async () => {
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
    check();
  }, []);

  if (authorized === null) return <div style={{ padding: '3rem', textAlign: 'center' }}>Checking access...</div>;
  if (!authorized) return <Navigate to="/dashboard" replace />;
  return children;
}

export default AdminRoute;
