import { useState, useEffect } from 'react';
import { subscriptionsAPI, usersAPI } from '../../utils/api';
import {
  Check, X, UserPlus, Eye, Loader2, Clock, CheckCircle,
  XCircle, RefreshCw, Package, ChevronDown, ChevronUp, FileText, Send,
  CreditCard, ShieldCheck, ShieldX, Calendar, RotateCcw, Settings, History,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

const ensureUrl = (url) => {
  if (!url) return '#';
  return /^https?:\/\//i.test(url) ? url : 'https://' + url;
};

const AdminSubscriptions = ({ embedded }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedSub, setExpandedSub] = useState(null);
  const [assignModal, setAssignModal] = useState({ isOpen: false, subId: null, taskId: null, taskTitle: '' });
  const [deliverableModal, setDeliverableModal] = useState({ isOpen: false, subId: null, taskId: null, taskTitle: '' });
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [verifying, setVerifying] = useState(null);
  // Cycle management state
  const [cycleModal, setCycleModal] = useState({ isOpen: false, sub: null });
  const [cycleDaysInput, setCycleDaysInput] = useState('');
  const [cycleStartInput, setCycleStartInput] = useState('');
  const [deadlineModal, setDeadlineModal] = useState({ isOpen: false, subId: null, taskId: null, taskTitle: '', currentDeadline: '' });
  const [deadlineInput, setDeadlineInput] = useState('');
  const [cycleHistoryModal, setCycleHistoryModal] = useState({ isOpen: false, sub: null });
  const [cycleProcessing, setCycleProcessing] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      if (subscriptions.length === 0) setLoading(true);
      const [subsData, usersData] = await Promise.all([
        subscriptionsAPI.getAll(),
        usersAPI.getTeam()
      ]);
      setSubscriptions(Array.isArray(subsData) ? subsData : []);
      setTeamMembers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (subId) => {
    try {
      await subscriptionsAPI.approve(subId);
      toast.success('Subscription approved! Customer needs to pay 25% advance.');
      fetchData();
    } catch (error) {
      console.error('Error approving:', error);
      toast.error(error.message || 'Failed to approve');
    }
  };

  const handleCancel = async (subId) => {
    const reason = prompt('Provide a reason for cancellation:');
    if (!reason) return;
    try {
      await subscriptionsAPI.cancel(subId, reason);
      toast.success('Subscription cancelled');
      fetchData();
    } catch (error) {
      console.error('Error cancelling:', error);
      toast.error(error.message || 'Failed to cancel');
    }
  };

  const handleVerifyPayment = async (subId, action) => {
    setVerifying(subId);
    try {
      const res = await subscriptionsAPI.verifyPayment(subId, action);
      toast.success(res.message || (action === 'verify' ? 'Payment verified! Tasks created.' : 'Payment rejected.'));
      fetchData();
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error(error.message || 'Failed to verify payment');
    } finally {
      setVerifying(null);
    }
  };

  const handleVerifyFinalPayment = async (subId, action) => {
    setVerifying(subId);
    try {
      const res = await subscriptionsAPI.verifyFinalPayment(subId, action);
      toast.success(res.message || (action === 'verify' ? 'Final payment verified! Subscription complete.' : 'Final payment rejected.'));
      fetchData();
    } catch (error) {
      console.error('Error verifying final payment:', error);
      toast.error(error.message || 'Failed to verify final payment');
    } finally {
      setVerifying(null);
    }
  };

  const handleRenewSubscription = async (subId) => {
    if (!confirm('Renew this subscription for the next cycle? Customer will need to pay 25% advance again.')) return;
    try {
      const res = await subscriptionsAPI.renewSubscription(subId);
      toast.success(res.message || 'Subscription renewed!');
      fetchData();
    } catch (error) {
      console.error('Error renewing subscription:', error);
      toast.error(error.message || 'Failed to renew subscription');
    }
  };

  const handleAssignTask = async (teamMemberId) => {
    try {
      await subscriptionsAPI.assignTask(assignModal.subId, assignModal.taskId, teamMemberId);
      toast.success('Task assigned successfully!');
      setAssignModal({ isOpen: false, subId: null, taskId: null, taskTitle: '' });
      fetchData();
    } catch (error) {
      console.error('Error assigning:', error);
      toast.error(error.message || 'Failed to assign');
    }
  };

  const handleCompleteTask = async (subId, taskId) => {
    try {
      await subscriptionsAPI.completeTask(subId, taskId);
      toast.success('Task marked as complete!');
      fetchData();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    }
  };

  const handleSubmitDeliverable = async () => {
    if (!deliverableUrl.trim()) {
      toast.error('Please enter a deliverable link');
      return;
    }
    try {
      await subscriptionsAPI.uploadDeliverables(
        deliverableModal.subId,
        deliverableModal.taskId,
        { deliverables: [{ url: deliverableUrl.trim(), name: 'Deliverable' }] }
      );
      toast.success('Deliverable uploaded! Customer will be notified.');
      setDeliverableModal({ isOpen: false, subId: null, taskId: null, taskTitle: '' });
      setDeliverableUrl('');
      fetchData();
    } catch (error) {
      console.error('Error uploading deliverable:', error);
      toast.error(error.message || 'Failed to upload');
    }
  };

  // ─── Cycle management handlers ─────────────────
  const openCycleModal = (sub) => {
    setCycleModal({ isOpen: true, sub });
    setCycleDaysInput(sub.cycleDays?.toString() || '30');
    setCycleStartInput(sub.cycleStartDate ? new Date(sub.cycleStartDate).toISOString().split('T')[0] : '');
  };

  const handleUpdateCycleDays = async () => {
    const days = parseInt(cycleDaysInput);
    if (!days || days < 1) {
      toast.error('Cycle days must be at least 1');
      return;
    }
    setCycleProcessing(true);
    try {
      const res = await subscriptionsAPI.updateCycleSettings(cycleModal.sub._id, days, cycleStartInput || undefined);
      toast.success(res.message || 'Cycle settings updated');
      setCycleModal({ isOpen: false, sub: null });
      fetchData();
    } catch (error) {
      console.error('Error updating cycle:', error);
      toast.error(error.message || 'Failed to update cycle');
    } finally {
      setCycleProcessing(false);
    }
  };

  const openDeadlineModal = (subId, task) => {
    const currentDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
    setDeadlineModal({ isOpen: true, subId, taskId: task._id, taskTitle: task.title, currentDeadline: currentDate });
    setDeadlineInput(currentDate);
  };

  const handleUpdateDeadline = async () => {
    if (!deadlineInput) {
      toast.error('Please select a deadline date');
      return;
    }
    setCycleProcessing(true);
    try {
      const res = await subscriptionsAPI.updateTaskDeadline(deadlineModal.subId, deadlineModal.taskId, deadlineInput);
      toast.success(res.message || 'Deadline updated');
      setDeadlineModal({ isOpen: false, subId: null, taskId: null, taskTitle: '', currentDeadline: '' });
      fetchData();
    } catch (error) {
      console.error('Error updating deadline:', error);
      toast.error(error.message || 'Failed to update deadline');
    } finally {
      setCycleProcessing(false);
    }
  };

  const handleResetCycle = async (subId) => {
    if (!confirm('Are you sure you want to reset the cycle? Current tasks will be archived and new tasks created.')) return;
    setCycleProcessing(true);
    try {
      const res = await subscriptionsAPI.resetCycle(subId);
      toast.success(res.message || 'Cycle reset successfully');
      fetchData();
    } catch (error) {
      console.error('Error resetting cycle:', error);
      toast.error(error.message || 'Failed to reset cycle');
    } finally {
      setCycleProcessing(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending': return { color: 'bg-yellow-500/20 text-yellow-500', label: 'Pending' };
      case 'awaiting_payment': return { color: 'bg-orange-500/20 text-orange-400', label: 'Awaiting Payment' };
      case 'active': return { color: 'bg-green-500/20 text-green-500', label: 'Active' };
      case 'awaiting_final_payment': return { color: 'bg-orange-500/20 text-orange-400', label: 'Final Payment' };
      case 'completed': return { color: 'bg-green-500/20 text-green-500', label: 'Completed' };
      case 'cancelled': return { color: 'bg-red-500/20 text-red-500', label: 'Cancelled' };
      default: return { color: 'bg-gray-500/20 text-gray-400', label: status };
    }
  };

  const getTaskStatusConfig = (status) => {
    switch (status) {
      case 'todo': return { color: 'bg-gray-500/20 text-gray-400', label: 'To Do' };
      case 'in_progress': return { color: 'bg-blue-500/20 text-blue-500', label: 'In Progress' };
      case 'review': return { color: 'bg-purple-500/20 text-purple-500', label: 'Review' };
      case 'done': return { color: 'bg-green-500/20 text-green-500', label: 'Done' };
      default: return { color: 'bg-gray-500/20 text-gray-400', label: status };
    }
  };

  const filteredSubs = filterStatus === 'all'
    ? subscriptions
    : subscriptions.filter(s => s.status === filterStatus);

  const statusCounts = {
    all: subscriptions.length,
    pending: subscriptions.filter(s => s.status === 'pending').length,
    awaiting_payment: subscriptions.filter(s => s.status === 'awaiting_payment').length,
    active: subscriptions.filter(s => s.status === 'active').length,
    awaiting_final_payment: subscriptions.filter(s => s.status === 'awaiting_final_payment').length,
    completed: subscriptions.filter(s => s.status === 'completed').length,
    cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
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
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Subscription Management</h2>
            <p className="text-textGray mt-2">Review, approve, verify payments, and manage subscriptions</p>
          </div>
          <button onClick={fetchData} className="btn-secondary flex items-center space-x-2">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { key: 'all', label: 'All', count: statusCounts.all },
          { key: 'pending', label: 'Pending', count: statusCounts.pending },
          { key: 'awaiting_payment', label: 'Payment', count: statusCounts.awaiting_payment },
          { key: 'active', label: 'Active', count: statusCounts.active },
          { key: 'awaiting_final_payment', label: 'Final Pay', count: statusCounts.awaiting_final_payment },
          { key: 'completed', label: 'Completed', count: statusCounts.completed },
          { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
        ].map(stat => (
          <button
            key={stat.key}
            onClick={() => setFilterStatus(stat.key)}
            className={`card text-center transition-all ${filterStatus === stat.key ? 'ring-2 ring-primary' : ''}`}
          >
            <p className="text-textGray text-xs mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.count}</p>
          </button>
        ))}
      </div>

      {/* Subscriptions List */}
      <div className="space-y-4">
        {filteredSubs.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-textGray">No subscriptions found</p>
          </div>
        ) : (
          filteredSubs.map((sub) => {
            const statusConfig = getStatusConfig(sub.status);
            const isExpanded = expandedSub === sub._id;
            const tasks = sub.tasks || [];
            const completedTasks = tasks.filter(t => t.status === 'done').length;
            const paymentStatus = sub.payment?.status;

            return (
              <div key={sub._id} className="card">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Package className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-bold text-white">{sub.packageName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-textGray">
                      <p>Customer: <span className="text-white">{sub.customer?.name || 'N/A'}</span> ({sub.customer?.email})</p>
                      <p>Price: <span className="text-primary font-semibold">LKR {sub.offeringPrice?.toLocaleString()}</span>
                        {sub.discount > 0 && <span className="text-green-400 ml-2">({sub.discount}% OFF)</span>}
                        {' '}• Advance: <span className="text-orange-400 font-semibold">LKR {(sub.advanceAmount || 0).toLocaleString()}</span>
                      </p>
                      <p>Duration: <span className="text-white">{sub.duration}</span> • Applied: {new Date(sub.createdAt).toLocaleDateString()}</p>
                      {sub.approvedAt && <p>Approved: {new Date(sub.approvedAt).toLocaleDateString()}</p>}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4 lg:mt-0">
                    {/* Pending — Approve / Cancel */}
                    {sub.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(sub._id)}
                          className="bg-green-500/20 text-green-500 hover:bg-green-500/30 px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                        >
                          <Check size={18} />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleCancel(sub._id)}
                          className="bg-red-500/20 text-red-500 hover:bg-red-500/30 px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                        >
                          <X size={18} />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {/* Show tasks toggle */}
                    {tasks.length > 0 && (
                      <button
                        onClick={() => setExpandedSub(isExpanded ? null : sub._id)}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        <span>Tasks ({completedTasks}/{tasks.length})</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* ─── Payment Verification Section ─── */}
                {sub.status === 'awaiting_payment' && (
                  <div className="mb-4 bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg space-y-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <CreditCard className="w-5 h-5 text-orange-400" />
                      <h4 className="text-orange-400 font-semibold">Payment Status</h4>
                    </div>

                    {(!paymentStatus || paymentStatus === 'none') && (
                      <p className="text-textGray text-sm">Customer has not submitted payment yet. Advance required: <span className="text-white font-semibold">LKR {(sub.advanceAmount || 0).toLocaleString()}</span></p>
                    )}

                    {paymentStatus === 'pending' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-textGray">Method:</span>{' '}
                            <span className="text-white">{sub.payment?.method === 'direct' ? 'Bank Transfer' : 'Wallet'}</span>
                          </div>
                          <div>
                            <span className="text-textGray">Amount:</span>{' '}
                            <span className="text-white font-semibold">LKR {(sub.payment?.amount || 0).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-textGray">Paid:</span>{' '}
                            <span className="text-white">{sub.payment?.paidAt ? new Date(sub.payment.paidAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-textGray">Status:</span>{' '}
                            <span className="text-yellow-500 font-semibold">Pending Verification</span>
                          </div>
                        </div>

                        {/* Slip preview */}
                        {sub.payment?.slip && (
                          <div>
                            <p className="text-textGray text-xs font-semibold mb-2">Payment Slip:</p>
                            <a
                              href={ensureUrl(sub.payment.slip)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block"
                            >
                              {/\.(jpg|jpeg|png|gif|webp)$/i.test(sub.payment.slip) ? (
                                <img
                                  src={ensureUrl(sub.payment.slip)}
                                  alt="Payment slip"
                                  className="max-h-48 rounded-lg border border-gray-600 hover:opacity-80 transition-opacity"
                                />
                              ) : (
                                <span className="flex items-center space-x-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors">
                                  <FileText size={16} />
                                  <span>View Payment Slip</span>
                                  <Eye size={16} />
                                </span>
                              )}
                            </a>
                          </div>
                        )}

                        {/* Verify / Reject buttons */}
                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={() => handleVerifyPayment(sub._id, 'verify')}
                            disabled={verifying === sub._id}
                            className="bg-green-500/20 text-green-500 hover:bg-green-500/30 px-5 py-2.5 rounded-lg font-medium transition-all flex items-center space-x-2"
                          >
                            {verifying === sub._id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <ShieldCheck size={18} />
                            )}
                            <span>Verify Payment</span>
                          </button>
                          <button
                            onClick={() => handleVerifyPayment(sub._id, 'reject')}
                            disabled={verifying === sub._id}
                            className="bg-red-500/20 text-red-500 hover:bg-red-500/30 px-5 py-2.5 rounded-lg font-medium transition-all flex items-center space-x-2"
                          >
                            <ShieldX size={18} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {paymentStatus === 'rejected' && (
                      <p className="text-red-400 text-sm">Payment was rejected. Waiting for customer to re-upload.</p>
                    )}

                    {paymentStatus === 'verified' && (
                      <p className="text-green-400 text-sm">Payment verified. Subscription should be active.</p>
                    )}
                  </div>
                )}

                {/* Payment info for active subscriptions */}
                {sub.status === 'active' && sub.payment?.status === 'verified' && (
                  <div className="mb-4 bg-green-500/10 border border-green-500/30 p-3 rounded-lg text-sm">
                    <span className="text-green-400 font-medium">Payment Verified</span>
                    <span className="text-textGray ml-2">
                      LKR {(sub.payment.amount || 0).toLocaleString()} via {sub.payment.method === 'wallet' ? 'Wallet' : 'Bank Transfer'}
                      {sub.payment.verifiedAt && ` • ${new Date(sub.payment.verifiedAt).toLocaleDateString()}`}
                    </span>
                  </div>
                )}

                {/* ─── Cycle Info Panel (Active subscriptions only) ─── */}
                {sub.status === 'active' && sub.cycleStartDate && (
                  <div className="mb-4 bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <h4 className="text-blue-400 font-semibold">Cycle {sub.currentCycle || 1}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {sub.cycleHistory?.length > 0 && (
                          <button
                            onClick={() => setCycleHistoryModal({ isOpen: true, sub })}
                            className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-all"
                          >
                            <History size={14} />
                            <span>History ({sub.cycleHistory.length})</span>
                          </button>
                        )}
                        <button
                          onClick={() => openCycleModal(sub)}
                          className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-all"
                        >
                          <Settings size={14} />
                          <span>Edit Cycle</span>
                        </button>
                        <button
                          onClick={() => handleResetCycle(sub._id)}
                          disabled={cycleProcessing}
                          className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-all"
                        >
                          <RotateCcw size={14} />
                          <span>Reset Cycle</span>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-textGray">Cycle Days:</span>{' '}
                        <span className="text-white font-semibold">{sub.cycleDays || 30}</span>
                      </div>
                      <div>
                        <span className="text-textGray">Start:</span>{' '}
                        <span className="text-white">{new Date(sub.cycleStartDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-textGray">End:</span>{' '}
                        <span className="text-white">{sub.cycleEndDate ? new Date(sub.cycleEndDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── Final Payment Verification (awaiting_final_payment) ─── */}
                {sub.status === 'awaiting_final_payment' && (() => {
                  const fp = sub.finalPayment;
                  const remainingAmount = Math.round(sub.offeringPrice - (sub.advanceAmount || 0));
                  return (
                    <div className="mb-4 bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg space-y-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-5 h-5 text-orange-400" />
                        <h4 className="text-orange-400 font-semibold">Final Payment — LKR {remainingAmount.toLocaleString()}</h4>
                      </div>
                      <p className="text-textGray text-sm">
                        All tasks are done. Customer owes remaining 75%: <span className="text-white font-semibold">LKR {remainingAmount.toLocaleString()}</span>
                      </p>

                      {(!fp?.status || fp.status === 'none') && (
                        <p className="text-yellow-400 text-sm">Customer has not submitted final payment yet.</p>
                      )}

                      {fp?.status === 'pending' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-textGray">Method:</span>{' '}
                              <span className="text-white">{fp.method === 'direct' ? 'Bank Transfer' : 'Wallet'}</span>
                            </div>
                            <div>
                              <span className="text-textGray">Amount:</span>{' '}
                              <span className="text-white font-semibold">LKR {(fp.amount || 0).toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-textGray">Paid:</span>{' '}
                              <span className="text-white">{fp.paidAt ? new Date(fp.paidAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-textGray">Status:</span>{' '}
                              <span className="text-yellow-500 font-semibold">Pending Verification</span>
                            </div>
                          </div>

                          {fp.slip && (
                            <div>
                              <p className="text-textGray text-xs font-semibold mb-2">Final Payment Slip:</p>
                              <a
                                href={ensureUrl(fp.slip)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block"
                              >
                                {/\.(jpg|jpeg|png|gif|webp)$/i.test(fp.slip) ? (
                                  <img
                                    src={ensureUrl(fp.slip)}
                                    alt="Final payment slip"
                                    className="max-h-48 rounded-lg border border-gray-600 hover:opacity-80 transition-opacity"
                                  />
                                ) : (
                                  <span className="flex items-center space-x-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors">
                                    <FileText size={16} />
                                    <span>View Final Payment Slip</span>
                                    <Eye size={16} />
                                  </span>
                                )}
                              </a>
                            </div>
                          )}

                          <div className="flex items-center gap-3 pt-2">
                            <button
                              onClick={() => handleVerifyFinalPayment(sub._id, 'verify')}
                              disabled={verifying === sub._id}
                              className="bg-green-500/20 text-green-500 hover:bg-green-500/30 px-5 py-2.5 rounded-lg font-medium transition-all flex items-center space-x-2"
                            >
                              {verifying === sub._id ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <ShieldCheck size={18} />
                              )}
                              <span>Verify Final Payment</span>
                            </button>
                            <button
                              onClick={() => handleVerifyFinalPayment(sub._id, 'reject')}
                              disabled={verifying === sub._id}
                              className="bg-red-500/20 text-red-500 hover:bg-red-500/30 px-5 py-2.5 rounded-lg font-medium transition-all flex items-center space-x-2"
                            >
                              <ShieldX size={18} />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {fp?.status === 'rejected' && (
                        <p className="text-red-400 text-sm">Final payment was rejected. Waiting for customer to re-upload.</p>
                      )}
                    </div>
                  );
                })()}

                {/* ─── Completed — Renew Button ─── */}
                {sub.status === 'completed' && (
                  <div className="mb-4 bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <h4 className="text-green-400 font-semibold">Subscription Complete</h4>
                        </div>
                        <p className="text-textGray text-sm">
                          All tasks delivered and final payment verified.
                          {sub.finalPayment?.verifiedAt && ` Completed: ${new Date(sub.finalPayment.verifiedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRenewSubscription(sub._id)}
                        className="bg-primary/20 text-primary hover:bg-primary/30 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center space-x-2"
                      >
                        <RefreshCw size={18} />
                        <span>Renew Subscription</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Progress */}
                {tasks.length > 0 && (
                  <div className="mb-4">
                    <div className="w-full bg-darker rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(completedTasks / tasks.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Expanded Tasks */}
                {isExpanded && tasks.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h4 className="text-white font-semibold text-lg">Tasks</h4>
                    {tasks.map((task) => {
                      const taskStatus = getTaskStatusConfig(task.status);
                      return (
                        <div key={task._id} className="bg-darker rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h5 className="text-white font-medium">{task.title}</h5>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${taskStatus.color}`}>
                                  {taskStatus.label}
                                </span>
                              </div>
                              <p className="text-textGray text-sm">{task.description}</p>
                              <p className="text-textGray text-xs mt-1">
                                Service: <span className="text-white">{task.service?.name || 'N/A'}</span>
                                {task.assignedTo && (
                                  <> • Assigned to: <span className="text-blue-400">{task.assignedTo.name}</span></>
                                )}
                              </p>
                              {/* Deadline display */}
                              {task.dueDate && (
                                <p className="text-textGray text-xs mt-1">
                                  Deadline:{' '}
                                  <span className={`font-semibold ${
                                    task.status === 'done' ? 'text-green-400' :
                                    new Date(task.dueDate) < new Date() ? 'text-red-400' : 'text-yellow-400'
                                  }`}>
                                    {new Date(task.dueDate).toLocaleDateString()}
                                    {task.status !== 'done' && new Date(task.dueDate) < new Date() && ' (Overdue)'}
                                  </span>
                                </p>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                              {/* Edit deadline button */}
                              {task.status !== 'done' && (
                                <button
                                  onClick={() => openDeadlineModal(sub._id, task)}
                                  className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 px-3 py-1.5 rounded-lg font-medium text-sm flex items-center space-x-1"
                                >
                                  <Calendar size={14} />
                                  <span>Deadline</span>
                                </button>
                              )}
                              {/* Assign button */}
                              {task.status !== 'done' && (
                                <button
                                  onClick={() => setAssignModal({ isOpen: true, subId: sub._id, taskId: task._id, taskTitle: task.title })}
                                  className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 px-3 py-1.5 rounded-lg font-medium text-sm flex items-center space-x-1"
                                >
                                  <UserPlus size={14} />
                                  <span>{task.assignedTo ? 'Reassign' : 'Assign'}</span>
                                </button>
                              )}
                              {/* Upload deliverable */}
                              {task.status !== 'done' && (
                                <button
                                  onClick={() => {
                                    setDeliverableModal({ isOpen: true, subId: sub._id, taskId: task._id, taskTitle: task.title });
                                    setDeliverableUrl('');
                                  }}
                                  className="bg-purple-500/20 text-purple-500 hover:bg-purple-500/30 px-3 py-1.5 rounded-lg font-medium text-sm flex items-center space-x-1"
                                >
                                  <Send size={14} />
                                  <span>Deliverable</span>
                                </button>
                              )}
                              {/* Complete */}
                              {task.status !== 'done' && (
                                <button
                                  onClick={() => handleCompleteTask(sub._id, task._id)}
                                  className="bg-green-500/20 text-green-500 hover:bg-green-500/30 px-3 py-1.5 rounded-lg font-medium text-sm flex items-center space-x-1"
                                >
                                  <CheckCircle size={14} />
                                  <span>Complete</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Customer Instructions */}
                          {task.instructions && (
                            <div className="bg-lightGray p-3 rounded-lg mb-2">
                              <p className="text-textGray text-xs font-semibold mb-1">Customer Instructions:</p>
                              <p className="text-white text-sm">{task.instructions}</p>
                            </div>
                          )}

                          {/* Raw Files */}
                          {task.rawFiles?.length > 0 && (
                            <div className="mb-2">
                              <p className="text-textGray text-xs font-semibold mb-1">Raw Files ({task.rawFiles.length}):</p>
                              <div className="flex flex-wrap gap-2">
                                {task.rawFiles.map((file, idx) => (
                                  <a
                                    key={idx}
                                    href={ensureUrl(file.url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-1 px-3 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-lg hover:bg-blue-500/20"
                                  >
                                    <FileText size={12} />
                                    <span>{file.name || `File ${idx + 1}`}</span>
                                    <Eye size={12} />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Deliverables */}
                          {task.deliverables?.length > 0 && (
                            <div>
                              <p className="text-green-400 text-xs font-semibold mb-1">Deliverables ({task.deliverables.length}):</p>
                              <div className="flex flex-wrap gap-2">
                                {task.deliverables.map((d, idx) => (
                                  <a
                                    key={idx}
                                    href={ensureUrl(d.url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-1 px-3 py-1 bg-green-500/10 text-green-400 text-xs rounded-lg hover:bg-green-500/20"
                                  >
                                    <FileText size={12} />
                                    <span>{d.name || `Deliverable ${idx + 1}`}</span>
                                    <Eye size={12} />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Assign Team Modal */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-lightGray rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Assign Team Member</h3>
              <p className="text-textGray text-sm mt-1">{assignModal.taskTitle}</p>
            </div>
            <div className="p-6 space-y-3">
              {teamMembers.length === 0 ? (
                <p className="text-textGray text-center py-4">No team members available</p>
              ) : (
                teamMembers.map((member) => (
                  <button
                    key={member._id}
                    onClick={() => handleAssignTask(member._id)}
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
                onClick={() => setAssignModal({ isOpen: false, subId: null, taskId: null, taskTitle: '' })}
                className="w-full btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deliverable Upload Modal */}
      {deliverableModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-lightGray rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-2">Upload Deliverable</h3>
            <p className="text-textGray text-sm mb-4">{deliverableModal.taskTitle}</p>
            <input
              type="url"
              value={deliverableUrl}
              onChange={(e) => setDeliverableUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="input-field mb-4"
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setDeliverableModal({ isOpen: false, subId: null, taskId: null, taskTitle: '' })}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDeliverable}
                disabled={!deliverableUrl.trim()}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                <Send size={18} />
                <span>Submit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Cycle Days Modal ─── */}
      {cycleModal.isOpen && cycleModal.sub && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-lightGray rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="w-5 h-5 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Edit Cycle Settings</h3>
            </div>
            <p className="text-textGray text-sm mb-4">
              {cycleModal.sub.packageName} — Cycle {cycleModal.sub.currentCycle || 1}
            </p>
            <div className="bg-darker p-4 rounded-lg mb-4 space-y-2 text-sm">
              <p className="text-textGray">Current: <span className="text-white font-semibold">{cycleModal.sub.cycleDays || 30} days</span></p>
              <p className="text-textGray">Tasks: <span className="text-white font-semibold">{(cycleModal.sub.tasks || []).length}</span></p>
              <p className="text-textGray">
                Current rate: <span className="text-primary font-semibold">
                  1 task every {(cycleModal.sub.tasks?.length > 0 ? ((cycleModal.sub.cycleDays || 30) / cycleModal.sub.tasks.length).toFixed(1) : 'N/A')} days
                </span>
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-textGray text-sm font-medium mb-2">Cycle Start Date</label>
              <input
                type="date"
                value={cycleStartInput}
                onChange={(e) => setCycleStartInput(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="mb-4">
              <label className="block text-textGray text-sm font-medium mb-2">New Cycle Days</label>
              <input
                type="number"
                min="1"
                value={cycleDaysInput}
                onChange={(e) => setCycleDaysInput(e.target.value)}
                className="input-field"
                placeholder="30"
              />
              {cycleDaysInput && cycleModal.sub.tasks?.length > 0 && (
                <p className="text-textGray text-xs mt-2">
                  New rate: <span className="text-primary font-semibold">
                    1 task every {(parseInt(cycleDaysInput) / cycleModal.sub.tasks.length).toFixed(1)} days
                  </span>
                  {' '}— All task deadlines will be recalculated.
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setCycleModal({ isOpen: false, sub: null })}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCycleDays}
                disabled={cycleProcessing}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                {cycleProcessing ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                <span>{cycleProcessing ? 'Saving...' : 'Update'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit Task Deadline Modal ─── */}
      {deadlineModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-lightGray rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">Edit Task Deadline</h3>
            </div>
            <p className="text-textGray text-sm mb-4">{deadlineModal.taskTitle}</p>
            {deadlineModal.currentDeadline && (
              <p className="text-textGray text-sm mb-3">
                Current deadline: <span className="text-white font-semibold">{new Date(deadlineModal.currentDeadline).toLocaleDateString()}</span>
              </p>
            )}
            <div className="mb-4">
              <label className="block text-textGray text-sm font-medium mb-2">New Deadline</label>
              <input
                type="date"
                value={deadlineInput}
                onChange={(e) => setDeadlineInput(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeadlineModal({ isOpen: false, subId: null, taskId: null, taskTitle: '', currentDeadline: '' })}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDeadline}
                disabled={cycleProcessing || !deadlineInput}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                {cycleProcessing ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                <span>{cycleProcessing ? 'Saving...' : 'Update'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Cycle History Modal ─── */}
      {cycleHistoryModal.isOpen && cycleHistoryModal.sub && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-lightGray rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-lightGray border-b border-gray-700 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Cycle History</h3>
                <p className="text-textGray text-sm mt-1">{cycleHistoryModal.sub.packageName}</p>
              </div>
              <button
                onClick={() => setCycleHistoryModal({ isOpen: false, sub: null })}
                className="p-2 hover:bg-darker rounded-lg transition-colors"
              >
                <X size={24} className="text-textGray" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {(cycleHistoryModal.sub.cycleHistory || []).length === 0 ? (
                <p className="text-textGray text-center py-4">No cycle history yet</p>
              ) : (
                [...(cycleHistoryModal.sub.cycleHistory || [])].reverse().map((cycle, idx) => (
                  <div key={idx} className="bg-darker rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-semibold">Cycle {cycle.cycle}</h4>
                      <span className="text-textGray text-xs">
                        {cycle.startDate ? new Date(cycle.startDate).toLocaleDateString() : ''} — {cycle.endDate ? new Date(cycle.endDate).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {(cycle.tasks || []).map((t, tIdx) => (
                        <div key={tIdx} className="flex items-center justify-between text-sm py-1 border-b border-gray-700/50 last:border-0">
                          <span className="text-white">{t.title}</span>
                          <div className="flex items-center space-x-3">
                            {t.deadline && (
                              <span className="text-textGray text-xs">Due: {new Date(t.deadline).toLocaleDateString()}</span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              t.status === 'done' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {t.status === 'done' ? 'Done' : t.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {cycle.completedAt && (
                      <p className="text-textGray text-xs mt-2">
                        Archived: {new Date(cycle.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
