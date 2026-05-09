const mongoose = require('mongoose');

const projectRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  techStack: { type: String, default: '' },
  budget: { type: String, default: '' },
  level: {
    type: String,
    enum: ['Beginner', 'Moderate', 'Advanced'],
    default: 'Beginner',
  },
  deadline: { type: String, default: '' },
  additionalNotes: { type: String, default: '' },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'negotiation'],
    default: 'pending',
  },
  // For negotiation
  adminPrice: { type: Number, default: null },      // counter‑price from admin
  adminNotes: { type: String, default: '' },        // optional message for user

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ProjectRequest', projectRequestSchema);