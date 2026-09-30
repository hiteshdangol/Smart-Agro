import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const verify = async () => {
      try {
        const transaction_code = searchParams.get('transaction_code');
        const total_amount = searchParams.get('total_amount');
        const transaction_uuid = searchParams.get('transaction_uuid');
        const ref_id = searchParams.get('ref_id');

        if (!transaction_code || !total_amount || !transaction_uuid) {
          setStatus('invalid');
          return;
        }

        const orderId = transaction_uuid.split('_')[0];
        await axiosInstance.post('/orders/esewa/verify', {
          orderId,
          transaction_code,
          total_amount,
          transaction_uuid,
        });

        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cart-updated'));
        setStatus('success');
      } catch {
        setStatus('failed');
      }
    };
    verify();
  }, [searchParams]);

  return (
    <div className="checkout-page" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      {status === 'verifying' && (
        <>
          <h2>Verifying Payment...</h2>
          <p>Please wait while we confirm your eSewa transaction.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <h2 style={{ color: '#60b246' }}>Payment Successful!</h2>
          <p>Your order has been placed and payment confirmed via eSewa.</p>
          <button className="btn btn-primary" onClick={() => navigate('/my-orders')} style={{ marginTop: '1rem' }}>
            View My Orders
          </button>
        </>
      )}
      {status === 'failed' && (
        <>
          <h2 style={{ color: '#e74c3c' }}>Payment Verification Failed</h2>
          <p>We could not verify your payment. Please contact support.</p>
          <Link to="/my-orders" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            My Orders
          </Link>
        </>
      )}
      {status === 'invalid' && (
        <>
          <h2 style={{ color: '#e74c3c' }}>Invalid Response</h2>
          <p>The payment response was incomplete. Please check your orders.</p>
          <Link to="/my-orders" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            My Orders
          </Link>
        </>
      )}
    </div>
  );
}

export default PaymentSuccess;
