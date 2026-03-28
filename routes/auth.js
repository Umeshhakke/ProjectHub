const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


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
   📝 SIGNUP
====================== */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup error" });
  }
});

/* ======================
   🔐 LOGIN
====================== */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(password);

    // find user
    const user = await User.findOne({ email });
    
    // ✅ CHECK IF USER EXISTS FIRST
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Now it's safe to log password hash
    console.log(user.password);

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // create token
    const token = jwt.sign(
      { id: user._id, role: user.role }, // MUST include role for /projects/add
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login error" });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});
router.put('/update', authenticateToken, async (req, res) => {
  try {
    const { name, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,                 
      { name, email },
      { new: true }
    ).select('-password');

    res.json(updatedUser);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Update failed' });
  }
});
module.exports = router;