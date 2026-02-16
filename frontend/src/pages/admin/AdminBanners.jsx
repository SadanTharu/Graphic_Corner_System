import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, Upload, X, GripVertical, Pencil, Layers, ArrowDown, ArrowUp } from 'lucide-react';
import { bannersAPI, uploadAPI, settingsAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [heroTextPosition, setHeroTextPosition] = useState('below'); // 'overlay' or 'below'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    cloudinaryId: '',
    link: '',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchBanners();
    fetchHeroTextPosition();
  }, []);

  const fetchHeroTextPosition = async () => {
    try {
      const result = await settingsAPI.get('heroTextPosition');
      if (result.value) {
        setHeroTextPosition(result.value);
      }
    } catch (error) {
      console.error('Error fetching hero text position:', error);
    }
  };

  const handleHeroTextPositionChange = async (position) => {
    try {
      await settingsAPI.update('heroTextPosition', position);
      setHeroTextPosition(position);
      toast.success(`Hero text position set to "${position}"`);
    } catch (error) {
      toast.error('Failed to update hero text position');
    }
  };

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await bannersAPI.getAll();
      setBanners(data);
    } catch (error) {
      toast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      const result = await uploadAPI.single(fd);
      const uploaded = result.file || result;
      setFormData(prev => ({
        ...prev,
        imageUrl: uploaded.url || uploaded.secure_url || result.url || result.secure_url,
        cloudinaryId: uploaded.publicId || uploaded.public_id || result.public_id || '',
      }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      cloudinaryId: '',
      link: '',
      isActive: true,
      order: 0,
    });
    setEditingBanner(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      imageUrl: banner.imageUrl,
      cloudinaryId: banner.cloudinaryId || '',
      link: banner.link || '',
      isActive: banner.isActive,
      order: banner.order || 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      toast.error('Title and image are required');
      return;
    }

    try {
      if (editingBanner) {
        await bannersAPI.update(editingBanner._id || editingBanner.id, formData);
        toast.success('Banner updated successfully');
      } else {
        await bannersAPI.create(formData);
        toast.success('Banner created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchBanners();
    } catch (error) {
      toast.error(error.message || 'Failed to save banner');
    }
  };

  const handleToggle = async (id) => {
    try {
      const result = await bannersAPI.toggle(id);
      toast.success(result.message);
      fetchBanners();
    } catch (error) {
      toast.error('Failed to toggle banner');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;

    try {
      await bannersAPI.delete(id);
      toast.success('Banner deleted successfully');
      fetchBanners();
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Banner Management</h1>
          <p className="text-textGray mt-1">Upload and manage homepage banner images</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Banner</span>
        </button>
      </div>

      {/* Hero Text Position Setting */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Layers size={20} className="text-primary" />
            <div>
              <h3 className="text-white font-semibold">Hero Text Position</h3>
              <p className="text-textGray text-sm">Choose where to display the hero text relative to the banner</p>
            </div>
          </div>
          <div className="flex items-center bg-darker rounded-lg p-1 space-x-1">
            <button
              onClick={() => handleHeroTextPositionChange('overlay')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                heroTextPosition === 'overlay'
                  ? 'bg-primary text-white'
                  : 'text-textGray hover:text-white'
              }`}
            >
              <ArrowUp size={16} />
              <span>Overlay on Banner</span>
            </button>
            <button
              onClick={() => handleHeroTextPositionChange('below')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                heroTextPosition === 'below'
                  ? 'bg-primary text-white'
                  : 'text-textGray hover:text-white'
              }`}
            >
              <ArrowDown size={16} />
              <span>Below Banner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Banners Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-darker rounded-lg mb-4" />
              <div className="h-4 bg-darker rounded w-3/4 mb-2" />
              <div className="h-3 bg-darker rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="card text-center py-16">
          <Upload size={48} className="mx-auto text-textGray mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Banners Yet</h3>
          <p className="text-textGray mb-6">Upload your first banner image to display on the homepage</p>
          <button onClick={openCreateModal} className="btn-primary">
            Add Your First Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner._id || banner.id} className="card group relative overflow-hidden">
              {/* Banner Image */}
              <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                {!banner.isActive && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-gray-800 text-textGray px-3 py-1 rounded-full text-sm font-medium">
                      Inactive
                    </span>
                  </div>
                )}
                {/* Order badge */}
                <div className="absolute top-2 left-2 bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  {banner.order || 0}
                </div>
              </div>

              {/* Info */}
              <h3 className="text-white font-semibold text-lg mb-1 truncate">{banner.title}</h3>
              {banner.description && (
                <p className="text-textGray text-sm mb-3 line-clamp-2">{banner.description}</p>
              )}

              {/* Status & Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                  banner.isActive ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-400'
                }`}>
                  {banner.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span>{banner.isActive ? 'Active' : 'Inactive'}</span>
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggle(banner._id || banner.id)}
                    className="p-2 rounded-lg hover:bg-darker text-textGray hover:text-white transition-colors"
                    title={banner.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {banner.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => openEditModal(banner)}
                    className="p-2 rounded-lg hover:bg-darker text-textGray hover:text-primary transition-colors"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id || banner.id)}
                    className="p-2 rounded-lg hover:bg-darker text-textGray hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-lightGray rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-textGray hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-textGray mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field w-full"
                  placeholder="e.g. Special Offer Banner"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-textGray mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field w-full"
                  placeholder="Optional description"
                  rows={2}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-textGray mb-1">Banner Image *</label>
                {formData.imageUrl ? (
                  <div className="relative">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '', cloudinaryId: '' }))}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    {uploading ? (
                      <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                        <p className="text-textGray text-sm">Uploading...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload size={32} className="mx-auto text-textGray mb-2" />
                        <p className="text-textGray text-sm">Click to upload image</p>
                        <p className="text-textGray text-xs mt-1">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-textGray mb-1">Link (optional)</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  className="input-field w-full"
                  placeholder="e.g. /services or https://..."
                />
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-textGray mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="input-field w-full"
                  placeholder="0"
                  min={0}
                />
                <p className="text-xs text-textGray mt-1">Lower numbers appear first</p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-textGray">Active</label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.isActive ? 'bg-primary' : 'bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    formData.isActive ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Submit */}
              <div className="flex items-center space-x-3 pt-2">
                <button type="submit" className="btn-primary flex-1" disabled={uploading}>
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
