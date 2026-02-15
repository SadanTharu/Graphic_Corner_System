const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper function to create notification
const createNotification = async (userId, type, title, message) => {
  try {
    const notification = new Notification({ user: userId, type, title, message });
    await notification.save();
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

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

// Get all pending top-ups (Admin only)
router.get('/pending-topups', auth, isAdmin, async (req, res) => {
  try {
    const pendingTopups = await Transaction.find({ type: 'topup', status: 'pending' })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 });
    
    res.json({ transactions: pendingTopups });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all transactions (Admin only)
router.get('/all-transactions', auth, isAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'name email avatar')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 });
    
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Reject top-up (Admin only)
router.patch('/topup/:id/review', auth, isAdmin, async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    
    const transaction = await Transaction.findById(req.params.id)
      .populate('user', 'name email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction already processed' });
    }

    if (action === 'approve') {
      transaction.status = 'completed';
      await transaction.save();

      // Credit wallet balance
      await User.findByIdAndUpdate(transaction.user._id, {
        $inc: { walletBalance: transaction.amount }
      });

      // Notify customer
      await createNotification(
        transaction.user._id,
        'payment_verified',
        'Top-up Approved! 💰',
        `Your wallet top-up of LKR ${transaction.amount.toLocaleString()} has been approved and credited.`
      );

      const updatedUser = await User.findById(transaction.user._id);
      res.json({ 
        message: 'Top-up approved and balance credited', 
        transaction,
        newBalance: updatedUser.walletBalance
      });
    } else if (action === 'reject') {
      transaction.status = 'failed';
      await transaction.save();

      // Notify customer
      await createNotification(
        transaction.user._id,
        'payment_rejected',
        'Top-up Rejected ❌',
        `Your wallet top-up of LKR ${transaction.amount.toLocaleString()} was rejected. Please try again with a valid payment slip.`
      );

      res.json({ message: 'Top-up rejected', transaction });
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "approve" or "reject"' });
    }
  } catch (error) {
    console.error('Error reviewing top-up:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
