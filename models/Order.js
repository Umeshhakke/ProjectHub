// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  paymentId: {
    type: String
  },
  status: {
    type: String,
    default: 'pending'
  },
  file_url: {          // store project file path
    type: String
  },
  image_url: {         // store project image path
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);