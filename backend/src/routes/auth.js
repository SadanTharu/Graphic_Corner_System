const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Client or Admin login
router.post('/login', authController.login);

// Seed admin (one-time) - protected by ADMIN_PASSWORD env variable
router.post('/seed-admin', authController.seedAdmin);

module.exports = router;