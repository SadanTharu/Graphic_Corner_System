const express = require('express');
const router = express.Router();
const { auth, isAdmin, isTeam } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');

// Get all orders (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { status, customer, assignedTo } = req.query;
    const filter = {};

    // Customer can only see their own orders
    if (req.user.role === 'customer') {
      filter.customer = req.userId;
    } else {
      if (customer) filter.customer = customer;
      if (assignedTo) filter.assignedTo = assignedTo;
    }

    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('customer', 'name email avatar')
      .populate('service', 'name category')
      .populate('assignedTo', 'name specialty avatar')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone avatar')
      .populate('service', 'name category description')
      .populate('assignedTo', 'name specialty avatar')
      .populate('notes.user', 'name avatar');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    if (
      req.user.role === 'customer' &&
      order.customer._id.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { service, packageName, totalAmount, requirements } = req.body;

    const order = new Order({
      customer: req.userId,
      service,
      packageName,
      totalAmount,
      advanceAmount: totalAmount * 0.25,
      requirements,
      status: 'awaiting_advance',
      currentStep: 2
    });

    await order.save();
    await order.populate('service', 'name category');

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, currentStep, assignedTo } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status) order.status = status;
    if (currentStep) order.currentStep = currentStep;
    if (assignedTo) order.assignedTo = assignedTo;

    await order.save();
    await order.populate('customer service assignedTo');

    res.json({ message: 'Order updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add payment
router.post('/:id/payment', auth, async (req, res) => {
  try {
    const { type, amount, slip } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.payments.push({
      type,
      amount,
      date: new Date(),
      status: 'pending',
      slip
    });

    await order.save();
    res.json({ message: 'Payment uploaded successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload files
router.post('/:id/files', auth, isTeam, async (req, res) => {
  try {
    const { fileType, urls } = req.body; // fileType: 'raw', 'watermark', 'final'
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.files[fileType]) {
      order.files[fileType] = [];
    }

    order.files[fileType].push(...urls);
    await order.save();

    res.json({ message: 'Files uploaded successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add note/comment
router.post('/:id/notes', auth, async (req, res) => {
  try {
    const { message } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.notes.push({
      user: req.userId,
      message
    });

    await order.save();
    await order.populate('notes.user', 'name avatar');

    res.json({ message: 'Note added successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Request revision
router.post('/:id/revision', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.revisions.push({
      requestedAt: new Date(),
      reason
    });

    order.status = 'revision_requested';
    await order.save();

    res.json({ message: 'Revision requested successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
