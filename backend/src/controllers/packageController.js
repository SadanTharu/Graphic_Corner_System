const Package = require('../models/Package');

// Admin: get all packages
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find();
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: create package
exports.createPackage = async (req, res) => {
  try {
    const newPackage = await Package.create(req.body);
    res.json({ message: 'Package created', package: newPackage });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: update package
exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await Package.findByIdAndUpdate(id, req.body, { new: true });
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json({ message: 'Package updated', package: pkg });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: delete package
exports.deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await Package.findByIdAndDelete(id);
    if (!pkg) return res.status(404).json({ message: 'Package not found' });
    res.json({ message: 'Package deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Client: get packages for client
exports.getClientPackages = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    if (req.user.role === 'client' && req.user.clientId !== clientId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const packages = await Package.find({ clientId });
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
