const express = require('express');
const packageController = require('../controllers/packageController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');
const router = express.Router();

// Admin: get all packages
router.get('/', auth, adminOnly, packageController.getAllPackages);

// Admin: create package
router.post('/', auth, adminOnly, packageController.createPackage);

// Admin: update package
router.put('/:id', auth, adminOnly, packageController.updatePackage);

// Admin: delete package
router.delete('/:id', auth, adminOnly, packageController.deletePackage);

// Client: get packages for client
router.get('/client/:clientId', auth, packageController.getClientPackages);

module.exports = router;