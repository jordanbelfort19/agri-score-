const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

// @route   GET /api/logs
// @desc    Get all activity logs for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 50, activityType, startDate, endDate } = req.query;
    
    const query = { userId: req.user.id };
    
    // Filter by activity type
    if (activityType) {
      query.activityType = activityType;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const logs = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/logs/stats
// @desc    Get activity statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Total activities
    const totalActivities = await ActivityLog.countDocuments({ userId });
    
    // Activities by type
    const activitiesByType = await ActivityLog.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: '$activityType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Recent activities (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivities = await ActivityLog.countDocuments({
      userId,
      timestamp: { $gte: sevenDaysAgo }
    });
    
    // Total orders
    const totalBuyOrders = await ActivityLog.countDocuments({
      userId,
      activityType: 'BUY_ORDER'
    });
    
    const totalSellOrders = await ActivityLog.countDocuments({
      userId,
      activityType: 'SELL_ORDER'
    });
    
    // Login history
    const loginCount = await ActivityLog.countDocuments({
      userId,
      activityType: 'LOGIN',
      status: 'success'
    });
    
    const failedLoginCount = await ActivityLog.countDocuments({
      userId,
      activityType: 'LOGIN',
      status: 'failed'
    });
    
    res.json({
      totalActivities,
      activitiesByType,
      recentActivities,
      orders: {
        buy: totalBuyOrders,
        sell: totalSellOrders,
        total: totalBuyOrders + totalSellOrders
      },
      logins: {
        successful: loginCount,
        failed: failedLoginCount,
        total: loginCount + failedLoginCount
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/logs/export
// @desc    Export logs as JSON
// @access  Private
router.get('/export', auth, async (req, res) => {
  try {
    const logs = await ActivityLog.find({ userId: req.user.id })
      .sort({ timestamp: -1 });
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=activity-logs.json');
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
