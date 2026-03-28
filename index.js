require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*', // or your frontend URL after deploy
}));

/* =======================
   🔌 MongoDB Connection
======================= */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Error:", error.message);
    process.exit(1);
  }
};

connectDB();

/* =======================
   💳 Razorpay Setup
======================= */
let razorpayInstance = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  const Razorpay = require("razorpay");

  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  console.log("✅ Razorpay initialized");
} else {
  console.log("❌ Razorpay NOT initialized");
}

app.locals.razorpay = razorpayInstance;

/* =======================
   📦 Routes
======================= */
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const projectRoutes = require('./routes/projects');
app.use('/api/projects', projectRoutes);

const orderRoutes = require('./routes/orders');
app.use('/api/orders', orderRoutes);

const cartRoutes = require('./routes/cart');
app.use('/api/cart', cartRoutes);

// const paymentRoutes = require('./routes/payment');
// app.use('/api/payment', paymentRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

/* =======================
   📁 Static Files
======================= */
app.use('/files', express.static('files'));
app.use('/uploads', express.static('uploads'));

/* =======================
   🧪 Test Route
======================= */
app.get('/', (req, res) => {
  res.send('MongoDB Backend is working!');
});

/* =======================
   🚀 Start Server
======================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
