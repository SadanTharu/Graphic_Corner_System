const Payment = require('../models/Payment');
const Client = require('../models/Client');

// Admin: get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort('-createdAt');
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

    const payments = await Payment.find({ clientId }).sort('-createdAt');
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Client: Submit payment proof (Bank Transfer Slip)
exports.submitProof = async (req, res) => {
  try {
    const { paymentId, title, amount, notes } = req.body;
    const slipUrl = req.file?.path; // Multer-Cloudinary returns path for URL

    if (!slipUrl) {
      return res.status(400).json({ message: 'Payment slip file is required' });
    }

    let payment;
    if (paymentId) {
      // Update existing pending payment
      payment = await Payment.findById(paymentId);
      if (!payment) return res.status(404).json({ message: 'Payment record not found' });

      payment.slipUrl = slipUrl;
      payment.notes = notes || payment.notes;
      payment.status = 'pending'; // Re-set to pending if it was rejected
    } else {
      // Create new payment request/submission
      payment = new Payment({
        clientId: req.user.clientId,
        title: title || 'Bank Transfer Payment',
        amount: amount || 0,
        method: 'bank_transfer',
        status: 'pending',
        slipUrl,
        notes
      });
    }

    await payment.save();
    res.json({ message: 'Payment slip uploaded successfully for verification', payment });
  } catch (err) {
    res.status(500).json({ message: 'File upload failed', error: err.message });
  }
};

// Admin: Verify/Approve payment
exports.verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; // status: 'verified' or 'rejected'

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid verification status' });
    }

    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    payment.status = status === 'verified' ? 'paid' : 'rejected';
    payment.notes = notes || payment.notes;
    await payment.save();

    // If verified, update client payment tracking
    if (status === 'verified' && payment.clientId) {
      await Client.findOneAndUpdate(
        { clientId: payment.clientId },
        {
          $set: {
            'paymentTracking.isAdvancePaid': true,
            'paymentTracking.lastAdvancePaid': new Date()
          },
          $inc: {
            'paymentTracking.nextPaymentDue': -Math.min(payment.amount || 0, 1000000) // Simple safety cap
          }
        },
        { new: true }
      );
    }

    res.json({ message: `Payment ${status} successfully`, payment });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
};
