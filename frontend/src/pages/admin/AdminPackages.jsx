import { useState, useEffect } from 'react';
import { packagesAPI } from '../../utils/api';
import { Plus, Edit2, Trash2, Star, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: 'month',
    features: [''],
    popular: false,
    maxOrders: '',
  });

  const durationLabels = {
    month: 'Monthly',
    quarter: 'Quarterly',
    year: 'Yearly',
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await packagesAPI.getAll();
      setPackages(data);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: 'month',
      features: [''],
      popular: false,
      maxOrders: '',
    });
    setEditingPackage(null);
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      duration: pkg.duration,
      features: pkg.features || [''],
      popular: pkg.popular || false,
      maxOrders: pkg.maxOrders || '',
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleDelete = async (pkg) => {
    if (!confirm(`Are you sure you want to delete "${pkg.name}"?`)) return;

    try {
      await packagesAPI.delete(pkg._id);
      toast.success('Package deleted successfully');
      fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('Failed to delete package');
    }
  };

  const handleAddFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, ''],
    });
  };

  const handleRemoveFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      features: newFeatures.length > 0 ? newFeatures : [''],
    });
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.price || !formData.maxOrders) {
      toast.error('Please fill in all required fields');
      return;
    }

    const validFeatures = formData.features.filter(f => f.trim() !== '');
    if (validFeatures.length === 0) {
      toast.error('Please add at least one feature');
      return;
    }

    try {
      const packageData = {
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price),
        duration: formData.duration,
        features: validFeatures,
        popular: formData.popular,
        maxOrders: parseInt(formData.maxOrders),
      };

      if (editingPackage) {
        await packagesAPI.update(editingPackage._id, packageData);
        toast.success('Package updated successfully');
      } else {
        await packagesAPI.create(packageData);
        toast.success('Package created successfully');
      }

      setIsModalOpen(false);
      resetForm();
      fetchPackages();
    } catch (error) {
      console.error('Error saving package:', error);
      toast.error(error.response?.data?.message || 'Failed to save package');
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
          <h2 className="text-2xl md:text-3xl font-bold text-white">Package Management</h2>
          <p className="text-textGray mt-2">Manage subscription packages for your customers</p>
        </div>
        <button onClick={handleAddNew} className="btn-primary flex items-center space-x-2 mt-4 md:mt-0">
          <Plus size={20} />
          <span>Add New Package</span>
        </button>
      </div>

      {/* Packages Grid */}
      {packages.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-textGray">No packages created yet</p>
          <button onClick={handleAddNew} className="btn-primary mt-4">
            Create Your First Package
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className={`card relative ${pkg.popular ? 'border-2 border-primary' : ''}`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                    <Star size={12} fill="currentColor" />
                    <span>POPULAR</span>
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-500 text-xs rounded">
                  {durationLabels[pkg.duration]}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="p-2 hover:bg-darker rounded-lg transition-colors"
                  >
                    <Edit2 size={16} className="text-blue-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(pkg)}
                    className="p-2 hover:bg-darker rounded-lg transition-colors"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
              <p className="text-textGray text-sm mb-4">{pkg.description}</p>

              <div className="text-center mb-6 py-4 border-y border-gray-700">
                <span className="text-4xl font-bold text-primary">
                  LKR {pkg.price.toLocaleString()}
                </span>
                <span className="text-textGray text-sm block mt-1">
                  per {pkg.duration}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-white text-sm font-medium">Includes:</p>
                {pkg.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span className="text-textGray text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-700 text-sm text-textGray">
                Max Orders: <span className="text-white font-semibold">{pkg.maxOrders}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {packages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-textGray text-sm mb-2">Total Packages</p>
            <p className="text-3xl font-bold text-white">{packages.length}</p>
          </div>
          <div className="card">
            <p className="text-textGray text-sm mb-2">Popular Packages</p>
            <p className="text-3xl font-bold text-primary">
              {packages.filter(p => p.popular).length}
            </p>
          </div>
          <div className="card">
            <p className="text-textGray text-sm mb-2">Average Price</p>
            <p className="text-3xl font-bold text-green-500">
              LKR {Math.round(packages.reduce((sum, p) => sum + p.price, 0) / packages.length).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-dark border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {editingPackage ? 'Edit Package' : 'Create New Package'}
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
                  Package Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Starter Plan"
                  required
                />
              </div>

              <div>
                <label className="block text-textGray text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="2"
                  placeholder="Brief description of the package..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-textGray text-sm font-medium mb-2">
                    Price (LKR) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                    placeholder="25000"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-textGray text-sm font-medium mb-2">
                    Duration *
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="month">Monthly</option>
                    <option value="quarter">Quarterly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-textGray text-sm font-medium mb-2">
                  Max Orders per Period *
                </label>
                <input
                  type="number"
                  value={formData.maxOrders}
                  onChange={(e) => setFormData({ ...formData, maxOrders: e.target.value })}
                  className="input-field"
                  placeholder="10"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-textGray text-sm font-medium mb-2">
                  Features *
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="input-field flex-1"
                        placeholder="Enter a feature..."
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="px-3 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="text-primary hover:text-red-400 text-sm transition-colors"
                  >
                    + Add Feature
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="popular"
                  checked={formData.popular}
                  onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                  className="w-4 h-4 text-primary bg-darker border-gray-700 rounded focus:ring-primary"
                />
                <label htmlFor="popular" className="text-textGray text-sm">
                  Mark as Popular Package
                </label>
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
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPackages;
