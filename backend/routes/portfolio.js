const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Portfolio = require('../models/Portfolio');

// @route   GET /api/portfolio
// @desc    Get user's portfolio
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.find({ userId: req.user.id });
    res.json(portfolio);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
