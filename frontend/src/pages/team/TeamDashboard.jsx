import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tasksAPI, ordersAPI } from '../../utils/api';
import { Loader2, RefreshCw, Download, Link as LinkIcon, Eye, Edit3, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const ensureUrl = (url) => {
  if (!url) return '#';
  return /^https?:\/\//i.test(url) ? url : 'https://' + url;
};

// Kanban columns mapped to order statuses
const kanbanColumns = [
  { key: 'awaiting_advance', label: 'Awaiting Advance', color: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  { key: 'in_progress', label: 'In Progress', color: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  { key: 'review', label: 'Under Review', color: 'border-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  { key: 'revision_requested', label: 'Revision Requested', color: 'border-red-500', bg: 'bg-red-500/10', text: 'text-red-400' },
  { key: 'awaiting_final', label: 'Awaiting Final', color: 'border-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  { key: 'completed', label: 'Completed', color: 'border-green-500', bg: 'bg-green-500/10', text: 'text-green-400' },
];

const TeamDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [linkModal, setLinkModal] = useState({ isOpen: false, orderId: null, type: null, isUpdate: false });
  const [linkValue, setLinkValue] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      if (tasks.length === 0 && orders.length === 0) setLoading(true);
      const [tasksData, ordersData] = await Promise.all([
        tasksAPI.getAll(),
        ordersAPI.getAll()
      ]);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      const myOrders = (Array.isArray(ordersData) ? ordersData : []).filter(o =>
        o.assignedTo?._id === user?._id || o.assignedTo === user?._id
      );
      setOrders(myOrders);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadRaw = (order) => {
    if (order.files?.raw?.length > 0) {
      order.files.raw.forEach(url => window.open(url, '_blank'));
      toast.success('Opening raw files...');
    } else {
      toast.error('No raw files available');
    }
  };

  const handleSubmitLink = async () => {
    const { orderId, type, isUpdate } = linkModal;
    if (!linkValue.trim()) {
      toast.error('Please enter a link');
      return;
    }

    setUploading(prev => ({ ...prev, [orderId]: type }));
    try {
      await ordersAPI.uploadFiles(orderId, {
        fileType: type,
        urls: [linkValue.trim()],
        replace: isUpdate || false
      });

      const label = type === 'watermark' ? 'Preview' : 'Final';
      toast.success(`${label} link ${isUpdate ? 'updated' : 'submitted'}! Customer will be notified.`);
      setLinkModal({ isOpen: false, orderId: null, type: null, isUpdate: false });
      setLinkValue('');
      fetchData();
    } catch (error) {
      console.error(`Error submitting ${type} link:`, error);
      toast.error(error.message || `Failed to submit ${type} link`);
    } finally {
      setUploading(prev => ({ ...prev, [orderId]: null }));
    }
  };

  const completedToday = [...tasks, ...orders].filter(item => {
    const completed = item.completedAt || (item.status === 'completed' && item.updatedAt);
    if (!completed) return false;
    const today = new Date();
    const completedDate = new Date(completed);
    return completedDate.toDateString() === today.toDateString();
  }).length;

  const totalEarnings = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

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
          <h2 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h2>
          <p className="text-textGray mt-2">Welcome back, {user?.name}</p>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center space-x-2">
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-textGray text-sm mb-2">Active Orders</p>
          <p className="text-3xl font-bold text-primary">{orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length}</p>
        </div>
        <div className="card">
          <p className="text-textGray text-sm mb-2">Active Tasks</p>
          <p className="text-3xl font-bold text-blue-500">{tasks.filter(t => t.status !== 'done').length}</p>
          <Link to="/team/tasks" className="text-primary text-xs hover:underline mt-1 inline-block">View Tasks →</Link>
        </div>
        <div className="card">
          <p className="text-textGray text-sm mb-2">Completed Today</p>
          <p className="text-3xl font-bold text-green-500">{completedToday}</p>
        </div>
        <div className="card">
          <p className="text-textGray text-sm mb-2">Total Completed</p>
          <p className="text-3xl font-bold text-yellow-500">
            {orders.filter(o => o.status === 'completed').length + tasks.filter(t => t.status === 'done').length}
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Order Timeline</h3>
        {orders.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-textGray">No orders assigned yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
            {kanbanColumns.map((col) => {
              const columnOrders = orders.filter(o => o.status === col.key);
              return (
                <div key={col.key} className={`rounded-xl border-t-4 ${col.color} bg-darker p-3 min-h-[200px]`}>
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-sm font-bold ${col.text}`}>{col.label}</h4>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${col.bg} ${col.text}`}>
                      {columnOrders.length}
                    </span>
                  </div>

                  {/* Order Cards */}
                  <div className="space-y-2">
                    {columnOrders.length === 0 ? (
                      <p className="text-textGray text-xs text-center py-4">No orders</p>
                    ) : (
                      columnOrders.map(order => (
                        <div
                          key={order._id}
                          onClick={() => setSelectedOrder(order)}
                          className="bg-lightGray rounded-lg p-3 cursor-pointer hover:ring-1 hover:ring-primary/50 transition-all"
                        >
                          <p className="text-white text-sm font-semibold truncate">{order.service?.name || 'Service'}</p>
                          <p className="text-textGray text-xs mt-1">#{order.orderNumber}</p>
                          <p className="text-textGray text-xs">{order.customer?.name || 'Customer'}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-primary text-xs font-semibold">LKR {order.totalAmount?.toLocaleString()}</span>
                            <span className="text-textGray text-xs">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                          {/* File indicators */}
                          <div className="flex items-center space-x-2 mt-2">
                            {order.files?.watermark?.length > 0 && (
                              <span className="text-xs bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">Preview ✓</span>
                            )}
                            {order.files?.final?.length > 0 && (
                              <span className="text-xs bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded">Final ✓</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-lightGray rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-lightGray border-b border-gray-700 p-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedOrder.service?.name || 'Service'}</h3>
                <p className="text-textGray text-sm">Order #{selectedOrder.orderNumber}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-darker rounded-lg transition-colors">
                <span className="text-textGray text-xl">✕</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-textGray text-xs">Customer</p>
                  <p className="text-white font-semibold text-sm">{selectedOrder.customer?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-textGray text-xs">Amount</p>
                  <p className="text-primary font-semibold text-sm">LKR {selectedOrder.totalAmount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-textGray text-xs">Created</p>
                  <p className="text-white text-sm">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-textGray text-xs">Status</p>
                  <p className="text-white text-sm capitalize">{selectedOrder.status?.replace(/_/g, ' ')}</p>
                </div>
              </div>

              {/* Requirements */}
              {selectedOrder.requirements && (
                <div className="bg-darker p-3 rounded-lg">
                  <p className="text-textGray text-xs font-semibold mb-1">Requirements</p>
                  <p className="text-white text-sm">{selectedOrder.requirements}</p>
                </div>
              )}

              {/* Revision Notes */}
              {selectedOrder.status === 'revision_requested' && selectedOrder.revisions?.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                  <p className="text-red-400 text-sm font-semibold mb-1">Revision Requested:</p>
                  <p className="text-textGray text-sm">
                    {selectedOrder.revisions[selectedOrder.revisions.length - 1].reason}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleDownloadRaw(selectedOrder)}
                  className={`btn-secondary flex items-center justify-center space-x-2 text-sm ${
                    !selectedOrder.files?.raw?.length ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={!selectedOrder.files?.raw?.length}
                >
                  <Download size={16} />
                  <span>Download Raw</span>
                </button>

                <button
                  onClick={() => setLinkModal({ isOpen: true, orderId: selectedOrder._id, type: 'watermark', isUpdate: selectedOrder.files?.watermark?.length > 0 })}
                  disabled={uploading[selectedOrder._id] === 'watermark' || selectedOrder.status === 'awaiting_advance'}
                  className={`bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 text-sm ${
                    uploading[selectedOrder._id] === 'watermark' || selectedOrder.status === 'awaiting_advance' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {selectedOrder.files?.watermark?.length > 0 ? <Edit3 size={16} /> : <LinkIcon size={16} />}
                  <span>{selectedOrder.files?.watermark?.length > 0 ? 'Update Preview' : 'Preview Link'}</span>
                </button>

                <button
                  onClick={() => setLinkModal({ isOpen: true, orderId: selectedOrder._id, type: 'final', isUpdate: selectedOrder.files?.final?.length > 0 })}
                  disabled={selectedOrder.status !== 'awaiting_final' || uploading[selectedOrder._id] === 'final'}
                  className={`bg-green-500/20 text-green-500 hover:bg-green-500/30 font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 text-sm ${
                    selectedOrder.status !== 'awaiting_final' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {selectedOrder.files?.final?.length > 0 ? <Edit3 size={16} /> : <LinkIcon size={16} />}
                  <span>{selectedOrder.files?.final?.length > 0 ? 'Update Final' : 'Final Link'}</span>
                </button>
              </div>

              {/* Current Links */}
              {(selectedOrder.files?.watermark?.length > 0 || selectedOrder.files?.final?.length > 0) && (
                <div className="border-t border-gray-700 pt-4">
                  <p className="text-textGray text-sm mb-2 font-semibold">Current Links:</p>
                  <div className="space-y-2">
                    {selectedOrder.files?.watermark?.length > 0 && (
                      <div className="flex items-center justify-between p-2 bg-darker rounded">
                        <span className="text-white text-sm">Preview/Watermark</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500 text-xs">✓</span>
                          <button
                            onClick={() => selectedOrder.files.watermark.forEach(url => window.open(ensureUrl(url), '_blank'))}
                            className="text-blue-500 text-xs hover:underline flex items-center space-x-1"
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => {
                              setLinkModal({ isOpen: true, orderId: selectedOrder._id, type: 'watermark', isUpdate: true });
                              setLinkValue(selectedOrder.files.watermark[selectedOrder.files.watermark.length - 1] || '');
                            }}
                            className="text-yellow-500 text-xs hover:underline flex items-center space-x-1"
                          >
                            <Edit3 size={12} />
                            <span>Update</span>
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedOrder.files?.final?.length > 0 && (
                      <div className="flex items-center justify-between p-2 bg-darker rounded">
                        <span className="text-white text-sm">Final File</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-green-500 text-xs">✓</span>
                          <button
                            onClick={() => selectedOrder.files.final.forEach(url => window.open(ensureUrl(url), '_blank'))}
                            className="text-blue-500 text-xs hover:underline flex items-center space-x-1"
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => {
                              setLinkModal({ isOpen: true, orderId: selectedOrder._id, type: 'final', isUpdate: true });
                              setLinkValue(selectedOrder.files.final[selectedOrder.files.final.length - 1] || '');
                            }}
                            className="text-yellow-500 text-xs hover:underline flex items-center space-x-1"
                          >
                            <Edit3 size={12} />
                            <span>Update</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Link Submit Modal */}
      {linkModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-lightGray rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {linkModal.isUpdate ? 'Update' : 'Submit'} {linkModal.type === 'watermark' ? 'Preview' : 'Final'} Link
            </h3>
            <p className="text-textGray text-sm mb-4">
              {linkModal.isUpdate
                ? `Replace the existing ${linkModal.type === 'watermark' ? 'preview/watermark' : 'final deliverable'} link with a new one.`
                : `Paste the ${linkModal.type === 'watermark' ? 'preview/watermark' : 'final deliverable'} link (Google Drive, Dropbox, etc.)`
              }
            </p>
            <input
              type="url"
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="input-field mb-4"
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setLinkModal({ isOpen: false, orderId: null, type: null, isUpdate: false });
                  setLinkValue('');
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitLink}
                disabled={!linkValue.trim() || uploading[linkModal.orderId] === linkModal.type}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                {uploading[linkModal.orderId] === linkModal.type ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <LinkIcon size={18} />
                )}
                <span>{linkModal.isUpdate ? 'Update' : 'Submit'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDashboard;
