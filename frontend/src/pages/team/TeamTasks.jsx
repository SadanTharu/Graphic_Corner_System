import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tasksAPI, ordersAPI, subscriptionsAPI } from '../../utils/api';
import { 
  CheckCircle, Loader2, RefreshCw, Download, Link as LinkIcon, Eye, Edit3,
  FileText, ExternalLink, Send, X, Package, Calendar, Upload
} from 'lucide-react';
import toast from 'react-hot-toast';

const ensureUrl = (url) => {
  if (!url) return '#';
  return /^https?:\/\//i.test(url) ? url : 'https://' + url;
};

const TeamTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // 'active', 'done', 'all'
  const [uploading, setUploading] = useState({});
  const [linkModal, setLinkModal] = useState({ isOpen: false, orderId: null, type: null, isUpdate: false });
  const [linkValue, setLinkValue] = useState('');
  // Subscription task deliverable modal
  const [subDeliverableModal, setSubDeliverableModal] = useState({ isOpen: false, subId: null, taskId: null, taskTitle: '' });
  const [subDeliverableUrl, setSubDeliverableUrl] = useState('');

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

  const handleSubmitSubDeliverable = async () => {
    if (!subDeliverableUrl.trim()) {
      toast.error('Please enter a deliverable link');
      return;
    }
    try {
      await subscriptionsAPI.uploadDeliverables(
        subDeliverableModal.subId,
        subDeliverableModal.taskId,
        { deliverables: [{ url: subDeliverableUrl.trim(), name: 'Deliverable' }] }
      );
      toast.success('Deliverable uploaded! Customer will be notified.');
      setSubDeliverableModal({ isOpen: false, subId: null, taskId: null, taskTitle: '' });
      setSubDeliverableUrl('');
      fetchData();
    } catch (error) {
      console.error('Error uploading deliverable:', error);
      toast.error(error.message || 'Failed to upload deliverable');
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

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      in_progress: 'bg-blue-500/20 text-blue-500',
      review: 'bg-yellow-500/20 text-yellow-500',
      revision_requested: 'bg-red-500/20 text-red-500',
      awaiting_final: 'bg-orange-500/20 text-orange-500',
      awaiting_advance: 'bg-purple-500/20 text-purple-500',
      completed: 'bg-green-500/20 text-green-500',
      done: 'bg-green-500/20 text-green-500',
    };
    return styles[status] || 'bg-textGray/20 text-textGray';
  };

  const activeTasks = tasks.filter(t => t.status !== 'done');
  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const completedTasks = tasks.filter(t => t.status === 'done');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const filteredTasks = filter === 'active' ? activeTasks : filter === 'done' ? completedTasks : tasks;
  const filteredOrders = filter === 'active' ? activeOrders : filter === 'done' ? completedOrders : orders;

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">My Tasks</h2>
          <p className="text-textGray mt-2">Manage your assigned tasks &amp; orders</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <button onClick={fetchData} className="btn-secondary flex items-center space-x-2">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'active' ? 'bg-primary text-white' : 'bg-lightGray text-textGray hover:text-white'
          }`}
        >
          Active ({activeTasks.length + activeOrders.length})
        </button>
        <button
          onClick={() => setFilter('done')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'done' ? 'bg-green-600 text-white' : 'bg-lightGray text-textGray hover:text-white'
          }`}
        >
          Completed ({completedTasks.length + completedOrders.length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-lightGray text-textGray hover:text-white'
          }`}
        >
          All ({tasks.length + orders.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {filteredTasks.length === 0 && filteredOrders.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-textGray">{filter === 'active' ? 'No active tasks' : filter === 'done' ? 'No completed items' : 'No tasks assigned yet'}</p>
          </div>
        ) : (
          <>
            {/* Task Cards */}
            {filteredTasks.map(task => {
              const isSubTask = !!task.subscription;
              return (
              <div key={task._id} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        isSubTask ? 'bg-purple-500/20 text-purple-400' : 'bg-primary/20 text-primary'
                      }`}>
                        {isSubTask ? 'Subscription' : 'Task'}
                      </span>
                      <h3 className="text-xl font-bold text-white">{task.title}</h3>
                    </div>
                    {task.description && (
                      <p className="text-textGray text-sm mt-1">{task.description}</p>
                    )}
                    {/* Subscription & Service info */}
                    {isSubTask && (
                      <div className="mt-1 space-y-0.5 text-sm">
                        <p className="text-textGray">
                          <Package size={12} className="inline mr-1 text-purple-400" />
                          Package: <span className="text-white">{task.subscription?.packageName || 'N/A'}</span>
                          {task.service && (
                            <> • Service: <span className="text-blue-400">{task.service.name}</span></>
                          )}
                        </p>
                        {task.customer && (
                          <p className="text-textGray">
                            Customer: <span className="text-white">{task.customer.name}</span>
                          </p>
                        )}
                      </div>
                    )}
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

                {/* Customer Instructions (subscription tasks) */}
                {isSubTask && task.instructions && (
                  <div className="bg-darker p-3 rounded-lg mb-3">
                    <p className="text-textGray text-xs font-semibold mb-1 flex items-center space-x-1">
                      <FileText size={12} className="text-yellow-400" />
                      <span>Customer Instructions:</span>
                    </p>
                    <p className="text-white text-sm">{task.instructions}</p>
                  </div>
                )}

                {/* Raw Files from Customer (subscription tasks) */}
                {isSubTask && task.rawFiles?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-blue-400 text-xs font-semibold mb-2 flex items-center space-x-1">
                      <ExternalLink size={12} />
                      <span>Customer Raw Files ({task.rawFiles.length}):</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {task.rawFiles.map((file, idx) => (
                        <a
                          key={idx}
                          href={ensureUrl(file.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-500/10 text-blue-400 text-sm rounded-lg hover:bg-blue-500/20 transition-colors"
                        >
                          <ExternalLink size={14} />
                          <span className="truncate max-w-[200px]">{file.name || file.url}</span>
                          <Eye size={14} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Uploaded Deliverables (subscription tasks) */}
                {isSubTask && task.deliverables?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-green-400 text-xs font-semibold mb-2 flex items-center space-x-1">
                      <CheckCircle size={12} />
                      <span>Deliverables Uploaded ({task.deliverables.length}):</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {task.deliverables.map((d, idx) => (
                        <a
                          key={idx}
                          href={ensureUrl(d.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-3 py-2 bg-green-500/10 text-green-400 text-sm rounded-lg hover:bg-green-500/20 transition-colors border border-green-500/20"
                        >
                          <ExternalLink size={14} />
                          <span className="truncate max-w-[200px]">{d.name || `Deliverable ${idx + 1}`}</span>
                          <Eye size={14} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-textGray">
                    <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</span>
                    {task.order && (
                      <span>Order: #{task.order?.orderNumber || 'N/A'}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Upload Deliverable button for subscription tasks */}
                    {isSubTask && task.subscription?._id && (
                      <button
                        onClick={() => {
                          setSubDeliverableModal({
                            isOpen: true,
                            subId: task.subscription._id,
                            taskId: task._id,
                            taskTitle: task.title
                          });
                          setSubDeliverableUrl(task.deliverables?.length > 0 ? task.deliverables[task.deliverables.length - 1].url : '');
                        }}
                        className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                      >
                        {task.deliverables?.length > 0 ? <Edit3 size={16} /> : <Upload size={16} />}
                        <span>{task.deliverables?.length > 0 ? 'Update Deliverable' : 'Upload Deliverable'}</span>
                      </button>
                    )}
                    {task.status !== 'done' && (
                      <button
                        onClick={() => handleCompleteTask(task._id)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <CheckCircle size={18} />
                        <span>Mark as Complete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              );
            })}

            {/* Order Cards */}
            {filteredOrders.map(order => (
              <div key={order._id} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-medium">Order</span>
                      <h3 className="text-xl font-bold text-white">{order.service?.name || 'Service'}</h3>
                    </div>
                    <p className="text-textGray text-sm mt-1">
                      Order #{order.orderNumber} &bull; Customer: {order.customer?.name || 'N/A'}
                    </p>
                    <p className="text-textGray text-sm">
                      Amount: <span className="text-primary font-semibold">LKR {order.totalAmount?.toLocaleString()}</span>
                    </p>
                    <p className="text-textGray text-sm">Created: {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-3 lg:mt-0">
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

                {/* Action Buttons - only for active orders */}
                {order.status !== 'completed' && order.status !== 'cancelled' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

                    <button
                      onClick={() => {
                        const hasExisting = order.files?.watermark?.length > 0;
                        setLinkModal({ isOpen: true, orderId: order._id, type: 'watermark', isUpdate: hasExisting });
                        if (hasExisting) setLinkValue(order.files.watermark[order.files.watermark.length - 1] || '');
                      }}
                      disabled={uploading[order._id] === 'watermark' || order.status === 'awaiting_advance'}
                      className={`bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                        uploading[order._id] === 'watermark' || order.status === 'awaiting_advance' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploading[order._id] === 'watermark' ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : order.files?.watermark?.length > 0 ? (
                        <Edit3 size={18} />
                      ) : (
                        <LinkIcon size={18} />
                      )}
                      <span>{order.files?.watermark?.length > 0 ? 'Update Preview' : 'Preview Link'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const hasExisting = order.files?.final?.length > 0;
                        setLinkModal({ isOpen: true, orderId: order._id, type: 'final', isUpdate: hasExisting });
                        if (hasExisting) setLinkValue(order.files.final[order.files.final.length - 1] || '');
                      }}
                      disabled={order.status !== 'awaiting_final' || uploading[order._id] === 'final'}
                      className={`bg-green-500/20 text-green-500 hover:bg-green-500/30 font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 ${
                        order.status !== 'awaiting_final' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploading[order._id] === 'final' ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : order.files?.final?.length > 0 ? (
                        <Edit3 size={18} />
                      ) : (
                        <LinkIcon size={18} />
                      )}
                      <span>{order.files?.final?.length > 0 ? 'Update Final' : 'Final Link'}</span>
                    </button>
                  </div>
                )}

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
                              onClick={() => order.files.watermark.forEach(url => window.open(ensureUrl(url), '_blank'))}
                              className="text-blue-500 text-xs hover:underline flex items-center space-x-1"
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => {
                                setLinkModal({ isOpen: true, orderId: order._id, type: 'watermark', isUpdate: true });
                                setLinkValue(order.files.watermark[order.files.watermark.length - 1] || '');
                              }}
                              className="text-yellow-500 text-xs hover:underline flex items-center space-x-1"
                            >
                              <Edit3 size={12} />
                              <span>Update</span>
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
                              onClick={() => order.files.final.forEach(url => window.open(ensureUrl(url), '_blank'))}
                              className="text-blue-500 text-xs hover:underline flex items-center space-x-1"
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => {
                                setLinkModal({ isOpen: true, orderId: order._id, type: 'final', isUpdate: true });
                                setLinkValue(order.files.final[order.files.final.length - 1] || '');
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
            ))}
          </>
        )}
      </div>

      {/* Link Submit Modal */}
      {linkModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
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

      {/* Subscription Deliverable Upload Modal */}
      {subDeliverableModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-lightGray rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Upload Deliverable</h3>
                <p className="text-textGray text-sm mt-1">{subDeliverableModal.taskTitle}</p>
              </div>
              <button
                onClick={() => {
                  setSubDeliverableModal({ isOpen: false, subId: null, taskId: null, taskTitle: '' });
                  setSubDeliverableUrl('');
                }}
                className="p-2 hover:bg-darker rounded-lg transition-colors"
              >
                <X size={20} className="text-textGray" />
              </button>
            </div>
            <p className="text-textGray text-sm mb-4">
              Paste the final output link (Google Drive, YouTube, Dropbox, etc.)
            </p>
            <input
              type="url"
              value={subDeliverableUrl}
              onChange={(e) => setSubDeliverableUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="input-field mb-4"
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setSubDeliverableModal({ isOpen: false, subId: null, taskId: null, taskTitle: '' });
                  setSubDeliverableUrl('');
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitSubDeliverable}
                disabled={!subDeliverableUrl.trim()}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                <Send size={18} />
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
