const express = require('express');
const router = express.Router();
const { auth, isAdmin, isTeam } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper function to create notification
const createNotification = async (userId, type, title, message, orderId = null) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      order: orderId
    });
    await notification.save();
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

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

    // Validate required fields
    if (!service || !totalAmount) {
      return res.status(400).json({ message: 'Service and total amount are required' });
    }

    const order = new Order({
      customer: req.userId,
      service,
      packageName,
      totalAmount,
      advanceAmount: totalAmount * 0.25,
      requirements,
      status: 'pending',
      currentStep: 1
    });

    await order.save();
    
    // Populate after save
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email avatar')
      .populate('service', 'name category');

    // Send notification to all admins
    const admins = await User.find({ role: 'admin', isActive: true });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'order_created',
        'New Order Request',
        `${populatedOrder.customer.name} has requested ${populatedOrder.service.name}. Review and approve to proceed.`,
        order._id
      );
    }

    res.status(201).json({ message: 'Order created successfully', order: populatedOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status (Admin/Team only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    // Only admin and team can update order status
    if (req.user.role === 'customer') {
      return res.status(403).json({ message: 'Access denied. Only admin/team can update order status.' });
    }

    const { status, currentStep, assignedTo } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name')
      .populate('service', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const oldStatus = order.status;
    const oldAssignedTo = order.assignedTo ? order.assignedTo.toString() : null;

    if (status) order.status = status;
    if (currentStep !== undefined) order.currentStep = currentStep;
    if (assignedTo !== undefined) order.assignedTo = assignedTo;

    await order.save();
    
    // Send notifications based on status change
    if (status && status !== oldStatus) {
      if (status === 'awaiting_advance') {
        // Order approved
        await createNotification(
          order.customer._id,
          'order_approved',
          'Order Approved! 🎉',
          `Your order for ${order.service.name} has been approved! Please upload advance payment to proceed.`,
          order._id
        );
      } else if (status === 'cancelled') {
        // Order cancelled/rejected
        await createNotification(
          order.customer._id,
          'order_cancelled',
          'Order Cancelled',
          `Your order for ${order.service.name} has been cancelled.`,
          order._id
        );
      } else if (status === 'in_progress') {
        // Order in progress
        await createNotification(
          order.customer._id,
          'order_assigned',
          'Work Started! 🚀',
          `Your order for ${order.service.name} is now in progress. Our team is working on it!`,
          order._id
        );
      } else if (status === 'review') {
        // Files uploaded for review
        await createNotification(
          order.customer._id,
          'files_uploaded',
          'Preview Ready! 👀',
          `Preview files for ${order.service.name} are ready for your review.`,
          order._id
        );
      } else if (status === 'completed') {
        // Order completed
        await createNotification(
          order.customer._id,
          'order_completed',
          'Order Completed! ✅',
          `Your order for ${order.service.name} is complete! Final files are ready for download.`,
          order._id
        );
      }
    }

    // Notify assigned team member (only when newly assigned)
    if (assignedTo && assignedTo !== oldAssignedTo) {
      await createNotification(
        assignedTo,
        'order_assigned',
        'New Order Assigned',
        `You have been assigned to work on ${order.service.name}.`,
        order._id
      );
    }
    
    // Populate after save
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email avatar')
      .populate('service', 'name category')
      .populate('assignedTo', 'name specialty avatar');

    res.json({ message: 'Order updated successfully', order: populatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add payment
router.post('/:id/payment', auth, async (req, res) => {
  try {
    const { type, amount, slip, reference } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name')
      .populate('service', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only the order's customer can upload payment
    if (order.customer._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied. Only the order customer can upload payment.' });
    }

    // Add payment to order
    order.payments.push({
      type,
      amount,
      date: new Date(),
      status: 'pending',
      slip,
      reference: reference || `PAY-${Date.now()}`
    });

    await order.save();

    // Send notification to all admins
    const admins = await User.find({ role: 'admin', isActive: true });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'payment_received',
        'Payment Received',
        `${order.customer.name} uploaded ${type} payment (LKR ${amount.toLocaleString()}) for ${order.service.name}. Please verify.`,
        order._id
      );
    }

    // Populate and return
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email avatar')
      .populate('service', 'name category')
      .populate('assignedTo', 'name specialty avatar');

    res.json({ message: 'Payment uploaded successfully', order: populatedOrder });
  } catch (error) {
    console.error('Error uploading payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload files
router.post('/:id/files', auth, isTeam, async (req, res) => {
  try {
    const { fileType, urls } = req.body; // fileType: 'raw', 'watermark', 'final'
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name')
      .populate('service', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.files[fileType]) {
      order.files[fileType] = [];
    }

    order.files[fileType].push(...urls);
    
    // Update status if watermark files uploaded
    if (fileType === 'watermark' && order.status === 'in_progress') {
      order.status = 'review';
      order.currentStep = 4;
    }
    
    await order.save();

    // Notify customer if watermark or final files uploaded
    if (fileType === 'watermark' || fileType === 'final') {
      await createNotification(
        order.customer._id,
        'files_uploaded',
        fileType === 'watermark' ? 'Preview Ready!' : 'Final Files Ready!',
        `${fileType === 'watermark' ? 'Preview' : 'Final'} files for ${order.service.name} have been uploaded.`,
        order._id
      );
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email avatar')
      .populate('service', 'name category')
      .populate('assignedTo', 'name specialty avatar');

    res.json({ message: 'Files uploaded successfully', order: populatedOrder });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name')
      .populate('service', 'name')
      .populate('assignedTo', '_id');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.revisions.push({
      requestedAt: new Date(),
      reason
    });

    order.status = 'revision_requested';
    order.currentStep = 3;
    await order.save();

    // Notify assigned team member
    if (order.assignedTo) {
      await createNotification(
        order.assignedTo._id,
        'revision_requested',
        'Revision Requested',
        `${order.customer.name} requested revisions for ${order.service.name}: ${reason}`,
        order._id
      );
    }

    // Notify admins
    const admins = await User.find({ role: 'admin', isActive: true });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'revision_requested',
        'Revision Requested',
        `${order.customer.name} requested revisions for ${order.service.name}`,
        order._id
      );
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email avatar')
      .populate('service', 'name category')
      .populate('assignedTo', 'name specialty avatar');

    res.json({ message: 'Revision requested successfully', order: populatedOrder });
  } catch (error) {
    console.error('Error requesting revision:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify/Reject payment (Admin only)
router.patch('/:id/payment/:paymentIndex/verify', auth, isAdmin, async (req, res) => {
  try {
    const { action } = req.body; // 'verify' or 'reject'
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name')
      .populate('service', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const paymentIndex = parseInt(req.params.paymentIndex);
    if (!order.payments[paymentIndex]) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const payment = order.payments[paymentIndex];

    if (action === 'verify') {
      payment.status = 'verified';

      // Auto-advance order status based on payment type
      if (payment.type === 'advance' && order.status === 'awaiting_advance') {
        if (order.assignedTo) {
          order.status = 'in_progress';
          order.currentStep = 3;
        } else {
          // Keep awaiting advance but mark payment as verified
          // Admin needs to assign team member
        }
      } else if (payment.type === 'final' && order.status === 'awaiting_final') {
        order.status = 'completed';
        order.currentStep = 6;
      }

      await order.save();

      // Notify customer
      await createNotification(
        order.customer._id,
        'payment_verified',
        'Payment Verified! ✅',
        `Your ${payment.type} payment of LKR ${payment.amount.toLocaleString()} for ${order.service.name} has been verified.`,
        order._id
      );
    } else if (action === 'reject') {
      payment.status = 'rejected';
      await order.save();

      // Notify customer
      await createNotification(
        order.customer._id,
        'payment_rejected',
        'Payment Rejected ❌',
        `Your ${payment.type} payment for ${order.service.name} was rejected. Please re-upload a valid payment slip.`,
        order._id
      );
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email avatar')
      .populate('service', 'name category')
      .populate('assignedTo', 'name specialty avatar');

    res.json({ message: `Payment ${action}d successfully`, order: populatedOrder });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve work (Customer approves watermark, triggers final payment step)
router.post('/:id/approve', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name')
      .populate('service', 'name')
      .populate('assignedTo', '_id');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only the order's customer can approve work
    if (order.customer._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    order.status = 'awaiting_final';
    order.currentStep = 5;
    await order.save();

    // Notify assigned team member
    if (order.assignedTo) {
      await createNotification(
        order.assignedTo._id,
        'work_approved',
        'Work Approved! 🎉',
        `${order.customer.name} approved the preview for ${order.service.name}. Awaiting final payment.`,
        order._id
      );
    }

    // Notify admins
    const admins = await User.find({ role: 'admin', isActive: true });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'work_approved',
        'Work Approved by Customer',
        `${order.customer.name} approved work for ${order.service.name}. Awaiting final payment.`,
        order._id
      );
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email avatar')
      .populate('service', 'name category')
      .populate('assignedTo', 'name specialty avatar');

    res.json({ message: 'Work approved successfully', order: populatedOrder });
  } catch (error) {
    console.error('Error approving work:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
