const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Portfolio = require('../models/Portfolio');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

// ========== PLACE ORDER ==========
// @route   POST /api/orders
// @desc    Place an order (buy/sell)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { symbol, name, type, quantity, price, profitData } = req.body;
    const userId = req.user.id;

    console.log(`🔵 Processing ${type.toUpperCase()} order: ${quantity} ${symbol} @ ₹${price}`);

    // Get user info
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
    console.log(`✅ Order saved: ${type.toUpperCase()} ${quantity} ${symbol}`);

    // Update portfolio
    let portfolio = await Portfolio.findOne({ userId });

    if (!portfolio) {
      portfolio = new Portfolio({
        userId,
        holdings: []
      });
      console.log(`✅ Created new portfolio for user: ${userId}`);
    }

    if (type === 'buy') {
      // Add to portfolio
      const existingHolding = portfolio.holdings.find(h => h.symbol === symbol);
      
      if (existingHolding) {
        // Update existing holding
        const totalQuantity = existingHolding.quantity + quantity;
        const totalCost = (existingHolding.avgPrice * existingHolding.quantity) + (price * quantity);
        existingHolding.quantity = totalQuantity;
        existingHolding.avgPrice = totalCost / totalQuantity;
        console.log(`✅ Updated holding: ${symbol} - ${totalQuantity} shares @ avg ₹${existingHolding.avgPrice.toFixed(2)}`);
      } else {
        // Add new holding
        portfolio.holdings.push({
          symbol,
          name,
          quantity,
          avgPrice: price
        });
        console.log(`✅ Added new holding: ${symbol} - ${quantity} shares @ ₹${price}`);
      }
    } else if (type === 'sell') {
      // Remove from portfolio
      const holding = portfolio.holdings.find(h => h.symbol === symbol);
      
      if (holding) {
        holding.quantity -= quantity;
        console.log(`✅ Reduced holding: ${symbol} - ${holding.quantity} shares remaining`);
        
        // Remove holding if quantity is 0
        if (holding.quantity <= 0) {
          portfolio.holdings = portfolio.holdings.filter(h => h.symbol !== symbol);
          console.log(`✅ Removed holding: ${symbol} (sold all shares)`);
        }
      }
    }

    await portfolio.save();
    console.log(`✅ Portfolio updated`);

    // Log activity
    try {
      await ActivityLog.create({
        userId,
        email: user.email,
        activityType: 'ORDER_PLACED',
        details: {
          symbol,
          name,
          type,
          quantity,
          price,
          total: price * quantity,
          profit: profitData
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        status: 'success'
      });
      console.log(`✅ Activity logged: ORDER_PLACED for ${user.email}`);
    } catch (logErr) {
      console.error('⚠️ Failed to log activity:', logErr.message);
      // Don't fail the order if logging fails
    }

    res.json({
      order,
      msg: 'Order placed successfully'
    });
  } catch (err) {
    console.error('❌ Order error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// ========== GET ORDERS ==========
// @route   GET /api/orders
// @desc    Get user's order history
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ timestamp: -1 })
      .limit(50);

    console.log(`✅ Retrieved ${orders.length} orders for user`);
    res.json(orders);
  } catch (err) {
    console.error('❌ Get orders error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
