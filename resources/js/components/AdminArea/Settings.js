import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, MapPin, Camera, Edit, Save, X, Eye, EyeOff, Lock } from 'lucide-react';
import '../../../sass/AdminAreas/Settings.scss';

const Settings = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    email: '',
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
    profile_pic: null
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/user');
      if (response.data?.success) {
        const user = response.data.data.user;
        setUserData(user);
        setFormData({
          first_name: user.profile?.first_name || '',
          middle_name: user.profile?.middle_name || '',
          last_name: user.profile?.last_name || '',
          suffix: user.profile?.suffix || '',
          email: user.email || '',
          current_password: '',
          new_password: '',
          new_password_confirmation: '',
          profile_pic: null
        });

        // Set profile picture preview
        if (user.profile?.profile_pic) {
          setProfilePicPreview(`/storage/${user.profile.profile_pic}`);
        }
      } else {
        setError('Failed to fetch user data');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Error fetching user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      if (file.size > 2048 * 1024) { // 2MB limit
        setError('Image size must be less than 2MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        profile_pic: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      profile_pic: null
    }));
    
    // Reset to original image
    if (userData?.profile?.profile_pic) {
      setProfilePicPreview(`/storage/${userData.profile.profile_pic}`);
    } else {
      setProfilePicPreview(null);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await axios.delete(`/api/profiles/${userData.profile.profile_id}/delete-picture`);
      
      if (response.data.success) {
        setProfilePicPreview(null);
        setSuccess('Profile picture deleted successfully');
        // Update userData
        setUserData(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            profile_pic: null
          }
        }));
      } else {
        setError('Failed to delete profile picture');
      }
    } catch (err) {
      console.error('Error deleting profile picture:', err);
      setError('Failed to delete profile picture');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');
      setFieldErrors({});

      if (activeTab === 'profile') {
        // Handle profile update
        
        // Upload profile picture if selected
        if (formData.profile_pic) {
          const formDataFile = new FormData();
          formDataFile.append('profile_picture', formData.profile_pic);

          const uploadResponse = await axios.post(
            `/api/profiles/${userData.profile.profile_id}/upload-picture`, 
            formDataFile,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          if (!uploadResponse.data.success) {
            throw new Error('Failed to upload profile picture');
          }
        }

        // Update profile information
        const profileData = {
          first_name: formData.first_name,
          middle_name: formData.middle_name,
          last_name: formData.last_name,
          suffix: formData.suffix
        };

        const profileResponse = await axios.put(
          `/api/profiles/${userData.profile.profile_id}`,
          profileData
        );

        if (!profileResponse.data.success) {
          throw new Error('Failed to update profile information');
        }

        setSuccess('Profile updated successfully');
        setIsEditing(false);
        
        // Reset form
        setFormData(prev => ({
          ...prev,
          profile_pic: null
        }));

        // Refresh user data
        await fetchUserData();

      } else if (activeTab === 'password') {
        // Handle password change
        const passwordData = {
          current_password: formData.current_password,
          new_password: formData.new_password,
          new_password_confirmation: formData.new_password_confirmation
        };

        const passwordResponse = await axios.post('/api/change-password', passwordData);

        if (!passwordResponse.data.success) {
          throw new Error('Failed to change password');
        }

        setSuccess('Password updated successfully');
        setIsChangingPassword(false);
        
        // Reset password fields
        setFormData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        }));
      }

    } catch (err) {
      console.error('Error updating:', err);
      
      if (err.response && err.response.data && err.response.data.errors) {
        setFieldErrors(err.response.data.errors);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(activeTab === 'profile' ? 'Failed to update profile' : 'Failed to change password');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setError('');
    setSuccess('');
    setFieldErrors({});
    setIsEditing(false);
    setIsChangingPassword(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    
    // Reset form to original data
    if (userData) {
      setFormData({
        first_name: userData.profile?.first_name || '',
        middle_name: userData.profile?.middle_name || '',
        last_name: userData.profile?.last_name || '',
        suffix: userData.profile?.suffix || '',
        email: userData.email || '',
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
        profile_pic: null
      });

      // Reset profile picture preview
      if (userData.profile?.profile_pic) {
        setProfilePicPreview(`/storage/${userData.profile.profile_pic}`);
      } else {
        setProfilePicPreview(null);
      }
    }
  };

  const handleCancel = () => {
    if (activeTab === 'profile') {
      setIsEditing(false);
    } else if (activeTab === 'password') {
      setIsChangingPassword(false);
    }
    
    setError('');
    setSuccess('');
    setFieldErrors({});
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    
    // Reset form to original data
    if (userData) {
      setFormData({
        first_name: userData.profile?.first_name || '',
        middle_name: userData.profile?.middle_name || '',
        last_name: userData.profile?.last_name || '',
        suffix: userData.profile?.suffix || '',
        email: userData.email || '',
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
        profile_pic: null
      });

      // Reset profile picture preview
      if (userData.profile?.profile_pic) {
        setProfilePicPreview(`/storage/${userData.profile.profile_pic}`);
      } else {
        setProfilePicPreview(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="my-profile__loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="my-profile__error">
        <p>Failed to load profile data</p>
        <button onClick={fetchUserData} className="my-profile__retry-btn">
          Retry
        </button>
      </div>
    );
  }

  const renderProfileTab = () => (
    <div className="my-profile__container">
      {/* Profile Picture Section */}
      <div className="my-profile__section">
        <h3 className="my-profile__section-title">Profile Picture</h3>
        <div className="my-profile__profile-pic-section">
          <img 
            src={profilePicPreview || '/images/csp.png'} 
            alt="Profile" 
            className="my-profile__profile-pic" 
          />
          {isEditing && (
            <div className="my-profile__profile-pic-actions">
              <label className="my-profile__btn my-profile__btn--secondary my-profile__btn--small">
                <Camera size={16} />
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="my-profile__file-input"
                  disabled={isSaving}
                  style={{ display: 'none' }}
                />
              </label>
              
              {formData.profile_pic && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="my-profile__btn my-profile__btn--secondary my-profile__btn--small"
                  disabled={isSaving}
                >
                  <X size={16} />
                  Remove
                </button>
              )}
              
              {userData.profile?.profile_pic && !formData.profile_pic && (
                <button
                  type="button"
                  onClick={handleDeleteProfilePicture}
                  className="my-profile__btn my-profile__btn--danger my-profile__btn--small"
                  disabled={isSaving}
                >
                  Delete Current
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div className="my-profile__section">
        <h3 className="my-profile__section-title">Personal Information</h3>
        <div className="my-profile__form-grid">
          <div className="my-profile__form-group">
            <label className="my-profile__label">
              First Name <span className="required">*</span>
            </label>
            <input 
              type="text" 
              className={`my-profile__input ${fieldErrors.first_name ? 'my-profile__input--error' : ''}`}
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              readOnly={!isEditing}
              disabled={isSaving}
            />
            {fieldErrors.first_name && (
              <span className="my-profile__field-error">{fieldErrors.first_name[0]}</span>
            )}
          </div>

          <div className="my-profile__form-group">
            <label className="my-profile__label">Middle Name</label>
            <input 
              type="text" 
              className="my-profile__input"
              name="middle_name"
              value={formData.middle_name}
              onChange={handleInputChange}
              readOnly={!isEditing}
              disabled={isSaving}
            />
          </div>

          <div className="my-profile__form-group">
            <label className="my-profile__label">
              Last Name <span className="required">*</span>
            </label>
            <input 
              type="text" 
              className={`my-profile__input ${fieldErrors.last_name ? 'my-profile__input--error' : ''}`}
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              readOnly={!isEditing}
              disabled={isSaving}
            />
            {fieldErrors.last_name && (
              <span className="my-profile__field-error">{fieldErrors.last_name[0]}</span>
            )}
          </div>

          <div className="my-profile__form-group">
            <label className="my-profile__label">Suffix</label>
            <input 
              type="text" 
              className="my-profile__input"
              name="suffix"
              value={formData.suffix}
              onChange={handleInputChange}
              placeholder="Jr., Sr., III, etc."
              readOnly={!isEditing}
              disabled={isSaving}
            />
          </div>

        </div>
      </div>

      <div className="my-profile__section">
        <h3 className="my-profile__section-title">Account Information</h3>
        <div className="my-profile__form-grid">
          <div className="my-profile__form-group">
            <label className="my-profile__label">Email</label>
            <input 
              type="email" 
              className="my-profile__input" 
              value={userData.email || ''}
              readOnly 
            />
          </div>
          <div className="my-profile__form-group">
            <label className="my-profile__label">Role</label>
            <input 
              type="text" 
              className="my-profile__input" 
              value={userData.role?.role_name || 'No Role'}
              readOnly 
            />
          </div>
        </div>
      </div>

      {/* Action Buttons for Profile Tab */}
      {!isEditing ? (
        <div className="my-profile__tab-actions">
          <button 
            className="my-profile__btn my-profile__btn--primary"
            onClick={() => setIsEditing(true)}
          >
            <Edit size={16} />
            Edit Profile
          </button>
        </div>
      ) : (
        <div className="my-profile__tab-actions">
          <button 
            className="my-profile__btn my-profile__btn--secondary"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X size={16} />
            Cancel
          </button>
          <button 
            className="my-profile__btn my-profile__btn--primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );

  const renderPasswordTab = () => (
    <div className="my-profile__container">
      <div className="my-profile__section">
        <h3 className="my-profile__section-title">
          {!isChangingPassword ? 'Password Security' : 'Change Password'}
        </h3>
        {!isChangingPassword && (
          <p className="my-profile__section-description">
            Keep your account secure by using a strong password.
          </p>
        )}
        
        <div className="my-profile__form-grid">
          <div className="my-profile__form-group">
            <label className="my-profile__label">
              Current Password {isChangingPassword && <span className="required">*</span>}
            </label>
            <div className="my-profile__password-input-wrapper">
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="current_password"
                value={formData.current_password}
                onChange={handleInputChange}
                className={`my-profile__input ${fieldErrors.current_password ? 'my-profile__input--error' : ''}`}
                placeholder="Enter current password"
                disabled={!isChangingPassword || isSaving}
                readOnly={!isChangingPassword}
              />
              <button
                type="button"
                className="my-profile__password-toggle"
                onClick={toggleCurrentPasswordVisibility}
                disabled={!isChangingPassword || isSaving}
                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.current_password && (
              <span className="my-profile__field-error">{fieldErrors.current_password[0]}</span>
            )}
          </div>
          <div className="my-profile__form-group">
            <label className="my-profile__label">
              New Password {isChangingPassword && <span className="required">*</span>}
            </label>
            <div className="my-profile__password-input-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                name="new_password"
                value={formData.new_password}
                onChange={handleInputChange}
                className={`my-profile__input ${fieldErrors.new_password ? 'my-profile__input--error' : ''}`}
                placeholder="Enter new password"
                disabled={!isChangingPassword || isSaving}
                readOnly={!isChangingPassword}
              />
              <button
                type="button"
                className="my-profile__password-toggle"
                onClick={toggleNewPasswordVisibility}
                disabled={!isChangingPassword || isSaving}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.new_password && (
              <span className="my-profile__field-error">{fieldErrors.new_password[0]}</span>
            )}
          </div>
          <div className="my-profile__form-group">
            <label className="my-profile__label">
              Confirm New Password {isChangingPassword && <span className="required">*</span>}
            </label>
            <div className="my-profile__password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="new_password_confirmation"
                value={formData.new_password_confirmation}
                onChange={handleInputChange}
                className={`my-profile__input ${fieldErrors.new_password_confirmation ? 'my-profile__input--error' : ''}`}
                placeholder="Confirm new password"
                disabled={!isChangingPassword || isSaving}
                readOnly={!isChangingPassword}
              />
              <button
                type="button"
                className="my-profile__password-toggle"
                onClick={toggleConfirmPasswordVisibility}
                disabled={!isChangingPassword || isSaving}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.new_password_confirmation && (
              <span className="my-profile__field-error">{fieldErrors.new_password_confirmation[0]}</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons for Password Tab */}
      {!isChangingPassword ? (
        <div className="my-profile__tab-actions">
          <button 
            className="my-profile__btn my-profile__btn--primary"
            onClick={() => setIsChangingPassword(true)}
          >
            <Lock size={16} />
            Change Password
          </button>
        </div>
      ) : (
        <div className="my-profile__tab-actions">
          <button 
            className="my-profile__btn my-profile__btn--secondary"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X size={16} />
            Cancel
          </button>
          <button 
            className="my-profile__btn my-profile__btn--primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save size={16} />
            {isSaving ? 'Updating Password...' : 'Update Password'}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="my-profile">
      {/* Header with title matching User Management */}
      <div className="my-profile__header">
        <h1 className="my-profile__title">Settings</h1>
      </div>

      {isLoading && (
        <div className="my-profile__loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      )}

      {!isLoading && !userData && (
        <div className="my-profile__error">
          <p>Failed to load profile data</p>
          <button onClick={fetchUserData} className="my-profile__retry-btn">
            Retry
          </button>
        </div>
      )}

      {!isLoading && userData && (
        <>
          {/* Tab Wrapper matching User Management folder style */}
          <div className="my-profile__tab-wrapper">
            <button
              className={`my-profile__tab ${activeTab === 'profile' ? 'my-profile__tab--active' : ''}`}
              onClick={() => handleTabChange('profile')}
            >
              My Profile
            </button>
            <button
              className={`my-profile__tab ${activeTab === 'password' ? 'my-profile__tab--active' : ''}`}
              onClick={() => handleTabChange('password')}
            >
              My Password
            </button>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="my-profile__alert my-profile__alert--error">
              {error}
            </div>
          )}

          {success && (
            <div className="my-profile__alert my-profile__alert--success">
              {success}
            </div>
          )}

          {/* Tab Content */}
          <div className="my-profile__content">
            {activeTab === 'profile' ? renderProfileTab() : renderPasswordTab()}
          </div>
        </>
      )}
    </div>
  );
};

export default Settings;
