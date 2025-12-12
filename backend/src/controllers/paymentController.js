const Payment = require('../models/Payment');

// Admin: get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: create payment
exports.createPayment = async (req, res) => {
  try {
    const newPayment = await Payment.create(req.body);
    res.json({ message: 'Payment created', payment: newPayment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: update payment
exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByIdAndUpdate(id, req.body, { new: true });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment updated', payment });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: delete payment
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByIdAndDelete(id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Client: get own payments
exports.getClientPayments = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    if (req.user.role === 'client' && req.user.clientId !== clientId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const payments = await Payment.find({ clientId });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
