const express = require('express');
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');
const router = express.Router();

// Admin: get all payments
router.get('/', auth, adminOnly, paymentController.getAllPayments);

// Admin: create payment
router.post('/', auth, adminOnly, paymentController.createPayment);

// Admin: update payment
router.put('/:id', auth, adminOnly, paymentController.updatePayment);

// Admin: delete payment
router.delete('/:id', auth, adminOnly, paymentController.deletePayment);

// Client: get own payments
router.get('/client/:clientId', auth, paymentController.getClientPayments);

module.exports = router;