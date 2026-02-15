const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Get wallet balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('walletBalance');
    res.json({ balance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.userId })
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 });

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Top up wallet
router.post('/topup', auth, async (req, res) => {
  try {
    const { amount, paymentMethod, reference } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    // Create transaction
    const transaction = new Transaction({
      user: req.userId,
      type: 'topup',
      amount,
      status: 'pending',
      paymentMethod,
      reference,
      description: `Wallet top-up of LKR ${amount}`
    });

    await transaction.save();

    // In production, this would be verified by payment gateway
    // For now, auto-approve
    transaction.status = 'completed';
    await transaction.save();

    // Update user wallet
    await User.findByIdAndUpdate(req.userId, {
      $inc: { walletBalance: amount }
    });

    const user = await User.findById(req.userId);

    res.json({
      message: 'Wallet topped up successfully',
      transaction,
      balance: user.walletBalance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Make payment from wallet
router.post('/pay', auth, async (req, res) => {
  try {
    const { amount, orderId, description } = req.body;

    const user = await User.findById(req.userId);

    if (user.walletBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create transaction
    const transaction = new Transaction({
      user: req.userId,
      type: 'payment',
      amount: -amount,
      status: 'completed',
      order: orderId,
      paymentMethod: 'wallet',
      description: description || `Payment for order`
    });

    await transaction.save();

    // Deduct from wallet
    user.walletBalance -= amount;
    await user.save();

    res.json({
      message: 'Payment successful',
      transaction,
      balance: user.walletBalance
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
