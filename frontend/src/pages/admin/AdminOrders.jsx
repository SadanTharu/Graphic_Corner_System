import { useState, useEffect } from 'react';
import { ordersAPI, usersAPI } from '../../utils/api';
import { 
  Check, 
  X, 
  UserPlus, 
  Eye, 
  Loader2, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  DollarSign,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import StatusStepper from '../../components/StatusStepper';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [assignModal, setAssignModal] = useState({ isOpen: false, orderId: null });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      if (orders.length === 0) setLoading(true);
      const [ordersData, usersData] = await Promise.all([
        ordersAPI.getAll(),
        usersAPI.getTeam()
      ]);
      setOrders(ordersData);
      setTeamMembers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId) => {
    if (!confirm('Are you sure you want to approve this order?')) return;

    try {
      await ordersAPI.updateStatus(orderId, {
        status: 'awaiting_advance',
        currentStep: 2
      });
      toast.success('Order approved! Customer can now proceed with advance payment.');
      fetchData();
    } catch (error) {
      console.error('Error approving order:', error);
      toast.error('Failed to approve order');
    }
  };

  const handleReject = async (orderId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await ordersAPI.updateStatus(orderId, {
        status: 'cancelled',
        currentStep: 1
      });
      // Add note with rejection reason
      await ordersAPI.addNote(orderId, `Order rejected: ${reason}`);
      toast.success('Order rejected successfully');
      fetchData();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error('Failed to reject order');
    }
  };

  const handleAssign = async (orderId, teamMemberId) => {
    try {
      await ordersAPI.updateStatus(orderId, {
        assignedTo: teamMemberId,
        status: 'in_progress',
        currentStep: 3
      });
      toast.success('Order assigned successfully!');
      setAssignModal({ isOpen: false, orderId: null });
      fetchData();
    } catch (error) {
      console.error('Error assigning order:', error);
      toast.error('Failed to assign order');
    }
  };

  const handleVerifyPayment = async (orderId, paymentIndex, action) => {
    const confirmMsg = action === 'verify'
      ? 'Are you sure you want to verify this payment?'
      : 'Are you sure you want to reject this payment?';
    if (!confirm(confirmMsg)) return;

    try {
      await ordersAPI.verifyPayment(orderId, paymentIndex, action);
      toast.success(`Payment ${action === 'verify' ? 'verified' : 'rejected'} successfully!`);
      fetchData();
      // Refresh selected order if it's the same
      if (selectedOrder?._id === orderId) {
        const updated = await ordersAPI.getById(orderId);
        setSelectedOrder(updated);
      }
    } catch (error) {
      console.error(`Error ${action}ing payment:`, error);
      toast.error(`Failed to ${action} payment`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'awaiting_advance':
      case 'awaiting_final':
        return 'bg-orange-500/20 text-orange-500';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-500';
      case 'review':
        return 'bg-purple-500/20 text-purple-500';
      case 'completed':
        return 'bg-green-500/20 text-green-500';
      case 'cancelled':
      case 'revision_requested':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'in_progress':
      case 'review':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    awaiting_advance: orders.filter(o => o.status === 'awaiting_advance').length,
    in_progress: orders.filter(o => o.status === 'in_progress').length,
    review: orders.filter(o => o.status === 'review').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
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
          <h2 className="text-2xl md:text-3xl font-bold text-white">Orders Management</h2>
          <p className="text-textGray mt-2">Review, approve, and manage customer orders</p>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center space-x-2">
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { key: 'all', label: 'All Orders', count: statusCounts.all },
          { key: 'pending', label: 'Pending', count: statusCounts.pending },
          { key: 'awaiting_advance', label: 'Awaiting Payment', count: statusCounts.awaiting_advance },
          { key: 'in_progress', label: 'In Progress', count: statusCounts.in_progress },
          { key: 'review', label: 'Review', count: statusCounts.review },
          { key: 'completed', label: 'Completed', count: statusCounts.completed },
          { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled }
        ].map(stat => (
          <button
            key={stat.key}
            onClick={() => setFilterStatus(stat.key)}
            className={`card text-center transition-all ${
              filterStatus === stat.key ? 'ring-2 ring-primary' : ''
            }`}
          >
            <p className="text-textGray text-xs mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.count}</p>
          </button>
        ))}
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
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {order.service?.name || 'Service'}
                    </h3>
                    <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span>{order.status.replace('_', ' ').toUpperCase()}</span>
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-textGray">
                    <p>Order #{order.orderNumber}</p>
                    <p>Customer: <span className="text-white">{order.customer?.name || 'N/A'}</span></p>
                    <p>Amount: <span className="text-primary font-semibold">LKR {order.totalAmount.toLocaleString()}</span></p>
                    <p>Created: {new Date(order.createdAt).toLocaleDateString()}</p>
                    {order.assignedTo && (
                      <p>Assigned to: <span className="text-blue-500">{order.assignedTo.name}</span></p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4 lg:mt-0">
                  {/* Pending Orders - Show Approve/Reject */}
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(order._id)}
                        className="bg-green-500/20 text-green-500 hover:bg-green-500/30 px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                      >
                        <Check size={18} />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(order._id)}
                        className="bg-red-500/20 text-red-500 hover:bg-red-500/30 px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                      >
                        <X size={18} />
                        <span>Reject</span>
                      </button>
                    </>
                  )}

                  {/* Awaiting Advance - Show Assign if not assigned */}
                  {(order.status === 'awaiting_advance' || order.status === 'in_progress') && !order.assignedTo && (
                    <button
                      onClick={() => setAssignModal({ isOpen: true, orderId: order._id })}
                      className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                    >
                      <UserPlus size={18} />
                      <span>Assign Team</span>
                    </button>
                  )}

                  {/* Payment Verification - Show for orders with pending payments */}
                  {order.payments?.some(p => p.status === 'pending') && (
                    <div className="flex items-center space-x-2">
                      {order.payments.map((payment, pIdx) =>
                        payment.status === 'pending' ? (
                          <div key={pIdx} className="flex items-center space-x-1">
                            <span className="text-yellow-500 text-xs font-medium">
                              {payment.type} - LKR {payment.amount?.toLocaleString()}
                            </span>
                            {payment.slip && (
                              <button
                                onClick={() => window.open(payment.slip, '_blank')}
                                className="p-1 hover:bg-blue-500/20 rounded"
                                title="View slip"
                              >
                                <ExternalLink size={14} className="text-blue-500" />
                              </button>
                            )}
                            <button
                              onClick={() => handleVerifyPayment(order._id, pIdx, 'verify')}
                              className="bg-green-500/20 text-green-500 hover:bg-green-500/30 px-2 py-1 rounded text-xs font-medium"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleVerifyPayment(order._id, pIdx, 'reject')}
                              className="bg-red-500/20 text-red-500 hover:bg-red-500/30 px-2 py-1 rounded text-xs font-medium"
                            >
                              Reject
                            </button>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Eye size={18} />
                    <span>View Details</span>
                  </button>
                </div>
              </div>

              {order.requirements && (
                <div className="mt-4 p-3 bg-darker rounded-lg">
                  <p className="text-textGray text-sm">
                    <span className="font-semibold text-white">Requirements:</span> {order.requirements}
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
                  <p className="text-textGray text-sm">Customer</p>
                  <p className="text-white font-semibold">{selectedOrder.customer?.name}</p>
                  <p className="text-textGray text-xs">{selectedOrder.customer?.email}</p>
                </div>
                <div>
                  <p className="text-textGray text-sm">Assigned To</p>
                  <p className="text-white font-semibold">
                    {selectedOrder.assignedTo?.name || 'Not assigned'}
                  </p>
                </div>
                <div>
                  <p className="text-textGray text-sm">Order Date</p>
                  <p className="text-white font-semibold">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-textGray text-sm">Status</p>
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span>{selectedOrder.status.replace('_', ' ').toUpperCase()}</span>
                  </span>
                </div>
                <div>
                  <p className="text-textGray text-sm">Total Amount</p>
                  <p className="text-primary font-bold text-lg">
                    LKR {selectedOrder.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-textGray text-sm">Advance Amount (25%)</p>
                  <p className="text-white font-semibold">
                    LKR {selectedOrder.advanceAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedOrder.requirements && (
                <div className="bg-darker p-4 rounded-lg">
                  <p className="text-textGray text-sm font-semibold mb-2">Requirements</p>
                  <p className="text-white">{selectedOrder.requirements}</p>
                </div>
              )}

              {/* Progress Stepper */}
              <div className="bg-darker p-6 rounded-lg">
                <h4 className="text-lg font-bold text-white mb-4">Order Progress</h4>
                <StatusStepper order={selectedOrder} orientation="vertical" />
              </div>

              {/* Payments Section */}
              {selectedOrder.payments?.length > 0 && (
                <div className="bg-darker p-6 rounded-lg">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                    <DollarSign size={20} className="text-primary" />
                    <span>Payments</span>
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.payments.map((payment, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-lightGray rounded-lg">
                        <div>
                          <p className="text-white font-medium capitalize">{payment.type} Payment</p>
                          <p className="text-textGray text-sm">LKR {payment.amount?.toLocaleString()}</p>
                          <p className="text-textGray text-xs">{new Date(payment.date).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {payment.slip && (
                            <button
                              onClick={() => window.open(payment.slip, '_blank')}
                              className="text-blue-500 text-sm hover:underline flex items-center space-x-1"
                            >
                              <ExternalLink size={14} />
                              <span>View Slip</span>
                            </button>
                          )}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            payment.status === 'verified' ? 'bg-green-500/20 text-green-500' :
                            payment.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                            'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {payment.status}
                          </span>
                          {payment.status === 'pending' && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleVerifyPayment(selectedOrder._id, idx, 'verify')}
                                className="bg-green-500/20 text-green-500 hover:bg-green-500/30 px-3 py-1 rounded text-xs font-medium"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => handleVerifyPayment(selectedOrder._id, idx, 'reject')}
                                className="bg-red-500/20 text-red-500 hover:bg-red-500/30 px-3 py-1 rounded text-xs font-medium"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {selectedOrder.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedOrder._id);
                        setSelectedOrder(null);
                      }}
                      className="bg-green-500/20 text-green-500 hover:bg-green-500/30 px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                    >
                      <Check size={18} />
                      <span>Approve Order</span>
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedOrder._id);
                        setSelectedOrder(null);
                      }}
                      className="bg-red-500/20 text-red-500 hover:bg-red-500/30 px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                    >
                      <X size={18} />
                      <span>Reject Order</span>
                    </button>
                  </>
                )}
                {(selectedOrder.status === 'awaiting_advance' || selectedOrder.status === 'in_progress') && !selectedOrder.assignedTo && (
                  <button
                    onClick={() => {
                      setAssignModal({ isOpen: true, orderId: selectedOrder._id });
                      setSelectedOrder(null);
                    }}
                    className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                  >
                    <UserPlus size={18} />
                    <span>Assign to Team</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Team Modal */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-lightGray rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Assign to Team Member</h3>
            </div>
            <div className="p-6 space-y-3">
              {teamMembers.length === 0 ? (
                <p className="text-textGray text-center py-4">No team members available</p>
              ) : (
                teamMembers.map((member) => (
                  <button
                    key={member._id}
                    onClick={() => handleAssign(assignModal.orderId, member._id)}
                    className="w-full flex items-center space-x-3 p-4 bg-darker hover:bg-dark rounded-lg transition-colors"
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">{member.name}</p>
                      <p className="text-textGray text-sm">{member.specialty || 'Team Member'}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="p-6 border-t border-gray-700">
              <button
                onClick={() => setAssignModal({ isOpen: false, orderId: null })}
                className="w-full btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
