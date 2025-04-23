const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, isAdmin } = require('../middleware/auth');

// Đăng ký người dùng
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Tên người dùng đã tồn tại' });

    const user = new User({ username, password, role });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Đăng nhập người dùng
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Tên người dùng không tồn tại' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu không chính xác' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 