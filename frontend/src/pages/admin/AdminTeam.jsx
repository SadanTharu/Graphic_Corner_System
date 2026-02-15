import { useState, useEffect } from 'react';
import { usersAPI, tasksAPI, ordersAPI } from '../../utils/api';
import { UserPlus, Mail, Phone, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminTeam = () => {
  const [showKanban, setShowKanban] = useState(true);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, tasksData, ordersData] = await Promise.all([
        usersAPI.getAll(),
        tasksAPI.getAll(),
        ordersAPI.getAll()
      ]);
      setUsers(usersData);
      setTasks(tasksData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const teamMembers = users.filter(u => u.role === 'team');

  const kanbanColumns = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    review: tasks.filter(t => t.status === 'review'),
    done: tasks.filter(t => t.status === 'done')
  };

  const handleAssignTask = (taskId, teamMemberId) => {
    toast.success('Task assigned successfully!');
  };

  const handleAddTeamMember = () => {
    toast.success('Add team member (Coming soon)');
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Team Management</h2>
          <p className="text-textGray mt-2">Manage team members and task assignments</p>
        </div>
        <button
          onClick={handleAddTeamMember}
          className="btn-primary flex items-center space-x-2 mt-4 md:mt-0"
        >
          <UserPlus size={20} />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex space-x-2">
        <button
          onClick={() => setShowKanban(true)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            showKanban ? 'bg-primary text-white' : 'bg-lightGray text-textGray'
          }`}
        >
          Kanban Board
        </button>
        <button
          onClick={() => setShowKanban(false)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            !showKanban ? 'bg-primary text-white' : 'bg-lightGray text-textGray'
          }`}
        >
          Team Members
        </button>
      </div>

      {/* Kanban Board */}
      {showKanban ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* To Do Column */}
          <div className="card bg-darker">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">To Do</h3>
              <span className="bg-textGray/20 text-textGray text-xs px-2 py-1 rounded">
                {kanbanColumns.todo.length}
              </span>
            </div>
            <div className="space-y-3">
              {kanbanColumns.todo.map(task => (
                <div key={task.id} className="bg-lightGray p-4 rounded-lg">
                  <h4 className="text-white font-medium text-sm mb-2">{task.title}</h4>
                  <p className="text-textGray text-xs mb-3">{task.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-textGray">{task.dueDate}</span>
                    <select
                      onChange={(e) => handleAssignTask(task.id, e.target.value)}
                      className="bg-darker text-white text-xs px-2 py-1 rounded"
                    >
                      <option value="">Assign...</option>
                      {teamMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="card bg-darker">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">In Progress</h3>
              <span className="bg-blue-500/20 text-blue-500 text-xs px-2 py-1 rounded">
                {kanbanColumns.in_progress.length}
              </span>
            </div>
            <div className="space-y-3">
              {kanbanColumns.in_progress.map(task => (
                <div key={task.id} className="bg-lightGray p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="text-white font-medium text-sm mb-2">{task.title}</h4>
                  <p className="text-textGray text-xs mb-3">{task.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-textGray">{task.dueDate}</span>
                    <span className="text-blue-500">{task.assignedToName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Review Column */}
          <div className="card bg-darker">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Review</h3>
              <span className="bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded">
                {kanbanColumns.review.length}
              </span>
            </div>
            <div className="space-y-3">
              {kanbanColumns.review.map(task => (
                <div key={task.id} className="bg-lightGray p-4 rounded-lg border-l-4 border-yellow-500">
                  <h4 className="text-white font-medium text-sm mb-2">{task.title}</h4>
                  <p className="text-textGray text-xs mb-3">{task.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-textGray">{task.dueDate}</span>
                    <span className="text-yellow-500">{task.assignedToName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Done Column */}
          <div className="card bg-darker">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Done</h3>
              <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded">
                {kanbanColumns.done?.length || 0}
              </span>
            </div>
            <div className="text-center py-8">
              <p className="text-textGray text-sm">No completed tasks</p>
            </div>
          </div>
        </div>
      ) : (
        /* Team Members View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map(member => {
            const memberTasks = tasks.filter(t => t.assignedTo === member.id);
            const memberOrders = orders.filter(o => o.assignedTeam === member.id);

            return (
              <div key={member.id} className="card">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white">{member.name}</h3>
                    <p className="text-textGray text-sm">{member.specialty}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-textGray">
                    <Mail size={16} />
                    <span>{member.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                  <div>
                    <p className="text-textGray text-xs mb-1">Active Tasks</p>
                    <p className="text-2xl font-bold text-primary">{memberTasks.length}</p>
                  </div>
                  <div>
                    <p className="text-textGray text-xs mb-1">Active Orders</p>
                    <p className="text-2xl font-bold text-blue-500">{memberOrders.length}</p>
                  </div>
                </div>

                <button className="w-full mt-4 btn-secondary text-sm">
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminTeam;
