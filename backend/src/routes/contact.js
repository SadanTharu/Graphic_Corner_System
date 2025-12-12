const express = require('express');
const contactController = require('../controllers/contactController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');
const router = express.Router();

// Public: Submit contact form
router.post('/', contactController.submitContact);

// Admin: Get all messages
router.get('/', auth, adminOnly, contactController.getAllMessages);

// Admin: Mark as read
router.put('/:id/read', auth, adminOnly, contactController.markAsRead);

// Admin: Delete message
router.delete('/:id', auth, adminOnly, contactController.deleteMessage);

module.exports = router;
