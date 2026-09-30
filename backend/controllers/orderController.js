const Order = require('../models/Order');
const Product = require('../models/Product');
const crypto = require('crypto');

exports.placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
      if (product.stock < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
      totalAmount += product.price * item.quantity;
    }

    const order = await Order.create({
      buyer: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'esewa' ? 'unpaid' : 'unpaid',
    });

    // Decrement stock only for COD orders (eSewa: stock decremented after payment verification)
    if (paymentMethod !== 'esewa') {
      for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
      }
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('buyer', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.initiateEsewaPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.buyer.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const amount = Math.round(order.totalAmount).toString();
    const taxAmount = '0';
    const totalAmount = amount;
    const transactionUuid = `${orderId}_${Date.now()}`;
    const productCode = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';
    const secretKey = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';

    // Generate HMAC-SHA256 signature
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(message);
    const signature = hmac.digest('base64');

    const formData = {
      amount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: process.env.ESEWA_SUCCESS_URL,
      failure_url: process.env.ESEWA_FAILURE_URL,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature,
    };

    res.json({ success: true, formData, esewaUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyEsewaPayment = async (req, res) => {
  try {
    const { orderId, transaction_code, total_amount, transaction_uuid } = req.body;
    const productCode = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';

    // Call eSewa status API to verify
    const https = require('https');
    const url = `https://rc-epay.esewa.com.np/api/epay/transaction/status/?product_code=${productCode}&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`;

    const response = await new Promise((resolve, reject) => {
      https.get(url, (resp) => {
        let data = '';
        resp.on('data', chunk => data += chunk);
        resp.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch { resolve(data); }
        });
      }).on('error', reject);
    });

    if (response.status === 'COMPLETE' || response?.state === 'completed') {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      order.paymentStatus = 'paid';
      order.transactionId = transaction_code || response.transaction_code;
      await order.save();

      // Decrement stock now that payment is confirmed
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
      }

      return res.json({ success: true, order, message: 'Payment verified successfully' });
    }

    res.status(400).json({ success: false, message: 'Payment verification failed', details: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPendingOrderCount = async (req, res) => {
  try {
    const count = await Order.countDocuments({ buyer: req.user.id, status: 'pending' });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (status === 'cancelled' && order.status !== 'cancelled') {
      const shouldRestore = order.paymentMethod === 'cod' || order.paymentStatus === 'paid';
      if (shouldRestore) {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }
      }
    }

    order.status = status;
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
