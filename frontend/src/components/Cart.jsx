import React from "react";
import { Link } from "react-router-dom";
import "../styles/Cart.css";

const Cart = () => {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-container">
      <h2>Shopping Cart ({cart.length} items)</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty. <Link to="/shop">Browse Shop</Link></p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item._id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #eee" }}>
              <span>{item.name} x {item.quantity}</span>
              <span>NPR {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <h3>Total: NPR {total.toFixed(2)}</h3>
          <Link to="/cart" className="toggle-btn">View Cart</Link>
        </>
      )}
    </div>
  );
};

export default Cart;
