const Category = require('../models/Category');
const Service = require('../models/Service');

exports.listCategories = async (req, res) => {
  try {
    const cats = await Category.find();
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Category exists' });
    const cat = await Category.create({ name, description });
    res.json({ message: 'Category created', category: cat });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await Category.findByIdAndUpdate(id, req.body, { new: true });
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category updated', category: cat });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    // soft delete
    const cat = await Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    // unset category on services that belonged to this category
    await Service.updateMany({ category: id }, { $unset: { category: '' } });
    res.json({ message: 'Category deactivated', category: cat });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Public: get a category with its services
exports.getCategoryWithServices = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    const services = await Service.find({ category: id });
    res.json({ category, services });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
