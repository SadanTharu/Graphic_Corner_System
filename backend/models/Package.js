const mongoose = require('mongoose');

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
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    enum: ['month', 'quarter', 'year'],
    default: 'month'
  },
  features: [{
    type: String,
    required: true
  }],
  popular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  servicesIncluded: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  maxOrders: {
    type: Number,
    required: true,
    min: [1, 'Must include at least 1 order']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Package', packageSchema);
