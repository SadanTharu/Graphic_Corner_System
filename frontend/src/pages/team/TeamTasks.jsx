import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tasksAPI, ordersAPI } from '../../utils/api';
import { Download, Link as LinkIcon, CheckCircle, Loader2, RefreshCw, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const TeamTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [linkModal, setLinkModal] = useState({ isOpen: false, orderId: null, type: null });
  const [linkValue, setLinkValue] = useState('');

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
      toast.error('Failed to load tasks');
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
    const { orderId, type } = linkModal;
    if (!linkValue.trim()) {
      toast.error('Please enter a link');
      return;
    }

    setUploading(prev => ({ ...prev, [orderId]: type }));
    try {
      await ordersAPI.uploadFiles(orderId, {
        fileType: type,
        urls: [linkValue.trim()]
      });

      const label = type === 'watermark' ? 'Preview' : 'Final';
      toast.success(`${label} link submitted! Customer will be notified.`);
      setLinkModal({ isOpen: false, orderId: null, type: null });
      setLinkValue('');
      fetchData();
    } catch (error) {
      console.error(`Error submitting ${type} link:`, error);
      toast.error(error.message || `Failed to submit ${type} link`);
    } finally {
      setUploading(prev => ({ ...prev, [orderId]: null }));
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await tasksAPI.update(taskId, { status: 'done' });
      toast.success('Task marked as complete!');
      fetchData();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const completedToday = [...tasks, ...orders].filter(item => {
    const completed = item.completedAt || (item.status === 'completed' && item.updatedAt);
    if (!completed) return false;
    const today = new Date();
    const completedDate = new Date(completed);
    return completedDate.toDateString() === today.toDateString();
  }).length;

  const getStatusBadge = (status) => {
    const styles = {
      in_progress: 'bg-blue-500/20 text-blue-500',
      review: 'bg-yellow-500/20 text-yellow-500',
      revision_requested: 'bg-red-500/20 text-red-500',
      awaiting_final: 'bg-orange-500/20 text-orange-500',
      completed: 'bg-green-500/20 text-green-500',
      awaiting_advance: 'bg-purple-500/20 text-purple-500',
    };
    return styles[status] || 'bg-textGray/20 text-textGray';
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
          <h2 className="text-2xl md:text-3xl font-bold text-white">My Tasks</h2>
          <p className="text-textGray mt-2">Manage your assigned work</p>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center space-x-2">
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-textGray text-sm mb-2">Active Tasks</p>
          <p className="text-3xl font-bold text-primary">{tasks.filter(t => t.status !== 'done').length}</p>
        </div>
        <div className="card">
          <p className="text-textGray text-sm mb-2">Assigned Orders</p>
          <p className="text-3xl font-bold text-blue-500">{orders.filter(o => o.status !== 'completed').length}</p>
        </div>
        <div className="card">
          <p className="text-textGray text-sm mb-2">Completed Today</p>
          <p className="text-3xl font-bold text-green-500">{completedToday}</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {tasks.length === 0 && orders.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-textGray">No tasks assigned yet</p>
          </div>
        ) : (
          <>
            {/* Task Cards */}
            {tasks.filter(t => t.status !== 'done').map(task => (
              <div key={task._id} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{task.title}</h3>
                    <p className="text-textGray text-sm mt-1">{task.description}</p>
                  </div>
                  <div className="flex items-center space-x-3 mt-3 lg:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      task.priority === 'high' ? 'bg-red-500/20 text-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      {task.priority} priority
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(task.status)}`}>
                      {task.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-textGray mb-4">
                  <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</span>
                </div>

                <button
                  onClick={() => handleCompleteTask(task._id)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <CheckCircle size={18} />
                  <span>Mark as Complete</span>
                </button>
              </div>
            ))}

            {/* Order Cards */}
            {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').map(order => (
              <div key={order._id} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{order.service?.name || 'Service'}</h3>
                    <p className="text-textGray text-sm mt-1">
                      Order #{order.orderNumber} &bull; Customer: {order.customer?.name || 'N/A'}
                    </p>
                    <p className="text-textGray text-sm">
                      Amount: <span className="text-primary font-semibold">LKR {order.totalAmount?.toLocaleString()}</span>
                    </p>
                    <p className="text-textGray text-sm">Created: {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(order.status)}`}>
                      {order.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {order.requirements && (
                  <div className="bg-darker p-3 rounded-lg mb-4">
                    <p className="text-textGray text-sm">
                      <span className="font-semibold text-white">Requirements:</span> {order.requirements}
                    </p>
                  </div>
                )}

                {/* Revision Notes */}
                {order.status === 'revision_requested' && order.revisions?.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg mb-4">
                    <p className="text-red-400 text-sm font-semibold mb-1">Revision Requested:</p>
                    <p className="text-textGray text-sm">
                      {order.revisions[order.revisions.length - 1].reason}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Download Raw */}
                  <button
                    onClick={() => handleDownloadRaw(order)}
                    className={`btn-secondary flex items-center justify-center space-x-2 ${
                      !order.files?.raw?.length ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!order.files?.raw?.length}
                  >
                    <Download size={18} />
                    <span>Download Raw</span>
                  </button>

                  {/* Submit Preview Link */}
                  <button
                    onClick={() => setLinkModal({ isOpen: true, orderId: order._id, type: 'watermark' })}
                    disabled={uploading[order._id] === 'watermark' || order.status === 'awaiting_advance'}
                    className={`bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                      uploading[order._id] === 'watermark' || order.status === 'awaiting_advance' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploading[order._id] === 'watermark' ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <LinkIcon size={18} />
                    )}
                    <span>{uploading[order._id] === 'watermark' ? 'Submitting...' : 'Preview Link'}</span>
                  </button>

                  {/* Submit Final Link */}
                  <button
                    onClick={() => setLinkModal({ isOpen: true, orderId: order._id, type: 'final' })}
                    disabled={order.status !== 'awaiting_final' || uploading[order._id] === 'final'}
                    className={`bg-green-500/20 text-green-500 hover:bg-green-500/30 font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                      order.status !== 'awaiting_final' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploading[order._id] === 'final' ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <LinkIcon size={18} />
                    )}
                    <span>{uploading[order._id] === 'final' ? 'Submitting...' : 'Final Link'}</span>
                  </button>
                </div>

                {/* Uploaded Files Display */}
                {(order.files?.watermark?.length > 0 || order.files?.final?.length > 0) && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-textGray text-sm mb-2 font-semibold">Uploaded Files:</p>
                    <div className="space-y-2">
                      {order.files?.watermark?.length > 0 && (
                        <div className="flex items-center justify-between p-2 bg-darker rounded">
                          <span className="text-white text-sm">Preview/Watermark ({order.files.watermark.length})</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-500 text-xs">&#10003; Uploaded</span>
                            <button
                              onClick={() => order.files.watermark.forEach(url => window.open(url, '_blank'))}
                              className="text-blue-500 text-xs hover:underline flex items-center space-x-1"
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </button>
                          </div>
                        </div>
                      )}
                      {order.files?.final?.length > 0 && (
                        <div className="flex items-center justify-between p-2 bg-darker rounded">
                          <span className="text-white text-sm">Final File ({order.files.final.length})</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-500 text-xs">&#10003; Uploaded</span>
                            <button
                              onClick={() => order.files.final.forEach(url => window.open(url, '_blank'))}
                              className="text-blue-500 text-xs hover:underline flex items-center space-x-1"
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Link Submit Modal (Preview or Final) */}
      {linkModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-lightGray rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              Submit {linkModal.type === 'watermark' ? 'Preview' : 'Final'} Link
            </h3>
            <p className="text-textGray text-sm mb-4">
              Paste the {linkModal.type === 'watermark' ? 'preview/watermark' : 'final deliverable'} link (Google Drive, Dropbox, etc.)
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
                  setLinkModal({ isOpen: false, orderId: null, type: null });
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
                <span>Submit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamTasks;
