const express = require('express');
const router = express.Router();
const { auth, isAdmin, isTeam } = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendTaskAssignedEmail } = require('../config/mailjet');

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
      .populate('order');

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
