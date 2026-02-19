const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const Package = require('../models/Package');
const Task = require('../models/Task');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
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

// Populate helper used across routes
const populateSub = (query) => {
  return query
    .populate('customer', 'name email avatar phone')
    .populate({
      path: 'package',
      populate: { path: 'services.service', select: 'name category description' }
    })
    .populate({
      path: 'tasks',
      populate: [
        { path: 'assignedTo', select: 'name specialty avatar' },
        { path: 'service', select: 'name category' },
        { path: 'customer', select: 'name email' }
      ]
    })
    .populate('approvedBy', 'name')
    .populate('payment.verifiedBy', 'name');
};

// ─────────────────────────────────────────────────
// Helper: map duration string → default cycle days
// ─────────────────────────────────────────────────
function durationToCycleDays(duration) {
  switch (duration) {
    case 'month': return 30;
    case 'quarter': return 90;
    case 'year': return 365;
    default: return 30;
  }
}

// ─────────────────────────────────────────────────
// Helper: create individual tasks per count from package services
// with auto-calculated deadlines based on cycleDays
// e.g. 5 short videos + 2 long videos = 7 tasks
// 30 days / 7 tasks ≈ 4.28 days per task
// ─────────────────────────────────────────────────
async function createTasksFromPackage(subscription) {
  const createdTasks = [];
  const pkgServices = subscription.package.services || [];

  // Count total tasks first (for deadline calculation)
  let totalTaskCount = 0;
  for (const svc of pkgServices) {
    totalTaskCount += (svc.count || 1);
  }

  const cycleDays = subscription.cycleDays || durationToCycleDays(subscription.duration);
  const cycleStart = subscription.cycleStartDate || new Date();
  const daysPerTask = totalTaskCount > 0 ? cycleDays / totalTaskCount : cycleDays;

  let taskIndex = 0;
  for (const svc of pkgServices) {
    const serviceName = svc.service?.name || 'Service';
    const count = svc.count || 1;

    for (let i = 1; i <= count; i++) {
      taskIndex++;
      // Deadline = cycleStart + (taskIndex * daysPerTask)
      const deadlineDate = new Date(cycleStart);
      deadlineDate.setDate(deadlineDate.getDate() + Math.ceil(taskIndex * daysPerTask));

      const task = new Task({
        title: count > 1 ? `${serviceName} #${i}` : serviceName,
        description: `Task ${i} of ${count} — ${serviceName} from "${subscription.packageName}" package.`,
        status: 'todo',
        priority: 'medium',
        subscription: subscription._id,
        service: svc.service._id || svc.service,
        customer: subscription.customer._id || subscription.customer,
        serviceCount: 1,
        dueDate: deadlineDate
      });
      await task.save();
      createdTasks.push(task._id);
    }
  }

  return createdTasks;
}

// ─────────────────────────────────────────────────
// GET /api/subscriptions — list subscriptions
// ─────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'customer') {
      filter.customer = req.userId;
    } else {
      if (req.query.customer) filter.customer = req.query.customer;
      if (req.query.status) filter.status = req.query.status;
    }

    const subscriptions = await populateSub(
      Subscription.find(filter).sort({ createdAt: -1 })
    );

    res.json({ subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────
// GET /api/subscriptions/:id — get single subscription
// ─────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const subscription = await populateSub(Subscription.findById(req.params.id));

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (req.user.role === 'customer' && subscription.customer._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────
// POST /api/subscriptions — customer subscribes to a package
// ─────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { packageId } = req.body;

    if (!packageId) {
      return res.status(400).json({ message: 'Package ID is required' });
    }

    const pkg = await Package.findById(packageId).populate('services.service', 'name category');
    if (!pkg || !pkg.isActive) {
      return res.status(404).json({ message: 'Package not found or inactive' });
    }

    // Check for existing active subscription
    const existing = await Subscription.findOne({
      customer: req.userId,
      package: packageId,
      status: { $in: ['pending', 'approved', 'awaiting_payment', 'active'] }
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have an active or pending subscription for this package' });
    }

    const advanceAmount = Math.round(pkg.offeringPrice * 0.25);

    const subscription = new Subscription({
      customer: req.userId,
      package: packageId,
      packageName: pkg.name,
      totalPrice: pkg.totalPrice,
      offeringPrice: pkg.offeringPrice,
      discount: pkg.discount,
      duration: pkg.duration,
      advanceAmount,
      status: 'pending'
    });

    await subscription.save();

    // Notify all admins
    const customer = await User.findById(req.userId);
    const admins = await User.find({ role: 'admin', isActive: true });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'subscription_request',
        'New Subscription Request 📦',
        `${customer.name} has requested to subscribe to "${pkg.name}" package (LKR ${pkg.offeringPrice.toLocaleString()}). Review and approve.`,
        null
      );
    }

    const populated = await populateSub(Subscription.findById(subscription._id));

    res.status(201).json({
      message: 'Subscription request submitted! Waiting for admin approval.',
      subscription: populated
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────
// PATCH /api/subscriptions/:id/approve — Admin approves → moves to awaiting_payment
// ─────────────────────────────────────────────────
router.patch('/:id/approve', auth, isAdmin, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('customer', 'name email');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.status !== 'pending') {
      return res.status(400).json({ message: 'Subscription is not in pending status' });
    }

    subscription.status = 'awaiting_payment';
    subscription.approvedAt = new Date();
    subscription.approvedBy = req.userId;
    await subscription.save();

    // Notify customer: approved, now pay 25% advance
    await createNotification(
      subscription.customer._id,
      'subscription_approved',
      'Subscription Approved! 🎉',
      `Your subscription to "${subscription.packageName}" has been approved! Please pay 25% advance (LKR ${subscription.advanceAmount.toLocaleString()}) to activate it.`,
      null
    );

    const populated = await populateSub(Subscription.findById(subscription._id));
    res.json({ message: 'Subscription approved! Customer needs to pay advance.', subscription: populated });
  } catch (error) {
    console.error('Error approving subscription:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────
// POST /api/subscriptions/:id/pay — Customer pays 25% advance (direct with slip)
// ─────────────────────────────────────────────────
router.post('/:id/pay', auth, async (req, res) => {
  try {
    const { slip } = req.body; // slip = uploaded image/pdf URL

    const subscription = await Subscription.findById(req.params.id)
      .populate('customer', 'name');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.customer._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (subscription.status !== 'awaiting_payment') {
      return res.status(400).json({ message: 'Subscription is not awaiting payment' });
    }

    if (!slip) {
      return res.status(400).json({ message: 'Payment slip is required' });
    }

    subscription.payment = {
      method: 'direct',
      amount: subscription.advanceAmount,
      slip,
      status: 'pending',
      paidAt: new Date()
    };
    await subscription.save();

    // Notify admins to verify
    const admins = await User.find({ role: 'admin', isActive: true });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'payment_received',
        'Subscription Payment Received 💳',
        `${subscription.customer.name} uploaded advance payment (LKR ${subscription.advanceAmount.toLocaleString()}) for "${subscription.packageName}". Please verify the slip.`,
        null
      );
    }

    const populated = await populateSub(Subscription.findById(subscription._id));
    res.json({ message: 'Payment slip uploaded! Awaiting admin verification.', subscription: populated });
  } catch (error) {
    console.error('Error submitting payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────
// POST /api/subscriptions/:id/wallet-pay — Customer pays 25% advance from wallet
// ─────────────────────────────────────────────────
router.post('/:id/wallet-pay', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('customer', 'name')
      .populate({
        path: 'package',
        populate: { path: 'services.service', select: 'name category description' }
      });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.customer._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (subscription.status !== 'awaiting_payment') {
      return res.status(400).json({ message: 'Subscription is not awaiting payment' });
    }

    const amount = subscription.advanceAmount;
    const user = await User.findById(req.userId);

    if (user.walletBalance < amount) {
      return res.status(400).json({
        message: `Insufficient wallet balance. Need LKR ${amount.toLocaleString()}, have LKR ${user.walletBalance.toLocaleString()}.`
      });
    }

    // Deduct from wallet
    user.walletBalance -= amount;
    await user.save();

    // Create wallet transaction
    const transaction = new Transaction({
      user: req.userId,
      type: 'payment',
      amount,
      status: 'completed',
      paymentMethod: 'wallet',
      description: `Advance payment for subscription "${subscription.packageName}"`
    });
    await transaction.save();

    // Wallet payments are auto-verified → activate subscription & create tasks
    subscription.payment = {
      method: 'wallet',
      amount,
      slip: '',
      status: 'verified',
      paidAt: new Date(),
      verifiedAt: new Date()
    };

    // Set cycle fields
    const cycleDays = durationToCycleDays(subscription.duration);
    subscription.cycleDays = cycleDays;
    subscription.cycleStartDate = new Date();
    const cycleEnd = new Date();
    cycleEnd.setDate(cycleEnd.getDate() + cycleDays);
    subscription.cycleEndDate = cycleEnd;
    subscription.currentCycle = 1;

    // Create tasks per count
    const createdTasks = await createTasksFromPackage(subscription);
    subscription.tasks = createdTasks;
    subscription.status = 'active';
    await subscription.save();

    // Notify admins
    const admins = await User.find({ role: 'admin', isActive: true });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'payment_received',
        'Wallet Payment — Subscription Activated ✅',
        `${subscription.customer.name} paid LKR ${amount.toLocaleString()} via wallet for "${subscription.packageName}". Auto-verified and tasks created.`,
        null
      );
    }

    // Notify customer
    await createNotification(
      subscription.customer._id,
      'payment_verified',
      'Payment Confirmed & Subscription Active! 🎉',
      `Your wallet payment of LKR ${amount.toLocaleString()} for "${subscription.packageName}" is confirmed. You can now provide raw files and instructions for each task.`,
      null
    );

    const populated = await populateSub(Subscription.findById(subscription._id));
    res.json({
      message: 'Wallet payment successful! Subscription is now active.',
      subscription: populated,
      newBalance: user.walletBalance
    });
  } catch (error) {
    console.error('Error processing wallet payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────
// PATCH /api/subscriptions/:id/verify-payment — Admin verifies/rejects payment slip
// ─────────────────────────────────────────────────
router.patch('/:id/verify-payment', auth, isAdmin, async (req, res) => {
  try {
    const { action } = req.body; // 'verify' or 'reject'

    const subscription = await Subscription.findById(req.params.id)
      .populate('customer', 'name email')
      .populate({
        path: 'package',
        populate: { path: 'services.service', select: 'name category description' }
      });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.payment.status !== 'pending') {
      return res.status(400).json({ message: 'No pending payment to verify' });
    }

    if (action === 'verify') {
      subscription.payment.status = 'verified';
      subscription.payment.verifiedAt = new Date();
      subscription.payment.verifiedBy = req.userId;

      // Set cycle fields
      const cycleDays = durationToCycleDays(subscription.duration);
      subscription.cycleDays = cycleDays;
      subscription.cycleStartDate = new Date();
      const cycleEnd = new Date();
      cycleEnd.setDate(cycleEnd.getDate() + cycleDays);
      subscription.cycleEndDate = cycleEnd;
      subscription.currentCycle = 1;

      // Create tasks per count and activate
      const createdTasks = await createTasksFromPackage(subscription);
      subscription.tasks = createdTasks;
      subscription.status = 'active';
      await subscription.save();

      await createNotification(
        subscription.customer._id,
        'payment_verified',
        'Payment Verified & Subscription Active! 🎉',
        `Your advance payment for "${subscription.packageName}" has been verified. You can now provide raw files and instructions for each task.`,
        null
      );

      const populated = await populateSub(Subscription.findById(subscription._id));
      res.json({ message: 'Payment verified, subscription activated, tasks created!', subscription: populated });

    } else if (action === 'reject') {
      subscription.payment.status = 'rejected';
      // Stay in awaiting_payment so customer can re-upload
      await subscription.save();

      await createNotification(
        subscription.customer._id,
        'payment_verified',
        'Payment Rejected ❌',
        `Your payment slip for "${subscription.packageName}" was rejected. Please re-upload a valid payment slip.`,
        null
      );

      const populated = await populateSub(Subscription.findById(subscription._id));
      res.json({ message: 'Payment rejected. Customer can re-upload.', subscription: populated });

    } else {
      return res.status(400).json({ message: 'Action must be "verify" or "reject"' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────
// PATCH /api/subscriptions/:id/cancel — Admin or customer cancels
// ─────────────────────────────────────────────────
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('customer', 'name');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (req.user.role === 'customer') {
      if (subscription.customer._id.toString() !== req.userId.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (!['pending', 'awaiting_payment'].includes(subscription.status)) {
        return res.status(400).json({ message: 'Can only cancel pending or awaiting-payment subscriptions' });
      }
    }

    subscription.status = 'cancelled';
    subscription.notes = req.body.reason || 'Cancelled';
    await subscription.save();

    if (req.user.role === 'admin') {
      await createNotification(
        subscription.customer._id,
        'subscription_cancelled',
        'Subscription Cancelled',
        `Your subscription to "${subscription.packageName}" has been cancelled. ${req.body.reason || ''}`,
        null
      );
    }

    res.json({ message: 'Subscription cancelled', subscription });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────
// PATCH /api/subscriptions/:id/tasks/:taskId/assign — Admin assigns team member
// ─────────────────────────────────────────────────
router.patch('/:id/tasks/:taskId/assign', auth, isAdmin, async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.assignedTo = assignedTo;
    if (task.status === 'todo') {
      task.status = 'in_progress';
    }
    await task.save();

    const teamMember = await User.findById(assignedTo);
    if (teamMember) {
      await createNotification(
        assignedTo,
        'order_assigned',
        'New Task Assigned 📋',
        `You have been assigned to: ${task.title}`,
        null
      );
    }

    await task.populate([
      { path: 'assignedTo', select: 'name specialty avatar' },
      { path: 'service', select: 'name category' }
    ]);

    res.json({ message: 'Task assigned successfully', task });
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────
// POST /api/subscriptions/:id/tasks/:taskId/raw — Customer uploads raw files & instructions
// ─────────────────────────────────────────────────
router.post('/:id/tasks/:taskId/raw', auth, async (req, res) => {
  try {
    const { rawFiles, instructions } = req.body;

    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.customer.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({ message: 'Subscription must be active to upload files' });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (rawFiles && Array.isArray(rawFiles)) {
      const newFiles = rawFiles.map(f => ({
        url: f.url || f,
        name: f.name || 'File',
        uploadedAt: new Date()
      }));
      task.rawFiles.push(...newFiles);
    }

    if (instructions !== undefined) {
      task.instructions = instructions;
    }

    await task.save();

    // Notify assigned team member
    if (task.assignedTo) {
      const customer = await User.findById(req.userId);
      await createNotification(
        task.assignedTo,
        'files_uploaded',
        'Raw Files Uploaded 📁',
        `${customer.name} uploaded raw files for task: ${task.title}`,
        null
      );
    }

    // Notify admins
    const customer = await User.findById(req.userId);
    const admins = await User.find({ role: 'admin', isActive: true });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'files_uploaded',
        'Customer Uploaded Raw Files',
        `${customer.name} uploaded raw files for task: ${task.title}`,
        null
      );
    }

    await task.populate([
      { path: 'assignedTo', select: 'name specialty avatar' },
      { path: 'service', select: 'name category' }
    ]);

    res.json({ message: 'Raw files and instructions saved', task });
  } catch (error) {
    console.error('Error uploading raw files:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────
// POST /api/subscriptions/:id/tasks/:taskId/deliverables — Team uploads deliverables
// ─────────────────────────────────────────────────
router.post('/:id/tasks/:taskId/deliverables', auth, async (req, res) => {
  try {
    const { deliverables } = req.body;

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'team' && task.assignedTo?.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (deliverables && Array.isArray(deliverables)) {
      const newDeliverables = deliverables.map(d => ({
        url: d.url || d,
        name: d.name || 'Deliverable',
        uploadedAt: new Date()
      }));
      task.deliverables.push(...newDeliverables);
    }

    task.status = 'review';
    await task.save();

    if (task.customer) {
      await createNotification(
        task.customer,
        'files_uploaded',
        'Deliverables Ready! 👀',
        `Deliverables for task "${task.title}" are ready for your review.`,
        null
      );
    }

    await task.populate([
      { path: 'assignedTo', select: 'name specialty avatar' },
      { path: 'service', select: 'name category' }
    ]);

    res.json({ message: 'Deliverables uploaded', task });
  } catch (error) {
    console.error('Error uploading deliverables:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────
// PATCH /api/subscriptions/:id/tasks/:taskId/complete — Mark task done
// ─────────────────────────────────────────────────
router.patch('/:id/tasks/:taskId/complete', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = 'done';
    task.completedAt = new Date();
    await task.save();

    // Check if all tasks in subscription are done
    const subscription = await Subscription.findById(req.params.id).populate('tasks');
    if (subscription) {
      const allDone = subscription.tasks.every(t => t.status === 'done');
      if (allDone) {
        // Move to awaiting final payment (75% remaining)
        const remainingAmount = Math.round(subscription.offeringPrice - subscription.advanceAmount);
        subscription.status = 'awaiting_final_payment';
        subscription.finalPayment = {
          method: '',
          amount: remainingAmount,
          slip: '',
          status: 'none',
          paidAt: null,
          verifiedAt: null,
          verifiedBy: null
        };
        await subscription.save();

        await createNotification(
          subscription.customer,
          'subscription_completed',
          'All Tasks Complete! 💰 Final Payment Required',
          `All tasks in your "${subscription.packageName}" subscription are complete! Please pay the remaining balance of LKR ${remainingAmount.toLocaleString()} to finalize.`,
          null
        );

        // Notify admins
        const admins = await User.find({ role: 'admin', isActive: true });
        for (const admin of admins) {
          await createNotification(
            admin._id,
            'subscription_completed',
            'Subscription Tasks Complete ✅',
            `All tasks in "${subscription.packageName}" are done. Awaiting customer's final payment of LKR ${remainingAmount.toLocaleString()}.`,
            null
          );
        }
      }
    }

    await task.populate([
      { path: 'assignedTo', select: 'name specialty avatar' },
      { path: 'service', select: 'name category' }
    ]);

    res.json({ message: 'Task marked as complete', task });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────
// PATCH /api/subscriptions/:id/cycle-settings — Admin updates cycle days (recalculates deadlines)
// ─────────────────────────────────────────────────
router.patch('/:id/cycle-settings', auth, isAdmin, async (req, res) => {
  try {
    const { cycleDays, cycleStartDate } = req.body;

    if (!cycleDays || cycleDays < 1) {
      return res.status(400).json({ message: 'Cycle days must be at least 1' });
    }

    const subscription = await Subscription.findById(req.params.id)
      .populate('customer', 'name')
      .populate({
        path: 'tasks',
        populate: [
          { path: 'assignedTo', select: 'name specialty avatar' },
          { path: 'service', select: 'name category' }
        ]
      });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({ message: 'Can only update cycle for active subscriptions' });
    }

    subscription.cycleDays = cycleDays;
    // Allow admin to override cycle start date
    if (cycleStartDate) {
      subscription.cycleStartDate = new Date(cycleStartDate);
    }
    const cycleStart = subscription.cycleStartDate || new Date();
    const newEnd = new Date(cycleStart);
    newEnd.setDate(newEnd.getDate() + cycleDays);
    subscription.cycleEndDate = newEnd;

    // Recalculate deadlines for all non-completed tasks
    const activeTasks = subscription.tasks.filter(t => t.status !== 'done');
    const totalTasks = subscription.tasks.length;
    const daysPerTask = totalTasks > 0 ? cycleDays / totalTasks : cycleDays;

    for (let idx = 0; idx < subscription.tasks.length; idx++) {
      const task = subscription.tasks[idx];
      if (task.status !== 'done') {
        const deadlineDate = new Date(cycleStart);
        deadlineDate.setDate(deadlineDate.getDate() + Math.ceil((idx + 1) * daysPerTask));
        task.dueDate = deadlineDate;
        await task.save();
      }
    }

    await subscription.save();

    const populated = await populateSub(Subscription.findById(subscription._id));
    res.json({ message: `Cycle updated to ${cycleDays} days. Deadlines recalculated.`, subscription: populated });
  } catch (error) {
    console.error('Error updating cycle settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────
// PATCH /api/subscriptions/:id/tasks/:taskId/deadline — Admin changes task deadline
// ─────────────────────────────────────────────────
router.patch('/:id/tasks/:taskId/deadline', auth, isAdmin, async (req, res) => {
  try {
    const { deadline } = req.body;

    if (!deadline) {
      return res.status(400).json({ message: 'Deadline date is required' });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.dueDate = new Date(deadline);
    await task.save();

    await task.populate([
      { path: 'assignedTo', select: 'name specialty avatar' },
      { path: 'service', select: 'name category' }
    ]);

    res.json({ message: 'Task deadline updated', task });
  } catch (error) {
    console.error('Error updating deadline:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────
// POST /api/subscriptions/:id/cycle-reset — Admin resets cycle (archive old, create new tasks)
// ─────────────────────────────────────────────────
router.post('/:id/cycle-reset', auth, isAdmin, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('customer', 'name email')
      .populate({
        path: 'package',
        populate: { path: 'services.service', select: 'name category description' }
      })
      .populate('tasks');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({ message: 'Can only reset cycle for active subscriptions' });
    }

    // Archive current cycle
    const archivedTasks = subscription.tasks.map(t => ({
      task: t._id,
      title: t.title,
      status: t.status,
      deadline: t.dueDate,
      completedAt: t.completedAt
    }));

    subscription.cycleHistory.push({
      cycle: subscription.currentCycle,
      startDate: subscription.cycleStartDate,
      endDate: subscription.cycleEndDate,
      completedAt: new Date(),
      tasks: archivedTasks
    });

    // Start new cycle
    subscription.currentCycle += 1;
    subscription.cycleStartDate = new Date();
    const newEnd = new Date();
    newEnd.setDate(newEnd.getDate() + subscription.cycleDays);
    subscription.cycleEndDate = newEnd;

    // Create new tasks
    const newTasks = await createTasksFromPackage(subscription);
    subscription.tasks = newTasks;
    await subscription.save();

    // Notify customer
    await createNotification(
      subscription.customer._id,
      'subscription_approved',
      `Cycle ${subscription.currentCycle} Started! 🔄`,
      `A new cycle has started for your "${subscription.packageName}" subscription. New tasks are ready for you to provide raw files and instructions.`,
      null
    );

    const populated = await populateSub(Subscription.findById(subscription._id));
    res.json({
      message: `Cycle ${subscription.currentCycle} started! Old tasks archived, new tasks created.`,
      subscription: populated
    });
  } catch (error) {
    console.error('Error resetting cycle:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────
// POST /api/subscriptions/:id/final-pay — Customer pays remaining 75% (direct with slip)
// ─────────────────────────────────────────────────
router.post('/:id/final-pay', auth, async (req, res) => {
  try {
    const { slip } = req.body;

    const subscription = await Subscription.findById(req.params.id)
      .populate('customer', 'name');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.customer._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (subscription.status !== 'awaiting_final_payment') {
      return res.status(400).json({ message: 'Subscription is not awaiting final payment' });
    }

    if (!slip) {
      return res.status(400).json({ message: 'Payment slip is required' });
    }

    const remainingAmount = Math.round(subscription.offeringPrice - subscription.advanceAmount);

    subscription.finalPayment = {
      method: 'direct',
      amount: remainingAmount,
      slip,
      status: 'pending',
      paidAt: new Date()
    };
    await subscription.save();

    // Notify admins
    const admins = await User.find({ role: 'admin', isActive: true });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'payment_received',
        'Final Payment Received 💳',
        `${subscription.customer.name} uploaded final payment (LKR ${remainingAmount.toLocaleString()}) for "${subscription.packageName}". Please verify the slip.`,
        null
      );
    }

    const populated = await populateSub(Subscription.findById(subscription._id));
    res.json({ message: 'Final payment slip uploaded! Awaiting admin verification.', subscription: populated });
  } catch (error) {
    console.error('Error submitting final payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────
// POST /api/subscriptions/:id/final-wallet-pay — Customer pays remaining 75% from wallet
// ─────────────────────────────────────────────────
router.post('/:id/final-wallet-pay', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('customer', 'name');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.customer._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (subscription.status !== 'awaiting_final_payment') {
      return res.status(400).json({ message: 'Subscription is not awaiting final payment' });
    }

    const remainingAmount = Math.round(subscription.offeringPrice - subscription.advanceAmount);
    const user = await User.findById(req.userId);

    if (user.walletBalance < remainingAmount) {
      return res.status(400).json({
        message: `Insufficient wallet balance. Need LKR ${remainingAmount.toLocaleString()}, have LKR ${user.walletBalance.toLocaleString()}.`
      });
    }

    // Deduct from wallet
    user.walletBalance -= remainingAmount;
    await user.save();

    // Create wallet transaction
    const transaction = new Transaction({
      user: req.userId,
      type: 'payment',
      amount: remainingAmount,
      status: 'completed',
      paymentMethod: 'wallet',
      description: `Final payment for subscription "${subscription.packageName}"`
    });
    await transaction.save();

    // Auto-verified
    subscription.finalPayment = {
      method: 'wallet',
      amount: remainingAmount,
      slip: '',
      status: 'verified',
      paidAt: new Date(),
      verifiedAt: new Date()
    };
    subscription.status = 'completed';
    await subscription.save();

    // Notify admins
    const admins = await User.find({ role: 'admin', isActive: true });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'payment_received',
        'Final Wallet Payment — Subscription Complete ✅',
        `${subscription.customer.name} paid final LKR ${remainingAmount.toLocaleString()} via wallet for "${subscription.packageName}". Subscription is now complete.`,
        null
      );
    }

    // Notify customer
    await createNotification(
      subscription.customer._id,
      'payment_verified',
      'Subscription Complete! 🎉',
      `Your final payment of LKR ${remainingAmount.toLocaleString()} for "${subscription.packageName}" is confirmed. Subscription is now complete!`,
      null
    );

    const populated = await populateSub(Subscription.findById(subscription._id));
    res.json({
      message: 'Final payment successful! Subscription is now complete.',
      subscription: populated,
      newBalance: user.walletBalance
    });
  } catch (error) {
    console.error('Error processing final wallet payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────
// PATCH /api/subscriptions/:id/verify-final-payment — Admin verifies/rejects final payment slip
// ─────────────────────────────────────────────────
router.patch('/:id/verify-final-payment', auth, isAdmin, async (req, res) => {
  try {
    const { action } = req.body; // 'verify' or 'reject'

    const subscription = await Subscription.findById(req.params.id)
      .populate('customer', 'name email');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.finalPayment?.status !== 'pending') {
      return res.status(400).json({ message: 'No pending final payment to verify' });
    }

    if (action === 'verify') {
      subscription.finalPayment.status = 'verified';
      subscription.finalPayment.verifiedAt = new Date();
      subscription.finalPayment.verifiedBy = req.userId;
      subscription.status = 'completed';
      await subscription.save();

      await createNotification(
        subscription.customer._id,
        'payment_verified',
        'Final Payment Verified — Subscription Complete! 🎉',
        `Your final payment for "${subscription.packageName}" has been verified. Subscription is now complete!`,
        null
      );

      const populated = await populateSub(Subscription.findById(subscription._id));
      res.json({ message: 'Final payment verified, subscription completed!', subscription: populated });

    } else if (action === 'reject') {
      subscription.finalPayment.status = 'rejected';
      await subscription.save();

      await createNotification(
        subscription.customer._id,
        'payment_verified',
        'Final Payment Rejected ❌',
        `Your final payment slip for "${subscription.packageName}" was rejected. Please re-upload a valid payment slip.`,
        null
      );

      const populated = await populateSub(Subscription.findById(subscription._id));
      res.json({ message: 'Final payment rejected. Customer can re-upload.', subscription: populated });

    } else {
      return res.status(400).json({ message: 'Action must be "verify" or "reject"' });
    }
  } catch (error) {
    console.error('Error verifying final payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────────────
// POST /api/subscriptions/:id/renew — Admin renews a completed subscription for next cycle
// ─────────────────────────────────────────────────
router.post('/:id/renew', auth, isAdmin, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('customer', 'name email')
      .populate({
        path: 'package',
        populate: { path: 'services.service', select: 'name category description' }
      })
      .populate('tasks');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.status !== 'completed') {
      return res.status(400).json({ message: 'Can only renew completed subscriptions' });
    }

    // Archive current cycle
    const archivedTasks = subscription.tasks.map(t => ({
      task: t._id,
      title: t.title,
      status: t.status,
      deadline: t.dueDate,
      completedAt: t.completedAt
    }));

    subscription.cycleHistory.push({
      cycle: subscription.currentCycle,
      startDate: subscription.cycleStartDate,
      endDate: subscription.cycleEndDate,
      completedAt: new Date(),
      tasks: archivedTasks
    });

    // Reset for new cycle — requires advance payment again
    subscription.currentCycle += 1;
    subscription.status = 'awaiting_payment';
    subscription.payment = {
      method: '',
      amount: 0,
      slip: '',
      status: 'none',
      paidAt: null,
      verifiedAt: null,
      verifiedBy: null
    };
    subscription.finalPayment = {
      method: '',
      amount: 0,
      slip: '',
      status: 'none',
      paidAt: null,
      verifiedAt: null,
      verifiedBy: null
    };
    subscription.tasks = [];
    await subscription.save();

    // Notify customer
    await createNotification(
      subscription.customer._id,
      'subscription_approved',
      `Subscription Renewed — Cycle ${subscription.currentCycle}! 🔄`,
      `Your "${subscription.packageName}" subscription has been renewed for cycle ${subscription.currentCycle}. Please pay the 25% advance (LKR ${subscription.advanceAmount.toLocaleString()}) to start the new cycle.`,
      null
    );

    const populated = await populateSub(Subscription.findById(subscription._id));
    res.json({
      message: `Subscription renewed for cycle ${subscription.currentCycle}! Customer needs to pay advance.`,
      subscription: populated
    });
  } catch (error) {
    console.error('Error renewing subscription:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
