const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const auth = require('../middleware/auth');

// ========== HELPER FUNCTION ==========
// Helper function to log activity
async function logActivity(userId, email, activityType, details, req, status = 'success') {
  try {
    await ActivityLog.create({
      userId,
      email,
      activityType,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      status
    });
    console.log(`✅ Activity logged: ${activityType} for ${email} (Status: ${status})`);
  } catch (err) {
    console.error('❌ Error logging activity:', err.message);
  }
}

// ========== SIGNUP ROUTE ==========
// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
router.post('/signup', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      await logActivity(user._id, email, 'SIGNUP', {
        reason: 'User already exists'
      }, req, 'failed');
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create user
    const name = email.split('@')[0];
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      email,
      name,
      password: hashedPassword
    });

    await user.save();
    console.log(`✅ User created: ${email}`);

    // Log signup activity
    await logActivity(user._id, user.email, 'SIGNUP', {
      name: user.name
    }, req, 'success');

    // Create JWT token
    const payload = {
      user: {
        id: user._id,
        email: user.email
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { 
            id: user._id, 
            email: user.email, 
            name: user.name 
          },
          msg: 'User created successfully'
        });
      }
    );
  } catch (err) {
    console.error('❌ Signup error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ========== LOGIN ROUTE ==========
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      await logActivity(null, email, 'LOGIN', {
        reason: 'User not found'
      }, req, 'failed');
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logActivity(user._id, email, 'LOGIN', {
        reason: 'Invalid password'
      }, req, 'failed');
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log successful login
    await logActivity(user._id, user.email, 'LOGIN', {
      name: user.name,
      lastLogin: user.lastLogin
    }, req, 'success');

    console.log(`✅ User logged in: ${email}`);

    // Create JWT token
    const payload = {
      user: {
        id: user._id,
        email: user.email
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: { 
            id: user._id, 
            email: user.email, 
            name: user.name 
          } 
        });
      }
    );
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ========== LOGOUT ROUTE ==========
// @route   POST /api/auth/logout
// @desc    Logout user (log activity)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Log logout activity
    await logActivity(user._id, user.email, 'LOGOUT', {
      name: user.name
    }, req, 'success');

    console.log(`✅ User logged out: ${user.email}`);
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error('❌ Logout error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ========== GET CURRENT USER ==========
// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('❌ Get user error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
