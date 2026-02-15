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
    const { amount, paymentMethod, reference, slip } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    if (!slip) {
      return res.status(400).json({ message: 'Payment slip is required' });
    }

    // Create transaction
    const transaction = new Transaction({
      user: req.userId,
      type: 'topup',
      amount,
      status: 'pending', // Keep as pending for admin approval
      paymentMethod,
      reference,
      slip, // Store the payment slip URL
      description: `Wallet top-up of LKR ${amount}`
    });

    await transaction.save();

    // Note: Balance will be updated after admin approval
    // In a production system, admin would approve and update balance
    // For testing, you can auto-approve by uncommenting below:
    // transaction.status = 'completed';
    // await transaction.save();
    // await User.findByIdAndUpdate(req.userId, {
    //   $inc: { walletBalance: amount }
    // });

    const user = await User.findById(req.userId);

    res.json({
      message: 'Top-up request submitted successfully. Awaiting admin approval.',
      transaction,
      balance: user.walletBalance
    });
  } catch (error) {
    console.error('Topup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
