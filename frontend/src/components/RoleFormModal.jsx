import React, { useState, useEffect } from 'react';
import { PERMISSION_LIST } from '../utils/permissions';

function RoleFormModal({ role, onSave, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description);
      setPermissions(role.permissions || []);
    }
  }, [role]);

  const toggle = (key) => {
    setPermissions(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, description, permissions });
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>{role ? 'Edit Role' : 'Create Role'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="glass-input"
            placeholder="Role name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={{ marginBottom: '0.75rem' }}
          />
          <input
            className="glass-input"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />
          <h4 style={{ marginBottom: '0.5rem' }}>Permissions</h4>
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
            {PERMISSION_LIST.map(({ key, label }) => (
              <label key={key} style={checkboxStyle}>
                <input
                  type="checkbox"
                  checked={permissions.includes(key)}
                  onChange={() => toggle(key)}
                />
                <span><strong>{key}</strong> — {label}</span>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Role</button>
          </div>
        </form>
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

export default RoleFormModal;
