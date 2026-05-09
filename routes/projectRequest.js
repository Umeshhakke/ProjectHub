const express = require('express');
const router = express.Router();
const ProjectRequest = require('../models/ProjectRequest');
const auth = require('../middleware/auth');           // ✅ new auth middleware (token only)
const adminAuth = require('../middleware/admin');     // ✅ your existing admin middleware (renamed)

// 1️⃣ USER: Create a new request
router.post('/', auth, async (req, res) => {
  try {
    const request = await ProjectRequest.create({
      userId: req.user.id,
      ...req.body,
    });
    res.status(201).json({ message: 'Request submitted', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2️⃣ USER: Get own requests
router.get('/my', auth, async (req, res) => {
  try {
    const requests = await ProjectRequest.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3️⃣ ADMIN: Get all requests
router.get('/admin', auth, adminAuth, async (req, res) => {
  try {
    const requests = await ProjectRequest.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4️⃣ ADMIN: Update request status (accept/reject/negotiate)
router.put('/admin/:id', auth, adminAuth, async (req, res) => {
  try {
    const { status, adminPrice, adminNotes } = req.body;
    if (!['accepted', 'rejected', 'negotiation'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const update = { status };
    if (status === 'negotiation') {
      update.adminPrice = adminPrice;
      update.adminNotes = adminNotes || '';
    } else {
      update.adminPrice = null;
      update.adminNotes = '';
    }
    const updated = await ProjectRequest.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Request not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5️⃣ USER: Respond to negotiation (accept or reject counter-offer)
router.put('/:id/respond', auth, async (req, res) => {
  try {
    const { action } = req.body;            // 'accept' or 'reject'
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Use "accept" or "reject".' });
    }

    const request = await ProjectRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Only the owner can respond
    if (request.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Can only respond when status is 'negotiation'
    if (request.status !== 'negotiation') {
      return res.status(400).json({ message: 'Request is not in negotiation state' });
    }

    // Update status
    const updated = await ProjectRequest.findByIdAndUpdate(
      req.params.id,
      { status: action === 'accept' ? 'accepted' : 'rejected' },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;