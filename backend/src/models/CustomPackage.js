const mongoose = require('mongoose');

const customPackageSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: true
  },
  packageName: {
    type: String,
    required: true,
    description: 'Custom package name defined by admin for this specific client'
  },
  description: String,
  price: {
    type: Number,
    required: true,
    description: 'Total package price'
  },
  taskCount: {
    type: Number,
    required: true,
    description: 'Number of design tasks included in this package'
  },
  tasksCompleted: {
    type: Number,
    default: 0,
    description: 'Number of tasks already completed'
  },
  revisionLimit: {
    type: Number,
    description: 'Max revisions allowed per task'
  },
  deliveryDays: {
    type: Number,
    default: 7,
    description: 'Standard delivery time in days'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  billingDay: {
    type: Number,
    default: 27,
    min: 1,
    max: 31
  },
  services: [{
    name: { type: String, required: true },
    description: String,
    count: { type: Number, default: 0 }
  }],
  notes: String,
  features: [{
    name: String,
    included: { type: Boolean, default: true }
  }],
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending'
  },
  amountPaid: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('CustomPackage', customPackageSchema);
