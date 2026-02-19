import { useState } from 'react';
import { Package, Settings } from 'lucide-react';
import AdminServices from './AdminServices';
import AdminPackages from './AdminPackages';

const AdminCatalog = () => {
  const [activeTab, setActiveTab] = useState('services');

  const tabs = [
    { key: 'services', label: 'Services', icon: Settings },
    { key: 'packages', label: 'Packages', icon: Package },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">Services & Packages</h2>
        <p className="text-textGray mt-2">Manage your service catalog and package bundles</p>
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
        {activeTab === 'services' && <AdminServices embedded />}
        {activeTab === 'packages' && <AdminPackages embedded />}
      </div>
    </div>
  );
};

export default AdminCatalog;
