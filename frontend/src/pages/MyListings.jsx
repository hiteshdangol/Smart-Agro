import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { showToast } from '../utils/toast';
import '../styles/MyListings.css';

function MyListings() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Other', stock: '' });
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchMyProducts(); }, []);

  const fetchMyProducts = async () => {
    try {
      const res = await axiosInstance.get('/products/mine');
      setProducts(res.data.products);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editing) {
        await axiosInstance.put(`/products/${editing}`, payload);
      } else {
        await axiosInstance.post('/products', payload);
      }
      resetForm();
      fetchMyProducts();
      showToast(editing ? 'Product updated!' : 'Product added to your listings!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save product', 'error');
    }
  };

  const editProduct = (product) => {
    setForm({
      name: product.name, description: product.description,
      price: product.price, category: product.category,
      stock: product.stock,
    });
    setEditing(product._id);
    document.querySelector('.listing-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const deleteProduct = (id, name) => {
    setConfirmDelete({ id, name });
  };

  const performDelete = async (id) => {
    try {
      await axiosInstance.delete(`/products/${id}`);
      fetchMyProducts();
      showToast('Product deleted', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', category: 'Other', stock: '' });
    setEditing(null);
  };

  return (
    <>
      <div className="my-listings-page">
        <h1>My Listings</h1>

        <div className="listing-form-card">
          <h2>{editing ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="listing-form-grid">
              <input name="name" placeholder="Product name" value={form.name} onChange={handleChange} required />
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="Sensor">Sensor</option>
                <option value="Pesticide">Pesticide</option>
                <option value="Fertilizer">Fertilizer</option>
                <option value="Tool">Tool</option>
                <option value="Seed">Seed</option>
                <option value="Other">Other</option>
              </select>
              <input name="price" placeholder="Price (NPR)" type="number" value={form.price} onChange={handleChange} required />
              <input name="stock" placeholder="Stock quantity" type="number" value={form.stock} onChange={handleChange} />
            </div>
            <textarea className="listing-form-textarea" name="description" placeholder="Product description" value={form.description} onChange={handleChange} />
            <div className="listing-form-actions">
              <button type="submit" className="btn btn-primary">
                {editing ? 'Update' : 'Add'} Product
              </button>
              {editing && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              )}
            </div>
          </form>
        </div>

        {products.length === 0 ? (
          <p className="empty-listings">You haven't listed any products yet. Add your first product above!</p>
        ) : (
          <div className="listing-grid">
            {products.map((product) => (
              <div key={product._id} className="listing-card">
                <div className="listing-card-body">
                  <h3>{product.name}</h3>
                  <p className="category">{product.category}</p>
                  <p className="desc">{product.description}</p>
                  <p className="price">NPR {product.price}</p>
                  <p className="stock">Stock: {product.stock}</p>
                  <p className={`listing-status listing-status-${product.approvalStatus || 'pending'}`}>
                    {product.approvalStatus === 'approved' ? '✅ Approved' :
                     product.approvalStatus === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                  </p>
                  <div className="listing-card-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => editProduct(product)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(product._id, product.name)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="listing-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="listing-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setConfirmDelete(null)}>✕</button>
            <h3>Delete Product</h3>
            <p>
              Are you sure you want to delete <strong>"{confirmDelete.name}"</strong>? This action
              cannot be undone.
            </p>
            <div className="listing-modal-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => performDelete(confirmDelete.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MyListings;
