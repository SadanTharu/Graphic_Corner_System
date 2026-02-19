const mongoose = require('mongoose');

const packageServiceSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  count: {
    type: Number,
    required: true,
    min: [1, 'Count must be at least 1']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Unit price cannot be negative']
  }
}, { _id: false });

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Package name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  services: {
    type: [packageServiceSchema],
    validate: {
      validator: function(v) { return v && v.length > 0; },
      message: 'At least one service must be included'
    }
  },
  totalPrice: {
    type: Number,
    default: 0,
    min: [0, 'Total price cannot be negative']
  },
  offeringPrice: {
    type: Number,
    required: [true, 'Offering price is required'],
    min: [0, 'Offering price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    enum: ['month', 'quarter', 'year'],
    default: 'month'
  },
  popular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate totalPrice and discount before saving
packageSchema.pre('validate', async function() {
  if (this.services && this.services.length > 0) {
    this.totalPrice = this.services.reduce((sum, s) => sum + (s.count * s.unitPrice), 0);
  }
  if (this.totalPrice > 0 && this.offeringPrice >= 0) {
    this.discount = Math.round(((this.totalPrice - this.offeringPrice) / this.totalPrice) * 100);
  } else {
    this.discount = 0;
  }
});

module.exports = mongoose.model('Package', packageSchema);
