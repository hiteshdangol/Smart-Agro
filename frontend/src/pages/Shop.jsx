import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { showToast } from '../utils/toast';
import FloatingCart from '../components/FloatingCart';
import '../styles/Shop.css';

function Shop() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = category ? `/products?category=${category}` : '/products';
      const res = await axiosInstance.get(url);
      setProducts(res.data.products);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = (productId, value) => {
    const num = parseInt(value, 10);
    const product = products.find((p) => p._id === productId);
    const maxStock = product ? product.stock : Infinity;
    setQuantities((prev) => ({
      ...prev,
      [productId]: isNaN(num) || num < 1 ? 1 : Math.min(num, maxStock),
    }));
  };

  const addToCart = (product) => {
    const qty = quantities[product._id] || 1;
    if (qty < 1) {
      showToast('Please set a quantity greater than 0', 'error');
      return;
    }
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

  return (
    <>
      <div className="shop-container">
        <h1>Farmers Marketplace</h1>
        <div className="shop-filters">
          <label>Category: </label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All</option>
            <option value="Sensor">Sensors</option>
            <option value="Pesticide">Pesticides</option>
            <option value="Fertilizer">Fertilizers</option>
            <option value="Tool">Tools</option>
            <option value="Seed">Seeds</option>
            <option value="Other">Other</option>
          </select>
        </div>
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="shop-grid">
            {products.map((product) => (
              <div key={product._id} className="shop-card">
                <div className="shop-card-body">
                  <h3>{product.name}</h3>
                  <p className="shop-card-category">{product.category}</p>
                  <p className="shop-card-desc">{product.description}</p>
                  <p className="shop-card-price">NPR {product.price}</p>
                  <p className="shop-card-seller">Sold by: {product.seller?.name || 'Unknown'}</p>
                  <p className="shop-card-stock">Stock: {product.stock}</p>
                  {product.stock > 0 ? (
                    <div className="qty-control">
                      <label>Qty:</label>
                      <input
                        type="number"
                        min={1}
                        max={product.stock}
                        value={quantities[product._id] || 1}
                        onChange={(e) => handleQtyChange(product._id, e.target.value)}
                        onBlur={(e) => {
                          const v = parseInt(e.target.value, 10);
                          if (isNaN(v) || v < 1) handleQtyChange(product._id, 1);
                          else if (v > product.stock) handleQtyChange(product._id, product.stock);
                        }}
                      />
                      <button className="shop-btn" onClick={() => addToCart(product)}>
                        Add to Cart
                      </button>
                    </div>
                  ) : (
                    <button className="shop-btn" disabled>Out of Stock</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <FloatingCart />
    </>
  );
}

export default Shop;