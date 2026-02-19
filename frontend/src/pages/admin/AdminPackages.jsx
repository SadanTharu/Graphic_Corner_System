import { useState, useEffect } from 'react';
import { packagesAPI, servicesAPI } from '../../utils/api';
import { Plus, Edit2, Trash2, Star, Loader2, X, Percent, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPackages = ({ embedded }) => {
  const [packages, setPackages] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 'month',
    services: [],
    offeringPrice: '',
    popular: false,
  });

  const durationLabels = {
    month: 'Monthly',
    quarter: 'Quarterly',
    year: 'Yearly',
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pkgData, svcData] = await Promise.all([
        packagesAPI.getAll(),
        servicesAPI.getAll(),
      ]);
      setPackages(pkgData);
      setAvailableServices(svcData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: 'month',
      services: [],
      offeringPrice: '',
      popular: false,
    });
    setEditingPackage(null);
  };

  // Calculate totals from selected services
  const totalPrice = formData.services.reduce(
    (sum, s) => sum + (Number(s.count) || 0) * (Number(s.unitPrice) || 0),
    0
  );

  const discountPercent =
    totalPrice > 0 && Number(formData.offeringPrice) >= 0
      ? Math.round(((totalPrice - Number(formData.offeringPrice)) / totalPrice) * 100)
      : 0;

  const handleAddService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { service: '', count: 1, unitPrice: '' }],
    });
  };

  const handleRemoveService = (index) => {
    const updated = formData.services.filter((_, i) => i !== index);
    setFormData({ ...formData, services: updated });
  };

  const handleServiceChange = (index, field, value) => {
    const updated = [...formData.services];
    updated[index] = { ...updated[index], [field]: value };

    // If selecting a service, auto-fill unitPrice from service's priceRange min
    if (field === 'service' && value) {
      const svc = availableServices.find((s) => s._id === value);
      if (svc && svc.priceRange) {
        updated[index].unitPrice = svc.priceRange.min;
      }
    }

    setFormData({ ...formData, services: updated });
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      duration: pkg.duration,
      services: (pkg.services || []).map((s) => ({
        service: s.service?._id || s.service,
        count: s.count,
        unitPrice: s.unitPrice,
      })),
      offeringPrice: pkg.offeringPrice,
      popular: pkg.popular || false,
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
      fetchData();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('Failed to delete package');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const validServices = formData.services.filter(
      (s) => s.service && Number(s.count) > 0 && Number(s.unitPrice) >= 0
    );
    if (validServices.length === 0) {
      toast.error('Please add at least one service with valid count and price');
      return;
    }

    if (!formData.offeringPrice || Number(formData.offeringPrice) < 0) {
      toast.error('Please enter a valid offering price');
      return;
    }

    try {
      const packageData = {
        name: formData.name,
        description: formData.description,
        duration: formData.duration,
        services: validServices.map((s) => ({
          service: s.service,
          count: parseInt(s.count),
          unitPrice: parseInt(s.unitPrice),
        })),
        offeringPrice: parseInt(formData.offeringPrice),
        popular: formData.popular,
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
      fetchData();
    } catch (error) {
      console.error('Error saving package:', error);
      toast.error(error.message || 'Failed to save package');
    }
  };

  // get already selected service IDs to prevent duplicates
  const selectedServiceIds = formData.services.map((s) => s.service).filter(Boolean);

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Package Management</h2>
            <p className="text-textGray mt-2">Create service bundles with discounted pricing</p>
          </div>
          <button onClick={handleAddNew} className="btn-primary flex items-center space-x-2 mt-4 md:mt-0">
            <Plus size={20} />
            <span>Add New Package</span>
          </button>
        </div>
      )}
      {embedded && (
        <div className="flex justify-end">
          <button onClick={handleAddNew} className="btn-primary flex items-center space-x-2">
            <Plus size={20} />
            <span>Add New Package</span>
          </button>
        </div>
      )}

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

              {/* Pricing */}
              <div className="text-center mb-4 py-4 border-y border-gray-700">
                {pkg.discount > 0 && (
                  <span className="text-textGray line-through text-sm block mb-1">
                    LKR {pkg.totalPrice?.toLocaleString()}
                  </span>
                )}
                <span className="text-4xl font-bold text-primary">
                  LKR {pkg.offeringPrice?.toLocaleString()}
                </span>
                <span className="text-textGray text-sm block mt-1">
                  per {pkg.duration}
                </span>
                {pkg.discount > 0 && (
                  <span className="inline-flex items-center space-x-1 mt-2 px-3 py-1 bg-green-500/20 text-green-400 text-sm font-semibold rounded-full">
                    <Percent size={14} />
                    <span>{pkg.discount}% OFF</span>
                  </span>
                )}
              </div>

              {/* Included Services */}
              <div className="space-y-2 mb-4">
                <p className="text-white text-sm font-medium">Services Included:</p>
                {(pkg.services || []).map((s, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500">•</span>
                      <span className="text-textGray">
                        {s.service?.name || 'Service'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-medium">×{s.count}</span>
                      <span className="text-textGray ml-2">
                        (LKR {(s.unitPrice * s.count).toLocaleString()})
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-gray-700 flex items-center justify-between text-sm text-textGray">
                <span>
                  Total Services: <span className="text-white font-semibold">
                    {(pkg.services || []).reduce((sum, s) => sum + s.count, 0)}
                  </span>
                </span>
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
              {packages.filter((p) => p.popular).length}
            </p>
          </div>
          <div className="card">
            <p className="text-textGray text-sm mb-2">Avg. Discount</p>
            <p className="text-3xl font-bold text-green-500">
              {Math.round(packages.reduce((sum, p) => sum + (p.discount || 0), 0) / packages.length)}%
            </p>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-dark border border-gray-700 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark border-b border-gray-700 px-6 py-4 flex items-center justify-between z-10">
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

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-textGray text-sm font-medium mb-2">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Business Starter"
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

              {/* Description */}
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

              {/* Services Selection */}
              <div>
                <label className="block text-textGray text-sm font-medium mb-3">
                  Services *
                </label>
                <div className="space-y-3">
                  {formData.services.map((svc, index) => (
                    <div key={index} className="bg-darker rounded-lg p-4">
                      <div className="grid grid-cols-12 gap-3 items-end">
                        {/* Service select */}
                        <div className="col-span-12 md:col-span-5">
                          <label className="block text-textGray text-xs mb-1">Service</label>
                          <select
                            value={svc.service}
                            onChange={(e) => handleServiceChange(index, 'service', e.target.value)}
                            className="input-field text-sm"
                            required
                          >
                            <option value="">Select a service</option>
                            {availableServices.map((s) => (
                              <option
                                key={s._id}
                                value={s._id}
                                disabled={selectedServiceIds.includes(s._id) && svc.service !== s._id}
                              >
                                {s.name} ({s.category})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Count */}
                        <div className="col-span-4 md:col-span-2">
                          <label className="block text-textGray text-xs mb-1">Count</label>
                          <input
                            type="number"
                            value={svc.count}
                            onChange={(e) => handleServiceChange(index, 'count', e.target.value)}
                            className="input-field text-sm"
                            min="1"
                            placeholder="1"
                            required
                          />
                        </div>

                        {/* Unit Price */}
                        <div className="col-span-5 md:col-span-3">
                          <label className="block text-textGray text-xs mb-1">Price per unit (LKR)</label>
                          <input
                            type="number"
                            value={svc.unitPrice}
                            onChange={(e) => handleServiceChange(index, 'unitPrice', e.target.value)}
                            className="input-field text-sm"
                            min="0"
                            placeholder="5000"
                            required
                          />
                        </div>

                        {/* Subtotal + Remove */}
                        <div className="col-span-3 md:col-span-2 flex items-end space-x-2">
                          <div className="flex-1 text-right">
                            <label className="block text-textGray text-xs mb-1">Subtotal</label>
                            <p className="text-white font-semibold text-sm py-2">
                              {((Number(svc.count) || 0) * (Number(svc.unitPrice) || 0)).toLocaleString()}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveService(index)}
                            className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors mb-0.5"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddService}
                    className="flex items-center space-x-2 text-primary hover:text-red-400 text-sm transition-colors"
                  >
                    <Plus size={16} />
                    <span>Add Service</span>
                  </button>
                </div>
              </div>

              {/* Price Calculation Summary */}
              <div className="bg-darker rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-textGray text-sm">
                    Normal Price (
                    {formData.services.reduce((sum, s) => sum + (Number(s.count) || 0), 0)} services total)
                  </span>
                  <span className="text-white font-bold text-lg">
                    LKR {totalPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <label className="block text-textGray text-xs mb-1">
                      Offering Price (LKR) *
                    </label>
                    <input
                      type="number"
                      value={formData.offeringPrice}
                      onChange={(e) => setFormData({ ...formData, offeringPrice: e.target.value })}
                      className="input-field"
                      min="0"
                      placeholder="Enter offering price"
                      required
                    />
                  </div>
                  <div className="text-center pt-4">
                    <div
                      className={`inline-flex items-center space-x-1 px-4 py-2 rounded-lg text-lg font-bold ${
                        discountPercent > 0
                          ? 'bg-green-500/20 text-green-400'
                          : discountPercent < 0
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-gray-700 text-textGray'
                      }`}
                    >
                      <Tag size={18} />
                      <span>{discountPercent}% {discountPercent >= 0 ? 'OFF' : 'MARKUP'}</span>
                    </div>
                  </div>
                </div>

                {discountPercent > 0 && (
                  <p className="text-green-400 text-xs">
                    Customer saves LKR {(totalPrice - Number(formData.offeringPrice)).toLocaleString()} with this package!
                  </p>
                )}
              </div>

              {/* Popular checkbox */}
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

              {/* Actions */}
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
                <button type="submit" className="flex-1 btn-primary">
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
