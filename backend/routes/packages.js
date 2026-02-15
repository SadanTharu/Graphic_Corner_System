const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const Package = require('../models/Package');

// Get all packages
router.get('/', async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter = {};

    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const packages = await Package.find(filter)
      .populate('servicesIncluded', 'name category')
      .sort({ popular: -1, price: 1 });
    
    res.json({ packages });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get package by ID
router.get('/:id', async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id)
      .populate('servicesIncluded', 'name category priceRange');
    
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json({ package: pkg });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create package (Admin only)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const pkg = new Package(req.body);
    await pkg.save();
    res.status(201).json({ message: 'Package created successfully', package: pkg });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update package (Admin only)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json({ message: 'Package updated successfully', package: pkg });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete package (Admin only - soft delete)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json({ message: 'Package deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
