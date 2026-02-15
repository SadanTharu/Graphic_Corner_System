import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tasksAPI, ordersAPI } from '../../utils/api';
import { Download, Upload, Link as LinkIcon, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const TeamTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, ordersData] = await Promise.all([
        tasksAPI.getAll(),
        ordersAPI.getAll()
      ]);
      // Filter for tasks assigned to this team member
      const myTasks = tasksData.filter(t => t.assignedTo === user.id || t.assignedTo?._id === user.id);
      const myOrders = ordersData.filter(o => o.assignedTo === user.id || o.assignedTo?._id === user.id);
      setTasks(myTasks);
      setOrders(myOrders);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadRaw = (order) => {
    if (order.files.rawFootage) {
      window.open(order.files.rawFootage, '_blank');
      toast.success('Opening raw footage...');
    } else {
      toast.error('No raw footage available');
    }
  };

  const handleUploadWatermark = () => {
    toast.success('Upload watermark feature (Coming soon)');
  };

  const handleUploadFinal = () => {
    toast.success('Upload final file feature (Coming soon)');
  };

  const handleCompleteTask = (taskId) => {
    toast.success('Task marked as complete!');
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
        <h2 className="text-2xl md:text-3xl font-bold text-white">My Tasks</h2>
        <p className="text-textGray mt-2">Manage your assigned work</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-textGray text-sm mb-2">Active Tasks</p>
          <p className="text-3xl font-bold text-primary">{tasks.length}</p>
        </div>
        <div className="card">
          <p className="text-textGray text-sm mb-2">Assigned Orders</p>
          <p className="text-3xl font-bold text-blue-500">{orders.length}</p>
        </div>
        <div className="card">
          <p className="text-textGray text-sm mb-2">Completed Today</p>
          <p className="text-3xl font-bold text-green-500">0</p>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.length === 0 && orders.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-textGray">No tasks assigned yet</p>
          </div>
        ) : (
          <>
            {/* Task Cards */}
            {tasks.map(task => (
              <div key={task.id} className="card">
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
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      task.status === 'in_progress' ? 'bg-primary/20 text-primary' :
                      task.status === 'review' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-textGray/20 text-textGray'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-textGray mb-4">
                  <span>Due: {task.dueDate}</span>
                </div>

                <button
                  onClick={() => handleCompleteTask(task.id)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <CheckCircle size={18} />
                  <span>Mark as Complete</span>
                </button>
              </div>
            ))}

            {/* Order Cards */}
            {orders.map(order => (
              <div key={order.id} className="card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{order.serviceName}</h3>
                    <p className="text-textGray text-sm mt-1">
                      Order #{order.id} • Customer: {order.customerName}
                    </p>
                    <p className="text-textGray text-sm">Due: {order.expectedDelivery}</p>
                  </div>
                  <div>
                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {order.notes && (
                  <div className="bg-darker p-3 rounded-lg mb-4">
                    <p className="text-textGray text-sm">
                      <span className="font-semibold">Client Notes:</span> {order.notes}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Download Raw */}
                  <button
                    onClick={() => handleDownloadRaw(order)}
                    className={`btn-secondary flex items-center justify-center space-x-2 ${
                      !order.files?.rawFootage ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!order.files?.rawFootage}
                  >
                    <Download size={18} />
                    <span>Download Raw</span>
                  </button>

                  {/* Upload Watermark */}
                  <button
                    onClick={handleUploadWatermark}
                    className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <Upload size={18} />
                    <span>Upload Preview</span>
                  </button>

                  {/* Upload Final */}
                  <button
                    onClick={handleUploadFinal}
                    className="bg-green-500/20 text-green-500 hover:bg-green-500/30 font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <LinkIcon size={18} />
                    <span>Final Link</span>
                  </button>
                </div>

                {/* Uploaded Files Display */}
                {(order.files?.watermark || order.files?.finalLink) && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-textGray text-sm mb-2 font-semibold">Uploaded Files:</p>
                    <div className="space-y-2">
                      {order.files.watermark && (
                        <div className="flex items-center justify-between p-2 bg-darker rounded">
                          <span className="text-white text-sm">Preview/Watermark</span>
                          <span className="text-green-500 text-xs">✓ Uploaded</span>
                        </div>
                      )}
                      {order.files.finalLink && (
                        <div className="flex items-center justify-between p-2 bg-darker rounded">
                          <span className="text-white text-sm">Final File</span>
                          <span className="text-green-500 text-xs">✓ Uploaded</span>
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
    </div>
  );
};

export default TeamTasks;
