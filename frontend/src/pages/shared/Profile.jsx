import { useState, useRef } from 'react';
import { Camera, User, Mail, Phone, Briefcase, Lock, Eye, EyeOff, Loader, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, uploadAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [specialty, setSpecialty] = useState(user?.specialty || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadAPI.single(formData);
      const imageUrl = result.file?.url || result.url;
      setAvatar(imageUrl);
      toast.success('Avatar uploaded! Click Save to apply.');
    } catch (error) {
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSavingProfile(true);
    try {
      const updateData = { name: name.trim(), phone: phone.trim(), avatar };
      if (user?.role === 'team') {
        updateData.specialty = specialty.trim();
      }

      const result = await usersAPI.update(user._id, updateData);
      const updatedUser = result.user || result;
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      await usersAPI.changePassword(user._id, { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-primary/20 text-primary';
      case 'team': return 'bg-green-500/20 text-green-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-textGray mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card - Left Column */}
        <div className="lg:col-span-1">
          <div className="card text-center">
            {/* Avatar Section */}
            <div className="relative inline-block mx-auto mb-4">
              <img
                src={avatar}
                alt={name}
                className="w-28 h-28 rounded-full object-cover border-4 border-primary/30"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 bg-primary hover:bg-red-500 text-white p-2 rounded-full shadow-lg transition-colors"
              >
                {uploadingAvatar ? <Loader size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            <h3 className="text-lg font-bold text-white">{user?.name}</h3>
            <p className="text-textGray text-sm">{user?.email}</p>
            
            <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRoleBadgeColor(user?.role)}`}>
              {user?.role}
            </span>

            {user?.role === 'team' && user?.specialty && (
              <p className="text-textGray text-sm mt-2">
                <Briefcase size={14} className="inline mr-1" />
                {user.specialty}
              </p>
            )}

            <div className="mt-4 pt-4 border-t border-gray-700 text-left space-y-2">
              <div className="flex items-center text-sm">
                <Mail size={14} className="text-textGray mr-2" />
                <span className="text-textGray">{user?.email}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center text-sm">
                  <Phone size={14} className="text-textGray mr-2" />
                  <span className="text-textGray">{user.phone}</span>
                </div>
              )}
              <div className="flex items-center text-sm">
                <CheckCircle size={14} className="text-green-400 mr-2" />
                <span className="text-green-400">Active Account</span>
              </div>
            </div>
          </div>
        </div>

        {/* Forms - Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information Form */}
          <div className="card">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User size={20} className="text-primary" />
              Profile Information
            </h2>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textGray" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textGray" size={18} />
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="input-field pl-10 opacity-60 cursor-not-allowed"
                    disabled
                  />
                </div>
                <p className="text-xs text-textGray mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="label">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textGray" size={18} />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              {user?.role === 'team' && (
                <div>
                  <label className="label">Specialty</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textGray" size={18} />
                    <input
                      type="text"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="input-field pl-10"
                      placeholder="e.g. Logo Design, Video Editing"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-primary flex items-center gap-2"
                >
                  {savingProfile ? (
                    <><Loader size={18} className="animate-spin" /> Saving...</>
                  ) : (
                    <><Save size={18} /> Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="card">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Lock size={20} className="text-primary" />
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textGray" size={18} />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textGray hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textGray" size={18} />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="Enter new password (min 6 chars)"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-textGray hover:text-white"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textGray" size={18} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="btn-primary flex items-center gap-2"
                >
                  {savingPassword ? (
                    <><Loader size={18} className="animate-spin" /> Changing...</>
                  ) : (
                    <><Lock size={18} /> Change Password</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
