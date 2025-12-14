const Membership = require('../models/Membership');

// Get all memberships
const getAllMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find({ isActive: true }).sort('price');
    res.json(memberships);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch memberships', error: err.message });
  }
};

// Get single membership
const getMembership = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) return res.status(404).json({ message: 'Membership not found' });
    res.json(membership);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch membership', error: err.message });
  }
};

// Create membership (admin only)
const createMembership = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      billingCycle,
      taskLimit,
      revisionLimit,
      supportLevel,
      icon,
      color,
      features,
      includedServices // expect array of { service: serviceId, count: number, priceOverride? }
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    // Normalize includedServices if provided
    let normalizedIncluded = [];
    if (Array.isArray(includedServices)) {
      normalizedIncluded = includedServices.map(item => {
        return {
          service: item.service,
          count: typeof item.count === 'number' ? item.count : Number(item.count) || 0,
          priceOverride: item.priceOverride
        };
      });
    }

    const membership = new Membership({
      name,
      description,
      price,
      billingCycle,
      taskLimit,
      revisionLimit,
      supportLevel,
      icon,
      color,
      features: features || [],
      includedServices: normalizedIncluded
    });

    await membership.save();
    res.status(201).json({ message: 'Membership created successfully', membership });
  } catch (err) {
    res.status(400).json({ message: 'Failed to create membership', error: err.message });
  }
};

// Update membership (admin only)
const updateMembership = async (req, res) => {
  try {
    const membership = await Membership.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!membership) return res.status(404).json({ message: 'Membership not found' });

    res.json({ message: 'Membership updated successfully', membership });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update membership', error: err.message });
  }
};

// Delete membership (admin only)
const deleteMembership = async (req, res) => {
  try {
    const membership = await Membership.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!membership) return res.status(404).json({ message: 'Membership not found' });

    res.json({ message: 'Membership deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete membership', error: err.message });
  }
};

module.exports = {
  getAllMemberships,
  getMembership,
  createMembership,
  updateMembership,
  deleteMembership,
  // Purchase flow: assign membership to a client, record advance and generate installment payments
  purchaseMembership
};

// Purchase membership for a client (admin)
// Body: { clientId, totalAmount?, advancePaid (number), installments?: [numbers], months?: number, paymentMethod?, notes? }
async function purchaseMembership(req, res) {
  try {
    const membershipId = req.params.id;
    const { clientId, totalAmount, advancePaid = 0, installments, months = 3, paymentMethod, notes } = req.body;

    if (!clientId) return res.status(400).json({ message: 'clientId is required' });

    const MembershipModel = require('../models/Membership');
    const ClientModel = require('../models/Client');
    const Payment = require('../models/Payment');

    const membership = await MembershipModel.findById(membershipId).populate('includedServices.service', 'title price');
    if (!membership) return res.status(404).json({ message: 'Membership not found' });

    const client = await ClientModel.findById(clientId);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const total = typeof totalAmount === 'number' && totalAmount > 0 ? totalAmount : (membership.price || 0);

    // Minimum advance percentage (default 25%) - can be extended to membership.paymentRules
    const minAdvancePercent = (membership.paymentRules && membership.paymentRules.minAdvancePercent) ? membership.paymentRules.minAdvancePercent : 25;
    const minAdvance = Math.round((minAdvancePercent / 100) * total);
    if (advancePaid < minAdvance) {
      return res.status(400).json({ message: `Advance must be at least ${minAdvancePercent}% (${minAdvance}) of total` });
    }

    // remaining amount after advance
    const remaining = Math.max(0, total - advancePaid);

    // Build installment plan
    let schedule = [];
    if (Array.isArray(installments) && installments.length > 0) {
      const sum = installments.reduce((a, b) => a + b, 0);
      if (sum !== remaining) return res.status(400).json({ message: 'Installments sum must equal remaining balance' });
      schedule = installments.slice();
    } else {
      // split remaining into equal monthly installments over `months` months
      if (months <= 0) return res.status(400).json({ message: 'months must be >= 1' });
      const base = Math.floor(remaining / months);
      let rest = remaining - base * months;
      for (let i = 0; i < months; i++) {
        schedule.push(base + (rest > 0 ? 1 : 0));
        if (rest > 0) rest -= 1;
      }
    }

    // Create payments: advance + installments
    const paymentsToCreate = [];
    const now = new Date();

    if (advancePaid > 0) {
      paymentsToCreate.push({
        clientId: client.clientId || String(client._id),
        title: 'Advance Payment',
        dueDate: now,
        amount: advancePaid,
        method: paymentMethod || 'advance',
        status: 'paid'
      });
    }

    for (let i = 0; i < schedule.length; i++) {
      const amt = schedule[i];
      const due = new Date(now.getTime());
      // due each next month
      due.setMonth(due.getMonth() + (i + 1));
      paymentsToCreate.push({
        clientId: client.clientId || String(client._id),
        title: `Installment ${i + 1}`,
        dueDate: due,
        amount: amt,
        method: paymentMethod || 'installment',
        status: 'pending'
      });
    }

    // Save payments
    const createdPayments = [];
    for (const p of paymentsToCreate) {
      const cp = await Payment.create(p);
      createdPayments.push(cp);
    }

    // Assign membership and entitlements to client (similar to assignMembership)
    const entitlements = (membership.includedServices || []).map(s => ({ service: s.service._id || s.service, remaining: s.count || 0 }));

    client.customerType = 'monthly_subscription';
    client.membershipId = membership._id;
    client.subscriptionStartDate = new Date();
    client.subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    client.serviceEntitlements = entitlements;
    // update totalSpent by advancePaid (initial)
    client.totalSpent = (client.totalSpent || 0) + (advancePaid || 0);
    await client.save();

    res.json({ message: 'Membership purchased and schedule created', client: await ClientModel.findById(client._id).populate('membershipId', 'name price').populate('serviceEntitlements.service', 'title price'), payments: createdPayments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to process purchase', error: err.message });
  }
}
