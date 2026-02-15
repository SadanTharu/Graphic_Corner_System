import { useState, useEffect } from 'react';
import { Package, Users, DollarSign, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { ordersAPI, usersAPI, servicesAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const AdminOverview = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, usersData, servicesData] = await Promise.all([
        ordersAPI.getAll(),
        usersAPI.getAll(),
        servicesAPI.getAll()
      ]);
      setOrders(ordersData);
      setUsers(usersData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'completed');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const teamMembers = users.filter(u => u.role === 'team').length;
  const customers = users.filter(u => u.role === 'customer').length;

  const stats = [
    {
      title: 'Active Orders',
      value: activeOrders.length,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+3 new'
    },
    {
      title: 'Total Revenue',
      value: `LKR ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      change: '+15%'
    },
    {
      title: 'Team Members',
      value: teamMembers,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      change: 'Active'
    },
    {
      title: 'Total Customers',
      value: customers,
      icon: TrendingUp,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      change: '+2 this week'
    }
  ];

  const recentOrders = orders.slice(0, 5);

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
        <h2 className="text-2xl md:text-3xl font-bold text-white">Admin Overview</h2>
        <p className="text-textGray mt-2">Monitor your business performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-xs text-textGray">{stat.change}</span>
              </div>
              <p className="text-textGray text-sm">{stat.title}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Recent Orders</h3>
          <span className="text-sm text-primary">View All →</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-textGray font-medium py-3 px-4">#</th>
                <th className="text-left text-textGray font-medium py-3 px-4">Customer</th>
                <th className="text-left text-textGray font-medium py-3 px-4">Service</th>
                <th className="text-left text-textGray font-medium py-3 px-4">Status</th>
                <th className="text-left text-textGray font-medium py-3 px-4">Amount</th>
                <th className="text-left text-textGray font-medium py-3 px-4">Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id} className="border-b border-gray-800 hover:bg-darker transition-colors">
                  <td className="py-3 px-4 text-white">#{order.orderNumber}</td>
                  <td className="py-3 px-4 text-white">{order.customer?.name || 'N/A'}</td>
                  <td className="py-3 px-4 text-textGray">{order.service?.name || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        order.status === 'completed'
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-primary/20 text-primary'
                      }`}
                    >
                      {order.status === 'completed' ? 'Completed' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-semibold">
                    LKR {order.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-textGray">
                    {order.assignedTo?.name || 'Unassigned'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card hover:scale-105 transition-transform cursor-pointer">
          <Clock className="w-8 h-8 text-primary mb-3" />
          <h4 className="text-white font-semibold mb-2">Pending Approvals</h4>
          <p className="text-textGray text-sm">
            {orders.filter(o => o.status === 'pending').length} orders waiting
          </p>
        </div>

        <div className="card hover:scale-105 transition-transform cursor-pointer">
          <Package className="w-8 h-8 text-blue-500 mb-3" />
          <h4 className="text-white font-semibold mb-2">In Progress</h4>
          <p className="text-textGray text-sm">
            {orders.filter(o => o.status === 'in_progress').length} active projects
          </p>
        </div>

        <div className="card hover:scale-105 transition-transform cursor-pointer">
          <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
          <h4 className="text-white font-semibold mb-2">This Month</h4>
          <p className="text-textGray text-sm">{completedOrders.length} completed orders</p>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
