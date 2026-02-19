import { useState } from 'react';
import { CreditCard, BarChart3 } from 'lucide-react';
import AdminPayments from './AdminPayments';
import AdminFinance from './AdminFinance';

const AdminPaymentsHub = () => {
  const [activeTab, setActiveTab] = useState('payments');

  const tabs = [
    { key: 'payments', label: 'Payment Verification', icon: CreditCard },
    { key: 'finance', label: 'Finance Overview', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">Payments & Finance</h2>
        <p className="text-textGray mt-2">Verify payments, manage top-ups, and track financial performance</p>
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
        {activeTab === 'payments' && <AdminPayments embedded />}
        {activeTab === 'finance' && <AdminFinance embedded />}
      </div>
    </div>
  );
};

export default AdminPaymentsHub;
