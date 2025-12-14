const Client = require('../models/Client');

// Admin: list all clients
exports.listClients = async (req, res) => {
  try {
    const clients = await Client.find({ role: 'client' })
      .select('-password')
      .populate('membershipId', 'name price billingCycle');
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: create a new client/customer
exports.createClient = async (req, res) => {
  try {
    const { clientId, name, contact, email, status, password, customerType, membershipId } = req.body;
    
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
      role: 'client',
      customerType: customerType || 'task_based',
      membershipId: customerType === 'monthly_subscription' ? membershipId : null,
      subscriptionStartDate: customerType === 'monthly_subscription' ? new Date() : null,
      subscriptionEndDate: customerType === 'monthly_subscription' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
    });
    
    await newClient.save();
    await newClient.populate('membershipId', 'name price billingCycle');
    res.json({ message: 'Client created successfully', client: newClient });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: update client
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, status, customerType, membershipId } = req.body;
    
    const updateData = { name, contact, status, customerType };
    
    if (customerType === 'monthly_subscription' && membershipId) {
      updateData.membershipId = membershipId;
      updateData.subscriptionStartDate = new Date();
      updateData.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    
    const client = await Client.findByIdAndUpdate(id, updateData, { new: true })
      .populate('membershipId', 'name price billingCycle');
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

// Admin: Assign membership to client
exports.assignMembership = async (req, res) => {
  try {
    const { id } = req.params;
    const { membershipId } = req.body;

    if (!membershipId) {
      return res.status(400).json({ message: 'membershipId is required' });
    }

    // Load membership with included services
    const membership = await require('../models/Membership').findById(membershipId).populate('includedServices.service', 'title price');
    if (!membership) return res.status(404).json({ message: 'Membership not found' });

    // Build service entitlements from membership included services
    const entitlements = (membership.includedServices || []).map(s => ({ service: s.service._id || s.service, remaining: s.count || 0 }));

    const client = await Client.findByIdAndUpdate(
      id,
      {
        customerType: 'monthly_subscription',
        membershipId,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        serviceEntitlements: entitlements
      },
      { new: true }
    ).populate('membershipId', 'name price billingCycle taskLimit').populate('serviceEntitlements.service', 'title price');

    if (!client) return res.status(404).json({ message: 'Client not found' });

    res.json({ message: 'Membership assigned successfully', client });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: Get client with detailed info
exports.getClientDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id)
      .select('-password')
      .populate('membershipId', 'name price billingCycle taskLimit revisionLimit');

    if (!client) return res.status(404).json({ message: 'Client not found' });

    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Client: get own profile
exports.getProfile = async (req, res) => {
  try {
    const client = await Client.findById(req.user.id)
      .select('-password')
      .populate('membershipId', 'name price billingCycle taskLimit revisionLimit');
    
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
