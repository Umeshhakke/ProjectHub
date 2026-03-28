const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

/* ======================
   ➕ ADD TO CART
====================== */
router.post('/', async (req, res) => {
  try {
    const { userId, projectId } = req.body;

    const item = await Cart.create({
      userId,
      projectId
    });

    res.json(item);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
});

/* ======================
   📦 GET USER CART
====================== */
// cart.js
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const cartItems = await Cart.find({ userId })
      .populate({
        path: 'projectId',
        select: 'name price image_url description' // only needed fields
      });

    const formatted = cartItems.map(item => ({
      cart_id: item._id,
      project_id: item.projectId?._id,
      name: item.projectId?.name || 'Unknown Project',
      price: item.projectId?.price || 0,
      image_url: item.projectId?.image_url || '',
      description: item.projectId?.description || ''
    }));

    res.json(formatted);

  } catch (err) {
    console.log('Cart fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

/* ======================
   ❌ REMOVE ITEM
====================== */
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    await Cart.findByIdAndDelete(id);

    res.json({ message: 'Item removed' });

  } catch (err) {
    res.status(500).json({ message: 'Failed to remove item' });
  }
});

module.exports = router;