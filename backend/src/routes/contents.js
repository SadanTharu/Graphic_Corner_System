const express = require('express');
const contentController = require('../controllers/contentController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');
const router = express.Router();

// Admin: get all contents
router.get('/', auth, adminOnly, contentController.getAllContents);

// Admin: create content
router.post('/', auth, adminOnly, contentController.createContent);

// Admin: update content
router.put('/:id', auth, adminOnly, contentController.updateContent);

// Admin: delete content
router.delete('/:id', auth, adminOnly, contentController.deleteContent);

// Client: get contents for client
router.get('/client/:clientId', auth, contentController.getClientContents);

module.exports = router;