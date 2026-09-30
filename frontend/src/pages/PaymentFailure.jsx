import React from 'react';
import { Link } from 'react-router-dom';

function PaymentFailure() {
  return (
    <div className="checkout-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <h2 style={{ color: '#e74c3c' }}>Payment Cancelled / Failed</h2>
      <p>Your eSewa payment was not completed. You can try again or choose a different payment method.</p>
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/checkout" className="btn btn-primary">
          Try Again
        </Link>
        <Link to="/my-orders" className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', textDecoration: 'none' }}>
          My Orders
        </Link>
      </div>
    </div>
  );
}

export default PaymentFailure;
