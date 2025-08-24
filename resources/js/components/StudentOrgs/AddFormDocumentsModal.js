import React, { useState } from 'react';
import { X, Upload, FileText, Plus, Trash2, Eye } from 'lucide-react';
import FormViewer from './FormViewer';
import '../../../sass/StudentOrgDashboard/AddFormDocumentsModal.scss';

const AddFormDocumentsModal = ({ isOpen, onClose, onSave }) => {
  const [selectedForms, setSelectedForms] = useState([]);
  const [supportingDocuments, setSupportingDocuments] = useState([]);
  const [formViewerOpen, setFormViewerOpen] = useState(false);
  const [currentFormId, setCurrentFormId] = useState(null);
  const [completedForms, setCompletedForms] = useState({});

  const availableForms = [
    { id: 'FORM-01', name: 'Petty Cash Voucher', description: 'For small cash expenditures' },
    { id: 'FORM-02', name: 'Cash Voucher', description: 'For cash disbursements' },
    { id: 'FORM-03', name: 'Acknowledgment Form', description: 'For receipt acknowledgments' },
    { id: 'FORM-04', name: 'Communication Expense Form', description: 'For communication-related expenses' },
    { id: 'FORM-05', name: 'Transportation Form', description: 'For transportation expenses' },
    { id: 'FORM-06', name: 'Reimbursement Form', description: 'For expense reimbursements' },
    { id: 'FORM-07', name: 'Travel Form', description: 'For travel-related expenses' }
  ];

  const handleFormToggle = (formId) => {
    setSelectedForms(prev => {
      if (prev.includes(formId)) {
        return prev.filter(id => id !== formId);
      } else {
        return [...prev, formId];
      }
    });
  };

  const handleViewForm = (formId) => {
    setCurrentFormId(formId);
    setFormViewerOpen(true);
  };

  const handleCloseFormViewer = () => {
    setFormViewerOpen(false);
    setCurrentFormId(null);
  };

  const handleSaveFormData = (formData) => {
    setCompletedForms(prev => ({
      ...prev,
      [formData.formId]: formData.formData
    }));
    
    // Auto-select the form if it's not already selected
    if (!selectedForms.includes(formData.formId)) {
      setSelectedForms(prev => [...prev, formData.formId]);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newDocuments = files.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    
    setSupportingDocuments(prev => [...prev, ...newDocuments]);
    e.target.value = ''; // Reset file input
  };

  const handleRemoveDocument = (documentId) => {
    setSupportingDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSave = () => {
    const formData = {
      selectedForms: selectedForms.map(formId => {
        const formInfo = availableForms.find(form => form.id === formId);
        return {
          ...formInfo,
          filledData: completedForms[formId] || null // Include the filled form data
        };
      }),
      supportingDocuments: supportingDocuments,
      completedForms: completedForms // Also include all completed forms data
    };
    
    console.log('Saving form data with completed forms:', formData);
    onSave(formData);
    handleClose();
  };

  const handleClose = () => {
    setSelectedForms([]);
    setSupportingDocuments([]);
    setCompletedForms({});
    setFormViewerOpen(false);
    setCurrentFormId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="add-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-form-modal__header">
          <h2 className="add-form-modal__title">Add Form Documents</h2>
          <button 
            className="add-form-modal__close-btn"
            onClick={handleClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="add-form-modal__content">
          {/* Form Selection Section */}
          <div className="add-form-modal__section">
            <h3 className="add-form-modal__section-title">
              <FileText size={18} />
              Select Forms to Include
            </h3>
            <p className="add-form-modal__section-description">
              Choose the forms you want to include with your submission:
            </p>
            
            <div className="form-selection-grid">
              {availableForms.map(form => (
                                  <div 
                  key={form.id} 
                  className={`form-selection-item ${selectedForms.includes(form.id) ? 'selected' : ''} ${completedForms[form.id] ? 'completed' : ''}`}
                >
                  <label className="form-selection-label">
                    <input
                      type="checkbox"
                      checked={selectedForms.includes(form.id)}
                      onChange={() => handleFormToggle(form.id)}
                      className="form-selection-checkbox"
                    />
                    <div className="form-selection-content">
                      <div className="form-selection-header">
                        <span className="form-selection-id">{form.id}</span>
                        <div className="form-selection-actions">
                          <button
                            type="button"
                            className="form-selection-view-btn"
                            onClick={(e) => {
                              e.preventDefault();
                              handleViewForm(form.id);
                            }}
                            title="View and fill form"
                          >
                            <Eye size={14} />
                          </button>
                          <div className="form-selection-checkmark">
                            {selectedForms.includes(form.id) && <span>✓</span>}
                          </div>
                        </div>
                      </div>
                      <h4 className="form-selection-name">{form.name}</h4>
                      <p className="form-selection-description">{form.description}</p>
                      {completedForms[form.id] && (
                        <small className="form-selection-status">Form filled</small>
                      )}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Supporting Documents Section */}
          <div className="add-form-modal__section">
            <h3 className="add-form-modal__section-title">
              <Upload size={18} />
              Supporting Documents
            </h3>
            <p className="add-form-modal__section-description">
              Upload receipts, invoices, or other supporting documents:
            </p>
            
            <div className="file-upload-area">
              <input
                type="file"
                id="supporting-docs"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                onChange={handleFileUpload}
                className="file-upload-input"
              />
              <label htmlFor="supporting-docs" className="file-upload-label">
                <Plus size={20} />
                <span>Add Supporting Documents</span>
                <small>PDF, DOC, JPG, PNG, XLS files accepted</small>
              </label>
            </div>

            {supportingDocuments.length > 0 && (
              <div className="uploaded-documents">
                <h4 className="uploaded-documents__title">Uploaded Documents:</h4>
                <div className="uploaded-documents__list">
                  {supportingDocuments.map(doc => (
                    <div key={doc.id} className="uploaded-document-item">
                      <div className="uploaded-document-info">
                        <FileText size={16} className="uploaded-document-icon" />
                        <div className="uploaded-document-details">
                          <span className="uploaded-document-name">{doc.name}</span>
                          <span className="uploaded-document-size">{formatFileSize(doc.size)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="uploaded-document-remove"
                        onClick={() => handleRemoveDocument(doc.id)}
                        title="Remove document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="add-form-modal__footer">
          <div className="add-form-modal__summary">
            <span>{selectedForms.length} form(s) selected</span>
            <span>{supportingDocuments.length} document(s) uploaded</span>
          </div>
          <div className="add-form-modal__actions">
            <button 
              type="button"
              className="add-form-modal__btn add-form-modal__btn--secondary"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button 
              type="button"
              className="add-form-modal__btn add-form-modal__btn--primary"
              onClick={handleSave}
              disabled={selectedForms.length === 0 && supportingDocuments.length === 0}
            >
              Add Documents
            </button>
          </div>
        </div>

        {/* Form Viewer */}
        <FormViewer
          isOpen={formViewerOpen}
          onClose={handleCloseFormViewer}
          formId={currentFormId}
          onSave={handleSaveFormData}
        />
      </div>
    </div>
  );
};

export default AddFormDocumentsModal;
