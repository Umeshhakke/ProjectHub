const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require("crypto");

const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Project = require('../models/Project');

/* ======================
   🔐 AUTH MIDDLEWARE
====================== */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

/* ======================
   🛒 CREATE ORDER (RAZORPAY)
====================== */
router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch cart items with project details
    const cartItems = await Cart.find({ userId }).populate('projectId');
    if (!cartItems.length) return res.status(400).json({ message: "Cart is empty" });

    // Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.projectId?.price || 0), 0);
    if (!totalAmount || totalAmount < 1) return res.status(400).json({ message: "Invalid total amount" });

    // Razorpay instance from app.locals
    const razorpay = req.app.locals.razorpay;

    const order = await razorpay.orders.create({
      amount: totalAmount * 100, // in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { userId }
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Order creation failed" });
  }
});

/* ======================
   💳 VERIFY PAYMENT
====================== */
// routes/orders.js
router.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const userId = req.user.id;

    // ✅ Populate project data from cart
    const cartItems = await Cart.find({ userId }).populate('projectId');
    if (!cartItems.length) return res.status(400).json({ message: "No items in cart to process" });

    // ✅ Create orders with file_url and image_url
    const orders = cartItems.map(item => ({
      userId,
      projectId: item.projectId._id,
      paymentId: razorpay_payment_id,
      status: "completed",
      file_url: item.projectId.file_url || '',
      image_url: item.projectId.image_url || ''
    }));

    await Order.insertMany(orders);

    // Clear the cart
    await Cart.deleteMany({ userId });

    res.json({ message: "Payment successful", paymentId: razorpay_payment_id });

  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
});
/* ======================
   📦 GET MY ORDERS
====================== */
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ userId }).populate('projectId');
    const formattedOrders = orders.map(order => ({
      id: order._id,
      projectId: order.projectId?._id,
      name: order.projectId?.name,
      price: order.projectId?.price,
      image_url: order.projectId?.image_url,
      file_url:order.projectId?.file_url,
      status: order.status,
      paymentId: order.paymentId,
      createdAt: order.createdAt
    }));

    res.json(formattedOrders);

  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

module.exports = router;