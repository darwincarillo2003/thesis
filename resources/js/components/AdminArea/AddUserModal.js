import React, { useState } from 'react';
import { X, User, Mail, Lock, UserCheck } from 'lucide-react';
import '../../../sass/AdminAreas/AddUserModal.scss';

const AddUserModal = ({ isOpen, onClose, onUserAdded, onShowSuccess }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role options - you may want to fetch these from an API
  const roleOptions = [
    { value: '1', label: 'Admin' },
    { value: '2', label: 'COA' },
    { value: '3', label: 'Treasurer' },
    { value: '4', label: 'Auditor' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    if (!formData.role_id) {
      newErrors.role_id = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${localStorage.getItem('token_type')} ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Reset form
        setFormData({
          first_name: '',
          middle_name: '',
          last_name: '',
          suffix: '',
          email: '',
          password: '',
          password_confirmation: '',
          role_id: ''
        });
        
        // Notify parent component
        if (onUserAdded) {
          onUserAdded();
        }
        
        // Close modal first
        onClose();
        
        // Show success notification after a short delay
        setTimeout(() => {
          if (onShowSuccess) {
            onShowSuccess();
          }
        }, 300);
      } else {
        // Handle validation errors from server
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.message || 'Failed to create user' });
        }
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: ''
      });
      setErrors({});
      onClose();
    }
  };



  if (!isOpen) return null;

  return (
    <div className="add-user-modal-overlay" onClick={handleClose}>
      <div className="add-user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-user-modal__header">
          <h2 className="add-user-modal__title">
            <User size={24} />
            Add New User
          </h2>
          <button 
            className="add-user-modal__close"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <form className="add-user-modal__form" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="add-user-modal__error-banner">
              {errors.general}
            </div>
          )}

          <div className="add-user-modal__form-grid">
            <div className="add-user-modal__form-group">
              <label className="add-user-modal__label">
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={`add-user-modal__input ${errors.first_name ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.first_name && (
                <span className="add-user-modal__error">{errors.first_name}</span>
              )}
            </div>

            <div className="add-user-modal__form-group">
              <label className="add-user-modal__label">Middle Name</label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleInputChange}
                className="add-user-modal__input"
                disabled={isSubmitting}
              />
            </div>

            <div className="add-user-modal__form-group">
              <label className="add-user-modal__label">
                Last Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={`add-user-modal__input ${errors.last_name ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.last_name && (
                <span className="add-user-modal__error">{errors.last_name}</span>
              )}
            </div>

            <div className="add-user-modal__form-group">
              <label className="add-user-modal__label">Suffix</label>
              <input
                type="text"
                name="suffix"
                value={formData.suffix}
                onChange={handleInputChange}
                className="add-user-modal__input"
                placeholder="Jr., Sr., III, etc."
                disabled={isSubmitting}
              />
            </div>

            <div className="add-user-modal__form-group add-user-modal__form-group--full">
              <label className="add-user-modal__label">
                <Mail size={16} />
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`add-user-modal__input ${errors.email ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <span className="add-user-modal__error">{errors.email}</span>
              )}
            </div>

            <div className="add-user-modal__form-group">
              <label className="add-user-modal__label">
                <Lock size={16} />
                Password <span className="required">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`add-user-modal__input ${errors.password ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.password && (
                <span className="add-user-modal__error">{errors.password}</span>
              )}
            </div>

            <div className="add-user-modal__form-group">
              <label className="add-user-modal__label">
                <Lock size={16} />
                Confirm Password <span className="required">*</span>
              </label>
              <input
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleInputChange}
                className={`add-user-modal__input ${errors.password_confirmation ? 'error' : ''}`}
                disabled={isSubmitting}
              />
              {errors.password_confirmation && (
                <span className="add-user-modal__error">{errors.password_confirmation}</span>
              )}
            </div>

            <div className="add-user-modal__form-group add-user-modal__form-group--full">
              <label className="add-user-modal__label">
                <UserCheck size={16} />
                Role <span className="required">*</span>
              </label>
              <select
                name="role_id"
                value={formData.role_id}
                onChange={handleInputChange}
                className={`add-user-modal__select ${errors.role_id ? 'error' : ''}`}
                disabled={isSubmitting}
              >
                <option value="">Select a role...</option>
                {roleOptions.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {errors.role_id && (
                <span className="add-user-modal__error">{errors.role_id}</span>
              )}
            </div>
          </div>

          <div className="add-user-modal__actions">
            <button
              type="button"
              className="add-user-modal__button add-user-modal__button--secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="add-user-modal__button add-user-modal__button--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating User...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;

