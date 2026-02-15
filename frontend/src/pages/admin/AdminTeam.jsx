import { useState, useEffect } from 'react';
import { usersAPI, tasksAPI, ordersAPI, authAPI } from '../../utils/api';
import { UserPlus, Mail, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminTeam = () => {
  const [showKanban, setShowKanban] = useState(true);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '', specialty: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (users.length === 0) setLoading(true);
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

  const handleAssignTask = async (taskId, teamMemberId) => {
    try {
      await tasksAPI.update(taskId, { assignedTo: teamMemberId });
      toast.success('Task assigned successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to assign task');
    }
  };

  const handleAddTeamMember = async () => {
    if (!newMember.name || !newMember.email || !newMember.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (newMember.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setCreating(true);
    try {
      await authAPI.createUser({
        ...newMember,
        role: 'team'
      });
      toast.success('Team member created successfully!');
      setShowAddModal(false);
      setNewMember({ name: '', email: '', password: '', specialty: '' });
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to create team member');
    } finally {
      setCreating(false);
    }
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
          onClick={() => setShowAddModal(true)}
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
                <div key={task._id} className="bg-lightGray p-4 rounded-lg">
                  <h4 className="text-white font-medium text-sm mb-2">{task.title}</h4>
                  <p className="text-textGray text-xs mb-3">{task.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-textGray">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}</span>
                    <select
                      onChange={(e) => handleAssignTask(task._id, e.target.value)}
                      className="bg-darker text-white text-xs px-2 py-1 rounded"
                      defaultValue=""
                    >
                      <option value="" disabled>Assign...</option>
                      {teamMembers.map(member => (
                        <option key={member._id} value={member._id}>
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
                <div key={task._id} className="bg-lightGray p-4 rounded-lg border-l-4 border-blue-500">
                  <h4 className="text-white font-medium text-sm mb-2">{task.title}</h4>
                  <p className="text-textGray text-xs mb-3">{task.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-textGray">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}</span>
                    <span className="text-blue-500">{task.assignedTo?.name || 'Unassigned'}</span>
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
                <div key={task._id} className="bg-lightGray p-4 rounded-lg border-l-4 border-yellow-500">
                  <h4 className="text-white font-medium text-sm mb-2">{task.title}</h4>
                  <p className="text-textGray text-xs mb-3">{task.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-textGray">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}</span>
                    <span className="text-yellow-500">{task.assignedTo?.name || 'Unassigned'}</span>
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
              {kanbanColumns.done.length === 0 ? (
                <p className="text-textGray text-sm">No completed tasks</p>
              ) : (
                <div className="space-y-3">
                  {kanbanColumns.done.map(task => (
                    <div key={task._id} className="bg-lightGray p-4 rounded-lg border-l-4 border-green-500">
                      <h4 className="text-white font-medium text-sm mb-2">{task.title}</h4>
                      <p className="text-textGray text-xs">{task.assignedTo?.name || 'Unassigned'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Team Members View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map(member => {
            const memberTasks = tasks.filter(t => 
              t.assignedTo?._id === member._id || t.assignedTo === member._id
            );
            const memberOrders = orders.filter(o => 
              o.assignedTo?._id === member._id || o.assignedTo === member._id
            );

            return (
              <div key={member._id} className="card">
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

      {/* Add Team Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-lightGray rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add Team Member</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-darker rounded-lg">
                <X size={20} className="text-textGray" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Password *</label>
                <input
                  type="password"
                  value={newMember.password}
                  onChange={(e) => setNewMember(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Min 6 characters"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Specialty</label>
                <input
                  type="text"
                  value={newMember.specialty}
                  onChange={(e) => setNewMember(prev => ({ ...prev, specialty: e.target.value }))}
                  placeholder="e.g. Graphic Design, Video Editing"
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 btn-secondary" disabled={creating}>
                Cancel
              </button>
              <button onClick={handleAddTeamMember} className="flex-1 btn-primary" disabled={creating}>
                {creating ? 'Creating...' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeam;
