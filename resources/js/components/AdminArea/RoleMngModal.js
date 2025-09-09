import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import '../../../sass/AdminAreas/RoleMngModal.scss';

const RoleMngModal = ({ isOpen, onClose, onRoleSaved, editingRole = null }) => {
  const [formData, setFormData] = useState({
    role_name: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (editingRole) {
        setFormData({
          role_name: editingRole.role_name || '',
          description: editingRole.description || ''
        });
      } else {
        setFormData({
          role_name: '',
          description: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, editingRole]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.role_name.trim()) {
      newErrors.role_name = 'Role name is required';
    } else if (formData.role_name.trim().length < 2) {
      newErrors.role_name = 'Role name must be at least 2 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const url = editingRole ? `/api/roles/${editingRole.role_id}` : '/api/roles';
      const method = editingRole ? 'PUT' : 'POST';

      const response = await axios({
        method,
        url,
        data: {
          role_name: formData.role_name.trim(),
          description: formData.description.trim()
        }
      });

      if (response.data.success) {
        onRoleSaved();
      } else {
        setErrors({ general: response.data.message || 'Failed to save role' });
      }
    } catch (error) {
      console.error('Role save error:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.message || 'Failed to save role' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="role-mng-modal">
      <div className="role-mng-modal__overlay" onClick={handleClose}></div>
      <div className="role-mng-modal__content">
        <div className="role-mng-modal__header">
          <h2 className="role-mng-modal__title">
            {editingRole ? 'Edit Role' : 'Add New Role'}
          </h2>
          <button 
            className="role-mng-modal__close" 
            onClick={handleClose}
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="role-mng-modal__form">
          <div className="role-mng-modal__body">
            {errors.general && (
              <div className="role-mng-modal__error-general">
                {errors.general}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="role_name">
                Role Name <span className="required">*</span>
              </label>
              <input
                id="role_name"
                type="text"
                name="role_name"
                className={`form-input ${errors.role_name ? 'error' : ''}`}
                value={formData.role_name}
                onChange={handleInputChange}
                placeholder="Enter role name"
                disabled={isLoading}
              />
              {errors.role_name && (
                <span className="form-error">{errors.role_name}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter role description"
                rows={4}
                disabled={isLoading}
              />
              {errors.description && (
                <span className="form-error">{errors.description}</span>
              )}
            </div>
          </div>

          <div className="role-mng-modal__footer">
            <button 
              type="button" 
              className="role-mng-modal__cancel-btn" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="role-mng-modal__save-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (editingRole ? 'Update Role' : 'Create Role')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleMngModal;




