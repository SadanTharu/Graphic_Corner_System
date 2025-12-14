const express = require('express');
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');
const router = express.Router();

// Public: list services
router.get('/', serviceController.getPublicServices);

// Admin: list all services (for admin dashboard)
router.get('/admin', auth, adminOnly, serviceController.getAllServices);

// Public: list services by category
router.get('/category/:categoryId', serviceController.getServicesByCategory);

// Admin: create service
router.post('/', auth, adminOnly, serviceController.createService);

// Admin: update service
router.put('/:id', auth, adminOnly, serviceController.updateService);

// Admin: delete service
router.delete('/:id', auth, adminOnly, serviceController.deleteService);

module.exports = router;