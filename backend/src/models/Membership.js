const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    description: 'e.g., "Basic", "Professional", "Enterprise"'
  },
  description: String,
  price: {
    type: Number,
    required: true,
    description: 'Monthly subscription price'
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  features: [{
    name: String,
    description: String,
    limit: Number, // e.g., max tasks per month, design revisions, etc.
    included: { type: Boolean, default: true }
  }],
  // Detailed service deliverables (e.g., "10 short videos")
  servicePackages: [{
    title: { type: String, required: true },
    count: { type: Number, default: 0 },
    description: String
  }],
  billingDay: {
    type: Number,
    default: 27,
    min: 1,
    max: 31
  },
  includedServices: [{
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    count: { type: Number, default: 0 },
    priceOverride: { type: Number } // optional override when service used in membership
  }],
  taskLimit: {
    type: Number,
    description: 'Max tasks allowed per billing cycle'
  },
  revisionLimit: {
    type: Number,
    description: 'Max design revisions allowed'
  },
  deliveryDays: {
    type: Number,
    default: 7,
    description: 'Standard delivery time in days'
  },
  supportLevel: {
    type: String,
    enum: ['basic', 'priority', 'vip'],
    default: 'basic',
    description: 'Support response time and priority'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    default: '📦',
    description: 'Emoji icon for display'
  },
  color: {
    type: String,
    default: '#667eea',
    description: 'Color for UI display'
  }
}, { timestamps: true });

module.exports = mongoose.model('Membership', membershipSchema);
