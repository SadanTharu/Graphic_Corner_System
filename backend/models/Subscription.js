const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  // Snapshot of package details at time of subscription
  packageName: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  offeringPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  duration: {
    type: String,
    enum: ['month', 'quarter', 'year'],
    required: true
  },
  // Flow: pending → approved → awaiting_payment → active → awaiting_final_payment → completed
  status: {
    type: String,
    enum: ['pending', 'approved', 'awaiting_payment', 'active', 'awaiting_final_payment', 'completed', 'cancelled'],
    default: 'pending'
  },
  // 25% advance payment
  advanceAmount: { type: Number, default: 0 },
  payment: {
    method: { type: String, enum: ['wallet', 'direct', ''], default: '' },
    amount: { type: Number, default: 0 },
    slip: { type: String, default: '' }, // slip image/pdf URL for direct payment
    status: { type: String, enum: ['none', 'pending', 'verified', 'rejected'], default: 'none' },
    paidAt: { type: Date },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  // Final payment (75% remaining) after all tasks complete
  finalPayment: {
    method: { type: String, enum: ['wallet', 'direct', ''], default: '' },
    amount: { type: Number, default: 0 },
    slip: { type: String, default: '' },
    status: { type: String, enum: ['none', 'pending', 'verified', 'rejected'], default: 'none' },
    paidAt: { type: Date },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  // Auto-renewal
  autoRenew: { type: Boolean, default: false },
  // Tasks generated from package services after payment verification
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  // ─── Cycle Management ───
  cycleDays: { type: Number, default: 30 }, // total days in one cycle
  cycleStartDate: { type: Date },
  cycleEndDate: { type: Date },
  currentCycle: { type: Number, default: 1 },
  cycleHistory: [{
    cycle: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    completedAt: { type: Date },
    tasks: [{
      task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
      title: String,
      status: String,
      deadline: Date,
      completedAt: Date
    }]
  }],
  approvedAt: { type: Date },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: { type: String }
}, {
  timestamps: true
});

subscriptionSchema.index({ customer: 1, status: 1 });
subscriptionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
