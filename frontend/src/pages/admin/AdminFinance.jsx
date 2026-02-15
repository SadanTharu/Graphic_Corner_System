import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Clock, Target, Loader2 } from 'lucide-react';
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
import { ordersAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const AdminFinance = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersAPI.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  const stats = [
    {
      title: 'Total Revenue',
      value: `LKR ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      change: '+12.5%',
      isPositive: true
    },
    {
      title: 'Pending Payments',
      value: `LKR ${pendingPayments.toLocaleString()}`,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      change: '-5.2%',
      isPositive: true
    },
    {
      title: 'Total Orders',
      value: orders.length.toString(),
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      change: '+2.1%',
      isPositive: true
    },
    {
      title: 'Completed Orders',
      value: orders.filter(o => o.status === 'completed').length.toString(),
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '83.3%',
      isPositive: false
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
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">Financial Overview</h2>
        <p className="text-textGray mt-2">Track revenue and financial performance from completed orders</p>
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
      <div className="grid grid-cols-1 gap-6">
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
      </div>

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
