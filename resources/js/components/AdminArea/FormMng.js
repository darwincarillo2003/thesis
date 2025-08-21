import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Settings, 
  DragDropIcon,
  FileText,
  Users,
  Calendar,
  Download,
  Upload,
  ChevronUp,
  ChevronDown,
  Move,
  GripVertical
} from 'lucide-react';
import '../../../sass/AdminAreas/FormMng.scss';

const FormMng = () => {
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedForms, setSelectedForms] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [activeTab, setActiveTab] = useState('forms'); // forms, submissions, workflow

  // Form Builder State
  const [formData, setFormData] = useState({
    form_code: '',
    form_name: '',
    description: '',
    is_active: true,
    fields: [],
    workflow: []
  });

  const [availableFieldTypes] = useState([
    { type: 'text', label: 'Text Input', icon: '📝' },
    { type: 'number', label: 'Number', icon: '🔢' },
    { type: 'date', label: 'Date', icon: '📅' },
    { type: 'textarea', label: 'Text Area', icon: '📄' },
    { type: 'select', label: 'Dropdown', icon: '📋' },
    { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
    { type: 'radio', label: 'Radio Button', icon: '🔘' },
    { type: 'file', label: 'File Upload', icon: '📎' },
    { type: 'signature', label: 'Signature', icon: '✍️' },
    { type: 'table', label: 'Data Table', icon: '📊' },
    { type: 'calculation', label: 'Auto Calculation', icon: '🧮' }
  ]);

  const [availableRoles] = useState([
    'Prepared By',
    'Reviewed By', 
    'Approved By',
    'Treasurer',
    'President',
    'Vice President',
    'Secretary',
    'Auditor',
    'Finance Officer'
  ]);

  // Initialize with empty array - will be populated from API
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    // Check authentication and set headers
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('token_type');
    
    if (token && tokenType) {
      axios.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;
    }
    
    fetchForms();
  }, [currentPage, searchTerm, sortField, sortDirection]);

  const fetchForms = async () => {
    setIsLoading(true);
    setError('');
    setApiError('');
    
    try {
      const params = new URLSearchParams({
        per_page: '10',
        page: currentPage.toString(),
        sort_field: sortField,
        sort_direction: sortDirection
      });
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      console.log('Fetching forms from API...');
      const response = await axios.get(`/api/forms?${params}`);
      
      if (response.data.success) {
        const formsData = response.data.data.forms;
        console.log('Forms fetched successfully:', formsData);
        
        // Handle both paginated and direct array responses
        if (formsData.data) {
          setForms(formsData.data);
          setTotalPages(formsData.last_page || 1);
        } else if (Array.isArray(formsData)) {
          setForms(formsData);
          setTotalPages(1);
        } else {
          setForms([]);
          setTotalPages(1);
        }
      } else {
        setError('Failed to fetch forms: Invalid response');
        setForms([]);
      }
    } catch (err) {
      console.error('Fetch forms error:', err);
      
      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message || 'Unknown error';
        
        if (status === 401) {
          setApiError('Authentication required. Please login again.');
        } else if (status === 403) {
          setApiError('You do not have permission to access forms.');
        } else {
          setApiError(`Server error (${status}): ${message}`);
        }
      } else if (err.request) {
        setApiError('No response from server. Please check your connection.');
      } else {
        setApiError('Network error. Please try again.');
      }
      
      setError('Failed to fetch forms');
      setForms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIcon = (field) => (
    <div className="form-mng__sort-icon">
      <ChevronUp size={14} className={`form-mng__sort-icon-up ${sortField === field && sortDirection === 'asc' ? 'active' : ''}`} />
      <ChevronDown size={14} className={`form-mng__sort-icon-down ${sortField === field && sortDirection === 'desc' ? 'active' : ''}`} />
    </div>
  );

  const handleSelectForm = (formId) => {
    setSelectedForms(prev => 
      prev.includes(formId) 
        ? prev.filter(id => id !== formId)
        : [...prev, formId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedForms([]);
    } else {
      setSelectedForms(forms.map(form => form.form_id));
    }
    setSelectAll(!selectAll);
  };

  const handleCreateForm = () => {
    setEditingForm(null);
    setFormData({
      form_code: '',
      form_name: '',
      description: '',
      is_active: true,
      fields: [],
      workflow: []
    });
    setShowFormBuilder(true);
  };

  const handleEditForm = async (form) => {
    try {
      setIsLoading(true);
      
      // Fetch the complete form data including fields and workflow
      const response = await axios.get(`/api/forms/${form.form_id}`);
      
      if (response.data.success) {
        const fullForm = response.data.data.form;
        
        setEditingForm(fullForm);
        setFormData({
          form_code: fullForm.form_code,
          form_name: fullForm.form_name,
          description: fullForm.description || '',
          is_active: fullForm.is_active,
          fields: fullForm.fields || [],
          workflow: fullForm.workflow || []
        });
        setShowFormBuilder(true);
      } else {
        setError('Failed to load form details');
      }
    } catch (err) {
      console.error('Error loading form for edit:', err);
      setError('Failed to load form details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteForm = async (formId) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        setIsLoading(true);
        
        const response = await axios.delete(`/api/forms/${formId}`);
        
        if (response.data.success) {
          console.log('Form deleted successfully');
          fetchForms(); // Refresh the forms list
        } else {
          setError('Failed to delete form: ' + (response.data.message || 'Unknown error'));
        }
      } catch (err) {
        console.error('Delete form error:', err);
        
        if (err.response && err.response.data && err.response.data.message) {
          setError('Failed to delete form: ' + err.response.data.message);
        } else {
          setError('Failed to delete form. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const addField = (fieldType) => {
    const newField = {
      id: Date.now(),
      type: fieldType,
      label: `New ${fieldType} Field`,
      required: false,
      order: formData.fields.length,
      options: fieldType === 'select' || fieldType === 'radio' ? ['Option 1'] : [],
      validation: {},
      calculation: fieldType === 'calculation' ? { formula: '', inputs: [] } : null
    };

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const updateField = (fieldId, updates) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const removeField = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const moveField = (fieldId, direction) => {
    const fields = [...formData.fields];
    const index = fields.findIndex(field => field.id === fieldId);
    
    if (direction === 'up' && index > 0) {
      [fields[index], fields[index - 1]] = [fields[index - 1], fields[index]];
    } else if (direction === 'down' && index < fields.length - 1) {
      [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];
    }

    // Update order values
    fields.forEach((field, idx) => {
      field.order = idx;
    });

    setFormData(prev => ({ ...prev, fields }));
  };

  const addWorkflowStep = () => {
    setFormData(prev => ({
      ...prev,
      workflow: [...prev.workflow, {
        id: Date.now(),
        role: '',
        order: prev.workflow.length,
        required: true
      }]
    }));
  };

  const updateWorkflowStep = (stepId, updates) => {
    setFormData(prev => ({
      ...prev,
      workflow: prev.workflow.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
  };

  const removeWorkflowStep = (stepId) => {
    setFormData(prev => ({
      ...prev,
      workflow: prev.workflow.filter(step => step.id !== stepId)
    }));
  };

  const saveForm = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Prepare form data for API
      const apiData = {
        form_code: formData.form_code,
        form_name: formData.form_name,
        description: formData.description,
        is_active: formData.is_active,
        fields: formData.fields.map(field => ({
          type: field.type,
          label: field.label,
          required: field.required,
          order: field.order,
          options: field.options,
          validation: field.validation,
          placeholder: field.placeholder,
          help_text: field.help_text
        })),
        workflow: formData.workflow.map(step => ({
          role: step.role,
          order: step.order,
          required: step.required,
          description: step.description
        }))
      };
      
      console.log('Saving form:', apiData);
      
      let response;
      if (editingForm) {
        // Update existing form
        response = await axios.put(`/api/forms/${editingForm.form_id}`, apiData);
      } else {
        // Create new form
        response = await axios.post('/api/forms', apiData);
      }
      
      if (response.data.success) {
        console.log('Form saved successfully');
        setShowFormBuilder(false);
        fetchForms(); // Refresh the forms list
      } else {
        setError('Failed to save form: ' + (response.data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Save form error:', err);
      
      if (err.response && err.response.data && err.response.data.errors) {
        // Validation errors
        const validationErrors = Object.values(err.response.data.errors).flat();
        setError('Validation errors: ' + validationErrors.join(', '));
      } else if (err.response && err.response.data && err.response.data.message) {
        setError('Failed to save form: ' + err.response.data.message);
      } else {
        setError('Failed to save form. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormBuilder = () => (
    <div className="form-mng__form-builder">
      <div className="form-mng__builder-header">
        <h3>{editingForm ? 'Edit Form' : 'Create New Form'}</h3>
        <div className="form-mng__builder-actions">
          <button 
            className="form-mng__btn form-mng__btn--secondary"
            onClick={() => setShowFormBuilder(false)}
          >
            Cancel
          </button>
          <button 
            className="form-mng__btn form-mng__btn--primary"
            onClick={saveForm}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Form'}
          </button>
        </div>
      </div>

      <div className="form-mng__builder-content">
        {/* Form Basic Info */}
        <div className="form-mng__builder-section">
          <h4>Form Information</h4>
          <div className="form-mng__form-grid">
            <div className="form-mng__form-group">
              <label>Form Code</label>
              <input
                type="text"
                value={formData.form_code}
                onChange={(e) => setFormData(prev => ({ ...prev, form_code: e.target.value }))}
                placeholder="e.g., EXP001"
                className="form-mng__input"
              />
            </div>
            <div className="form-mng__form-group">
              <label>Form Name</label>
              <input
                type="text"
                value={formData.form_name}
                onChange={(e) => setFormData(prev => ({ ...prev, form_name: e.target.value }))}
                placeholder="Enter form name"
                className="form-mng__input"
              />
            </div>
            <div className="form-mng__form-group form-mng__form-group--full">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter form description"
                className="form-mng__textarea"
                rows="3"
              />
            </div>
            <div className="form-mng__form-group">
              <label className="form-mng__checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
                Active Form
              </label>
            </div>
          </div>
        </div>

        {/* Field Types Palette */}
        <div className="form-mng__builder-section">
          <h4>Add Fields</h4>
          <div className="form-mng__field-palette">
            {availableFieldTypes.map(fieldType => (
              <button
                key={fieldType.type}
                className="form-mng__field-type-btn"
                onClick={() => addField(fieldType.type)}
              >
                <span className="form-mng__field-icon">{fieldType.icon}</span>
                <span className="form-mng__field-label">{fieldType.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <div className="form-mng__builder-section">
          <h4>Form Fields ({formData.fields.length})</h4>
          <div className="form-mng__fields-list">
            {formData.fields.map((field, index) => (
              <div key={field.id} className="form-mng__field-item">
                <div className="form-mng__field-header">
                  <div className="form-mng__field-move">
                    <GripVertical size={16} />
                  </div>
                  <div className="form-mng__field-info">
                    <span className="form-mng__field-type">{availableFieldTypes.find(t => t.type === field.type)?.icon}</span>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      className="form-mng__field-label-input"
                    />
                  </div>
                  <div className="form-mng__field-controls">
                    <button
                      onClick={() => moveField(field.id, 'up')}
                      disabled={index === 0}
                      className="form-mng__field-btn"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => moveField(field.id, 'down')}
                      disabled={index === formData.fields.length - 1}
                      className="form-mng__field-btn"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      onClick={() => removeField(field.id)}
                      className="form-mng__field-btn form-mng__field-btn--danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="form-mng__field-options">
                  <label className="form-mng__checkbox-label">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    />
                    Required
                  </label>
                  {(field.type === 'select' || field.type === 'radio') && (
                    <div className="form-mng__field-options-list">
                      <label>Options:</label>
                      {field.options.map((option, optIndex) => (
                        <input
                          key={optIndex}
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...field.options];
                            newOptions[optIndex] = e.target.value;
                            updateField(field.id, { options: newOptions });
                          }}
                          placeholder={`Option ${optIndex + 1}`}
                          className="form-mng__option-input"
                        />
                      ))}
                      <button
                        onClick={() => updateField(field.id, { options: [...field.options, ''] })}
                        className="form-mng__btn form-mng__btn--small"
                      >
                        Add Option
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {formData.fields.length === 0 && (
              <div className="form-mng__empty-fields">
                <p>No fields added yet. Click on field types above to add them.</p>
              </div>
            )}
          </div>
        </div>

        {/* Workflow Configuration */}
        <div className="form-mng__builder-section">
          <h4>Approval Workflow</h4>
          <div className="form-mng__workflow-list">
            {formData.workflow.map((step, index) => (
              <div key={step.id} className="form-mng__workflow-item">
                <span className="form-mng__workflow-order">{index + 1}</span>
                <select
                  value={step.role}
                  onChange={(e) => updateWorkflowStep(step.id, { role: e.target.value })}
                  className="form-mng__select"
                >
                  <option value="">Select Role</option>
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <label className="form-mng__checkbox-label">
                  <input
                    type="checkbox"
                    checked={step.required}
                    onChange={(e) => updateWorkflowStep(step.id, { required: e.target.checked })}
                  />
                  Required
                </label>
                <button
                  onClick={() => removeWorkflowStep(step.id)}
                  className="form-mng__btn form-mng__btn--danger form-mng__btn--small"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={addWorkflowStep}
              className="form-mng__btn form-mng__btn--secondary"
            >
              <Plus size={16} />
              Add Workflow Step
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'forms':
        return renderFormsTable();
      case 'submissions':
        return renderSubmissionsTable();
      case 'analytics':
        return renderAnalyticsTable();
      default:
        return renderFormsTable();
    }
  };

  const renderFormsTable = () => (
    <div className="form-mng__table-container">
      <div className="form-mng__table-header">
        <div className="form-mng__table-actions">
          <div className="form-mng__search-bar">
            <Search size={18} className="form-mng__search-icon" />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-mng__search-input"
            />
          </div>
          <button
            onClick={handleCreateForm}
            className="form-mng__btn form-mng__btn--primary"
          >
            <Plus size={16} />
            Add New Form
          </button>
        </div>
      </div>

      <div className="form-mng__table-wrapper">
        <table className="form-mng__table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="form-mng__checkbox"
                />
              </th>
              <th>Actions</th>
              <th 
                className={`form-mng__sortable ${sortField === 'form_code' ? `form-mng__active-sort form-mng__sort-${sortDirection}` : ''}`}
                onClick={() => handleSort('form_code')}
              >
                Form Code
                {renderSortIcon('form_code')}
              </th>
              <th 
                className={`form-mng__sortable ${sortField === 'form_name' ? `form-mng__active-sort form-mng__sort-${sortDirection}` : ''}`}
                onClick={() => handleSort('form_name')}
              >
                Form Name
                {renderSortIcon('form_name')}
              </th>
              <th>Description</th>
              <th>Fields</th>
              <th>Submissions</th>
              <th>Status</th>
              <th 
                className={`form-mng__sortable ${sortField === 'created_at' ? `form-mng__active-sort form-mng__sort-${sortDirection}` : ''}`}
                onClick={() => handleSort('created_at')}
              >
                Created
                {renderSortIcon('created_at')}
              </th>
            </tr>
          </thead>
          <tbody>
            {forms.map(form => (
              <tr key={form.form_id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedForms.includes(form.form_id)}
                    onChange={() => handleSelectForm(form.form_id)}
                    className="form-mng__checkbox"
                  />
                </td>
                <td>
                  <div className="form-mng__action-buttons">
                    <button
                      onClick={() => handleEditForm(form)}
                      className="form-mng__action-btn form-mng__action-btn--edit"
                      title="Edit Form"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="form-mng__action-btn form-mng__action-btn--view"
                      title="View Submissions"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteForm(form.form_id)}
                      className="form-mng__action-btn form-mng__action-btn--delete"
                      title="Delete Form"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
                <td className="form-mng__form-code">{form.form_code}</td>
                <td className="form-mng__form-name">{form.form_name}</td>
                <td className="form-mng__description">{form.description || 'No description'}</td>
                <td className="form-mng__fields-count">{form.fields_count || 0} fields</td>
                <td className="form-mng__submissions-count">{form.submissions_count || 0}</td>
                <td>
                  <span className={`form-mng__status ${form.is_active ? 'form-mng__status--active' : 'form-mng__status--inactive'}`}>
                    {form.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="form-mng__date">{new Date(form.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSubmissionsTable = () => (
    <div className="form-mng__table-container">
      <div className="form-mng__table-header">
        <div className="form-mng__table-actions">
          <div className="form-mng__search-bar">
            <Search size={18} className="form-mng__search-icon" />
            <input
              type="text"
              placeholder="Search submissions..."
              className="form-mng__search-input"
            />
          </div>
        </div>
      </div>
      <div className="form-mng__empty-state">
        <FileText size={48} />
        <h3>Form Submissions</h3>
        <p>View and manage form submissions here.</p>
      </div>
    </div>
  );

  const renderAnalyticsTable = () => (
    <div className="form-mng__table-container">
      <div className="form-mng__table-header">
        <div className="form-mng__table-actions">
          <h3>Form Analytics</h3>
        </div>
      </div>
      <div className="form-mng__empty-state">
        <Users size={48} />
        <h3>Analytics & Reports</h3>
        <p>View form performance and analytics here.</p>
      </div>
    </div>
  );

  if (showFormBuilder) {
    return (
      <div className="form-mng">
        {renderFormBuilder()}
      </div>
    );
  }

  return (
    <div className="form-mng">
      {/* Header */}
      <div className="form-mng__header">
        <h1 className="form-mng__title">Form Management</h1>
      </div>

      {/* Tab Wrapper matching User Management folder style */}
      <div className="form-mng__tab-wrapper">
        <button
          className={`form-mng__tab ${activeTab === 'forms' ? 'form-mng__tab--active' : ''}`}
          onClick={() => setActiveTab('forms')}
        >
          <FileText size={16} />
          Forms
        </button>
        <button
          className={`form-mng__tab ${activeTab === 'submissions' ? 'form-mng__tab--active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          <Upload size={16} />
          Submissions
        </button>
        <button
          className={`form-mng__tab ${activeTab === 'analytics' ? 'form-mng__tab--active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <Users size={16} />
          Analytics
        </button>
      </div>

      {/* Error Messages */}
      {(error || apiError) && (
        <div className="form-mng__error">
          {apiError || error}
        </div>
      )}

      {/* Tab Content */}
      <div className="form-mng__content">
        {renderTabContent()}
      </div>

      {/* Bulk Actions for Forms Tab */}
      {activeTab === 'forms' && selectedForms.length > 0 && (
        <div className="form-mng__bulk-actions">
          <span>{selectedForms.length} form(s) selected</span>
          <button className="form-mng__btn form-mng__btn--danger">
            Delete Selected
          </button>
        </div>
      )}
    </div>
  );
};

export default FormMng;
