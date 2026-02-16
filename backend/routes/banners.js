const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const { auth, isAdmin } = require('../middleware/auth');

// GET /api/banners - Get all active banners (public)
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .populate('createdBy', 'name');
    res.json({ banners });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banners', error: error.message });
  }
});

// GET /api/banners/all - Get all banners including inactive (admin)
router.get('/all', auth, isAdmin, async (req, res) => {
  try {
    const banners = await Banner.find()
      .sort({ order: 1, createdAt: -1 })
      .populate('createdBy', 'name');
    res.json({ banners });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banners', error: error.message });
  }
});

// POST /api/banners - Create a new banner (admin)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl, cloudinaryId, link, isActive, order } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({ message: 'Title and image URL are required' });
    }

    const banner = new Banner({
      title,
      description: description || '',
      imageUrl,
      cloudinaryId: cloudinaryId || '',
      link: link || '',
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
      createdBy: req.userId,
    });

    await banner.save();
    await banner.populate('createdBy', 'name');

    res.status(201).json({ banner, message: 'Banner created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating banner', error: error.message });
  }
});

// PUT /api/banners/:id - Update a banner (admin)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl, cloudinaryId, link, isActive, order } = req.body;

    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { title, description, imageUrl, cloudinaryId, link, isActive, order },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.json({ banner, message: 'Banner updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating banner', error: error.message });
  }
});

// PATCH /api/banners/:id/toggle - Toggle banner active status (admin)
router.patch('/:id/toggle', auth, isAdmin, async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    banner.isActive = !banner.isActive;
    await banner.save();
    await banner.populate('createdBy', 'name');

    res.json({ banner, message: `Banner ${banner.isActive ? 'activated' : 'deactivated'}` });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling banner', error: error.message });
  }
});

// DELETE /api/banners/:id - Delete a banner (admin)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting banner', error: error.message });
  }
});

module.exports = router;
