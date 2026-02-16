const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User');
const Service = require('../models/Service');
const Transaction = require('../models/Transaction');

// GET /api/analytics - Full dashboard analytics (admin only)
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // ---- Fetch all data in parallel ----
    const [orders, users, services, transactions] = await Promise.all([
      Order.find({}).populate('service', 'name category').populate('assignedTo', 'name specialty').populate('customer', 'name email').lean(),
      User.find({}).select('name email role specialty walletBalance isActive createdAt').lean(),
      Service.find({}).lean(),
      Transaction.find({}).lean()
    ]);

    // ---- Summary Stats ----
    const totalOrders = orders.length;
    const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    const totalRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingRevenue = orders.filter(o => !['completed', 'cancelled'].includes(o.status)).reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const totalCustomers = users.filter(u => u.role === 'customer').length;
    const totalTeamMembers = users.filter(u => u.role === 'team').length;

    // This month stats
    const thisMonthOrders = orders.filter(o => new Date(o.createdAt) >= startOfMonth);
    const thisMonthRevenue = thisMonthOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const thisMonthNewCustomers = users.filter(u => u.role === 'customer' && new Date(u.createdAt) >= startOfMonth).length;

    // Last month stats for comparison
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = startOfMonth;
    const lastMonthOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= lastMonthStart && d < lastMonthEnd;
    });
    const lastMonthRevenue = lastMonthOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // ---- Monthly Revenue (last 12 months) ----
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthName = monthStart.toLocaleString('default', { month: 'short', year: '2-digit' });
      const monthOrders = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= monthStart && d < monthEnd;
      });
      const revenue = monthOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const count = monthOrders.length;
      monthlyRevenue.push({ month: monthName, revenue, orders: count });
    }

    // ---- Order Status Distribution ----
    const statusCounts = {};
    const statusLabels = {
      pending: 'Pending',
      awaiting_advance: 'Awaiting Advance',
      in_progress: 'In Progress',
      review: 'Under Review',
      revision_requested: 'Revision',
      awaiting_final: 'Awaiting Final',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    orders.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });
    const orderStatusDistribution = Object.entries(statusLabels).map(([key, label]) => ({
      name: label,
      value: statusCounts[key] || 0,
      key
    })).filter(item => item.value > 0);

    // ---- Revenue by Service Category ----
    const categoryRevenue = {};
    orders.filter(o => o.status === 'completed').forEach(o => {
      const cat = o.service?.category || 'unknown';
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (o.totalAmount || 0);
    });
    const revenueByCategory = Object.entries(categoryRevenue).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    // ---- Top Services by Order Count ----
    const serviceOrderCount = {};
    orders.forEach(o => {
      const serviceName = o.service?.name || 'Unknown';
      if (!serviceOrderCount[serviceName]) {
        serviceOrderCount[serviceName] = { name: serviceName, orders: 0, revenue: 0 };
      }
      serviceOrderCount[serviceName].orders += 1;
      if (o.status === 'completed') {
        serviceOrderCount[serviceName].revenue += (o.totalAmount || 0);
      }
    });
    const topServices = Object.values(serviceOrderCount)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 6);

    // ---- Team Performance ----
    const teamUsers = users.filter(u => u.role === 'team');
    const teamPerformance = teamUsers.map(member => {
      const memberOrders = orders.filter(o =>
        o.assignedTo && (o.assignedTo._id?.toString() === member._id.toString() || o.assignedTo.toString() === member._id.toString())
      );
      const completed = memberOrders.filter(o => o.status === 'completed').length;
      const active = memberOrders.filter(o => !['completed', 'cancelled'].includes(o.status)).length;
      const revenue = memberOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      return {
        name: member.name,
        specialty: member.specialty || 'General',
        completed,
        active,
        total: memberOrders.length,
        revenue
      };
    }).sort((a, b) => b.completed - a.completed);

    // ---- Daily Orders (last 30 days) ----
    const dailyOrders = [];
    for (let i = 29; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      const dayLabel = dayStart.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      const dayOrders = orders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= dayStart && d < dayEnd;
      });
      dailyOrders.push({
        date: dayLabel,
        orders: dayOrders.length,
        revenue: dayOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.totalAmount || 0), 0)
      });
    }

    // ---- Payment Stats ----
    const allPayments = orders.flatMap(o => (o.payments || []).map(p => ({ ...p, orderId: o._id })));
    const verifiedPayments = allPayments.filter(p => p.status === 'verified');
    const pendingPayments = allPayments.filter(p => p.status === 'pending');
    const totalCollected = verifiedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Wallet stats
    const totalWalletBalance = users.reduce((sum, u) => sum + (u.walletBalance || 0), 0);
    const walletTransactions = transactions.filter(t => t.status === 'completed');
    const totalTopups = walletTransactions.filter(t => t.type === 'topup').reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalWalletPayments = walletTransactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + (t.amount || 0), 0);

    // ---- Recent Orders (last 10) ----
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(o => ({
        _id: o._id,
        orderNumber: o.orderNumber,
        customer: o.customer?.name || 'N/A',
        service: o.service?.name || 'N/A',
        status: o.status,
        totalAmount: o.totalAmount,
        assignedTo: o.assignedTo?.name || 'Unassigned',
        createdAt: o.createdAt
      }));

    // ---- New Customers Per Month (last 6 months) ----
    const customerGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthName = mStart.toLocaleString('default', { month: 'short' });
      const newCustomers = users.filter(u => {
        const d = new Date(u.createdAt);
        return u.role === 'customer' && d >= mStart && d < mEnd;
      }).length;
      customerGrowth.push({ month: monthName, customers: newCustomers });
    }

    // ---- Average Order Value ----
    const avgOrderValue = completedOrders > 0 ? Math.round(totalRevenue / completedOrders) : 0;
    const avgCompletionTime = (() => {
      const completedWithDates = orders.filter(o => o.status === 'completed' && o.createdAt && o.updatedAt);
      if (completedWithDates.length === 0) return 0;
      const totalDays = completedWithDates.reduce((sum, o) => {
        const diff = (new Date(o.updatedAt) - new Date(o.createdAt)) / (1000 * 60 * 60 * 24);
        return sum + diff;
      }, 0);
      return Math.round(totalDays / completedWithDates.length);
    })();

    res.json({
      summary: {
        totalOrders,
        activeOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue,
        pendingRevenue,
        totalCustomers,
        totalTeamMembers,
        totalServices: services.length,
        avgOrderValue,
        avgCompletionTime,
        thisMonthOrders: thisMonthOrders.length,
        thisMonthRevenue,
        thisMonthNewCustomers,
        lastMonthRevenue,
        revenueGrowth: lastMonthRevenue > 0
          ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
          : thisMonthRevenue > 0 ? 100 : 0,
        orderGrowth: lastMonthOrders.length > 0
          ? Math.round(((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100)
          : thisMonthOrders.length > 0 ? 100 : 0
      },
      payments: {
        totalCollected,
        pendingCount: pendingPayments.length,
        pendingAmount: pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        totalWalletBalance,
        totalTopups,
        totalWalletPayments
      },
      charts: {
        monthlyRevenue,
        orderStatusDistribution,
        revenueByCategory,
        topServices,
        teamPerformance,
        dailyOrders,
        customerGrowth
      },
      recentOrders
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to load analytics', error: error.message });
  }
});

module.exports = router;
