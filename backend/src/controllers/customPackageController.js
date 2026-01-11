const CustomPackage = require('../models/CustomPackage');
const Client = require('../models/Client');
const { generateContentsFromPackage } = require('../utils/automation');

// Get all custom packages (admin)
const getAllCustomPackages = async (req, res) => {
  try {
    const packages = await CustomPackage.find().sort('-createdAt');
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch packages', error: err.message });
  }
};

// Get custom packages for a specific client
const getClientCustomPackages = async (req, res) => {
  try {
    const { clientId } = req.params;
    const packages = await CustomPackage.find({ clientId }).sort('-createdAt');
    res.json(packages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch packages', error: err.message });
  }
};

// Create custom package (admin only)
const createCustomPackage = async (req, res) => {
  try {
    const { clientId, packageName, description, price, taskCount, billingDay, services, revisionLimit, deliveryDays, features, notes } = req.body;

    if (!clientId || !packageName || !price) {
      return res.status(400).json({ message: 'ClientId, package name, and price are required' });
    }

    // Verify client exists (search by string clientId)
    const client = await Client.findOne({ clientId });
    if (!client) return res.status(404).json({ message: 'Client not found' });

    // Calculate taskCount if not provided but services exist
    let finalTaskCount = taskCount;
    if (!finalTaskCount && services && services.length > 0) {
      finalTaskCount = services.reduce((sum, s) => sum + (Number(s.count) || 0), 0);
    }

    const customPackage = new CustomPackage({
      clientId, // This is now the string ID
      packageName,
      description,
      price,
      taskCount: finalTaskCount || 0,
      billingDay: billingDay || 27,
      services: services || [],
      revisionLimit,
      deliveryDays,
      features: features || [],
      notes,
      status: 'active'
    });

    await customPackage.save();

    // Automate content creation
    await generateContentsFromPackage(clientId, services || []);

    // Update client to show they have a custom package
    client.customerType = 'task_based';
    // If it's a new subscription/package, set the 25% advance requirement
    client.paymentTracking = {
      ...client.paymentTracking,
      isAdvancePaid: false,
      nextPaymentDue: price * 0.25,
      nextPaymentDate: new Date()
    };

    await client.save();

    res.status(201).json({ message: 'Custom package created successfully', package: customPackage });
  } catch (err) {
    res.status(400).json({ message: 'Failed to create package', error: err.message });
  }
};

// Update custom package
const updateCustomPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Recalculate taskCount if services are updated
    if (updateData.services && updateData.services.length > 0) {
      updateData.taskCount = updateData.services.reduce((sum, s) => sum + (Number(s.count) || 0), 0);
    }

    const customPackage = await CustomPackage.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('clientId', 'name email clientId');

    if (!customPackage) return res.status(404).json({ message: 'Package not found' });

    res.json({ message: 'Package updated successfully', package: customPackage });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update package', error: err.message });
  }
};

// Update task completion status
const updateTaskProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { tasksCompleted, status } = req.body;

    const customPackage = await CustomPackage.findById(id);
    if (!customPackage) return res.status(404).json({ message: 'Package not found' });

    if (tasksCompleted !== undefined) {
      customPackage.tasksCompleted = Math.min(tasksCompleted, customPackage.taskCount);

      // Auto-complete package if all tasks done
      if (customPackage.tasksCompleted >= customPackage.taskCount) {
        customPackage.status = 'completed';
      }
    }

    if (status) {
      customPackage.status = status;
    }

    await customPackage.save();
    res.json({ message: 'Task progress updated', package: customPackage });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update progress', error: err.message });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { amountPaid, paymentStatus } = req.body;

    const customPackage = await CustomPackage.findById(id);
    if (!customPackage) return res.status(404).json({ message: 'Package not found' });

    if (amountPaid !== undefined) {
      customPackage.amountPaid = amountPaid;

      // Auto-update payment status
      if (amountPaid >= customPackage.price) {
        customPackage.paymentStatus = 'paid';
      } else if (amountPaid > 0) {
        customPackage.paymentStatus = 'partial';
      }
    }

    if (paymentStatus) {
      customPackage.paymentStatus = paymentStatus;
    }

    await customPackage.save();
    res.json({ message: 'Payment status updated', package: customPackage });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update payment', error: err.message });
  }
};

// Delete custom package
const deleteCustomPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const customPackage = await CustomPackage.findByIdAndDelete(id);

    if (!customPackage) return res.status(404).json({ message: 'Package not found' });

    res.json({ message: 'Package deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete package', error: err.message });
  }
};

module.exports = {
  getAllCustomPackages,
  getClientCustomPackages,
  createCustomPackage,
  updateCustomPackage,
  updateTaskProgress,
  updatePaymentStatus,
  deleteCustomPackage
};
