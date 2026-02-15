import { useState, useEffect } from 'react';
import { servicesAPI } from '../../utils/api';
import { Plus, Edit2, Trash2, Search, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'graphics',
    description: '',
    minPrice: '',
    maxPrice: '',
    deliveryTime: '',
  });

  const categories = ['All', 'graphics', 'video', '3d', 'ai'];
  const categoryLabels = {
    'All': 'All',
    'graphics': 'Graphics',
    'video': 'Video',
    '3d': '3D',
    'ai': 'AI'
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await servicesAPI.getAll();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || service.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'graphics',
      description: '',
      minPrice: '',
      maxPrice: '',
      deliveryTime: '',
    });
    setEditingService(null);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description,
      minPrice: service.priceRange?.min || '',
      maxPrice: service.priceRange?.max || '',
      deliveryTime: service.deliveryTime,
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.minPrice || !formData.maxPrice || !formData.deliveryTime) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const serviceData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        priceRange: {
          min: parseInt(formData.minPrice),
          max: parseInt(formData.maxPrice)
        },
        deliveryTime: formData.deliveryTime
      };

      if (editingService) {
        await servicesAPI.update(editingService._id, serviceData);
        toast.success('Service updated successfully');
      } else {
        await servicesAPI.create(serviceData);
        toast.success('Service created successfully');
      }

      setIsModalOpen(false);
      resetForm();
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(error.response?.data?.message || 'Failed to save service');
    }
  };

  const handleDelete = async (service) => {
    if (!confirm(`Are you sure you want to delete "${service.name}"?`)) return;

    try {
      await servicesAPI.delete(service._id);
      toast.success('Service deleted successfully');
      fetchServices(); // Refresh the list
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
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
                {categoryLabels[category]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service._id} className="card">
            <div className="flex items-start justify-between mb-4">
              <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                {categoryLabels[service.category]}
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
                <span className="text-white font-semibold">
                  LKR {service.priceRange?.min?.toLocaleString()} - {service.priceRange?.max?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-textGray">Delivery:</span>
                <span className="text-white">{service.deliveryTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && !loading && (
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
            {services.filter(s => s.category === 'graphics').length}
          </p>
        </div>
        <div className="card">
          <p className="text-textGray text-sm mb-2">Video</p>
          <p className="text-3xl font-bold text-blue-500">
            {services.filter(s => s.category === 'video').length}
          </p>
        </div>
        <div className="card">
          <p className="text-textGray text-sm mb-2">3D & AI</p>
          <p className="text-3xl font-bold text-green-500">
            {services.filter(s => s.category === '3d' || s.category === 'ai').length}
          </p>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-dark border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {editingService ? 'Edit Service' : 'Create New Service'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-textGray hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-textGray text-sm font-medium mb-2">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Logo Design"
                  required
                />
              </div>

              <div>
                <label className="block text-textGray text-sm font-medium mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="graphics">Graphics</option>
                  <option value="video">Video</option>
                  <option value="3d">3D</option>
                  <option value="ai">AI</option>
                </select>
              </div>

              <div>
                <label className="block text-textGray text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Describe the service..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-textGray text-sm font-medium mb-2">
                    Min Price (LKR) *
                  </label>
                  <input
                    type="number"
                    value={formData.minPrice}
                    onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                    className="input-field"
                    placeholder="5000"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-textGray text-sm font-medium mb-2">
                    Max Price (LKR) *
                  </label>
                  <input
                    type="number"
                    value={formData.maxPrice}
                    onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                    className="input-field"
                    placeholder="10000"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-textGray text-sm font-medium mb-2">
                  Delivery Time *
                </label>
                <input
                  type="text"
                  value={formData.deliveryTime}
                  onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                  className="input-field"
                  placeholder="e.g., 3-5 days"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-darker text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
