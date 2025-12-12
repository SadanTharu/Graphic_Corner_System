const express = require('express');
const clientController = require('../controllers/clientController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');
const router = express.Router();

// Admin: list all clients
router.get('/', auth, adminOnly, clientController.listClients);

// Admin: create a new client/customer
router.post('/', auth, adminOnly, clientController.createClient);

// Admin: update client
router.put('/:id', auth, adminOnly, clientController.updateClient);

// Admin: delete client
router.delete('/:id', auth, adminOnly, clientController.deleteClient);

// Client: get own profile
router.get('/me', auth, clientController.getProfile);

module.exports = router;