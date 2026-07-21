const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields required' });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email, stats: user.stats }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, stats: user.stats }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({ user: { id: req.user._id, username: req.user.username, email: req.user.email, stats: req.user.stats } });
});

module.exports = router;
