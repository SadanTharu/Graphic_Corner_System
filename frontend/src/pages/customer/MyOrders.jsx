import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOrdersByCustomerId } from '../../data';
import StatusStepper from '../../components/StatusStepper';
import { Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const orders = getOrdersByCustomerId(user.id);

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return order.status !== 'completed';
    if (filterStatus === 'completed') return order.status === 'completed';
    return true;
  });

  const handleUploadPayment = () => {
    toast.success('Payment upload feature coming soon!');
  };

  const handleRequestRevision = () => {
    toast.success('Revision requested successfully!');
  };

  const handleApprove = () => {
    toast.success('Work approved! Moving to next step.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
            Active ({orders.filter(o => o.status !== 'completed').length})
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
            <div key={order.id} className="card">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{order.serviceName}</h3>
                  <p className="text-textGray text-sm mt-1">
                    Order #{order.id} • Placed on {order.orderDate}
                  </p>
                  {order.assignedTeamName && (
                    <p className="text-textGray text-sm">
                      Assigned to: <span className="text-primary">{order.assignedTeamName}</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-3 mt-3 lg:mt-0">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'completed'
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {order.status === 'completed' ? 'Completed' : 'In Progress'}
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
                  <p className="text-textGray text-sm">Expected Delivery</p>
                  <p className="text-white font-semibold">{order.expectedDelivery}</p>
                </div>
                <div>
                  <p className="text-textGray text-sm">Progress</p>
                  <p className="text-white font-semibold">
                    {order.currentStep} of {order.totalSteps} steps
                  </p>
                </div>
              </div>

              {order.notes && (
                <div className="mt-4 p-3 bg-darker rounded-lg">
                  <p className="text-textGray text-sm">
                    <span className="font-semibold">Notes:</span> {order.notes}
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
                <h3 className="text-2xl font-bold text-white">{selectedOrder.serviceName}</h3>
                <p className="text-textGray text-sm mt-1">Order #{selectedOrder.id}</p>
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
                  <p className="text-white font-semibold">{selectedOrder.orderDate}</p>
                </div>
                <div>
                  <p className="text-textGray text-sm">Expected Delivery</p>
                  <p className="text-white font-semibold">{selectedOrder.expectedDelivery}</p>
                </div>
                <div>
                  <p className="text-textGray text-sm">Total Amount</p>
                  <p className="text-white font-semibold">LKR {selectedOrder.totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-textGray text-sm">Status</p>
                  <p className="text-primary font-semibold capitalize">
                    {selectedOrder.status.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Progress Stepper */}
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

              {/* Files */}
              {(selectedOrder.files?.watermark || selectedOrder.files?.finalLink) && (
                <div className="bg-darker p-6 rounded-lg">
                  <h4 className="text-lg font-bold text-white mb-4">Files</h4>
                  <div className="space-y-3">
                    {selectedOrder.files.watermark && (
                      <a
                        href={selectedOrder.files.watermark}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-lightGray rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <span className="text-white">Preview / Watermark</span>
                        <Eye size={18} className="text-primary" />
                      </a>
                    )}
                    {selectedOrder.files.finalLink && (
                      <a
                        href={selectedOrder.files.finalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-lightGray rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <span className="text-white">Final Files</span>
                        <Eye size={18} className="text-green-500" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
