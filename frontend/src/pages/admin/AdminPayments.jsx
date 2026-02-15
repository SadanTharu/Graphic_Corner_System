import { useState, useEffect, useCallback } from 'react';
import { ordersAPI, walletAPI } from '../../utils/api';
import {
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  Loader2,
  Eye,
  Wallet,
  CreditCard,
  FileText,
  X,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPayments = () => {
  const [activeTab, setActiveTab] = useState('order_payments');
  const [orders, setOrders] = useState([]);
  const [pendingTopups, setPendingTopups] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [slipModal, setSlipModal] = useState({ isOpen: false, url: '', title: '' });

  const fetchData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      const [ordersData, topupsData, transactionsData] = await Promise.all([
        ordersAPI.getAll(),
        walletAPI.getPendingTopups().catch(() => ({ transactions: [] })),
        walletAPI.getAllTransactions().catch(() => ({ transactions: [] }))
      ]);

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setPendingTopups(topupsData.transactions || []);
      setAllTransactions(transactionsData.transactions || []);
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Get all orders that have at least one pending payment
  const ordersWithPendingPayments = orders.filter(order =>
    order.payments?.some(p => p.status === 'pending')
  );

  // Get all verified/rejected payments for history
  const paymentHistory = orders.flatMap(order =>
    (order.payments || [])
      .filter(p => p.status !== 'pending')
      .map(p => ({
        ...p,
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customer?.name || 'Unknown',
        customerEmail: order.customer?.email || '',
        serviceName: order.service?.name || 'N/A'
      }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  // --- Order Payment Handlers ---
  const handleVerifyPayment = async (orderId, paymentIndex, action) => {
    const label = action === 'verify' ? 'verify' : 'reject';
    if (!confirm(`Are you sure you want to ${label} this payment?`)) return;

    try {
      await ordersAPI.verifyPayment(orderId, paymentIndex, action);
      toast.success(`Payment ${action === 'verify' ? 'verified' : 'rejected'} successfully!`);
      fetchData(false);
    } catch (error) {
      console.error(`Error ${label}ing payment:`, error);
      toast.error(`Failed to ${label} payment`);
    }
  };

  // --- Wallet Top-up Handlers ---
  const handleReviewTopup = async (transactionId, action) => {
    const label = action === 'approve' ? 'approve' : 'reject';
    if (!confirm(`Are you sure you want to ${label} this wallet top-up?`)) return;

    try {
      await walletAPI.reviewTopup(transactionId, action);
      toast.success(`Top-up ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      fetchData(false);
    } catch (error) {
      console.error(`Error ${label}ing top-up:`, error);
      toast.error(`Failed to ${label} top-up`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    {
      key: 'order_payments',
      label: 'Order Payments',
      icon: CreditCard,
      count: ordersWithPendingPayments.reduce(
        (sum, o) => sum + o.payments.filter(p => p.status === 'pending').length,
        0
      )
    },
    {
      key: 'wallet_topups',
      label: 'Wallet Top-ups',
      icon: Wallet,
      count: pendingTopups.length
    },
    {
      key: 'history',
      label: 'Payment History',
      icon: FileText,
      count: null
    }
  ];

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
          <h2 className="text-2xl md:text-3xl font-bold text-white">Payment Verification</h2>
          <p className="text-textGray mt-2">Review and verify customer payments and wallet top-ups</p>
        </div>
        <button
          onClick={() => fetchData(false)}
          disabled={refreshing}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-lg bg-yellow-500/10">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <p className="text-textGray text-sm mt-3">Pending Order Payments</p>
          <p className="text-2xl font-bold text-white mt-1">
            {ordersWithPendingPayments.reduce(
              (sum, o) => sum + o.payments.filter(p => p.status === 'pending').length,
              0
            )}
          </p>
        </div>
        <div className="card">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-lg bg-orange-500/10">
              <Wallet className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <p className="text-textGray text-sm mt-3">Pending Top-ups</p>
          <p className="text-2xl font-bold text-white mt-1">{pendingTopups.length}</p>
        </div>
        <div className="card">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-lg bg-green-500/10">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-textGray text-sm mt-3">Verified Today</p>
          <p className="text-2xl font-bold text-white mt-1">
            {allTransactions.filter(t => {
              const today = new Date();
              const txDate = new Date(t.updatedAt || t.createdAt);
              return t.status === 'completed' &&
                txDate.toDateString() === today.toDateString();
            }).length +
              paymentHistory.filter(p => {
                const today = new Date();
                const pDate = new Date(p.date);
                return p.status === 'verified' &&
                  pDate.toDateString() === today.toDateString();
              }).length
            }
          </p>
        </div>
        <div className="card">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-lg bg-primary/10">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-textGray text-sm mt-3">Total Pending Amount</p>
          <p className="text-2xl font-bold text-white mt-1">
            LKR {(
              ordersWithPendingPayments.reduce(
                (sum, o) =>
                  sum + o.payments.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0),
                0
              ) +
              pendingTopups.reduce((sum, t) => sum + (t.amount || 0), 0)
            ).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-darker rounded-lg p-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'text-textGray hover:text-white hover:bg-lightGray'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}

      {/* === ORDER PAYMENTS TAB === */}
      {activeTab === 'order_payments' && (
        <div className="space-y-4">
          {ordersWithPendingPayments.length === 0 ? (
            <div className="card text-center py-16">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <p className="text-white text-lg font-semibold">All caught up!</p>
              <p className="text-textGray mt-2">No pending order payments to verify.</p>
            </div>
          ) : (
            ordersWithPendingPayments.map(order =>
              order.payments
                .map((payment, paymentIndex) => ({ payment, paymentIndex }))
                .filter(({ payment }) => payment.status === 'pending')
                .map(({ payment, paymentIndex }) => (
                  <div
                    key={`${order._id}-${paymentIndex}`}
                    className="card border border-yellow-500/20"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left: Order & Payment Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-3">
                          <span className="bg-yellow-500/20 text-yellow-500 text-xs font-bold px-2 py-1 rounded-full uppercase">
                            {payment.type} Payment
                          </span>
                          <span className="text-textGray text-sm">
                            Order #{order.orderNumber}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                          <div>
                            <p className="text-textGray text-xs">Customer</p>
                            <p className="text-white font-medium">{order.customer?.name || 'N/A'}</p>
                            <p className="text-textGray text-xs">{order.customer?.email || ''}</p>
                          </div>
                          <div>
                            <p className="text-textGray text-xs">Service</p>
                            <p className="text-white font-medium">{order.service?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-textGray text-xs">Amount</p>
                            <p className="text-primary font-bold text-lg">
                              LKR {(payment.amount || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-textGray text-xs">Submitted</p>
                            <p className="text-white text-sm">{formatDate(payment.date)}</p>
                          </div>
                        </div>

                        {/* Order amounts context */}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-textGray">
                          <span>Order Total: LKR {order.totalAmount?.toLocaleString()}</span>
                          <span>Advance (25%): LKR {order.advanceAmount?.toLocaleString()}</span>
                          <span>Balance: LKR {(order.totalAmount - order.advanceAmount)?.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center space-x-3">
                        {payment.slip && (
                          <button
                            onClick={() => setSlipModal({
                              isOpen: true,
                              url: payment.slip,
                              title: `${payment.type} Payment Slip - Order #${order.orderNumber}`
                            })}
                            className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                          >
                            <Eye size={16} />
                            <span>View Slip</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleVerifyPayment(order._id, paymentIndex, 'verify')}
                          className="bg-green-500/20 text-green-500 hover:bg-green-500/30 px-5 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                        >
                          <CheckCircle size={16} />
                          <span>Verify</span>
                        </button>
                        <button
                          onClick={() => handleVerifyPayment(order._id, paymentIndex, 'reject')}
                          className="bg-red-500/20 text-red-500 hover:bg-red-500/30 px-5 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                        >
                          <XCircle size={16} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            )
          )}
        </div>
      )}

      {/* === WALLET TOP-UPS TAB === */}
      {activeTab === 'wallet_topups' && (
        <div className="space-y-4">
          {pendingTopups.length === 0 ? (
            <div className="card text-center py-16">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <p className="text-white text-lg font-semibold">All caught up!</p>
              <p className="text-textGray mt-2">No pending wallet top-ups to review.</p>
            </div>
          ) : (
            pendingTopups.map(topup => (
              <div
                key={topup._id}
                className="card border border-orange-500/20"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Left: Top-up Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="bg-orange-500/20 text-orange-500 text-xs font-bold px-2 py-1 rounded-full uppercase">
                        Wallet Top-up
                      </span>
                      <span className="bg-yellow-500/20 text-yellow-500 text-xs font-bold px-2 py-1 rounded-full">
                        Pending
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                      <div>
                        <p className="text-textGray text-xs">Customer</p>
                        <p className="text-white font-medium">{topup.user?.name || 'N/A'}</p>
                        <p className="text-textGray text-xs">{topup.user?.email || ''}</p>
                      </div>
                      <div>
                        <p className="text-textGray text-xs">Amount</p>
                        <p className="text-primary font-bold text-lg">
                          LKR {(topup.amount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-textGray text-xs">Payment Method</p>
                        <p className="text-white font-medium capitalize">
                          {topup.paymentMethod?.replace('_', ' ') || 'Bank Transfer'}
                        </p>
                      </div>
                      <div>
                        <p className="text-textGray text-xs">Submitted</p>
                        <p className="text-white text-sm">{formatDate(topup.createdAt)}</p>
                      </div>
                    </div>

                    {topup.reference && (
                      <p className="text-textGray text-xs mt-1">
                        Reference: <span className="text-white">{topup.reference}</span>
                      </p>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-3">
                    {topup.slip && (
                      <button
                        onClick={() => setSlipModal({
                          isOpen: true,
                          url: topup.slip,
                          title: `Top-up Slip - ${topup.user?.name || 'Customer'}`
                        })}
                        className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                      >
                        <Eye size={16} />
                        <span>View Slip</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleReviewTopup(topup._id, 'approve')}
                      className="bg-green-500/20 text-green-500 hover:bg-green-500/30 px-5 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                    >
                      <CheckCircle size={16} />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReviewTopup(topup._id, 'reject')}
                      className="bg-red-500/20 text-red-500 hover:bg-red-500/30 px-5 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                    >
                      <XCircle size={16} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* === HISTORY TAB === */}
      {activeTab === 'history' && (
        <div className="card">
          <h3 className="text-lg font-bold text-white mb-4">All Payment & Top-up History</h3>

          {/* Combined history from order payments + wallet transactions */}
          {(() => {
            // Build combined list
            const combined = [
              ...paymentHistory.map(p => ({
                id: `order-${p.orderId}-${p.date}`,
                type: 'order_payment',
                label: `${p.type} Payment`,
                customer: p.customerName,
                email: p.customerEmail,
                amount: p.amount,
                status: p.status,
                date: p.date,
                reference: p.orderNumber,
                service: p.serviceName,
                slip: p.slip
              })),
              ...allTransactions
                .filter(t => t.status !== 'pending')
                .map(t => ({
                  id: t._id,
                  type: 'wallet_transaction',
                  label: t.type === 'topup' ? 'Wallet Top-up' : t.type === 'refund' ? 'Refund' : 'Wallet Payment',
                  customer: t.user?.name || 'Unknown',
                  email: t.user?.email || '',
                  amount: t.amount,
                  status: t.status === 'completed' ? 'verified' : t.status === 'failed' ? 'rejected' : t.status,
                  date: t.updatedAt || t.createdAt,
                  reference: t.reference || (t.order?.orderNumber || ''),
                  service: '',
                  slip: t.slip
                }))
            ].sort((a, b) => new Date(b.date) - new Date(a.date));

            if (combined.length === 0) {
              return (
                <div className="text-center py-12 text-textGray">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No payment history yet.</p>
                </div>
              );
            }

            return (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-textGray font-medium py-3 px-4 text-sm">Date</th>
                      <th className="text-left text-textGray font-medium py-3 px-4 text-sm">Type</th>
                      <th className="text-left text-textGray font-medium py-3 px-4 text-sm">Customer</th>
                      <th className="text-left text-textGray font-medium py-3 px-4 text-sm">Reference</th>
                      <th className="text-right text-textGray font-medium py-3 px-4 text-sm">Amount</th>
                      <th className="text-center text-textGray font-medium py-3 px-4 text-sm">Status</th>
                      <th className="text-center text-textGray font-medium py-3 px-4 text-sm">Slip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combined.slice(0, 50).map(item => (
                      <tr key={item.id} className="border-b border-gray-800 hover:bg-darker transition-colors">
                        <td className="py-3 px-4 text-white text-sm">
                          {formatDate(item.date)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            item.type === 'order_payment'
                              ? 'bg-blue-500/20 text-blue-500'
                              : 'bg-orange-500/20 text-orange-500'
                          }`}>
                            {item.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-white text-sm">{item.customer}</p>
                          <p className="text-textGray text-xs">{item.email}</p>
                        </td>
                        <td className="py-3 px-4 text-textGray text-sm">
                          {item.reference}
                          {item.service && <span className="block text-xs">{item.service}</span>}
                        </td>
                        <td className="py-3 px-4 text-right text-primary font-bold text-sm">
                          LKR {(item.amount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            item.status === 'verified'
                              ? 'bg-green-500/20 text-green-500'
                              : item.status === 'rejected'
                              ? 'bg-red-500/20 text-red-500'
                              : 'bg-gray-500/20 text-gray-500'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.slip ? (
                            <button
                              onClick={() => setSlipModal({
                                isOpen: true,
                                url: item.slip,
                                title: `${item.label} Slip - ${item.customer}`
                              })}
                              className="text-blue-500 hover:text-blue-400"
                            >
                              <Eye size={16} />
                            </button>
                          ) : (
                            <span className="text-textGray text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* Slip Preview Modal */}
      {slipModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-lightGray rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-lightGray border-b border-gray-700 p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{slipModal.title}</h3>
              <div className="flex items-center space-x-2">
                <a
                  href={slipModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-400 flex items-center space-x-1 text-sm"
                >
                  <ExternalLink size={14} />
                  <span>Open in new tab</span>
                </a>
                <button
                  onClick={() => setSlipModal({ isOpen: false, url: '', title: '' })}
                  className="p-2 hover:bg-darker rounded-lg transition-colors"
                >
                  <X size={20} className="text-textGray" />
                </button>
              </div>
            </div>
            <div className="p-6 flex items-center justify-center">
              {slipModal.url.endsWith('.pdf') ? (
                <div className="text-center space-y-4">
                  <FileText size={64} className="mx-auto text-primary" />
                  <p className="text-textGray">PDF document</p>
                  <a
                    href={slipModal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <ExternalLink size={16} />
                    <span>Open PDF</span>
                  </a>
                </div>
              ) : (
                <img
                  src={slipModal.url}
                  alt="Payment Slip"
                  className="max-w-full max-h-[70vh] rounded-lg object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              )}
              <div className="hidden flex-col items-center space-y-3 text-center">
                <AlertTriangle size={48} className="text-yellow-500" />
                <p className="text-textGray">Could not load image preview</p>
                <a
                  href={slipModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary inline-flex items-center space-x-2"
                >
                  <ExternalLink size={16} />
                  <span>Open directly</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
