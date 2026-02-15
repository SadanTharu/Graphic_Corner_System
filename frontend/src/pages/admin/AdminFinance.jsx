import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Clock, Target, Loader2, Wallet, ArrowUpCircle, ArrowDownCircle, RefreshCw } from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ordersAPI, walletAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const AdminFinance = () => {
  const [orders, setOrders] = useState([]);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [pendingTopups, setPendingTopups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, txData, topupsData] = await Promise.all([
        ordersAPI.getAll(),
        walletAPI.getAllTransactions().catch(() => ({ transactions: [] })),
        walletAPI.getPendingTopups().catch(() => ({ transactions: [] }))
      ]);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setWalletTransactions(txData.transactions || []);
      setPendingTopups(topupsData.transactions || []);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate real financial data from orders
  const totalRevenue = orders.reduce((sum, order) => {
    if (order.status === 'completed') {
      return sum + order.totalAmount;
    }
    return sum;
  }, 0);

  const pendingPayments = orders.reduce((sum, order) => {
    if (order.status === 'awaiting_final' || order.status === 'awaiting_advance') {
      return sum + (order.totalAmount - (order.advanceAmount || 0));
    }
    return sum;
  }, 0);

  // Wallet calculations
  const walletTopupsCompleted = walletTransactions.filter(t => t.type === 'topup' && t.status === 'completed');
  const walletPayments = walletTransactions.filter(t => t.type === 'payment');
  const walletRefunds = walletTransactions.filter(t => t.type === 'refund');
  const totalWalletTopups = walletTopupsCompleted.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalWalletPayments = walletPayments.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalWalletRefunds = walletRefunds.reduce((sum, t) => sum + (t.amount || 0), 0);
  const pendingTopupAmount = pendingTopups.reduce((sum, t) => sum + (t.amount || 0), 0);
  const netWalletBalance = totalWalletTopups - totalWalletPayments - totalWalletRefunds;

  // Group revenue by service category
  const revenueByCategory = orders.reduce((acc, order) => {
    if (order.status === 'completed' && order.service?.category) {
      const category = order.service.category;
      acc[category] = (acc[category] || 0) + order.totalAmount;
    }
    return acc;
  }, {});

  const revenueByService = Object.entries(revenueByCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    percentage: ((value / totalRevenue) * 100).toFixed(1)
  }));

  const completedCount = orders.filter(o => o.status === 'completed').length;
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  const stats = [
    {
      title: 'Total Revenue',
      value: `LKR ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      change: `${completedCount} completed`,
      isPositive: true
    },
    {
      title: 'Pending Payments',
      value: `LKR ${pendingPayments.toLocaleString()}`,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      change: `${orders.filter(o => o.status === 'awaiting_advance' || o.status === 'awaiting_final').length} pending`,
      isPositive: true
    },
    {
      title: 'Total Orders',
      value: orders.length.toString(),
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      change: `Avg: LKR ${avgOrderValue.toLocaleString()}`,
      isPositive: true
    },
    {
      title: 'Completed Orders',
      value: completedCount.toString(),
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: `${orders.length > 0 ? ((completedCount / orders.length) * 100).toFixed(1) : 0}% completion rate`,
      isPositive: true
    }
  ];

  const COLORS = ['#9C27B0', '#2196F3', '#4CAF50', '#FF9800'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-lightGray border border-gray-700 p-3 rounded-lg shadow-lg">
          {payload.map((entry, index) => (
            <p key={index} className="text-white text-sm">
              <span className="font-semibold">{entry.name}:</span> LKR{' '}
              {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-lightGray border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-white text-sm font-semibold">{payload[0].name}</p>
          <p className="text-primary">LKR {payload[0].value.toLocaleString()}</p>
          <p className="text-textGray text-xs">{payload[0].payload.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Financial Overview</h2>
          <p className="text-textGray mt-2">Track revenue, wallet activity, and financial performance</p>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center space-x-2">
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    stat.isPositive ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-textGray text-sm">{stat.title}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Revenue by Service */}
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-6">Revenue by Service Type</h3>
          {revenueByService.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueByService}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueByService.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                {revenueByService.map((service, index) => (
              <div key={service.name} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{service.name}</p>
                  <p className="text-textGray text-xs">
                    LKR {service.value.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-textGray">
              <p>No completed orders yet. Revenue data will appear here once orders are completed.</p>
            </div>
          )}
        </div>

        {/* Wallet Overview Card */}
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-primary" />
            <span>Wallet Overview</span>
          </h3>

          {/* Wallet Stats */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-3 bg-darker rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <ArrowDownCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-textGray text-xs">Total Top-ups</p>
                  <p className="text-white font-semibold">LKR {totalWalletTopups.toLocaleString()}</p>
                </div>
              </div>
              <span className="text-green-500 text-xs bg-green-500/10 px-2 py-1 rounded">
                {walletTopupsCompleted.length} approved
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-darker rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <ArrowUpCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-textGray text-xs">Wallet Payments</p>
                  <p className="text-white font-semibold">LKR {totalWalletPayments.toLocaleString()}</p>
                </div>
              </div>
              <span className="text-red-500 text-xs bg-red-500/10 px-2 py-1 rounded">
                {walletPayments.length} transactions
              </span>
            </div>

            {totalWalletRefunds > 0 && (
              <div className="flex items-center justify-between p-3 bg-darker rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <ArrowDownCircle className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-textGray text-xs">Refunds</p>
                    <p className="text-white font-semibold">LKR {totalWalletRefunds.toLocaleString()}</p>
                  </div>
                </div>
                <span className="text-orange-500 text-xs bg-orange-500/10 px-2 py-1 rounded">
                  {walletRefunds.length} refunds
                </span>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-darker rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-textGray text-xs">Pending Top-ups</p>
                  <p className="text-white font-semibold">LKR {pendingTopupAmount.toLocaleString()}</p>
                </div>
              </div>
              <span className="text-yellow-500 text-xs bg-yellow-500/10 px-2 py-1 rounded">
                {pendingTopups.length} pending
              </span>
            </div>
          </div>

          {/* Net Balance */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-textGray text-sm">Net Wallet Circulation</p>
              <p className="text-xl font-bold text-primary">LKR {netWalletBalance.toLocaleString()}</p>
            </div>
            <p className="text-textGray text-xs mt-1">
              Total held across all customer wallets
            </p>
          </div>
        </div>
      </div>

      {/* Wallet Transactions Table */}
      {walletTransactions.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-primary" />
            <span>Recent Wallet Transactions</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-textGray font-medium py-3 px-4 text-sm">Date</th>
                  <th className="text-left text-textGray font-medium py-3 px-4 text-sm">Customer</th>
                  <th className="text-left text-textGray font-medium py-3 px-4 text-sm">Type</th>
                  <th className="text-left text-textGray font-medium py-3 px-4 text-sm">Reference</th>
                  <th className="text-right text-textGray font-medium py-3 px-4 text-sm">Amount</th>
                  <th className="text-right text-textGray font-medium py-3 px-4 text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {walletTransactions.slice(0, 15).map((tx) => (
                  <tr key={tx._id} className="border-b border-gray-800 hover:bg-darker transition-colors">
                    <td className="py-3 px-4 text-white text-sm">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-white text-sm">{tx.user?.name || 'Unknown'}</p>
                      <p className="text-textGray text-xs">{tx.user?.email || ''}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${
                        tx.type === 'topup'
                          ? 'bg-green-500/20 text-green-500'
                          : tx.type === 'refund'
                          ? 'bg-orange-500/20 text-orange-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-textGray text-sm">
                      {tx.reference || tx.order?.orderNumber || '—'}
                    </td>
                    <td className={`py-3 px-4 text-right font-semibold text-sm ${
                      tx.type === 'topup' || tx.type === 'refund' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {tx.type === 'topup' || tx.type === 'refund' ? '+' : '-'} LKR {(tx.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-1 text-xs rounded ${
                        tx.status === 'completed'
                          ? 'bg-green-500/20 text-green-500'
                          : tx.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-6">Recent Financial Activity</h3>
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-textGray font-medium py-3 px-4">Date</th>
                  <th className="text-left text-textGray font-medium py-3 px-4">Order ID</th>
                  <th className="text-left text-textGray font-medium py-3 px-4">Customer</th>
                  <th className="text-left text-textGray font-medium py-3 px-4">Service</th>
                  <th className="text-right text-textGray font-medium py-3 px-4">Amount</th>
                  <th className="text-right text-textGray font-medium py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr key={order._id} className="border-b border-gray-800 hover:bg-darker transition-colors">
                    <td className="py-3 px-4 text-white">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-white">{order.orderNumber}</td>
                    <td className="py-3 px-4 text-white">
                      {order.customer?.name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 text-white">
                      {order.service?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right text-green-500 font-semibold">
                      LKR {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-1 text-xs rounded ${
                        order.status === 'completed' 
                          ? 'bg-green-500/20 text-green-500'
                          : order.status === 'in_progress'
                          ? 'bg-blue-500/20 text-blue-500'
                          : order.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-gray-500/20 text-gray-500'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-textGray">
            <p>No orders yet. Financial activity will appear here once orders are created.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFinance;
