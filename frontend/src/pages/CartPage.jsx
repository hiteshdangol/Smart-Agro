import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CartPage.css';

function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart') || '[]'));

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

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      <div className="cart-page">
        <h1>Shopping Cart</h1>
        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item._id} className="cart-item-card">
                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p>NPR {item.price} x {item.quantity} = NPR {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="cart-item-qty">
                    <button onClick={() => changeQty(item._id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => changeQty(item._id, 1)}>+</button>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => removeItem(item._id)}>Remove</button>
                </div>
              ))}
            </div>
            <div className="cart-total">
              <h3>Total</h3>
              <span>NPR {total.toFixed(2)}</span>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/checkout')} style={{ marginTop: '1rem', width: '100%' }}>
              Proceed to Checkout
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default CartPage;
