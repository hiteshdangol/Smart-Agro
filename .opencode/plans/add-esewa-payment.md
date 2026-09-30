# Add ESEWA Payment to Checkout

## Files to Modify (in order)

### 1. `backend/.env`
Add:
```
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_SUCCESS_URL=http://localhost:3000/payment/success
ESEWA_FAILURE_URL=http://localhost:3000/payment/failure
```

### 2. `backend/models/Order.js`
Add after `status` field:
```js
paymentMethod: { type: String, enum: ['cod', 'esewa'], default: 'cod' },
paymentStatus: { type: String, enum: ['unpaid', 'paid', 'failed'], default: 'unpaid' },
transactionId: { type: String, default: null },
```

### 3. `backend/controllers/orderController.js`
- Modify `placeOrder`: accept `paymentMethod`; skip stock decrement if esewa
- Add `initiateEsewaPayment`: generates transaction_uuid, HMAC-SHA256 signature, returns form fields
- Add `verifyEsewaPayment`: calls eSewa status API, updates order

### 4. `backend/routes/orderRoutes.js`
Add:
```js
router.post('/esewa/initiate', authMiddleware, initiateEsewaPayment);
router.post('/esewa/verify', authMiddleware, verifyEsewaPayment);
```

### 5. `frontend/src/pages/Checkout.jsx`
- Add payment method radio buttons (COD / eSewa)
- On eSewa: place order → initiate payment → redirect to eSewa form

### 6. `frontend/src/pages/PaymentSuccess.jsx` (new)
- Read query params from eSewa redirect
- Call backend to verify
- Show success / order details

### 7. `frontend/src/pages/PaymentFailure.jsx` (new)
- Show failure message
- Link to retry / go to orders

### 8. `frontend/src/App.js`
Add routes:
```
<Route path="/payment/success" element={<PaymentSuccess />} />
<Route path="/payment/failure" element={<PaymentFailure />} />
```

### 9. `frontend/src/styles/Checkout.css`
Add styles for `.payment-methods`, `.payment-option`, `.payment-option.selected`
