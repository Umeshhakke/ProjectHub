const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  image_url: String,
  file_url: String,      // <-- Add this line to store the zip file
  report_url: String
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);