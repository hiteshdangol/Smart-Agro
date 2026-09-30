import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { showToast } from '../utils/toast';
import '../styles/Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const [form, setForm] = useState({ fullName: '', address: '', city: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const placeOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const items = cart.map((item) => ({ productId: item._id, quantity: item.quantity }));
      const { data } = await axiosInstance.post('/orders', { items, shippingAddress: form, paymentMethod });

      if (paymentMethod === 'esewa') {
        const { data: esewaData } = await axiosInstance.post('/orders/esewa/initiate', { orderId: data.order._id });
        const { formData, esewaUrl } = esewaData;
        const formEl = document.createElement('form');
        formEl.method = 'POST';
        formEl.action = esewaUrl;
        Object.entries(formData).forEach(([key, val]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = val;
          formEl.appendChild(input);
        });
        document.body.appendChild(formEl);
        formEl.submit();
      } else {
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cart-updated'));
        showToast('Order placed successfully!', 'success');
        navigate('/my-orders');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <>
        <div className="checkout-page"><p>Your cart is empty</p></div>
      </>
    );
  }

  return (
    <>
      <div className="checkout-page">
        <h1>Checkout</h1>
        <div className="checkout-layout">
          <div className="order-summary-card">
            <h3>Order Summary</h3>
            {cart.map((item) => (
              <p key={item._id}>
                <span>{item.name} x {item.quantity}</span>
                <span>NPR {(item.price * item.quantity).toFixed(2)}</span>
              </p>
            ))}
            <p className="total-row">
              <span>Total</span>
              <span>NPR {total.toFixed(2)}</span>
            </p>
          </div>
          <div className="shipping-form-card">
            <h3>Shipping Address</h3>
            <form onSubmit={placeOrder}>
              <input name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
              <input name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
              <input name="city" placeholder="City" value={form.city} onChange={handleChange} required />
              <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required />
              <div className="payment-methods">
                <h3>Payment Method</h3>
                <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <span>Cash on Delivery</span>
                </label>
                <label className={`payment-option ${paymentMethod === 'esewa' ? 'selected' : ''}`}>
                  <input type="radio" name="paymentMethod" value="esewa" checked={paymentMethod === 'esewa'} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <span className="esewa-label">eSewa</span>
                </label>
              </div>
              <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Checkout;
