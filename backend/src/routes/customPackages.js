const express = require('express');
const router = express.Router();
const customPackageController = require('../controllers/customPackageController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Admin only - Get all custom packages
router.get('/', authMiddleware, adminMiddleware, customPackageController.getAllCustomPackages);

// Get custom packages for a specific client
router.get('/client/:clientId', authMiddleware, customPackageController.getClientCustomPackages);

// Admin only - Create custom package for a client
router.post('/', authMiddleware, adminMiddleware, customPackageController.createCustomPackage);

// Admin only - Update custom package
router.put('/:id', authMiddleware, adminMiddleware, customPackageController.updateCustomPackage);

// Update task progress (admin can update client progress)
router.put('/:id/progress', authMiddleware, adminMiddleware, customPackageController.updateTaskProgress);

// Update payment status
router.put('/:id/payment', authMiddleware, adminMiddleware, customPackageController.updatePaymentStatus);

// Admin only - Delete custom package
router.delete('/:id', authMiddleware, adminMiddleware, customPackageController.deleteCustomPackage);

module.exports = router;
