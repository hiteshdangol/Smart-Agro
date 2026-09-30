import React, { useEffect, useState, useMemo } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { showToast } from '../utils/toast';
import '../styles/AdminMedicines.css';

export default function AdminMedicines() {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ diseaseName: '', medicines: [] });

  const fetchEntries = async () => {
    try {
      const params = search ? `?search=${search}` : '';
      const res = await axiosInstance.get(`/admin/medicines${params}`);
      setEntries(res.data.medicines || []);
    } catch (err) {
      console.error('Failed to fetch medicines', err);
    }
  };

  useEffect(() => { fetchEntries(); }, [search]);

  const filtered = useMemo(() => {
    if (!search) return entries;
    return entries.filter(e => e.diseaseName.toLowerCase().includes(search.toLowerCase()));
  }, [entries, search]);

  const openNew = () => {
    setEditing({ _new: true });
    setForm({ diseaseName: '', medicines: [] });
  };

  const openEdit = (entry) => {
    setEditing(entry);
    setForm({
      diseaseName: entry.diseaseName,
      medicines: entry.medicines.map(m => ({ ...m })),
    });
  };

  const closeForm = () => {
    setEditing(null);
    setForm({ diseaseName: '', medicines: [] });
  };

  const handleSave = async () => {
    if (!form.diseaseName) {
      showToast('Disease name is required', 'error');
      return;
    }
    try {
      if (editing?._new) {
        await axiosInstance.post('/admin/medicines', form);
      } else {
        await axiosInstance.put(`/admin/medicines/${encodeURIComponent(editing.diseaseName)}`, form);
      }
      closeForm();
      fetchEntries();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save', 'error');
    }
  };

  const handleDelete = async (diseaseName) => {
    if (!window.confirm(`Delete medicine entry for "${diseaseName}"?`)) return;
    try {
      await axiosInstance.delete(`/admin/medicines/${encodeURIComponent(diseaseName)}`);
      fetchEntries();
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  const addMedicine = () => {
    setForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, {
        type: 'chemical',
        productName: '',
        description: '',
        applicationInstructions: '',
        suggestedProductNames: [],
        price: '',
        stock: '',
      }],
    }));
  };

  const removeMedicine = (idx) => {
    setForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== idx),
    }));
  };

  const updateMedicineField = (idx, field, value) => {
    setForm(prev => {
      const updated = [...prev.medicines];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, medicines: updated };
    });
  };

  const updateProductNames = (idx, value) => {
    const names = value.split(',').map(s => s.trim()).filter(Boolean);
    updateMedicineField(idx, 'suggestedProductNames', names);
  };

  return (
    <div className="admin-medicines-page">
      <h1>Medicine Database</h1>
      <p>Manage medicine recommendations linked to plant diseases.</p>

      <div className="admin-medicines-toolbar">
            <input
              className="admin-medicines-search"
              placeholder="Search by disease name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-primary" onClick={openNew}>+ Add Entry</button>
          </div>

          {editing && (
            <div className="admin-medicines-form-overlay">
              <div className="admin-medicines-form">
                <h2>{editing._new ? 'New Disease Medicine Entry' : `Edit: ${editing.diseaseName}`}</h2>
                <div className="admin-medicines-form-field">
                  <label>Disease Name</label>
                  <input
                    value={form.diseaseName}
                    onChange={(e) => setForm(prev => ({ ...prev, diseaseName: e.target.value }))}
                    placeholder="e.g. Tomato___Early_blight"
                    disabled={!editing._new}
                  />
                </div>
                <div className="admin-medicines-form-medicines">
                  <h3>Medicines ({form.medicines.length})</h3>
                  {form.medicines.map((med, i) => (
                    <div key={i} className="admin-medicine-entry">
                      <div className="admin-medicine-entry-header">
                        <span>Medicine #{i + 1}</span>
                        <button className="admin-medicine-remove" onClick={() => removeMedicine(i)}>&times;</button>
                      </div>
                      <div className="admin-medicine-entry-grid">
                        <div className="admin-medicines-form-field">
                          <label>Type</label>
                          <select value={med.type} onChange={(e) => updateMedicineField(i, 'type', e.target.value)}>
                            <option value="chemical">Chemical</option>
                            <option value="organic">Organic</option>
                          </select>
                        </div>
                        <div className="admin-medicines-form-field">
                          <label>Product Name</label>
                          <input value={med.productName} onChange={(e) => updateMedicineField(i, 'productName', e.target.value)} placeholder="e.g. Mancozeb 75% WP" />
                        </div>
                        <div className="admin-medicines-form-field">
                          <label>Description</label>
                          <input value={med.description} onChange={(e) => updateMedicineField(i, 'description', e.target.value)} placeholder="Brief description" />
                        </div>
                        <div className="admin-medicines-form-field">
                          <label>Application Instructions</label>
                          <textarea value={med.applicationInstructions} onChange={(e) => updateMedicineField(i, 'applicationInstructions', e.target.value)} placeholder="How to apply..." rows={2} />
                        </div>
                        <div className="admin-medicines-form-field">
                          <label>Suggested Shop Products (comma-separated names)</label>
                          <input value={(med.suggestedProductNames || []).join(', ')} onChange={(e) => updateProductNames(i, e.target.value)} placeholder="e.g. Fenny Fungicide, Multi Clear Pesticide" />
                        </div>
                        <div className="admin-medicines-form-field">
                          <label>Price (₹)</label>
                          <input type="number" min="0" value={med.price ?? ''} onChange={(e) => updateMedicineField(i, 'price', e.target.value)} placeholder="e.g. 490" />
                        </div>
                        <div className="admin-medicines-form-field">
                          <label>Stock</label>
                          <input type="number" min="0" value={med.stock ?? ''} onChange={(e) => updateMedicineField(i, 'stock', e.target.value)} placeholder="e.g. 100" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-secondary" onClick={addMedicine}>+ Add Medicine</button>
                </div>
                <div className="admin-medicines-form-actions">
                  <button className="btn btn-primary" onClick={handleSave}>Save</button>
                  <button className="btn btn-secondary" onClick={closeForm}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="admin-medicines-table-wrapper">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Disease Name</th>
                  <th>Medicines</th>
                  <th>Chemical</th>
                  <th>Organic</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                      No entries found
                    </td>
                  </tr>
                )}
                {filtered.map((entry) => {
                  const chemCount = entry.medicines.filter(m => m.type === 'chemical').length;
                  const orgCount = entry.medicines.filter(m => m.type === 'organic').length;
                  return (
                    <tr key={entry._id}>
                      <td><strong>{entry.diseaseName.replace(/_/g, ' ')}</strong></td>
                      <td>{entry.medicines.length}</td>
                      <td><span className="admin-med-type chemical">{chemCount}</span></td>
                      <td><span className="admin-med-type organic">{orgCount}</span></td>
                      <td>
                        <div className="admin-med-actions">
                          <button className="admin-action-btn" onClick={() => openEdit(entry)}
                            style={{ color: 'var(--primary)', borderColor: 'var(--primary)', background: 'var(--primary-light)' }}>
                            ✏
                          </button>
                          <button className="admin-action-btn" onClick={() => handleDelete(entry.diseaseName)}
                            style={{ color: '#e74c3c', borderColor: '#e74c3c', background: 'rgba(231,76,60,0.1)' }}>
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
}
