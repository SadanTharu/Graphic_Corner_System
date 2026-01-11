const express = require('express');
const clientController = require('../controllers/clientController');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');
const router = express.Router();

// Admin: list all clients
router.get('/', auth, adminOnly, clientController.listClients);

// Admin: create a new client/customer
router.post('/', auth, adminOnly, clientController.createClient);

// Admin: get client detail
router.get('/:id', auth, adminOnly, clientController.getClientDetail);

// Admin: update client
router.put('/:id', auth, adminOnly, clientController.updateClient);

// Admin: assign membership to client
router.put('/:id/membership', auth, adminOnly, clientController.assignMembership);

// Admin: delete client
router.delete('/:id', auth, adminOnly, clientController.deleteClient);

// Client: get own profile
router.get('/me', auth, clientController.getProfile);

// Client: Self-subscribe to a package
router.post('/subscribe/:membershipId', auth, clientController.subscribe);

module.exports = router;