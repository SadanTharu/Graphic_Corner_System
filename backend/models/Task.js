const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'done'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  // Subscription-related fields
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Customer provides raw files (links) and instructions per task
  rawFiles: [{
    url: { type: String, required: true },
    name: { type: String, default: 'File' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  instructions: {
    type: String,
    default: ''
  },
  // Deliverable links from team
  deliverables: [{
    url: { type: String, required: true },
    name: { type: String, default: 'Deliverable' },
    uploadedAt: { type: Date, default: Date.now }
  }],
  serviceCount: {
    type: Number,
    default: 1
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

taskSchema.index({ subscription: 1 });
taskSchema.index({ customer: 1 });

module.exports = mongoose.model('Task', taskSchema);
