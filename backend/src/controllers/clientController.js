const Client = require('../models/Client');

// Admin: list all clients
exports.listClients = async (req, res) => {
  try {
    const clients = await Client.find({ role: 'client' }).select('-password');
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: create a new client/customer
exports.createClient = async (req, res) => {
  try {
    const { clientId, name, contact, email, status, password } = req.body;
    
    // Validation
    if (!clientId || !email || !password) {
      return res.status(400).json({ message: 'clientId, email, and password are required' });
    }
    
    // Check if client already exists
    const existing = await Client.findOne({ $or: [{ email }, { clientId }] });
    if (existing) {
      return res.status(400).json({ message: 'Client already exists with that email or clientId' });
    }
    
    const newClient = new Client({
      clientId,
      name: name || '',
      contact: contact || '',
      email,
      status: status || 'active',
      password,
      role: 'client'
    });
    
    await newClient.save();
    res.json({ message: 'Client created successfully', clientId: newClient._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: update client
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, status } = req.body;
    
    const client = await Client.findByIdAndUpdate(id, { name, contact, status }, { new: true });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    
    res.json({ message: 'Client updated', client });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: delete client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByIdAndDelete(id);
    
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Client: get own profile
exports.getProfile = async (req, res) => {
  try {
    const client = {
      clientId: req.user.clientId,
      name: req.user.name,
      email: req.user.email,
      contact: req.user.contact
    };
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
