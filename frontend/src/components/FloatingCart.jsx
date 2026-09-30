import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FloatingCart.css';

function FloatingCart() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart') || '[]'));
  const panelRef = useRef(null);

  useEffect(() => {
    const handler = () => {
      setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
    };
    window.addEventListener('cart-updated', handler);
    return () => window.removeEventListener('cart-updated', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const changeQty = (id, delta) => {
    const updated = cart.map((item) =>
      item._id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    updateCart(updated);
  };

  const removeItem = (id) => {
    updateCart(cart.filter((item) => item._id !== id));
  };

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="floating-cart-wrapper" ref={panelRef}>
      <button className="floating-cart-btn" onClick={() => setOpen((prev) => !prev)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        {itemCount > 0 && <span className="floating-cart-badge">{itemCount}</span>}
      </button>
      {open && (
        <div className="floating-cart-panel">
          <h4>Shopping Cart ({itemCount} items)</h4>
          {cart.length === 0 ? (
            <p className="floating-cart-empty">Your cart is empty.</p>
          ) : (
            <>
              <div className="floating-cart-items">
                {cart.map((item) => (
                  <div key={item._id} className="floating-cart-item">
                    <div className="floating-cart-item-info">
                      <span className="floating-cart-item-name">{item.name}</span>
                      <div className="floating-cart-item-actions">
                        <div className="floating-cart-item-qty">
                          <button onClick={() => changeQty(item._id, -1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => changeQty(item._id, 1)}>+</button>
                        </div>
                        <button className="floating-cart-remove" onClick={() => removeItem(item._id)}>Remove</button>
                      </div>
                    </div>
                    <span className="floating-cart-item-price">NPR {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="floating-cart-total">
                <span>Total</span>
                <span>NPR {total.toFixed(2)}</span>
              </div>
              <button className="floating-cart-checkout" onClick={() => { setOpen(false); navigate('/checkout'); }}>
                Proceed to Checkout
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default FloatingCart;
