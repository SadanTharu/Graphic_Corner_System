import { useState } from 'react';
import MyOrders from './MyOrders';
import MySubscriptions from './MySubscriptions';
import { ShoppingBag, Package } from 'lucide-react';

const CustomerOrdersHub = () => {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">My Orders & Subscriptions</h2>
        <p className="text-textGray mt-2">Track and manage all your orders and package subscriptions</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex space-x-1 bg-darker p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-medium transition-all text-sm ${
            activeTab === 'orders'
              ? 'bg-primary text-white shadow-lg'
              : 'text-textGray hover:text-white hover:bg-lightGray'
          }`}
        >
          <ShoppingBag size={18} />
          <span>Orders</span>
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-medium transition-all text-sm ${
            activeTab === 'subscriptions'
              ? 'bg-primary text-white shadow-lg'
              : 'text-textGray hover:text-white hover:bg-lightGray'
          }`}
        >
          <Package size={18} />
          <span>Subscriptions</span>
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'orders' ? (
          <MyOrders embedded />
        ) : (
          <MySubscriptions embedded />
        )}
      </div>
    </div>
  );
};

export default CustomerOrdersHub;
