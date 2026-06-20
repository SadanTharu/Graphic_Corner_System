import { useState, useEffect } from 'react';
import { subscriptionsAPI, walletAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, Clock, Check, CheckCircle, XCircle, Upload, 
  FileText, Loader2, Eye, ChevronDown, ChevronUp, Send, X,
  CreditCard, Wallet, AlertCircle, Image, Calendar, DollarSign,
  ExternalLink, Link2, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'graphiccornersystem-bwh6hrghayebbwb9.southeastasia-01.azurewebsites.net';

const ensureUrl = (url) => {
  if (!url) return '#';
  return /^https?:\/\//i.test(url) ? url : 'https://' + url;
};

const MySubscriptions = ({ embedded }) => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSub, setExpandedSub] = useState(null);
  const [rawModal, setRawModal] = useState({ isOpen: false, subId: null, taskId: null, taskTitle: '' });
  const [rawForm, setRawForm] = useState({ urls: [''], instructions: '' });
  const [submitting, setSubmitting] = useState(false);
  // Payment state — type: 'advance' or 'final'
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, sub: null, type: 'advance' });
  const [paymentMethod, setPaymentMethod] = useState(''); // 'wallet' or 'direct'
  const [activeTab, setActiveTab] = useState({}); // subId -> 'tasks' | 'deliverables'
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [payProcessing, setPayProcessing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    fetchSubscriptions();
    fetchWalletBalance();
    const interval = setInterval(fetchSubscriptions, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const data = await walletAPI.getBalance();
      setWalletBalance(data?.balance || data?.walletBalance || 0);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const data = await subscriptionsAPI.getAll();
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-500/20 text-yellow-500', icon: Clock, label: 'Pending Approval' };
      case 'awaiting_payment':
        return { color: 'bg-orange-500/20 text-orange-400', icon: CreditCard, label: 'Awaiting Payment' };
      case 'active':
        return { color: 'bg-green-500/20 text-green-500', icon: CheckCircle, label: 'Active' };
      case 'awaiting_final_payment':
        return { color: 'bg-orange-500/20 text-orange-400', icon: DollarSign, label: 'Awaiting Final Payment' };
      case 'completed':
        return { color: 'bg-green-500/20 text-green-500', icon: CheckCircle, label: 'Completed' };
      case 'cancelled':
        return { color: 'bg-red-500/20 text-red-500', icon: XCircle, label: 'Cancelled' };
      default:
        return { color: 'bg-gray-500/20 text-gray-400', icon: Clock, label: status };
    }
  };

  const getTaskStatusConfig = (status) => {
    switch (status) {
      case 'todo':
        return { color: 'bg-gray-500/20 text-gray-400', label: 'To Do' };
      case 'in_progress':
        return { color: 'bg-blue-500/20 text-blue-500', label: 'In Progress' };
      case 'review':
        return { color: 'bg-purple-500/20 text-purple-500', label: 'Under Review' };
      case 'done':
        return { color: 'bg-green-500/20 text-green-500', label: 'Done' };
      default:
        return { color: 'bg-gray-500/20 text-gray-400', label: status };
    }
  };

  // ─── Payment handlers ──────────────────────────
  const openPaymentModal = (sub, type = 'advance') => {
    setPaymentModal({ isOpen: true, sub, type });
    setPaymentMethod('');
    setSlipFile(null);
    setSlipPreview(null);
  };

  const handleSlipSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSlipFile(file);
    if (file.type.startsWith('image/')) {
      setSlipPreview(URL.createObjectURL(file));
    } else {
      setSlipPreview(null);
    }
  };

  const uploadSlipToServer = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'payment_slips');

    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/upload/single`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Failed to upload slip');
    }
    const data = await res.json();
    return data.file?.url || data.url || data.secure_url;
  };

  const handleDirectPayment = async () => {
    if (!slipFile) {
      toast.error('Please upload a payment slip');
      return;
    }
    setPayProcessing(true);
    try {
      const slipUrl = await uploadSlipToServer(slipFile);
      if (paymentModal.type === 'final') {
        await subscriptionsAPI.payFinalDirect(paymentModal.sub._id, slipUrl);
        toast.success('Final payment slip uploaded! Awaiting admin verification.');
      } else {
        await subscriptionsAPI.payDirect(paymentModal.sub._id, slipUrl);
        toast.success('Payment slip uploaded! Awaiting admin verification.');
      }
      setPaymentModal({ isOpen: false, sub: null, type: 'advance' });
      fetchSubscriptions();
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error(error.message || 'Failed to submit payment');
    } finally {
      setPayProcessing(false);
    }
  };

  const handleWalletPayment = async () => {
    setPayProcessing(true);
    try {
      let res;
      if (paymentModal.type === 'final') {
        res = await subscriptionsAPI.walletPayFinal(paymentModal.sub._id);
        toast.success(res.message || 'Final payment successful! Subscription is now complete.');
      } else {
        res = await subscriptionsAPI.walletPay(paymentModal.sub._id);
        toast.success(res.message || 'Wallet payment successful! Subscription is now active.');
      }
      if (res.newBalance !== undefined) setWalletBalance(res.newBalance);
      setPaymentModal({ isOpen: false, sub: null, type: 'advance' });
      fetchSubscriptions();
    } catch (error) {
      console.error('Error with wallet payment:', error);
      toast.error(error.message || 'Failed to process wallet payment');
    } finally {
      setPayProcessing(false);
    }
  };

  // ─── Raw file handlers ─────────────────────────
  const openRawModal = (subId, task) => {
    setRawModal({ isOpen: true, subId, taskId: task._id, taskTitle: task.title });
    setRawForm({
      urls: [''],
      instructions: task.instructions || ''
    });
  };

  const handleAddUrl = () => {
    setRawForm({ ...rawForm, urls: [...rawForm.urls, ''] });
  };

  const handleRemoveUrl = (index) => {
    const updated = rawForm.urls.filter((_, i) => i !== index);
    setRawForm({ ...rawForm, urls: updated.length > 0 ? updated : [''] });
  };

  const handleUrlChange = (index, value) => {
    const updated = [...rawForm.urls];
    updated[index] = value;
    setRawForm({ ...rawForm, urls: updated });
  };

  const handleSubmitRaw = async () => {
    const validUrls = rawForm.urls.filter(u => u.trim());
    if (validUrls.length === 0 && !rawForm.instructions.trim()) {
      toast.error('Please provide at least one file link or instructions');
      return;
    }

    setSubmitting(true);
    try {
      const rawFiles = validUrls.map(url => ({ url: url.trim(), name: 'Raw File' }));
      await subscriptionsAPI.uploadRaw(rawModal.subId, rawModal.taskId, {
        rawFiles,
        instructions: rawForm.instructions
      });
      toast.success('Raw files and instructions uploaded!');
      setRawModal({ isOpen: false, subId: null, taskId: null, taskTitle: '' });
      fetchSubscriptions();
    } catch (error) {
      console.error('Error uploading raw:', error);
      toast.error(error.message || 'Failed to upload');
    } finally {
      setSubmitting(false);
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
      {!embedded && (
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">My Subscriptions</h2>
          <p className="text-textGray mt-2">Manage your package subscriptions and provide task details</p>
        </div>
      )}

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="w-16 h-16 text-textGray mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Subscriptions Yet</h3>
          <p className="text-textGray">Subscribe to a package from the New Request page to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => {
            const statusConfig = getStatusConfig(sub.status);
            const StatusIcon = statusConfig.icon;
            const isExpanded = expandedSub === sub._id;
            const tasks = sub.tasks || [];
            const completedTasks = tasks.filter(t => t.status === 'done').length;
            const paymentStatus = sub.payment?.status;

            return (
              <div key={sub._id} className="card">
                {/* Subscription Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Package className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-bold text-white">{sub.packageName}</h3>
                      <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon size={14} />
                        <span>{statusConfig.label}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-textGray">Price:</span>{' '}
                        <span className="text-primary font-semibold">LKR {sub.offeringPrice?.toLocaleString()}</span>
                      </div>
                      {sub.discount > 0 && (
                        <div>
                          <span className="text-textGray">Discount:</span>{' '}
                          <span className="text-green-400 font-semibold">{sub.discount}% OFF</span>
                        </div>
                      )}
                      <div>
                        <span className="text-textGray">Duration:</span>{' '}
                        <span className="text-white">{sub.duration}</span>
                      </div>
                      <div>
                        <span className="text-textGray">Applied:</span>{' '}
                        <span className="text-white">{new Date(sub.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expand Tasks Button — only when active or completed */}
                  {tasks.length > 0 && ['active', 'completed', 'awaiting_final_payment'].includes(sub.status) && (
                    <button
                      onClick={() => setExpandedSub(isExpanded ? null : sub._id)}
                      className="mt-3 lg:mt-0 btn-secondary flex items-center space-x-2"
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      <span>Tasks ({completedTasks}/{tasks.length})</span>
                    </button>
                  )}
                </div>

                {/* Progress Bar — only for active/completed */}
                {tasks.length > 0 && ['active', 'completed', 'awaiting_final_payment'].includes(sub.status) && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-textGray">Progress</span>
                      <span className="text-white font-medium">{completedTasks}/{tasks.length} tasks done</span>
                    </div>
                    <div className="w-full bg-darker rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* ─── Cycle Info (Active subscriptions) ─── */}
                {sub.status === 'active' && sub.cycleStartDate && (
                  <div className="mb-4 bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <h4 className="text-blue-400 font-semibold">Cycle {sub.currentCycle || 1}</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
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
                      <div>
                        <span className="text-textGray">Days Left:</span>{' '}
                        <span className={`font-semibold ${
                          sub.cycleEndDate && new Date(sub.cycleEndDate) < new Date() ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {sub.cycleEndDate
                            ? Math.max(0, Math.ceil((new Date(sub.cycleEndDate) - new Date()) / (1000 * 60 * 60 * 24)))
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pending Status Banner */}
                {sub.status === 'pending' && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      <p className="text-yellow-500 font-medium">Your subscription request is being reviewed by the admin.</p>
                    </div>
                    <p className="text-textGray text-sm mt-1">You'll be notified once it's approved.</p>
                  </div>
                )}

                {/* ─── Awaiting Payment Banner ─── */}
                {sub.status === 'awaiting_payment' && (
                  <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg space-y-3">
                    {/* No payment submitted yet, or payment was rejected */}
                    {(!paymentStatus || paymentStatus === 'none' || paymentStatus === 'rejected') && (
                      <>
                        <div className="flex items-start space-x-2">
                          <CreditCard className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-orange-400 font-medium">
                              {paymentStatus === 'rejected'
                                ? 'Your payment slip was rejected. Please re-upload.'
                                : 'Your subscription has been approved! Pay 25% advance to start.'}
                            </p>
                            <p className="text-white text-lg font-bold mt-1">
                              Advance Amount: LKR {(sub.advanceAmount || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => openPaymentModal(sub)}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <CreditCard size={18} />
                          <span>{paymentStatus === 'rejected' ? 'Re-Upload Payment' : 'Pay Now'}</span>
                        </button>
                      </>
                    )}

                    {/* Payment pending admin verification */}
                    {paymentStatus === 'pending' && (
                      <div className="flex items-start space-x-2">
                        <Clock className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-orange-400 font-medium">Payment slip uploaded — awaiting admin verification.</p>
                          <p className="text-textGray text-sm mt-1">
                            Amount: LKR {(sub.advanceAmount || 0).toLocaleString()} •
                            Method: {sub.payment?.method === 'direct' ? 'Direct Transfer' : 'Wallet'} •
                            Paid: {sub.payment?.paidAt ? new Date(sub.payment.paidAt).toLocaleDateString() : ''}
                          </p>
                          {sub.payment?.slip && (
                            <a
                              href={ensureUrl(sub.payment.slip)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 mt-2 px-3 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-lg hover:bg-blue-500/20 transition-colors"
                            >
                              <Eye size={12} />
                              <span>View Uploaded Slip</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Awaiting Final Payment Banner ─── */}
                {sub.status === 'awaiting_final_payment' && (() => {
                  const finalPayStatus = sub.finalPayment?.status;
                  const remainingAmount = Math.round(sub.offeringPrice - (sub.advanceAmount || 0));
                  return (
                    <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg space-y-3">
                      {(!finalPayStatus || finalPayStatus === 'none' || finalPayStatus === 'rejected') && (
                        <>
                          <div className="flex items-start space-x-2">
                            <DollarSign className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-orange-400 font-medium">
                                {finalPayStatus === 'rejected'
                                  ? 'Your final payment slip was rejected. Please re-upload.'
                                  : 'All tasks are completed! Please pay the remaining balance.'}
                              </p>
                              <p className="text-white text-lg font-bold mt-1">
                                Final Payment: LKR {remainingAmount.toLocaleString()}
                              </p>
                              <p className="text-textGray text-xs mt-1">
                                75% remaining of LKR {(sub.offeringPrice || 0).toLocaleString()} (25% advance already paid)
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => openPaymentModal(sub, 'final')}
                            className="btn-primary flex items-center space-x-2"
                          >
                            <DollarSign size={18} />
                            <span>{finalPayStatus === 'rejected' ? 'Re-Upload Final Payment' : 'Pay Final Balance'}</span>
                          </button>
                        </>
                      )}

                      {finalPayStatus === 'pending' && (
                        <div className="flex items-start space-x-2">
                          <Clock className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-orange-400 font-medium">Final payment slip uploaded — awaiting admin verification.</p>
                            <p className="text-textGray text-sm mt-1">
                              Amount: LKR {remainingAmount.toLocaleString()} •
                              Method: {sub.finalPayment?.method === 'direct' ? 'Direct Transfer' : 'Wallet'} •
                              Paid: {sub.finalPayment?.paidAt ? new Date(sub.finalPayment.paidAt).toLocaleDateString() : ''}
                            </p>
                            {sub.finalPayment?.slip && (
                              <a
                                href={ensureUrl(sub.finalPayment.slip)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 mt-2 px-3 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-lg hover:bg-blue-500/20 transition-colors"
                              >
                                <Eye size={12} />
                                <span>View Uploaded Slip</span>
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* ─── Deliverables Tab (awaiting_final_payment, completed) ─── */}
                {['awaiting_final_payment', 'completed'].includes(sub.status) && tasks.some(t => t.deliverables?.length > 0) && (
                  <div className="mt-4">
                    {/* Tab Buttons */}
                    <div className="flex space-x-2 mb-4">
                      <button
                        onClick={() => setActiveTab({ ...activeTab, [sub._id]: 'tasks' })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          (activeTab[sub._id] || 'tasks') === 'tasks'
                            ? 'bg-primary text-white'
                            : 'bg-darker text-textGray hover:text-white'
                        }`}
                      >
                        Tasks Overview
                      </button>
                      <button
                        onClick={() => setActiveTab({ ...activeTab, [sub._id]: 'deliverables' })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          activeTab[sub._id] === 'deliverables'
                            ? 'bg-green-600 text-white'
                            : 'bg-darker text-textGray hover:text-white'
                        }`}
                      >
                        <span className="flex items-center space-x-1">
                          <CheckCircle size={14} />
                          <span>Final Deliverables</span>
                        </span>
                      </button>
                    </div>

                    {/* Deliverables Tab Content */}
                    {activeTab[sub._id] === 'deliverables' && (
                      <div className="space-y-4">
                        <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <p className="text-green-400 text-sm font-medium">
                            All task outputs and deliverables for "{sub.packageName}"
                          </p>
                        </div>
                        {tasks.map((task) => {
                          if (!task.deliverables?.length && !task.instructions && !task.rawFiles?.length) return null;
                          return (
                            <div key={task._id} className="bg-darker rounded-lg p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle size={16} className="text-green-400" />
                                  <h5 className="text-white font-semibold">{task.title}</h5>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTaskStatusConfig(task.status).color}`}>
                                  {getTaskStatusConfig(task.status).label}
                                </span>
                              </div>
                              {task.description && (
                                <p className="text-textGray text-sm">{task.description}</p>
                              )}

                              {/* Instructions Provided */}
                              {task.instructions && (
                                <div className="bg-lightGray p-3 rounded-lg">
                                  <p className="text-textGray text-xs font-semibold mb-1 flex items-center space-x-1">
                                    <FileText size={12} />
                                    <span>Instructions Provided:</span>
                                  </p>
                                  <p className="text-white text-sm">{task.instructions}</p>
                                </div>
                              )}

                              {/* Raw Files Provided */}
                              {task.rawFiles?.length > 0 && (
                                <div>
                                  <p className="text-blue-400 text-xs font-semibold mb-2 flex items-center space-x-1">
                                    <Link2 size={12} />
                                    <span>Raw Files Provided ({task.rawFiles.length}):</span>
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {task.rawFiles.map((file, idx) => (
                                      <a
                                        key={idx}
                                        href={ensureUrl(file.url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-2 px-3 py-2 bg-blue-500/10 text-blue-400 text-sm rounded-lg hover:bg-blue-500/20 transition-colors"
                                      >
                                        <ExternalLink size={14} />
                                        <span className="truncate">{file.name || file.url}</span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Final Deliverables / Output Links */}
                              {task.deliverables?.length > 0 && (
                                <div>
                                  <p className="text-green-400 text-xs font-semibold mb-2 flex items-center space-x-1">
                                    <CheckCircle size={12} />
                                    <span>Final Output ({task.deliverables.length} files):</span>
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {task.deliverables.map((d, idx) => (
                                      <a
                                        key={idx}
                                        href={ensureUrl(d.url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-2 px-3 py-2 bg-green-500/10 text-green-400 text-sm rounded-lg hover:bg-green-500/20 transition-colors border border-green-500/20"
                                      >
                                        <ExternalLink size={14} />
                                        <span className="truncate">{d.name || `Output ${idx + 1}`}</span>
                                        <Eye size={14} className="ml-auto flex-shrink-0" />
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
                )}

                {/* Tasks List (Expanded — only active/completed/awaiting_final subs) */}
                {isExpanded && tasks.length > 0 && ['active', 'completed', 'awaiting_final_payment'].includes(sub.status) && (activeTab[sub._id] || 'tasks') === 'tasks' && (
                  <div className="mt-4 space-y-3">
                    <h4 className="text-white font-semibold text-lg">Tasks</h4>
                    {tasks.map((task) => {
                      const taskStatus = getTaskStatusConfig(task.status);
                      return (
                        <div key={task._id} className="bg-darker rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h5 className="text-white font-medium">{task.title}</h5>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${taskStatus.color}`}>
                                  {taskStatus.label}
                                </span>
                              </div>
                              <p className="text-textGray text-sm">{task.description}</p>
                              {task.assignedTo && (
                                <p className="text-textGray text-xs mt-1">
                                  Assigned to: <span className="text-blue-400">{task.assignedTo.name}</span>
                                </p>
                              )}
                              {/* Deadline display */}
                              {task.dueDate && (
                                <p className="text-textGray text-xs mt-1 flex items-center space-x-1">
                                  <Calendar size={12} className="text-yellow-400" />
                                  <span>Deadline:{' '}
                                    <span className={`font-semibold ${
                                      task.status === 'done' ? 'text-green-400' :
                                      new Date(task.dueDate) < new Date() ? 'text-red-400' : 'text-yellow-400'
                                    }`}>
                                      {new Date(task.dueDate).toLocaleDateString()}
                                      {task.status !== 'done' && new Date(task.dueDate) < new Date() && ' (Overdue)'}
                                    </span>
                                  </span>
                                </p>
                              )}
                            </div>
                            {/* Upload Raw Button — only if active and task not done */}
                            {sub.status === 'active' && task.status !== 'done' && (
                              <button
                                onClick={() => openRawModal(sub._id, task)}
                                className="mt-2 md:mt-0 bg-primary/20 text-primary hover:bg-primary/30 px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 text-sm"
                              >
                                <Upload size={16} />
                                <span>{task.rawFiles?.length > 0 ? 'Add More Files' : 'Upload Raw & Instructions'}</span>
                              </button>
                            )}
                          </div>

                          {/* Instructions */}
                          {task.instructions && (
                            <div className="bg-lightGray p-3 rounded-lg mb-2">
                              <p className="text-textGray text-xs font-semibold mb-1">Your Instructions:</p>
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
                                    className="flex items-center space-x-1 px-3 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-lg hover:bg-blue-500/20 transition-colors"
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
                                    className="flex items-center space-x-1 px-3 py-1 bg-green-500/10 text-green-400 text-xs rounded-lg hover:bg-green-500/20 transition-colors"
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
          })}
        </div>
      )}

      {/* ─── Payment Modal (Advance & Final) ─── */}
      {paymentModal.isOpen && paymentModal.sub && (() => {
        const isFinal = paymentModal.type === 'final';
        const payAmount = isFinal
          ? Math.round(paymentModal.sub.offeringPrice - (paymentModal.sub.advanceAmount || 0))
          : (paymentModal.sub.advanceAmount || 0);
        const payLabel = isFinal ? 'Pay Final Balance (75%)' : 'Pay 25% Advance';
        const payDesc = isFinal
          ? `75% remaining of LKR ${(paymentModal.sub.offeringPrice || 0).toLocaleString()}`
          : `25% of LKR ${(paymentModal.sub.offeringPrice || 0).toLocaleString()}`;

        return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-lightGray rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-lightGray border-b border-gray-700 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{payLabel}</h3>
                <p className="text-textGray text-sm mt-1">{paymentModal.sub.packageName}</p>
              </div>
              <button
                onClick={() => setPaymentModal({ isOpen: false, sub: null, type: 'advance' })}
                className="p-2 hover:bg-darker rounded-lg transition-colors"
              >
                <X size={24} className="text-textGray" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-darker p-4 rounded-lg text-center">
                <p className="text-textGray text-sm">Amount to Pay</p>
                <p className="text-3xl font-bold text-primary mt-1">
                  LKR {payAmount.toLocaleString()}
                </p>
                <p className="text-textGray text-xs mt-1">{payDesc}</p>
              </div>

              {/* Choose method */}
              <div>
                <p className="text-white font-medium mb-3">Choose Payment Method</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      paymentMethod === 'wallet'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <Wallet className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'wallet' ? 'text-primary' : 'text-textGray'}`} />
                    <p className={`font-medium ${paymentMethod === 'wallet' ? 'text-primary' : 'text-white'}`}>Wallet</p>
                    <p className="text-textGray text-xs mt-1">
                      Balance: LKR {walletBalance.toLocaleString()}
                    </p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('direct')}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      paymentMethod === 'direct'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <CreditCard className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'direct' ? 'text-primary' : 'text-textGray'}`} />
                    <p className={`font-medium ${paymentMethod === 'direct' ? 'text-primary' : 'text-white'}`}>Bank Transfer</p>
                    <p className="text-textGray text-xs mt-1">Upload payment slip</p>
                  </button>
                </div>
              </div>

              {/* Wallet Pay */}
              {paymentMethod === 'wallet' && (
                <div className="space-y-3">
                  {walletBalance < payAmount ? (
                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-500 font-medium text-sm">Insufficient wallet balance</p>
                        <p className="text-textGray text-xs">
                          Need LKR {payAmount.toLocaleString()}, 
                          have LKR {walletBalance.toLocaleString()}. 
                          Please top up your wallet or use bank transfer.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleWalletPayment}
                      disabled={payProcessing}
                      className="w-full btn-primary flex items-center justify-center space-x-2 py-3"
                    >
                      {payProcessing ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Wallet size={18} />
                      )}
                      <span>{payProcessing ? 'Processing...' : 'Pay with Wallet'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Direct Transfer / Slip Upload */}
              {paymentMethod === 'direct' && (
                <div className="space-y-3">
                  <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg">
                    <p className="text-blue-400 text-sm font-medium">Bank Transfer Instructions</p>
                    <p className="text-textGray text-xs mt-1">
                      Transfer LKR {payAmount.toLocaleString()} to the company bank account, 
                      then upload the payment slip below. Admin will verify the payment.
                    </p>
                  </div>

                  <div>
                    <label className="block text-textGray text-sm font-medium mb-2">Upload Payment Slip</label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      {slipPreview ? (
                        <div className="space-y-2">
                          <img src={slipPreview} alt="Slip" className="max-h-40 mx-auto rounded-lg" />
                          <p className="text-green-400 text-sm">{slipFile?.name}</p>
                          <button
                            onClick={() => { setSlipFile(null); setSlipPreview(null); }}
                            className="text-red-400 text-xs hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      ) : slipFile ? (
                        <div className="space-y-2">
                          <FileText className="w-10 h-10 text-blue-400 mx-auto" />
                          <p className="text-blue-400 text-sm">{slipFile.name}</p>
                          <button
                            onClick={() => { setSlipFile(null); setSlipPreview(null); }}
                            className="text-red-400 text-xs hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Image className="w-10 h-10 text-textGray mx-auto mb-2" />
                          <p className="text-textGray text-sm">Click to upload payment slip</p>
                          <p className="text-textGray text-xs mt-1">JPG, PNG, or PDF</p>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleSlipSelect}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleDirectPayment}
                    disabled={payProcessing || !slipFile}
                    className="w-full btn-primary flex items-center justify-center space-x-2 py-3 disabled:opacity-50"
                  >
                    {payProcessing ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Upload size={18} />
                    )}
                    <span>{payProcessing ? 'Uploading...' : 'Submit Payment Slip'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      {/* ─── Raw Files Upload Modal ─── */}
      {rawModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-lightGray rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-lightGray border-b border-gray-700 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Upload Raw Files & Instructions</h3>
                <p className="text-textGray text-sm mt-1">{rawModal.taskTitle}</p>
              </div>
              <button
                onClick={() => setRawModal({ isOpen: false, subId: null, taskId: null, taskTitle: '' })}
                className="p-2 hover:bg-darker rounded-lg transition-colors"
              >
                <X size={24} className="text-textGray" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* File URLs */}
              <div>
                <label className="block text-textGray text-sm font-medium mb-2">
                  Raw File Links (Google Drive, Dropbox, etc.)
                </label>
                {rawForm.urls.map((url, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="input-field flex-1"
                    />
                    {rawForm.urls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveUrl(index)}
                        className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="text-primary text-sm hover:text-red-400 transition-colors"
                >
                  + Add another link
                </button>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-textGray text-sm font-medium mb-2">
                  Instructions for the team
                </label>
                <textarea
                  value={rawForm.instructions}
                  onChange={(e) => setRawForm({ ...rawForm, instructions: e.target.value })}
                  placeholder="Describe what you want, colors, style, references, etc."
                  className="input-field"
                  rows="4"
                />
              </div>

              {/* Submit */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setRawModal({ isOpen: false, subId: null, taskId: null, taskTitle: '' })}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRaw}
                  disabled={submitting}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  <span>{submitting ? 'Uploading...' : 'Submit'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySubscriptions;
