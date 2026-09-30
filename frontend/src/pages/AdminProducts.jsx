import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { showToast } from '../utils/toast';
import '../styles/AdminProducts.css';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [filterTab, setFilterTab] = useState('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState('products');
  const [wishlist, setWishlist] = useState([]);
  const [wishlistStatus, setWishlistStatus] = useState('');
  const [approving, setApproving] = useState(null);
  const [approvalForm, setApprovalForm] = useState({ name: '', category: '', price: '', stock: '', description: '' });
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', description: '', category: '', price: '', stock: '' });
  const [adding, setAdding] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get('/admin/products');
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const fetchWishlist = useCallback(async () => {
    setWishlistLoading(true);
    try {
      const params = wishlistStatus ? `?status=${wishlistStatus}` : '';
      const res = await axiosInstance.get(`/admin/wishlist${params}`);
      setWishlist(res.data.wishlist || []);
    } catch (err) {
      console.error('Failed to fetch wishlist', err);
    } finally {
      setWishlistLoading(false);
    }
  }, [wishlistStatus]);

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => { if (view === 'wishlist') fetchWishlist(); }, [view, fetchWishlist]);

  const pendingCount = useMemo(() => {
    return wishlist.filter((item) => item.status === 'pending').length;
  }, [wishlist]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filterTab !== 'all' && p.approvalStatus !== filterTab) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, filterTab, search]);

  const counts = useMemo(() => {
    return {
      all: products.length,
      pending: products.filter((p) => p.approvalStatus === 'pending').length,
      approved: products.filter((p) => p.approvalStatus === 'approved').length,
      rejected: products.filter((p) => p.approvalStatus === 'rejected').length,
    };
  }, [products]);

  const handleApprove = async (id, status) => {
    try {
      await axiosInstance.put(`/admin/products/${id}/approve`, { status });
      fetchProducts();
    } catch (err) {
      showToast('Failed to update product status', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete product "${name}"?`)) return;
    try {
      await axiosInstance.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      showToast('Failed to delete product', 'error');
    }
  };

  const handleAddProductChange = (field, value) => {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  };

  const openAddProduct = () => {
    setAddForm({ name: '', description: '', category: '', price: '', stock: '' });
    setShowAddProduct(true);
  };

  const closeAddProduct = () => {
    setShowAddProduct(false);
  };

  const submitAddProduct = async () => {
    if (!addForm.name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }
    if (!addForm.category) {
      showToast('Category is required', 'error');
      return;
    }
    if (!addForm.price || Number(addForm.price) <= 0) {
      showToast('Price must be greater than 0', 'error');
      return;
    }
    if (addForm.stock === '' || Number(addForm.stock) < 0) {
      showToast('Stock must be 0 or greater', 'error');
      return;
    }
    setAdding(true);
    try {
      await axiosInstance.post('/products', {
        name: addForm.name.trim(),
        description: addForm.description.trim(),
        category: addForm.category,
        price: Number(addForm.price),
        stock: Number(addForm.stock),
      });
      closeAddProduct();
      fetchProducts();
      showToast('Product added successfully', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add product', 'error');
    } finally {
      setAdding(false);
    }
  };

  const updateWishlistStatus = async (id, status) => {
    try {
      await axiosInstance.put(`/admin/wishlist/${id}/status`, { status });
      fetchWishlist();
      showToast(`Request ${status}`, 'success');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const openApprove = (item) => {
    setApproving(item);
    setApprovalForm({
      name: item.medicineName,
      category: item.type === 'chemical' ? 'Pesticide' : 'Other',
      price: '',
      stock: '',
      description: '',
    });
  };

  const closeApprove = () => {
    setApproving(null);
    setApprovalForm({ name: '', category: '', price: '', stock: '', description: '' });
  };

  const handleApproveWishlist = async () => {
    if (!approvalForm.price || Number(approvalForm.price) <= 0) {
      showToast('Please enter a valid price greater than 0', 'error');
      return;
    }
    if (approvalForm.stock === '' || Number(approvalForm.stock) < 0) {
      showToast('Please enter a valid stock amount', 'error');
      return;
    }
    try {
      await axiosInstance.post(`/admin/wishlist/${approving._id}/approve`, {
        name: approvalForm.name,
        category: approvalForm.category,
        price: Number(approvalForm.price),
        stock: Number(approvalForm.stock),
        description: approvalForm.description,
      });
      closeApprove();
      fetchWishlist();
      showToast('Product added to shop', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to approve wishlist item', 'error');
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleString();
  };

  const filteredWishlist = useMemo(() => {
    if (!wishlistStatus) return wishlist;
    return wishlist.filter((item) => item.status === wishlistStatus);
  }, [wishlist, wishlistStatus]);

  return (
    <div className="admin-products-page">
      <h1>📦 Products Management</h1>
      <p>Approve, reject, or remove product listings from the marketplace.</p>

      <div className="admin-products-tabs">
        <button
          className={`admin-prod-tab ${view === 'products' ? 'active' : ''}`}
          onClick={() => setView('products')}
        >
          Products
          <span className="admin-prod-tab-count">{counts.all}</span>
        </button>
        <button
          className={`admin-prod-tab ${view === 'wishlist' ? 'active' : ''}`}
          onClick={() => setView('wishlist')}
        >
          Wishlist Requests
          {pendingCount > 0 && <span className="admin-wishlist-badge">{pendingCount > 99 ? '99+' : pendingCount}</span>}
        </button>
      </div>

      {view === 'products' && (
        <>
          <div className="admin-products-toolbar">
            <div className="admin-products-tabs">
              {['all', 'pending', 'approved', 'rejected'].map((tab) => (
                <button
                  key={tab}
                  className={`admin-prod-tab ${filterTab === tab ? 'active' : ''}`}
                  onClick={() => setFilterTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className="admin-prod-tab-count">{counts[tab]}</span>
                </button>
              ))}
            </div>
            <input
              className="admin-prod-search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="admin-prod-add-btn" onClick={openAddProduct}>
              + Add Product
            </button>
          </div>

          <div className="admin-product-table-wrapper">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Farmer</th>
                  <th>Approval</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                      No products found
                    </td>
                  </tr>
                )}
                {filtered.map((p) => (
                  <tr key={p._id}>
                    <td><strong>{p.name}</strong></td>
                    <td>NPR {p.price?.toFixed(2)}</td>
                    <td style={{ fontSize: '0.85rem' }}>{p.seller?.name || 'Unknown'}</td>
                    <td>
                      <span className={`admin-prod-status ${p.approvalStatus || 'approved'}`}>
                        {p.approvalStatus === 'approved' ? '✅' : p.approvalStatus === 'rejected' ? '❌' : '⏳'} {p.approvalStatus || 'approved'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-prod-actions">
                        {p.approvalStatus !== 'approved' && (
                          <button className="admin-action-btn" title="Approve" onClick={() => handleApprove(p._id, 'approved')}
                            style={{ color: 'var(--primary)', borderColor: 'var(--primary)', background: 'var(--primary-light)' }}>
                            ✓
                          </button>
                        )}
                        {p.approvalStatus !== 'rejected' && (
                          <button className="admin-action-btn" title="Reject" onClick={() => handleApprove(p._id, 'rejected')}
                            style={{ color: '#e67e22', borderColor: '#e67e22', background: 'rgba(230,126,34,0.1)' }}>
                            ✗
                          </button>
                        )}
                        <button className="admin-action-btn" title="Delete" onClick={() => handleDelete(p._id, p.name)}
                          style={{ color: '#e74c3c', borderColor: '#e74c3c', background: 'rgba(231,76,60,0.1)' }}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === 'wishlist' && (
        <div className="admin-wishlist-page">
          <div className="admin-wishlist-filters">
            <label>Status: </label>
            <select value={wishlistStatus} onChange={(e) => setWishlistStatus(e.target.value)}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          {wishlistLoading ? (
            <p>Loading requests...</p>
          ) : wishlist.length === 0 ? (
            <p>No wishlist requests found.</p>
          ) : (
            <div className="admin-wishlist-table">
              <table>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Disease</th>
                    <th>Requested By</th>
                    <th>Requested At</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWishlist.map((item) => (
                    <tr key={item._id}>
                      <td><strong>{item.medicineName}</strong></td>
                      <td>{item.diseaseName || '—'}</td>
                      <td>{item.userName} ({item.userEmail})</td>
                      <td>{formatDate(item.createdAt)}</td>
                      <td>
                        <span className={`admin-med-type ${item.status === 'pending' ? 'chemical' : item.status === 'fulfilled' ? 'organic' : 'rejected'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.status === 'pending' && (
                          <>
                            <button className="admin-action-btn approve" title="Approve & add to shop"
                              onClick={() => openApprove(item)}>✓</button>
                            <button className="admin-action-btn reject" title="Mark rejected"
                              onClick={() => updateWishlistStatus(item._id, 'rejected')}>✕</button>
                          </>
                        )}
                        {item.status !== 'pending' && (
                          <button className="admin-action-btn reopen" title="Reopen as pending"
                            onClick={() => updateWishlistStatus(item._id, 'pending')}>↺</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showAddProduct && (
        <div className="admin-modal-overlay" onClick={closeAddProduct}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Product</h3>
            <div className="admin-modal-field">
              <label>Name</label>
              <input type="text" value={addForm.name} onChange={(e) => handleAddProductChange('name', e.target.value)} placeholder="Product name" />
            </div>
            <div className="admin-modal-field">
              <label>Description</label>
              <textarea value={addForm.description} onChange={(e) => handleAddProductChange('description', e.target.value)} placeholder="Description" rows={3} />
            </div>
            <div className="admin-modal-field">
              <label>Category</label>
              <select value={addForm.category} onChange={(e) => handleAddProductChange('category', e.target.value)}>
                <option value="">Select category</option>
                <option value="Sensor">Sensor</option>
                <option value="Pesticide">Pesticide</option>
                <option value="Fertilizer">Fertilizer</option>
                <option value="Tool">Tool</option>
                <option value="Seed">Seed</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="admin-modal-field">
              <label>Price (NPR)</label>
              <input type="number" value={addForm.price} onChange={(e) => handleAddProductChange('price', e.target.value)} placeholder="0.00" min={0} step={0.01} />
            </div>
            <div className="admin-modal-field">
              <label>Stock</label>
              <input type="number" value={addForm.stock} onChange={(e) => handleAddProductChange('stock', e.target.value)} placeholder="0" min={0} />
            </div>
            <div className="admin-modal-actions">
              <button className="admin-btn-secondary" onClick={closeAddProduct}>Cancel</button>
              <button className="admin-btn-primary" onClick={submitAddProduct} disabled={adding}>
                {adding ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {approving && (
        <div className="admin-modal-overlay" onClick={closeApprove}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Approve &amp; Add to Shop</h3>
            <p className="admin-modal-info">
              Medicine: <strong>{approving.medicineName}</strong>
              {approving.diseaseName && <> — Disease: <strong>{approving.diseaseName}</strong></>}
            </p>
            <div className="admin-modal-field">
              <label>Product Name</label>
              <input type="text" value={approvalForm.name} onChange={(e) => setApprovalForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="admin-modal-field">
              <label>Category</label>
              <select value={approvalForm.category} onChange={(e) => setApprovalForm((prev) => ({ ...prev, category: e.target.value }))}>
                <option value="Pesticide">Pesticide</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="admin-modal-field">
              <label>Price (NPR)</label>
              <input type="number" value={approvalForm.price} onChange={(e) => setApprovalForm((prev) => ({ ...prev, price: e.target.value }))} placeholder="0.00" min={0} step={0.01} />
            </div>
            <div className="admin-modal-field">
              <label>Stock</label>
              <input type="number" value={approvalForm.stock} onChange={(e) => setApprovalForm((prev) => ({ ...prev, stock: e.target.value }))} placeholder="0" min={0} />
            </div>
            <div className="admin-modal-field">
              <label>Description</label>
              <textarea value={approvalForm.description} onChange={(e) => setApprovalForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" rows={3} />
            </div>
            <div className="admin-modal-actions">
              <button className="admin-btn-secondary" onClick={closeApprove}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleApproveWishlist}>Approve &amp; Add to Shop</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;