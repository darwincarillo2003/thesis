import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import '../../../sass/AdminAreas/OrgMngModal.scss';

const OrgMngModal = ({ isOpen, onClose, onOrganizationSaved, editingOrganization = null }) => {
  const [formData, setFormData] = useState({
    organization_name: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (editingOrganization) {
        setFormData({
          organization_name: editingOrganization.organization_name || '',
          description: editingOrganization.description || ''
        });
      } else {
        setFormData({
          organization_name: '',
          description: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, editingOrganization]);

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

    if (!formData.organization_name.trim()) {
      newErrors.organization_name = 'Organization name is required';
    } else if (formData.organization_name.trim().length < 3) {
      newErrors.organization_name = 'Organization name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
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
      const url = editingOrganization ? `/api/organizations/${editingOrganization.organization_id}` : '/api/organizations';
      const method = editingOrganization ? 'PUT' : 'POST';

      const response = await axios({
        method,
        url,
        data: {
          organization_name: formData.organization_name.trim(),
          description: formData.description.trim()
        }
      });

      if (response.data.success) {
        onOrganizationSaved();
      } else {
        setErrors({ general: response.data.message || 'Failed to save organization' });
      }
    } catch (error) {
      console.error('Organization save error:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.message || 'Failed to save organization' });
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
    <div className="org-mng-modal">
      <div className="org-mng-modal__overlay" onClick={handleClose}></div>
      <div className="org-mng-modal__content">
        <div className="org-mng-modal__header">
          <h2 className="org-mng-modal__title">
            {editingOrganization ? 'Edit Organization' : 'Add New Organization'}
          </h2>
          <button 
            className="org-mng-modal__close" 
            onClick={handleClose}
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="org-mng-modal__form">
          <div className="org-mng-modal__body">
            {errors.general && (
              <div className="org-mng-modal__error-general">
                {errors.general}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="organization_name">
                Organization Name <span className="required">*</span>
              </label>
              <input
                id="organization_name"
                type="text"
                name="organization_name"
                className={`form-input ${errors.organization_name ? 'error' : ''}`}
                value={formData.organization_name}
                onChange={handleInputChange}
                placeholder="Enter organization name"
                disabled={isLoading}
              />
              {errors.organization_name && (
                <span className="form-error">{errors.organization_name}</span>
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
                placeholder="Enter organization description"
                rows={4}
                disabled={isLoading}
              />
              {errors.description && (
                <span className="form-error">{errors.description}</span>
              )}
            </div>
          </div>

          <div className="org-mng-modal__footer">
            <button 
              type="button" 
              className="org-mng-modal__cancel-btn" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="org-mng-modal__save-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (editingOrganization ? 'Update Organization' : 'Create Organization')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrgMngModal;




