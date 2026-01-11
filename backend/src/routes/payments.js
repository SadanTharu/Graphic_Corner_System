const express = require('express');
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');
const router = express.Router();

const upload = require('../middleware/upload');

// Admin: get all payments
router.get('/', auth, adminOnly, paymentController.getAllPayments);

// Admin: create payment
router.post('/', auth, adminOnly, paymentController.createPayment);

// Admin: update payment
router.put('/:id', auth, adminOnly, paymentController.updatePayment);

// Admin: Verify payment (approve/reject)
router.post('/verify/:id', auth, adminOnly, paymentController.verifyPayment);

// Admin: delete payment
router.delete('/:id', auth, adminOnly, paymentController.deletePayment);

// Client: get own payments
router.get('/client/:clientId', auth, paymentController.getClientPayments);

// Client: Submit proof
router.post('/submit-proof', auth, upload.single('slip'), paymentController.submitProof);

module.exports = router;