const express = require('express');
const router = express.Router();
const { auth, isAdmin, isTeam } = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const { sendTaskAssignedEmail } = require('../config/mailjet');

// Helper to create notification
const createNotification = async (userId, type, title, message) => {
  try {
    await new Notification({ user: userId, type, title, message }).save();
  } catch (err) {
    console.error('Notification error:', err);
  }
};

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const { status, assignedTo } = req.query;
    const filter = {};

    if (status) filter.status = status;
    
    // Team members see only their assigned tasks
    if (req.user.role === 'team') {
      filter.assignedTo = req.userId;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name specialty avatar')
      .populate('order', 'orderNumber totalAmount')
      .populate('subscription', 'packageName status customer currentCycle')
      .populate('service', 'name category')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name specialty avatar')
      .populate('order')
      .populate('subscription', 'packageName status customer currentCycle')
      .populate('service', 'name category')
      .populate('customer', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task (Admin only)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    await task.populate('assignedTo order');

    // Send email to assigned team member
    if (task.assignedTo && task.assignedTo.email) {
      const orderInfo = task.order ? task.order.orderNumber : null;
      sendTaskAssignedEmail(task.assignedTo, task.title, orderInfo)
        .then(r => { if (!r.success) console.error('Task assign email failed:', r.error); })
        .catch(err => console.error('Task assign email error:', err.message));
    }

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, completedAt } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Team members can only update their own tasks
    if (
      req.user.role === 'team' &&
      task.assignedTo?.toString() !== req.userId.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const oldAssignedTo = task.assignedTo ? task.assignedTo.toString() : null;

    Object.assign(task, req.body);
    
    if (status === 'done' && !task.completedAt) {
      task.completedAt = new Date();
    }

    await task.save();
    await task.populate('assignedTo order');

    // If this is a subscription task being marked as done, check subscription completion
    if (status === 'done' && task.subscription) {
      try {
        const subscription = await Subscription.findById(task.subscription).populate('tasks');
        if (subscription && subscription.status === 'active') {
          const allDone = subscription.tasks.every(t => t.status === 'done');
          if (allDone) {
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
              `All tasks in your "${subscription.packageName}" subscription are complete! Please pay the remaining balance of LKR ${remainingAmount.toLocaleString()} to finalize.`
            );

            const admins = await User.find({ role: 'admin', isActive: true });
            for (const admin of admins) {
              await createNotification(
                admin._id,
                'subscription_completed',
                'Subscription Tasks Complete ✅',
                `All tasks in "${subscription.packageName}" are done. Awaiting customer's final payment of LKR ${remainingAmount.toLocaleString()}.`
              );
            }
          }
        }
      } catch (subErr) {
        console.error('Error checking subscription completion:', subErr);
      }
    }

    // Send email if task was reassigned to a new team member
    const newAssignedTo = task.assignedTo ? task.assignedTo._id?.toString() : null;
    if (newAssignedTo && newAssignedTo !== oldAssignedTo && task.assignedTo.email) {
      const orderInfo = task.order ? task.order.orderNumber : null;
      sendTaskAssignedEmail(task.assignedTo, task.title, orderInfo)
        .then(r => { if (!r.success) console.error('Task reassign email failed:', r.error); })
        .catch(err => console.error('Task reassign email error:', err.message));
    }

    res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task (Admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
