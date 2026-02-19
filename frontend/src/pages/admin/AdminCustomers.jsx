import { useState, useEffect } from 'react';
import { usersAPI, ordersAPI, subscriptionsAPI } from '../../utils/api';
import {
  Users, Search, Loader2, Mail, Phone, Calendar, ShoppingBag,
  Package, Wallet, ChevronDown, ChevronUp, Eye, X, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerSubs, setCustomerSubs] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const users = await usersAPI.getAll();
      const customerList = (Array.isArray(users) ? users : []).filter(u => u.role === 'customer');
      setCustomers(customerList);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const openCustomerDetail = async (customer) => {
    setSelectedCustomer(customer);
    setDetailLoading(true);
    try {
      const [orders, subs] = await Promise.all([
        ordersAPI.getAll(),
        subscriptionsAPI.getAll()
      ]);
      const custOrders = (Array.isArray(orders) ? orders : []).filter(
        o => (o.customer?._id || o.customer) === customer._id
      );
      const custSubs = (Array.isArray(subs) ? subs : []).filter(
        s => (s.customer?._id || s.customer) === customer._id
      );
      setCustomerOrders(custOrders);
      setCustomerSubs(custSubs);
    } catch (error) {
      console.error('Error fetching customer details:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500';
      case 'in_progress': return 'bg-blue-500/20 text-blue-500';
      case 'completed': return 'bg-green-500/20 text-green-500';
      case 'cancelled': return 'bg-red-500/20 text-red-500';
      case 'active': return 'bg-green-500/20 text-green-500';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

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
          <h2 className="text-2xl md:text-3xl font-bold text-white">Customer Management</h2>
          <p className="text-textGray mt-2">View and manage all registered customers</p>
        </div>
        <button onClick={fetchCustomers} className="btn-secondary flex items-center space-x-2">
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-textGray text-xs mb-1">Total Customers</p>
          <p className="text-2xl font-bold text-white">{customers.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-textGray text-xs mb-1">Active (30 days)</p>
          <p className="text-2xl font-bold text-green-400">
            {customers.filter(c => {
              const lastActive = new Date(c.updatedAt || c.createdAt);
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              return lastActive >= thirtyDaysAgo;
            }).length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-textGray text-xs mb-1">Verified</p>
          <p className="text-2xl font-bold text-blue-400">
            {customers.filter(c => c.isVerified).length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-textGray text-xs mb-1">With Wallet Balance</p>
          <p className="text-2xl font-bold text-primary">
            {customers.filter(c => (c.walletBalance || 0) > 0).length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textGray" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Customers List */}
      <div className="space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="card text-center py-12">
            <Users className="w-16 h-16 text-textGray mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Customers Found</h3>
            <p className="text-textGray">
              {searchTerm ? 'Try a different search term.' : 'No customers have registered yet.'}
            </p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer._id} className="card hover:ring-1 hover:ring-primary/30 transition-all">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={customer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=E53E3E&color=fff`}
                    alt={customer.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-white font-semibold">{customer.name}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-textGray mt-1">
                      <span className="flex items-center space-x-1">
                        <Mail size={14} />
                        <span>{customer.email}</span>
                      </span>
                      {customer.phone && (
                        <span className="flex items-center space-x-1">
                          <Phone size={14} />
                          <span>{customer.phone}</span>
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>Joined {new Date(customer.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 md:mt-0">
                  <div className="text-right">
                    <p className="text-textGray text-xs">Wallet</p>
                    <p className="text-primary font-semibold text-sm">
                      LKR {(customer.walletBalance || 0).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    customer.isActive !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {customer.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => openCustomerDetail(customer)}
                    className="bg-primary/20 text-primary hover:bg-primary/30 px-3 py-2 rounded-lg font-medium text-sm flex items-center space-x-1 transition-all"
                  >
                    <Eye size={14} />
                    <span>View</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-lightGray rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-lightGray border-b border-gray-700 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedCustomer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCustomer.name)}&background=E53E3E&color=fff`}
                  alt={selectedCustomer.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedCustomer.name}</h3>
                  <p className="text-textGray text-sm">{selectedCustomer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 hover:bg-darker rounded-lg transition-colors"
              >
                <X size={24} className="text-textGray" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-darker p-3 rounded-lg text-center">
                  <p className="text-textGray text-xs">Wallet Balance</p>
                  <p className="text-primary font-bold mt-1">
                    LKR {(selectedCustomer.walletBalance || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-darker p-3 rounded-lg text-center">
                  <p className="text-textGray text-xs">Joined</p>
                  <p className="text-white font-semibold mt-1 text-sm">
                    {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {selectedCustomer.phone && (
                  <div className="bg-darker p-3 rounded-lg text-center">
                    <p className="text-textGray text-xs">Phone</p>
                    <p className="text-white font-semibold mt-1 text-sm">{selectedCustomer.phone}</p>
                  </div>
                )}
                <div className="bg-darker p-3 rounded-lg text-center">
                  <p className="text-textGray text-xs">Status</p>
                  <p className={`font-semibold mt-1 text-sm ${selectedCustomer.isActive !== false ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedCustomer.isActive !== false ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              {detailLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : (
                <>
                  {/* Orders */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <ShoppingBag className="w-5 h-5 text-primary" />
                      <h4 className="text-white font-semibold">Orders ({customerOrders.length})</h4>
                    </div>
                    {customerOrders.length === 0 ? (
                      <p className="text-textGray text-sm bg-darker p-4 rounded-lg">No orders yet</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {customerOrders.slice(0, 10).map((order) => (
                          <div key={order._id} className="bg-darker p-3 rounded-lg flex items-center justify-between">
                            <div>
                              <p className="text-white text-sm font-medium">
                                {order.service?.name || order.services?.map(s => s.service?.name).join(', ') || 'Order'}
                              </p>
                              <p className="text-textGray text-xs">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              {order.finalPrice > 0 && (
                                <span className="text-primary font-semibold text-sm">
                                  LKR {order.finalPrice.toLocaleString()}
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status?.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Subscriptions */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Package className="w-5 h-5 text-blue-400" />
                      <h4 className="text-white font-semibold">Subscriptions ({customerSubs.length})</h4>
                    </div>
                    {customerSubs.length === 0 ? (
                      <p className="text-textGray text-sm bg-darker p-4 rounded-lg">No subscriptions yet</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {customerSubs.map((sub) => (
                          <div key={sub._id} className="bg-darker p-3 rounded-lg flex items-center justify-between">
                            <div>
                              <p className="text-white text-sm font-medium">{sub.packageName}</p>
                              <p className="text-textGray text-xs">
                                {sub.duration} • Cycle {sub.currentCycle || 1} • {(sub.tasks || []).length} tasks
                              </p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-primary font-semibold text-sm">
                                LKR {(sub.offeringPrice || 0).toLocaleString()}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                                {sub.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
