import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EventModal = ({
  isOpen,
  onClose,
  onSave,
  editingEvent = null
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    targetOrganizations: [],
    priority: 'normal'
  });

  const [availableOrganizations, setAvailableOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes or editing event changes
  useEffect(() => {
    if (isOpen) {
      if (editingEvent) {
        setFormData({
          title: editingEvent.title || '',
          description: editingEvent.description || '',
          date: editingEvent.date || '',
          time: editingEvent.time || '',
          location: editingEvent.location || '',
          targetOrganizations: editingEvent.target_organizations || [],
          priority: editingEvent.priority || 'normal'
        });
      } else {
        setFormData({
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
          targetOrganizations: [],
          priority: 'normal'
        });
      }

      // Fetch orgs when modal opens
      fetchOrganizations();
    }
  }, [isOpen, editingEvent]);

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/events/organizations/list', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success) {
        // ✅ Deduplicate orgs by name
        const uniqueOrgs = result.organizations.filter(
          (org, index, self) =>
            index === self.findIndex((o) => o.organization_name === org.organization_name)
        );

        setAvailableOrganizations(uniqueOrgs);
      } else {
        console.error('Failed to fetch organizations:', result.message);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOrganizationToggle = (org) => {
    const orgName = org.organization_name;
    setFormData((prev) => ({
      ...prev,
      targetOrganizations: prev.targetOrganizations.includes(orgName)
        ? prev.targetOrganizations.filter((o) => o !== orgName)
        : [...prev.targetOrganizations, orgName]
    }));
  };

  const handleSelectAllOrganizations = () => {
    const allOrgNames = availableOrganizations.map((org) => org.organization_name);
    setFormData((prev) => ({
      ...prev,
      targetOrganizations:
        prev.targetOrganizations.length === allOrgNames.length ? [] : allOrgNames
    }));
  };

  const handleSave = async () => {
    if (!isFormValid()) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You are not authenticated. Please log in again.');
        setLoading(false);
        return;
      }

      const url = editingEvent
        ? `/api/events/${editingEvent.id}`
        : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          location: formData.location,
          priority: formData.priority,
          target_organizations: formData.targetOrganizations // ✅ string array
        })
      });

      const result = await response.json();
      if (result.success) {
        if (onSave) {
          onSave(result.data.event);
        }
      } else {
        alert(result.message || 'Failed to save event');
      }
    } catch (error) {
      console.error('Failed to save event:', error);
      alert('Failed to save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.description.trim() &&
      formData.date &&
      formData.time &&
      formData.location.trim() &&
      formData.targetOrganizations.length > 0
    );
  };

  if (!isOpen) return null;

  return (
    <div className="event-modal">
      <div className="event-modal__overlay" onClick={onClose}></div>
      <div className="event-modal__content">
        <div className="event-modal__header">
          <h2 className="event-modal__title">
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button className="event-modal__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="event-modal__body">
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Event Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter event title"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter event description"
              rows={3}
            />
          </div>

          {/* Date/Time/Priority */}
          <div className="form-row--three">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                name="date"
                className="form-input"
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time *</label>
              <input
                type="time"
                name="time"
                className="form-input"
                value={formData.time}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Location *</label>
            <input
              type="text"
              name="location"
              className="form-input"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter event location"
            />
          </div>

          {/* Target Orgs */}
          <div className="form-group">
            <label className="form-label">Target Organizations *</label>
            <div className="organizations-selector">
              <div className="organizations-selector__header">
                <button
                  type="button"
                  className="organizations-selector__select-all"
                  onClick={handleSelectAllOrganizations}
                >
                  {formData.targetOrganizations.length === availableOrganizations.length
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              </div>
              <div className="organizations-selector__list">
                {availableOrganizations.map((org) => (
                  <label
                    key={org.organization_id}
                    className="organization-checkbox"
                  >
                    <input
                      type="checkbox"
                      checked={formData.targetOrganizations.includes(org.organization_name)}
                      onChange={() => handleOrganizationToggle(org)}
                    />
                    <span className="organization-checkbox__label">
                      {org.organization_name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="event-modal__footer">
          <button className="event-modal__cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="event-modal__save-btn"
            onClick={handleSave}
            disabled={!isFormValid() || loading}
          >
            {loading
              ? 'Saving...'
              : editingEvent
              ? 'Update Event'
              : 'Create Event'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
