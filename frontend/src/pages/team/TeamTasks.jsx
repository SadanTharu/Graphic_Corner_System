import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tasksAPI } from '../../utils/api';
import { CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const TeamTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // 'active', 'done', 'all'

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      if (tasks.length === 0) setLoading(true);
      const tasksData = await tasksAPI.getAll();
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await tasksAPI.update(taskId, { status: 'done' });
      toast.success('Task marked as complete!');
      fetchTasks();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      in_progress: 'bg-blue-500/20 text-blue-500',
      done: 'bg-green-500/20 text-green-500',
    };
    return styles[status] || 'bg-textGray/20 text-textGray';
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return t.status !== 'done';
    if (filter === 'done') return t.status === 'done';
    return true;
  });

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
          <p className="text-textGray mt-2">Manage your assigned tasks</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <button onClick={fetchTasks} className="btn-secondary flex items-center space-x-2">
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
          Active ({tasks.filter(t => t.status !== 'done').length})
        </button>
        <button
          onClick={() => setFilter('done')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'done' ? 'bg-green-600 text-white' : 'bg-lightGray text-textGray hover:text-white'
          }`}
        >
          Completed ({tasks.filter(t => t.status === 'done').length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-lightGray text-textGray hover:text-white'
          }`}
        >
          All ({tasks.length})
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-textGray">{filter === 'active' ? 'No active tasks' : filter === 'done' ? 'No completed tasks' : 'No tasks assigned yet'}</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task._id} className="card">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{task.title}</h3>
                  {task.description && (
                    <p className="text-textGray text-sm mt-1">{task.description}</p>
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

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-textGray">
                  <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</span>
                  {task.order && (
                    <span>Order: #{task.order?.orderNumber || 'N/A'}</span>
                  )}
                </div>
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
          ))
        )}
      </div>
    </div>
  );
};

export default TeamTasks;
