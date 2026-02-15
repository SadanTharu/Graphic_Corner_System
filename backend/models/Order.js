const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  packageName: {
    type: String
  },
  totalAmount: {
    type: Number,
    required: true
  },
  advanceAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending',
      'awaiting_advance',
      'in_progress',
      'review',
      'awaiting_final',
      'completed',
      'cancelled',
      'revision_requested'
    ],
    default: 'pending'
  },
  currentStep: {
    type: Number,
    default: 1,
    min: 1,
    max: 6
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  requirements: {
    type: String
  },
  files: {
    raw: [String],
    watermark: [String],
    final: [String]
  },
  payments: [{
    type: {
      type: String,
      enum: ['advance', 'final']
    },
    amount: Number,
    date: Date,
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    slip: String
  }],
  revisions: [{
    requestedAt: Date,
    reason: String,
    resolvedAt: Date
  }],
  notes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `GC${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
