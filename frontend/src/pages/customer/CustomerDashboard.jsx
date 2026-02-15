import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Wallet, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getOrdersByCustomerId } from '../../data';
import StatusStepper from '../../components/StatusStepper';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { wallet } = useCart();
  const orders = getOrdersByCustomerId(user.id);

  const activeOrders = orders.filter(o => o.status !== 'completed');
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  const stats = [
    {
      title: 'Active Orders',
      value: activeOrders.length,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Completed',
      value: completedOrders.length,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Wallet Balance',
      value: `LKR ${wallet.toLocaleString()}`,
      icon: Wallet,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Total Spent',
      value: `LKR ${totalSpent.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-textGray text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/dashboard/new-request" className="btn-primary text-center">
            New Request
          </Link>
          <Link to="/dashboard/my-orders" className="btn-secondary text-center">
            View All Orders
          </Link>
          <Link to="/dashboard/wallet" className="btn-secondary text-center">
            Manage Wallet
          </Link>
        </div>
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-6">Active Orders</h3>
          <div className="space-y-6">
            {activeOrders.map((order) => (
              <div key={order.id} className="bg-darker p-6 rounded-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{order.serviceName}</h4>
                    <p className="text-textGray text-sm mt-1">
                      Order #{order.id} • Due: {order.expectedDelivery}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                      In Progress
                    </span>
                  </div>
                </div>

                <StatusStepper
                  order={order}
                  onUploadPayment={() => console.log('Upload payment')}
                  onRequestRevision={() => console.log('Request revision')}
                  onApprove={() => console.log('Approve work')}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Completed Orders */}
      {completedOrders.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-white mb-4">Recent Completed Orders</h3>
          <div className="space-y-3">
            {completedOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-darker rounded-lg">
                <div>
                  <p className="text-white font-medium">{order.serviceName}</p>
                  <p className="text-textGray text-sm">Completed on {order.completedDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-500 font-semibold">LKR {order.totalAmount.toLocaleString()}</p>
                  {order.rating && (
                    <div className="flex items-center justify-end mt-1">
                      <span className="text-yellow-500 text-sm">★ {order.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {completedOrders.length > 3 && (
            <Link
              to="/dashboard/my-orders"
              className="block text-center text-primary hover:text-red-400 mt-4 text-sm font-medium"
            >
              View All Completed Orders →
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
