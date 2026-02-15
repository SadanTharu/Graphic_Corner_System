const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['topup', 'payment', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  description: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['wallet', 'bank_transfer', 'card'],
    default: 'wallet'
  },
  reference: {
    type: String
  },
  slip: {
    type: String // URL to payment slip image/PDF
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
