const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Portfolio = require('../models/Portfolio');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

// @route   POST /api/orders
// @desc    Place an order (buy/sell)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { symbol, name, type, quantity, price, profitData } = req.body;
    const userId = req.user.id;

    console.log(`🔵 Order received: ${type} ${quantity} ${symbol} @ ₹${price}`);

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Create order
    const order = new Order({
      userId,
      symbol,
      name,
      type,
      quantity,
      price,
      total: price * quantity,
      profitData
    });

    await order.save();
    console.log(`✅ Order created in DB`);

    // Update portfolio
    let portfolio = await Portfolio.findOne({ userId });

    if (!portfolio) {
      portfolio = new Portfolio({
        userId,
        holdings: []
      });
    }

    if (type === 'buy') {
      const existingHolding = portfolio.holdings.find(h => h.symbol === symbol);
      
      if (existingHolding) {
        const totalQuantity = existingHolding.quantity + quantity;
        const totalCost = (existingHolding.avgPrice * existingHolding.quantity) + (price * quantity);
        existingHolding.quantity = totalQuantity;
        existingHolding.avgPrice = totalCost / totalQuantity;
      } else {
        portfolio.holdings.push({
          symbol,
          name,
          quantity,
          avgPrice: price
        });
      }
    } else if (type === 'sell') {
      const holding = portfolio.holdings.find(h => h.symbol === symbol);
      
      if (holding) {
        holding.quantity -= quantity;
        
        if (holding.quantity <= 0) {
          portfolio.holdings = portfolio.holdings.filter(h => h.symbol !== symbol);
        }
      }
    }

    await portfolio.save();
    console.log(`✅ Portfolio updated: ${portfolio.holdings.length} holdings`);

    // Log activity (simplified - no separate function)
    try {
      await ActivityLog.create({
        userId,
        email: user.email,
        activityType: 'ORDER_PLACED',
        details: {
          symbol,
          type,
          quantity,
          price
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status: 'success'
      });
      console.log(`✅ Activity logged`);
    } catch (logErr) {
      console.error('⚠️ Activity log failed:', logErr.message);
    }

    res.json({
      order,
      msg: 'Order placed successfully'
    });
  } catch (err) {
    console.error('❌ Order error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   GET /api/orders
// @desc    Get user's order history
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(orders);
  } catch (err) {
    console.error('❌ Get orders error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
