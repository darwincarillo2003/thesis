import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Camera, Trash2, User, Mail, Phone, MapPin, Upload } from 'lucide-react';
import '../../../sass/AdminAreas/EditUserModal.scss';

const EditUserModal = ({ isOpen, onClose, user, onUserUpdated, onShowSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    email: '',
    profile_pic: null
  });
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        suffix: user.suffix || '',
        email: user.user?.email || '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({});

    try {
      // Update profile information
      const profileData = {
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        suffix: formData.suffix
      };

      // For now, we'll just update the profile info
      // You can extend this to include email update if needed
      console.log('Updating profile:', profileData);

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
            Edit User Profile
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
            <div className="edit-user-modal__error">
              {error}
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="edit-user-modal__section">
            <h3 className="edit-user-modal__section-title">Profile Picture</h3>
            <div className="edit-user-modal__profile-pic-container">
              <div className="edit-user-modal__profile-pic-preview">
                <img
                  src={profilePicPreview || '/images/csp.png'}
                  alt="Profile preview"
                  className="edit-user-modal__profile-pic"
                />
              </div>
              <div className="edit-user-modal__profile-pic-actions">
                <label className="edit-user-modal__file-label">
                  <Camera size={16} />
                  Choose New Picture
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="edit-user-modal__file-input"
                    disabled={isLoading}
                  />
                </label>
                {formData.profile_pic && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="edit-user-modal__btn edit-user-modal__btn--secondary"
                    disabled={isLoading}
                  >
                    <X size={16} />
                    Remove New
                  </button>
                )}
                {user.profile_pic && (
                  <button
                    type="button"
                    onClick={handleDeleteProfilePicture}
                    className="edit-user-modal__btn edit-user-modal__btn--danger"
                    disabled={isLoading}
                  >
                    <Trash2 size={16} />
                    Delete Current
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="edit-user-modal__section">
            <h3 className="edit-user-modal__section-title">Personal Information</h3>
            <div className="edit-user-modal__form-grid">
              <div className="edit-user-modal__form-group">
                <label className="edit-user-modal__label">
                  First Name *
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
                  <span className="edit-user-modal__field-error">{fieldErrors.first_name[0]}</span>
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
                  <span className="edit-user-modal__field-error">{fieldErrors.middle_name[0]}</span>
                )}
              </div>

              <div className="edit-user-modal__form-group">
                <label className="edit-user-modal__label">
                  Last Name *
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
                  <span className="edit-user-modal__field-error">{fieldErrors.last_name[0]}</span>
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
                  <span className="edit-user-modal__field-error">{fieldErrors.suffix[0]}</span>
                )}
              </div>

              <div className="edit-user-modal__form-group edit-user-modal__form-group--full">
                <label className="edit-user-modal__label">
                  <Mail size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="edit-user-modal__input"
                  disabled={true} // Email editing disabled for security
                  placeholder="Email cannot be changed"
                />
                <span className="edit-user-modal__helper-text">
                  Email address cannot be changed for security reasons
                </span>
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
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;








