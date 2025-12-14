const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Public - Get all active memberships
router.get('/', membershipController.getAllMemberships);

// Public - Get single membership
router.get('/:id', membershipController.getMembership);

// Admin only - Create membership
router.post('/', authMiddleware, adminMiddleware, membershipController.createMembership);

// Admin: purchase membership for client (assign membership + create payment schedule)
router.post('/:id/purchase', authMiddleware, adminMiddleware, membershipController.purchaseMembership);

// Admin only - Update membership
router.put('/:id', authMiddleware, adminMiddleware, membershipController.updateMembership);

// Admin only - Delete membership (soft delete)
router.delete('/:id', authMiddleware, adminMiddleware, membershipController.deleteMembership);

module.exports = router;
