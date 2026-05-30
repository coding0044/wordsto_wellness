'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout as logoutService } from '@/services/auth-service.ts';

export default function SettingsModal({ isOpen, onClose, user, onUserUpdate }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(user?.image || null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setMessage('File size must be less than 3MB');
        return;
      }
      setProfilePicture(file);
      // Show preview of selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!profilePicture) return;

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', profilePicture);

      const response = await fetch('/api/user/profile-picture', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Profile picture updated successfully!');
        setProfilePicture(null);
        if (onUserUpdate) {
          onUserUpdate({ image: data.image });
        }
      } else {
        setMessage(data.message || 'Failed to update profile picture');
        // Revert preview on error
        setPreviewImage(user?.image || null);
      }
    } catch (error) {
      setMessage('Error uploading profile picture');
      setPreviewImage(user?.image || null);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Profile updated successfully!');
        if (onUserUpdate) {
          onUserUpdate(data.user);
        }
      } else {
        setMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutService();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
    onClose();
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user?._id,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowChangePassword(false);
      } else {
        setMessage(data.message || 'Failed to change password');
      }
    } catch (error) {
      setMessage('Error changing password');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5">
          {/* Profile Picture Section */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-900">Profile Picture</h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center overflow-hidden shadow-md">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                {profilePicture && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label className="block w-full cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                  <div className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-lg text-xs font-semibold text-center transition-colors">
                    {profilePicture ? 'Update Picture' : 'Choose File'}
                  </div>
                </label>
                <p className="text-xs text-gray-400">Max: 3MB</p>
                {profilePicture && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleProfilePictureUpload}
                      disabled={loading}
                      className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium text-xs transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Uploading...' : 'Upload'}
                    </button>
                    <button
                      onClick={() => {
                        setProfilePicture(null);
                        setPreviewImage(user?.image || null);
                      }}
                      className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details Section */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-900">Profile Details</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-sm"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-sm"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <button
                onClick={handleProfileUpdate}
                disabled={loading}
                className="w-full px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-lg font-medium text-xs transition-all disabled:opacity-50 shadow-md shadow-sky-500/20"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </div>

          {/* Password Section */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-900">Password</h3>
            
            {!showChangePassword ? (
              <div className="space-y-2">
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="w-full px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                  </svg>
                  Change Password
                </button>
                <button
                  onClick={handleForgotPassword}
                  className="w-full px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                  </svg>
                  Forgot Password?
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-sm"
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-sm"
                    placeholder="Enter new password (min 6 characters)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-sm"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-lg font-medium text-xs transition-all disabled:opacity-50 shadow-md shadow-sky-500/20"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Logout Section */}
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Logout
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.includes('success') ? (
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              ) : (
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
              )}
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
