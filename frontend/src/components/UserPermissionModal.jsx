import React, { useState, useEffect } from 'react';
import { PERMISSION_LIST } from '../utils/permissions';

function UserPermissionModal({ user, roles, onSave, onCancel }) {
  const [selectedRole, setSelectedRole] = useState('');
  const [overrides, setOverrides] = useState([]);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role || 'Farmer');
      setOverrides(user.permissionsOverride || []);
    }
  }, [user]);

  const toggleOverride = (key) => {
    setOverrides(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    );
  };

  const handleSave = () => {
    onSave({ role: selectedRole, permissionsOverride: overrides });
  };

  if (!user) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>Manage User: {user.name}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{user.email}</p>

        <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Role</label>
        <select
          className="glass-input"
          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value)}
          style={{ marginBottom: '1.25rem' }}
        >
          {roles.map(r => (
            <option key={r.name} value={r.name}>{r.name}</option>
          ))}
        </select>

        <h4 style={{ marginBottom: '0.5rem' }}>Permission Overrides</h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          These stack on top of role-based permissions.
        </p>
        <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '1rem' }}>
          {PERMISSION_LIST.map(({ key, label }) => (
            <label key={key} style={checkboxStyle}>
              <input
                type="checkbox"
                checked={overrides.includes(key)}
                onChange={() => toggleOverride(key)}
              />
              <span><strong>{key}</strong> — {label}</span>
            </label>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, backdropFilter: 'blur(4px)',
};

const modalStyle = {
  background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
  borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '500px',
  maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(46,204,113,0.3)',
  boxShadow: '0 16px 48px rgba(46,204,113,0.2)',
};

const checkboxStyle = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  padding: '0.4rem 0', cursor: 'pointer', fontSize: '0.9rem',
};

export default UserPermissionModal;
