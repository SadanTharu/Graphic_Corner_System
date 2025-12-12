const jwt = require('jsonwebtoken');
const Client = require('../models/Client');

// Client or Admin login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Client.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, role: user.role, clientId: user.clientId, name: user.name });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Seed admin (one-time) - protected by ADMIN_PASSWORD env variable
exports.seedAdmin = async (req, res) => {
  try {
    const { adminKey } = req.body;
    if (adminKey !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    const exists = await Client.findOne({ role: 'admin' });
    if (exists) return res.json({ message: 'Admin exists' });
    
    const admin = new Client({
      clientId: 'ADMIN',
      name: 'Admin',
      email: 'admin@local',
      password: process.env.ADMIN_PASSWORD,
      role: 'admin'
    });
    await admin.save();
    res.json({ message: 'Admin created' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
