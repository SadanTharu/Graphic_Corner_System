import { useState } from 'react';
import { ShoppingBag, ListChecks } from 'lucide-react';
import AdminOrders from './AdminOrders';
import AdminSubscriptions from './AdminSubscriptions';

const AdminOrdersHub = () => {
  const [activeTab, setActiveTab] = useState('orders');

  const tabs = [
    { key: 'orders', label: 'Orders', icon: ShoppingBag },
    { key: 'subscriptions', label: 'Subscriptions', icon: ListChecks },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">Orders & Subscriptions</h2>
        <p className="text-textGray mt-2">Manage all orders, subscriptions, and task assignments</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-darker p-1 rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-medium transition-all text-sm ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-textGray hover:text-white hover:bg-lightGray'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'orders' && <AdminOrders embedded />}
        {activeTab === 'subscriptions' && <AdminSubscriptions embedded />}
      </div>
    </div>
  );
};

export default AdminOrdersHub;
