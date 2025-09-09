import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Camera, Trash2, User, Mail, Lock, UserCheck, Building } from 'lucide-react';
import '../../../sass/AdminAreas/EditUserModal.scss';

const EditUserModal = ({ isOpen, onClose, user, onUserUpdated, onShowSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: '',
    organization_id: '',
    profile_pic: null
  });
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [organizations, setOrganizations] = useState([]);
  const [organizationsLoading, setOrganizationsLoading] = useState(true);

  // Role options - you may want to fetch these from an API
  const roleOptions = [
    { value: '4', label: 'Admin' },
    { value: '1', label: 'COA' },
    { value: '2', label: 'Treasurer' },
    { value: '3', label: 'Auditor' }
  ];

  // Fetch organizations from API
  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('token');
      const tokenType = localStorage.getItem('token_type');

      const response = await fetch('/api/organizations', {
        method: 'GET',
        headers: {
          'Authorization': `${tokenType} ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        setOrganizations(data.data);
      } else {
        console.error('Failed to fetch organizations:', data.message);
        setOrganizations([]);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations([]);
    } finally {
      setOrganizationsLoading(false);
    }
  };

  // Fetch organizations when modal opens
  useEffect(() => {
    if (isOpen) {
      setOrganizationsLoading(true);
      fetchOrganizations();
    }
  }, [isOpen]);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        suffix: user.suffix || '',
        email: user.user?.email || '',
        password: '',
        password_confirmation: '',
        role_id: user.user?.role_id || '',
        organization_id: user.user?.organizations?.[0]?.organization_id || '',
        profile_pic: null
      });
      
      // Set current profile picture preview
      if (user.profile_pic) {
        setProfilePicPreview(`/storage/${user.profile_pic}`);
      } else {
        setProfilePicPreview('/images/csp.png');
      }
      
      setError('');
      setFieldErrors({});
    }
  }, [user, isOpen]);

  const handleClose = () => {
    setFormData({
      first_name: '',
      middle_name: '',
      last_name: '',
      suffix: '',
      email: '',
      password: '',
      password_confirmation: '',
      role_id: '',
      organization_id: '',
      profile_pic: null
    });
    setProfilePicPreview(null);
    setError('');
    setFieldErrors({});
    onClose();
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
    
    // Reset to original or default image
    if (user.profile_pic) {
      setProfilePicPreview(`/storage/${user.profile_pic}`);
    } else {
      setProfilePicPreview('/images/csp.png');
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!window.confirm('Are you sure you want to delete the current profile picture?')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.delete(`/api/profiles/${user.profile_id}/delete-picture`);
      
      if (response.data.success) {
        setProfilePicPreview('/images/csp.png');
        setFormData(prev => ({ ...prev, profile_pic: null }));
        onShowSuccess();
      } else {
        setError('Failed to delete profile picture');
      }
    } catch (err) {
      console.error('Error deleting profile picture:', err);
      setError('Failed to delete profile picture');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    if (!formData.role_id) {
      newErrors.role_id = 'Role is required';
    }

    if (!formData.organization_id) {
      newErrors.organization_id = 'Organization is required';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setFieldErrors({});

    try {
      // Prepare user data for update
      const userData = {
        email: formData.email,
        role_id: formData.role_id,
        organization_id: formData.organization_id
      };

      // Only include password if it's provided
      if (formData.password) {
        userData.password = formData.password;
        userData.password_confirmation = formData.password_confirmation;
      }

      // Update profile information
      const profileData = {
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        suffix: formData.suffix
      };

      // Update user information (email, role, organization, password)
      console.log('Updating user:', userData);
      const userResponse = await axios.put(`/api/users/${user.user?.user_id}`, userData);

      if (!userResponse.data.success) {
        throw new Error(userResponse.data.message || 'Failed to update user');
      }

      // Update profile information (name fields)
      console.log('Updating profile:', profileData);
      const profileResponse = await axios.put(`/api/profiles/${user.profile_id}`, profileData);

      if (!profileResponse.data.success) {
        throw new Error(profileResponse.data.message || 'Failed to update profile');
      }

      // Upload profile picture if selected
      if (formData.profile_pic) {
        const formDataFile = new FormData();
        formDataFile.append('profile_picture', formData.profile_pic);

        const uploadResponse = await axios.post(
          `/api/profiles/${user.profile_id}/upload-picture`,
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

      onUserUpdated();
      onShowSuccess();
      handleClose();

    } catch (err) {
      console.error('Error updating user:', err);
      
      if (err.response && err.response.data && err.response.data.errors) {
        setFieldErrors(err.response.data.errors);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to update user profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="edit-user-modal__overlay">
      <div className="edit-user-modal__container">
        <div className="edit-user-modal__header">
          <h2 className="edit-user-modal__title">
            <User size={20} />
            Edit User Account
          </h2>
          <button
            onClick={handleClose}
            className="edit-user-modal__close-btn"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-user-modal__form">
          {error && (
            <div className="edit-user-modal__error-banner">
              {error}
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="edit-user-modal__section">
            <h3 className="edit-user-modal__section-title">Profile Picture (Optional)</h3>
            <div className="edit-user-modal__profile-pic-container">
              <div className="edit-user-modal__profile-pic-preview">
                <img
                  src={profilePicPreview || '/images/csp.png'}
                  alt="Profile preview"
                  className="edit-user-modal__profile-pic"
                  onClick={() => document.getElementById('profile-pic-input').click()}
                  onError={(e) => {
                    console.log('Image failed to load:', e.target.src);
                    e.target.src = '/images/background.png'; // Fallback image
                  }}
                />
                <label className="edit-user-modal__profile-pic-icon" htmlFor="profile-pic-input">
                  <Camera size={16} />
                </label>
                <input
                  id="profile-pic-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="edit-user-modal__file-input"
                  disabled={isLoading}
                />
              </div>
              {formData.profile_pic && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="edit-user-modal__btn edit-user-modal__btn--secondary edit-user-modal__btn--small"
                  disabled={isLoading}
                  style={{ marginTop: '12px', width: 'fit-content', marginLeft: 'auto', marginRight: 'auto' }}
                >
                  <X size={16} />
                  Remove
                </button>
              )}
              {user.profile_pic && (
                <button
                  type="button"
                  onClick={handleDeleteProfilePicture}
                  className="edit-user-modal__btn edit-user-modal__btn--danger edit-user-modal__btn--small"
                  disabled={isLoading}
                  style={{ marginTop: '8px', width: 'fit-content', marginLeft: 'auto', marginRight: 'auto' }}
                >
                  <Trash2 size={16} />
                  Delete Current
                </button>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="edit-user-modal__section">
            <h3 className="edit-user-modal__section-title">Personal Information</h3>
            <div className="edit-user-modal__form-grid">
              <div className="edit-user-modal__form-group">
                <label className="edit-user-modal__label">
                  First Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className={`edit-user-modal__input ${fieldErrors.first_name ? 'edit-user-modal__input--error' : ''}`}
                  required
                  disabled={isLoading}
                />
                {fieldErrors.first_name && (
                  <span className="edit-user-modal__error">{fieldErrors.first_name[0]}</span>
                )}
              </div>

              <div className="edit-user-modal__form-group">
                <label className="edit-user-modal__label">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleInputChange}
                  className={`edit-user-modal__input ${fieldErrors.middle_name ? 'edit-user-modal__input--error' : ''}`}
                  disabled={isLoading}
                />
                {fieldErrors.middle_name && (
                  <span className="edit-user-modal__error">{fieldErrors.middle_name[0]}</span>
                )}
              </div>

              <div className="edit-user-modal__form-group">
                <label className="edit-user-modal__label">
                  Last Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className={`edit-user-modal__input ${fieldErrors.last_name ? 'edit-user-modal__input--error' : ''}`}
                  required
                  disabled={isLoading}
                />
                {fieldErrors.last_name && (
                  <span className="edit-user-modal__error">{fieldErrors.last_name[0]}</span>
                )}
              </div>

              <div className="edit-user-modal__form-group">
                <label className="edit-user-modal__label">
                  Suffix
                </label>
                <input
                  type="text"
                  name="suffix"
                  value={formData.suffix}
                  onChange={handleInputChange}
                  className={`edit-user-modal__input ${fieldErrors.suffix ? 'edit-user-modal__input--error' : ''}`}
                  placeholder="Jr., Sr., III, etc."
                  disabled={isLoading}
                />
                {fieldErrors.suffix && (
                  <span className="edit-user-modal__error">{fieldErrors.suffix[0]}</span>
                )}
              </div>

              <div className="edit-user-modal__form-group edit-user-modal__form-group--full">
                <label className="edit-user-modal__label">
                  <Mail size={16} />
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`edit-user-modal__input ${fieldErrors.email ? 'edit-user-modal__input--error' : ''}`}
                  disabled={isLoading}
                  required
                />
                {fieldErrors.email && (
                  <span className="edit-user-modal__error">{fieldErrors.email}</span>
                )}
              </div>

              <div className="edit-user-modal__form-group">
                <label className="edit-user-modal__label">
                  <Lock size={16} />
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`edit-user-modal__input ${fieldErrors.password ? 'edit-user-modal__input--error' : ''}`}
                  disabled={isLoading}
                  placeholder="Leave blank to keep current password"
                />
                {fieldErrors.password && (
                  <span className="edit-user-modal__error">{fieldErrors.password}</span>
                )}
              </div>

              <div className="edit-user-modal__form-group">
                <label className="edit-user-modal__label">
                  <Lock size={16} />
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  className={`edit-user-modal__input ${fieldErrors.password_confirmation ? 'edit-user-modal__input--error' : ''}`}
                  disabled={isLoading}
                  placeholder="Confirm new password"
                />
                {fieldErrors.password_confirmation && (
                  <span className="edit-user-modal__error">{fieldErrors.password_confirmation}</span>
                )}
              </div>

              <div className="edit-user-modal__form-group edit-user-modal__form-group--full">
                <label className="edit-user-modal__label">
                  <UserCheck size={16} />
                  Role <span className="required">*</span>
                </label>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleInputChange}
                  className={`edit-user-modal__input ${fieldErrors.role_id ? 'edit-user-modal__input--error' : ''}`}
                  disabled={isLoading}
                >
                  <option value="">Select a role...</option>
                  {roleOptions.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.role_id && (
                  <span className="edit-user-modal__error">{fieldErrors.role_id}</span>
                )}
              </div>

              <div className="edit-user-modal__form-group edit-user-modal__form-group--full">
                <label className="edit-user-modal__label">
                  <Building size={16} />
                  Organization <span className="required">*</span>
                </label>
                <select
                  name="organization_id"
                  value={formData.organization_id}
                  onChange={handleInputChange}
                  className={`edit-user-modal__input ${fieldErrors.organization_id ? 'edit-user-modal__input--error' : ''}`}
                  disabled={isLoading || organizationsLoading}
                >
                  <option value="">
                    {organizationsLoading ? 'Loading organizations...' : 'Select an organization...'}
                  </option>
                  {organizations.map(org => (
                    <option key={org.organization_id} value={org.organization_id}>
                      {org.organization_name}
                    </option>
                  ))}
                </select>
                {fieldErrors.organization_id && (
                  <span className="edit-user-modal__error">{fieldErrors.organization_id}</span>
                )}
              </div>
            </div>
          </div>

          <div className="edit-user-modal__actions">
            <button
              type="button"
              onClick={handleClose}
              className="edit-user-modal__btn edit-user-modal__btn--secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="edit-user-modal__btn edit-user-modal__btn--primary"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;














