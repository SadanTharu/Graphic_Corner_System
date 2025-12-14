const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');

// Public list categories
router.get('/', categoryController.listCategories);

// Public: get category with services
router.get('/:id/services', categoryController.getCategoryWithServices);

// Admin create category
router.post('/', auth, adminOnly, categoryController.createCategory);

// Admin update
router.put('/:id', auth, adminOnly, categoryController.updateCategory);

// Admin soft delete
router.delete('/:id', auth, adminOnly, categoryController.deleteCategory);

module.exports = router;
