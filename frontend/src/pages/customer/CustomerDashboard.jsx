import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Wallet, TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ordersAPI, walletAPI } from '../../utils/api';
import StatusStepper from '../../components/StatusStepper';
import PaymentUploadModal from '../../components/PaymentUploadModal';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { wallet, setWalletBalance } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setLocalWalletBalance] = useState(0);
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    type: null,
    amount: 0,
    orderId: null
  });

  useEffect(() => {
    fetchOrders();
    
    // Auto-refresh orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [data, walletData] = await Promise.all([
        ordersAPI.getAll(),
        walletAPI.getBalance().catch(() => ({ balance: 0 }))
      ]);
      setOrders(data);
      const bal = walletData?.balance || walletData?.walletBalance || 0;
      setLocalWalletBalance(bal);
      setWalletBalance(bal);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPayment = async (orderId, paymentType) => {
    const order = orders.find(o => o._id === orderId);
    if (!order) return;

    const amount = paymentType === 'advance' ? order.advanceAmount : order.totalAmount - order.advanceAmount;

    setPaymentModal({
      isOpen: true,
      type: paymentType,
      amount: amount,
      orderId: orderId
    });
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      await ordersAPI.uploadPayment(paymentModal.orderId, {
        type: paymentModal.type,
        amount: paymentModal.amount,
        slip: paymentData.slip,
        reference: paymentData.reference
      });

      toast.success('Payment uploaded successfully! Awaiting admin approval.');
      
      // Close modal and refresh orders
      setPaymentModal({ isOpen: false, type: null, amount: 0, orderId: null });
      fetchOrders();
    } catch (error) {
      console.error('Payment upload error:', error);
      toast.error(error.message || 'Failed to upload payment');
      throw error;
    }
  };

  const handleWalletPay = async () => {
    try {
      const result = await ordersAPI.walletPay(paymentModal.orderId, paymentModal.type);
      // Update wallet balance from server response
      if (result?.newBalance !== undefined) {
        setLocalWalletBalance(result.newBalance);
        setWalletBalance(result.newBalance);
      }
      toast.success('Payment completed from wallet!');
      setPaymentModal({ isOpen: false, type: null, amount: 0, orderId: null });
      fetchOrders();
    } catch (error) {
      console.error('Wallet payment error:', error);
      throw error;
    }
  };

  const handleRequestRevision = async (orderId, reason) => {
    try {
      await ordersAPI.requestRevision(orderId, reason);
      toast.success('Revision request submitted successfully!');
      fetchOrders();
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast.error('Failed to request revision');
    }
  };

  const handleApprove = async (orderId) => {
    try {
      await ordersAPI.approveWork(orderId);
      toast.success('Work approved! You can now proceed with final payment.');
      fetchOrders();
    } catch (error) {
      console.error('Error approving work:', error);
      toast.error('Failed to approve work');
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
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
      value: `LKR ${walletBalance.toLocaleString()}`,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

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
              <div key={order._id} className="bg-darker p-6 rounded-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{order.service?.name || 'Service'}</h4>
                    <p className="text-textGray text-sm mt-1">
                      Order #{order.orderNumber} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                      order.status === 'completed'
                        ? 'bg-green-500/20 text-green-500'
                        : order.status === 'cancelled'
                        ? 'bg-red-500/20 text-red-500'
                        : order.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : order.status === 'awaiting_advance' || order.status === 'awaiting_final'
                        ? 'bg-orange-500/20 text-orange-500'
                        : order.status === 'review'
                        ? 'bg-purple-500/20 text-purple-500'
                        : 'bg-blue-500/20 text-blue-500'
                    }`}>
                      {order.status === 'completed' 
                        ? 'Completed' 
                        : order.status === 'cancelled'
                        ? 'Cancelled'
                        : order.status === 'pending'
                        ? 'Pending Approval'
                        : order.status === 'awaiting_advance'
                        ? 'Awaiting Advance'
                        : order.status === 'awaiting_final'
                        ? 'Awaiting Final'
                        : order.status === 'in_progress'
                        ? 'In Progress'
                        : order.status === 'review'
                        ? 'Under Review'
                        : order.status === 'revision_requested'
                        ? 'Revision Requested'
                        : order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.replace('_', ' ').slice(1)
                      }
                    </span>
                  </div>
                </div>

                <StatusStepper
                  order={order}
                  onUploadPayment={handleUploadPayment}
                  onRequestRevision={handleRequestRevision}
                  onApprove={handleApprove}
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
              <div key={order._id} className="flex items-center justify-between p-4 bg-darker rounded-lg">
                <div>
                  <p className="text-white font-medium">{order.service?.name || 'Service'}</p>
                  <p className="text-textGray text-sm">Completed on {new Date(order.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-500 font-semibold">LKR {order.totalAmount.toLocaleString()}</p>
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

      {/* Payment Upload Modal */}
      <PaymentUploadModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, type: null, amount: 0, orderId: null })}
        onSubmit={handlePaymentSubmit}
        paymentDetails={{
          type: paymentModal.type,
          amount: paymentModal.amount
        }}
        walletBalance={walletBalance}
        onWalletPay={handleWalletPay}
      />
    </div>
  );
};

export default CustomerDashboard;
