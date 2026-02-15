import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ordersAPI, walletAPI } from '../../utils/api';
import StatusStepper from '../../components/StatusStepper';
import PaymentUploadModal from '../../components/PaymentUploadModal';
import { Eye, X, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const ensureUrl = (url) => {
  if (!url) return '#';
  return /^https?:\/\//i.test(url) ? url : 'https://' + url;
};

const MyOrders = () => {
  const { user } = useAuth();
  const { wallet, setWalletBalance } = useCart();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
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
    
    // Auto-refresh orders every 30 seconds to catch status changes
    const interval = setInterval(fetchOrders, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const [ordersData, walletData] = await Promise.all([
        ordersAPI.getAll(),
        walletAPI.getBalance().catch(() => ({ balance: 0 }))
      ]);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
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
      
      // Refresh selected order if viewing details
      if (selectedOrder && selectedOrder._id === paymentModal.orderId) {
        const updatedOrder = await ordersAPI.getById(paymentModal.orderId);
        setSelectedOrder(updatedOrder);
      }
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
      
      if (selectedOrder && selectedOrder._id === paymentModal.orderId) {
        const updatedOrder = await ordersAPI.getById(paymentModal.orderId);
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Wallet payment error:', error);
      throw error;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return order.status !== 'completed' && order.status !== 'cancelled';
    if (filterStatus === 'completed') return order.status === 'completed';
    if (filterStatus === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  const handleRequestRevision = async (orderId, reason) => {
    try {
      await ordersAPI.requestRevision(orderId, reason);

      toast.success('Revision requested successfully!');
      fetchOrders();
      
      // Update selected order if viewing details
      if (selectedOrder && selectedOrder._id === orderId) {
        const updatedOrder = await ordersAPI.getById(orderId);
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast.error('Failed to request revision');
    }
  };

  const handleApprove = async (orderId) => {
    try {
      await ordersAPI.approveWork(orderId);

      toast.success('Work approved! Moving to final payment.');
      fetchOrders();
      
      // Update selected order if viewing details
      if (selectedOrder && selectedOrder._id === orderId) {
        const updatedOrder = await ordersAPI.getById(orderId);
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Error approving work:', error);
      toast.error('Failed to approve work');
    }
  };

  return (
    <div className="space-y-6">{/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">My Orders</h2>
          <p className="text-textGray mt-2">Track and manage your orders</p>
        </div>

        {/* Filter */}
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-primary text-white'
                : 'bg-lightGray text-textGray hover:text-white'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === 'active'
                ? 'bg-primary text-white'
                : 'bg-lightGray text-textGray hover:text-white'
            }`}
          >
            Active ({orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === 'completed'
                ? 'bg-primary text-white'
                : 'bg-lightGray text-textGray hover:text-white'
            }`}
          >
            Completed ({orders.filter(o => o.status === 'completed').length})
          </button>
          <button
            onClick={() => setFilterStatus('cancelled')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterStatus === 'cancelled'
                ? 'bg-red-500 text-white'
                : 'bg-lightGray text-textGray hover:text-white'
            }`}
          >
            Cancelled ({orders.filter(o => o.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-textGray">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="card">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{order.service?.name || 'Service'}</h3>
                  <p className="text-textGray text-sm mt-1">
                    Order #{order.orderNumber} • Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-3 mt-3 lg:mt-0">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                      ? 'Awaiting Advance Payment'
                      : order.status === 'awaiting_final'
                      ? 'Awaiting Final Payment'
                      : order.status === 'in_progress'
                      ? 'In Progress'
                      : order.status === 'review'
                      ? 'Under Review'
                      : order.status === 'revision_requested'
                      ? 'Revision Requested'
                      : order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.replace('_', ' ').slice(1)
                    }
                  </span>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Eye size={18} />
                    <span>Details</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-darker rounded-lg">
                <div>
                  <p className="text-textGray text-sm">Total Amount</p>
                  <p className="text-white font-semibold text-lg">
                    LKR {order.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-textGray text-sm">Created</p>
                  <p className="text-white font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-textGray text-sm">Progress</p>
                  <p className="text-white font-semibold">
                    Step {order.currentStep || 1} of 6
                  </p>
                </div>
              </div>

              {order.requirements && (
                <div className="mt-4 p-3 bg-darker rounded-lg">
                  <p className="text-textGray text-sm">
                    <span className="font-semibold">Requirements:</span> {order.requirements}
                  </p>
                </div>
              )}

              {/* Final Link in List */}
              {order.status === 'completed' && order.files?.final?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {order.files.final.map((link, idx) => (
                    <a
                      key={idx}
                      href={ensureUrl(link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between w-full px-4 py-3 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 text-green-400 hover:text-green-300 rounded-lg font-semibold transition-all group"
                    >
                      <span className="flex items-center space-x-2">
                        <ExternalLink size={18} />
                        <span>Download Final File {order.files.final.length > 1 ? `#${idx + 1}` : ''}</span>
                      </span>
                      <span className="text-xs text-green-500/60 group-hover:text-green-400">Open Link →</span>
                    </a>
                  ))}
                </div>
              )}

              {/* Cancellation Notice */}
              {order.status === 'cancelled' && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-500 text-sm font-semibold">
                    ⚠️ This order has been cancelled
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-lightGray rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-lightGray border-b border-gray-700 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedOrder.service?.name || 'Service'}</h3>
                <p className="text-textGray text-sm mt-1">Order #{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-darker rounded-lg transition-colors"
              >
                <X size={24} className="text-textGray" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-textGray text-sm">Order Date</p>
                  <p className="text-white font-semibold">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-textGray text-sm">Last Updated</p>
                  <p className="text-white font-semibold">{new Date(selectedOrder.updatedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-textGray text-sm">Total Amount</p>
                  <p className="text-white font-semibold">LKR {selectedOrder.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-textGray text-sm">Status</p>
                  <p className={`font-semibold capitalize ${
                    selectedOrder.status === 'cancelled' ? 'text-red-500' :
                    selectedOrder.status === 'completed' ? 'text-green-500' :
                    'text-primary'
                  }`}>
                    {selectedOrder.status.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Cancellation Notice */}
              {selectedOrder.status === 'cancelled' && (
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                  <h4 className="text-red-500 font-bold mb-2">⚠️ Order Cancelled</h4>
                  <p className="text-textGray text-sm">
                    This order has been cancelled by the admin.
                    {selectedOrder.notes && selectedOrder.notes.length > 0 && (
                      <span className="block mt-2 text-white">
                        <strong>Reason:</strong> {selectedOrder.notes[selectedOrder.notes.length - 1]?.message || 'No reason provided'}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Progress Stepper */}
              {selectedOrder.status !== 'cancelled' && (
                <div className="bg-darker p-6 rounded-lg">
                  <h4 className="text-lg font-bold text-white mb-4">Order Progress</h4>
                  <StatusStepper
                    order={selectedOrder}
                    orientation="vertical"
                    onUploadPayment={handleUploadPayment}
                    onRequestRevision={handleRequestRevision}
                    onApprove={handleApprove}
                  />
                </div>
              )}

              {/* Final Deliverables - Prominent Banner */}
              {selectedOrder.status === 'completed' && selectedOrder.files?.final?.length > 0 && (
                <div className="bg-green-500/10 border-2 border-green-500/40 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </div>
                    <div>
                      <h4 className="text-green-400 font-bold text-lg">Your Files Are Ready!</h4>
                      <p className="text-textGray text-sm">Click to download your final deliverables</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {selectedOrder.files.final.map((link, idx) => (
                      <a
                        key={idx}
                        href={ensureUrl(link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 rounded-lg font-semibold transition-all group"
                      >
                        <span className="flex items-center space-x-2">
                          <Eye size={18} />
                          <span>Download Final File {selectedOrder.files.final.length > 1 ? `#${idx + 1}` : ''}</span>
                        </span>
                        <span className="text-xs text-green-500/60 group-hover:text-green-400">Open Link →</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {(selectedOrder.files?.watermark?.length > 0 || (selectedOrder.files?.final?.length > 0 && selectedOrder.status !== 'completed')) && (
                <div className="bg-darker p-6 rounded-lg">
                  <h4 className="text-lg font-bold text-white mb-4">Files</h4>
                  <div className="space-y-3">
                    {selectedOrder.files.watermark?.length > 0 && (
                      <div>
                        <p className="text-textGray text-sm mb-2">Preview / Watermark</p>
                        {selectedOrder.files.watermark.map((link, idx) => (
                          <a
                            key={idx}
                            href={ensureUrl(link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-lightGray rounded-lg hover:bg-gray-700 transition-colors mb-2"
                          >
                            <span className="text-white text-sm">Preview Link {selectedOrder.files.watermark.length > 1 ? `#${idx + 1}` : ''}</span>
                            <Eye size={18} className="text-primary" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
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

export default MyOrders;
