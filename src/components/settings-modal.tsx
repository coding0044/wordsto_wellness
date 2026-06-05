'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout as logoutService } from '@/services/auth-service';
import { Modal, Input, Button, Alert } from '@/components/ui';
import { TEXT, AVATAR_ANIMATIONS, PROFILE_STYLES } from '@/styles';

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
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" scrollable>
      <div className="space-y-5">
        {/* Profile Picture Section */}
        <div className="space-y-3">
          <h3 className={TEXT.headingBase}>Profile Picture</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={AVATAR_ANIMATIONS.profileGradient}>
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              {profilePicture && (
                <div className={AVATAR_ANIMATIONS.profileRing}>
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
                <div className={PROFILE_STYLES.uploadButton}>
                  {profilePicture ? 'Update Picture' : 'Choose File'}
                </div>
              </label>
              <p className="text-xs text-gray-400">Max: 3MB</p>
              {profilePicture && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleProfilePictureUpload}
                    disabled={loading}
                    variant="primary"
                    size="sm"
                  >
                    {loading ? 'Uploading...' : 'Upload'}
                  </Button>
                  <Button
                    onClick={() => {
                      setProfilePicture(null);
                      setPreviewImage(user?.image || null);
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="space-y-3">
          <h3 className={TEXT.headingBase}>Profile Details</h3>
          
          <div className="space-y-3">
            <Input
              type="text"
              name="name"
              label="Username"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your username"
              compact
            />

            <Input
              type="email"
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              compact
            />

            <Input
              type="date"
              name="dateOfBirth"
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              compact
            />

            <Button
              onClick={handleProfileUpdate}
              disabled={loading}
              fullWidth
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </div>

        {/* Password Section */}
        <div className="space-y-3">
          <h3 className={TEXT.headingBase}>Password</h3>
          
          {!showChangePassword ? (
            <div className="space-y-2">
              <Button
                onClick={() => setShowChangePassword(true)}
                variant="secondary"
                fullWidth
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
                Change Password
              </Button>
              <Button
                onClick={handleForgotPassword}
                variant="secondary"
                fullWidth
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                </svg>
                Forgot Password?
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <Input
                type="password"
                label="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                compact
                required
              />
              <Input
                type="password"
                label="New Password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Enter new password (min 6 characters)"
                compact
                required
              />
              <Input
                type="password"
                label="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                compact
                required
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Logout Section */}
        <div className="pt-4 border-t border-gray-100">
          <Button
            onClick={handleLogout}
            variant="danger"
            fullWidth
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Logout
          </Button>
        </div>

        {/* Message */}
        {message && (
          <Alert
            message={message}
            type={message.includes('success') ? 'success' : 'error'}
          />
        )}
      </div>
    </Modal>
  );
}
