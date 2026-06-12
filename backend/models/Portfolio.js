const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  avgPrice: {
    type: Number,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for user + symbol
portfolioSchema.index({ userId: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
