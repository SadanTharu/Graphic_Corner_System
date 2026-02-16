const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { auth, isAdmin } = require('../middleware/auth');

// GET /api/settings/:key - Get a setting by key (public)
router.get('/:key', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: req.params.key });
    if (!setting) {
      return res.json({ key: req.params.key, value: null });
    }
    res.json({ key: setting.key, value: setting.value });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching setting', error: error.message });
  }
});

// PUT /api/settings/:key - Create or update a setting (admin)
router.put('/:key', auth, isAdmin, async (req, res) => {
  try {
    const { value } = req.body;
    const setting = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { key: req.params.key, value },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ key: setting.key, value: setting.value, message: 'Setting updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating setting', error: error.message });
  }
});

module.exports = router;
