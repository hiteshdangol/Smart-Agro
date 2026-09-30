import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { showToast } from '../utils/toast';
import '../styles/ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosInstance.get(`/products/${id}`);
        setProduct(res.data.product);
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const addToCart = () => {
    if (!product || qty < 1) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((item) => item._id === product._id);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + qty, product.stock);
    } else {
      cart.push({ ...product, quantity: Math.min(qty, product.stock) });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    showToast(`${product.name} added to cart`, 'success');
  };

  if (loading) {
    return <div className="product-detail-loading">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="product-detail-error">
        <h2>Product not found</h2>
        <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <Link to="/shop" className="product-detail-back">&larr; Back to Shop</Link>
      <div className="product-detail-card">
        <div className="product-detail-image">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div className="product-detail-image-placeholder">📦</div>
          )}
        </div>
        <div className="product-detail-info">
          <span className="product-detail-category">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="product-detail-price">NPR {product.price?.toFixed(2)}</p>
          <p className="product-detail-desc">{product.description}</p>
          <p className="product-detail-seller">Sold by: {product.seller?.name || 'Unknown'}</p>
          <p className="product-detail-stock">
            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </p>
          {product.stock > 0 && (
            <div className="product-detail-actions">
              <div className="product-detail-qty">
                <label>Quantity:</label>
                <input
                  type="number"
                  min={1}
                  max={product.stock}
                  value={qty}
                  onChange={(e) => setQty(Math.min(Math.max(1, parseInt(e.target.value) || 1), product.stock))}
                />
              </div>
              <button className="btn btn-primary" onClick={addToCart}>Add to Cart</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
