import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { showToast } from '../utils/toast';
import '../styles/ProfilePage.css';

function ProfilePage() {
  const [farmer, setFarmer] = useState({
    name: '',
    email: '',
    role: 'Farmer',
    profilePicture: '',
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [updatedFarmer, setUpdatedFarmer] = useState({ ...farmer });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get('/auth/profile');
      setFarmer(response.data.farmer);
      setUpdatedFarmer(response.data.farmer);
      setImagePreview(response.data.farmer.profilePicture || null);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handlePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUpdatedFarmer((prev) => ({ ...prev, profilePicture: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await axiosInstance.put('/auth/profile', updatedFarmer);
      setFarmer(response.data.farmer);
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile.', 'error');
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword) {
      showToast('Please enter your current password.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match!', 'error');
      return;
    }
    try {
      await axiosInstance.put('/auth/update-password', { currentPassword, newPassword: password });
      showToast('Password updated successfully!', 'success');
      setPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      const msg = error.response?.data?.message || 'Failed to update password.';
      showToast(msg, 'error');
    }
  };

  const handleAccountDeletion = async () => {
    const confirm = window.confirm(
      'Are you sure you want to delete your account? This action is irreversible.'
    );
    if (!confirm) return;

    try {
      await axiosInstance.delete('/auth/delete-account');
      showToast('Account deleted successfully!', 'success');
      window.location.href = '/login'; // Redirect after deletion
    } catch (error) {
      console.error('Error deleting account:', error);
      showToast('Failed to delete account.', 'error');
    }
  };

  return (
    <>
      <div className="profile-page">
        <h1>Your Profile</h1>
        <div className="profile-content bento-grid">
          {/* Profile Card */}
          <div className="profile-card bento-cell">
            <img
              src={imagePreview || 'https://via.placeholder.com/150'}
              alt="Profile"
              className="profile-picture"
            />
            {!isEditing ? (
              <div className="profile-info">
                <p><strong>Name:</strong> {farmer.name}</p>
                <p><strong>Email:</strong> {farmer.email}</p>
                <p><strong>Role:</strong> {farmer.role}</p>
                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="profile-edit">
                <label>
                  Profile Picture:
                  <input type="file" accept="image/*" onChange={handlePictureUpload} />
                </label>
                <label>
                  Name:
                  <input
                    type="text"
                    value={updatedFarmer.name}
                    onChange={(e) => setUpdatedFarmer({ ...updatedFarmer, name: e.target.value })}
                  />
                </label>
                <label>
                  Email:
                  <input
                    type="email"
                    value={updatedFarmer.email}
                    onChange={(e) => setUpdatedFarmer({ ...updatedFarmer, email: e.target.value })}
                  />
                </label>
                <button className="btn btn-primary btn-sm" onClick={handleUpdateProfile}>Save</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            )}
          </div>

          {/* Account Settings */}
          <section className="account-settings bento-cell">
            <h2>⚙️ Account Settings</h2>
            <div className="password-update">
              <h3>Update Password</h3>
              <label>
                Current Password:
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </label>
              <label>
                New Password:
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <label>
                Confirm Password:
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </label>
              <button className="btn btn-primary" onClick={handlePasswordUpdate}>
                Update Password
              </button>
            </div>
            <div className="account-delete">
              <h3>Delete Account</h3>
              <button className="btn btn-danger" onClick={handleAccountDeletion}>
                Delete Account
              </button>
            </div>
          </section>

        
        </div>
      </div>
    </>
  );
}

export default ProfilePage;
