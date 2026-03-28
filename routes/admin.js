const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminMiddleware = require('../middleware/admin');

const Project = require('../models/Project');
const User = require('../models/User');
const Order = require('../models/Order');

const path = require('path');

/* ======================
   📁 MULTER SETUP
====================== */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'image') cb(null, 'uploads/images');
    else if (file.fieldname === 'file') cb(null, 'uploads/files');
    else if (file.fieldname === 'report') cb(null, 'uploads/reports');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

/* ======================
   ➕ ADD PROJECT
====================== */
router.post(
  '/project',
  adminMiddleware,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
    { name: 'report', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { name, description, price } = req.body;

      const image_url = req.files['image']
        ? `/uploads/images/${req.files['image'][0].filename}`
        : null;

      const file_url = req.files['file']
        ? `/uploads/files/${req.files['file'][0].filename}`
        : null;

      const report_url = req.files['report']
        ? `/uploads/reports/${req.files['report'][0].filename}`
        : null;

      await Project.create({
        name,
        description,
        price,
        image_url,
        file_url,
        report_url
      });

      res.json({ message: 'Project added successfully' });

    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Error adding project' });
    }
  }
);

/* ======================
   ❌ DELETE PROJECT
====================== */
router.delete('/project/:id', adminMiddleware, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

/* ======================
   👥 GET USERS
====================== */
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, 'name email role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

/* ======================
   📦 GET PROJECTS
====================== */
router.get('/projects', adminMiddleware, async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

/* ======================
   📊 GET ORDERS
====================== */
router.get('/orders', adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name')
      .populate('projectId', 'name');

    const formatted = orders.map(order => ({
      id: order._id,
      user_name: order.userId?.name,
      project_name: order.projectId?.name,
      status: order.status
    }));

    res.json(formatted);

  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

/* ======================
   ❌ DELETE USER
====================== */
router.delete('/user/:id', adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

/* ======================
   ✏️ UPDATE ORDER STATUS
====================== */
router.put('/order/:id', adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    await Order.findByIdAndUpdate(req.params.id, { status });

    res.json({ message: 'Order updated' });

  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
});

module.exports = router;