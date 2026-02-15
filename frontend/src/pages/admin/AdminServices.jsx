import { useState } from 'react';
import { services } from '../../data';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminServices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = ['All', 'Graphics', 'Video', '3D', 'AI'];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || service.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (service) => {
    toast.success(`Edit ${service.name} (Coming soon)`);
  };

  const handleDelete = (service) => {
    toast.error(`Delete ${service.name} (Coming soon)`);
  };

  const handleAddNew = () => {
    toast.success('Add new service (Coming soon)');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Service Management</h2>
          <p className="text-textGray mt-2">Manage your service catalog</p>
        </div>
        <button onClick={handleAddNew} className="btn-primary flex items-center space-x-2 mt-4 md:mt-0">
          <Plus size={20} />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textGray" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search services..."
              className="input-field pl-11"
            />
          </div>

          {/* Category Filter */}
          <div className="flex space-x-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-darker text-textGray hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                {service.category}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="p-2 hover:bg-darker rounded-lg transition-colors"
                >
                  <Edit2 size={16} className="text-blue-500" />
                </button>
                <button
                  onClick={() => handleDelete(service)}
                  className="p-2 hover:bg-darker rounded-lg transition-colors"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
            <p className="text-textGray text-sm mb-4 line-clamp-2">{service.description}</p>

            <div className="space-y-2 pt-4 border-t border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-textGray">Price Range:</span>
                <span className="text-white font-semibold">LKR {service.priceRange}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-textGray">Delivery:</span>
                <span className="text-white">{service.deliveryTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-textGray">No services found matching your criteria</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-textGray text-sm mb-2">Total Services</p>
          <p className="text-3xl font-bold text-white">{services.length}</p>
        </div>
        <div className="card">
          <p className="text-textGray text-sm mb-2">Graphics</p>
          <p className="text-3xl font-bold text-purple-500">
            {services.filter(s => s.category === 'Graphics').length}
          </p>
        </div>
        <div className="card">
          <p className="text-textGray text-sm mb-2">Video</p>
          <p className="text-3xl font-bold text-blue-500">
            {services.filter(s => s.category === 'Video').length}
          </p>
        </div>
        <div className="card">
          <p className="text-textGray text-sm mb-2">3D & AI</p>
          <p className="text-3xl font-bold text-green-500">
            {services.filter(s => s.category === '3D' || s.category === 'AI').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminServices;
