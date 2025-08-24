import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, User, DollarSign } from 'lucide-react';

const SubmittedFormViewer = ({ isOpen, onClose, formId, submissionId }) => {
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch the submitted form data
  useEffect(() => {
    if (isOpen && formId && submissionId) {
      fetchFormData();
    }
  }, [isOpen, formId, submissionId]);

  const fetchFormData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/cashflow/${submissionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success && result.data.submission) {
        setFormData(result.data.submission);
      } else {
        setError(result.message || 'Failed to load form data');
        console.error('API Error:', result);
      }
    } catch (err) {
      setError('Error loading form data');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFormContent = () => {
    if (!formData) return null;

    // For now, we'll create a general form viewer
    // In the future, you can create specific renderers for each form type
    return (
      <div className="submitted-form-content">
        <div className="form-header">
          <h3>Submitted Form: {getFormTitle(formId)}</h3>
          <div className="form-meta">
            <div className="meta-item">
              <Calendar size={16} />
              <span>Submitted: {new Date(formData.created_at).toLocaleDateString()}</span>
            </div>
            <div className="meta-item">
              <User size={16} />
              <span>By: {formData.submitter?.profile?.first_name} {formData.submitter?.profile?.last_name}</span>
            </div>
            <div className="meta-item">
              <FileText size={16} />
              <span>Status: {formData.status}</span>
            </div>
          </div>
        </div>

        <div className="form-body">
          {renderFormFields()}
        </div>
      </div>
    );
  };

  const getFormTitle = (formId) => {
    const formTitles = {
      'FORM-01': 'Petty Cash Voucher',
      'FORM-02': 'Cash Voucher',
      'FORM-03': 'Acknowledgment Form',
      'FORM-04': 'Communication Expense Form',
      'FORM-05': 'Transportation Form',
      'FORM-06': 'Reimbursement Form',
      'FORM-07': 'Travel Form'
    };
    return formTitles[formId] || formId;
  };

  const renderFormFields = () => {
    if (!formData || !formData.form_data) {
      return <p>No form data available</p>;
    }

    // Render the specific form based on the form type
    switch (formId) {
      case 'FORM-01':
        return renderPettyCashVoucherForm();
      case 'FORM-02':
        return renderCashVoucherForm();
      case 'FORM-03':
        return renderAcknowledgmentForm();
      case 'FORM-04':
        return renderCommunicationExpenseForm();
      case 'FORM-05':
        return renderTransportationForm();
      case 'FORM-06':
        return renderReimbursementForm();
      case 'FORM-07':
        return renderTravelForm();
      default:
        return renderGenericForm();
    }
  };

  // Helper function to handle monetary display with proper precision
  const roundToTwoDecimals = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  };

  const renderPettyCashVoucherForm = () => {
    // Get the completed form data for FORM-01
    const completedData = formData.form_data.completed_forms?.[formId];
    
    return (
      <div className="form-fields-display">
        <div className="field-section">
          <h4>Organization Information</h4>
          <div className="field-grid">
            <div className="field-item">
              <label>Organization Name:</label>
              <span>{formData.form_data.organization_name || 'N/A'}</span>
            </div>
            <div className="field-item">
              <label>Academic Year:</label>
              <span>{formData.form_data.academic_year || 'N/A'}</span>
            </div>
            <div className="field-item">
              <label>Month:</label>
              <span>{formData.form_data.month || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Petty Cash Status */}
        {completedData?.pettyCashStatus && (
          <div className="field-section">
            <h4>Petty Cash Status</h4>
            <div className="field-grid">
              <div className="field-item">
                <label>Monthly Limit:</label>
                <span>₱{roundToTwoDecimals(parseFloat(completedData.pettyCashStatus.monthlyLimit || 0)).toLocaleString('en-PH', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="field-item">
                <label>Used:</label>
                <span>₱{roundToTwoDecimals(parseFloat(completedData.pettyCashStatus.used || 0)).toLocaleString('en-PH', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="field-item">
                <label>Available:</label>
                <span>₱{roundToTwoDecimals(parseFloat(completedData.pettyCashStatus.available || 0)).toLocaleString('en-PH', {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        )}

        <div className="field-section">
          <h4>Petty Cash Voucher Details</h4>
          <div className="field-grid">
            <div className="field-item">
              <label>No.:</label>
              <span>{completedData?.no || `PCF-${String(formData.submission_id).padStart(4, '0')}`}</span>
            </div>
            <div className="field-item">
              <label>Date:</label>
              <span>{completedData?.date || new Date(formData.created_at).toLocaleDateString()}</span>
            </div>
            <div className="field-item full-width">
              <label>Paid To:</label>
              <span>{completedData?.paidTo || formData.form_data.organization_name}</span>
            </div>
          </div>
        </div>

        {/* Table of Particulars */}
        {completedData?.particulars && completedData.particulars.length > 0 && (
          <div className="field-section">
            <h4>Table of Particulars</h4>
            <div className="particulars-table">
              <div className="table-header">
                <span>Item</span>
                <span>Amount</span>
              </div>
              {completedData.particulars.map((item, index) => (
                <div key={index} className="table-row">
                  <span>{item.item || 'N/A'}</span>
                  <span>₱{roundToTwoDecimals(parseFloat(item.amount || 0)).toLocaleString('en-PH', {minimumFractionDigits: 2})}</span>
                </div>
              ))}
              <div className="table-total">
                <span>Total:</span>
                <span>₱{roundToTwoDecimals(parseFloat(completedData.total || 0)).toLocaleString('en-PH', {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        )}

        <div className="field-section">
          <h4>Authorization & Signatures</h4>
          <div className="signature-grid">
            <div className="signature-item">
              <label>Approved By:</label>
              <span>{completedData?.approvedBy || 'Not signed'}</span>
            </div>
            <div className="signature-item">
              <label>Received Payment By:</label>
              <span>{completedData?.receivedPaymentBy || 'Not signed'}</span>
            </div>
          </div>
        </div>

        {renderSubmissionContext()}
      </div>
    );
  };

  const renderCashVoucherForm = () => (
    <div className="form-fields-display">
      <div className="field-section">
        <h4>Organization Information</h4>
        <div className="field-grid">
          <div className="field-item">
            <label>Organization Name:</label>
            <span>{formData.form_data.organization_name || 'N/A'}</span>
          </div>
          <div className="field-item">
            <label>Academic Year:</label>
            <span>{formData.form_data.academic_year || 'N/A'}</span>
          </div>
          <div className="field-item">
            <label>Month:</label>
            <span>{formData.form_data.month || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="field-section">
        <h4>Cash Voucher Details</h4>
        <div className="field-grid">
          <div className="field-item">
            <label>Voucher Number:</label>
            <span>CV-{String(formData.submission_id).padStart(4, '0')}</span>
          </div>
          <div className="field-item">
            <label>Date:</label>
            <span>{new Date(formData.created_at).toLocaleDateString()}</span>
          </div>
          <div className="field-item full-width">
            <label>Pay to:</label>
            <span>{formData.form_data.organization_name}</span>
          </div>
          <div className="field-item full-width">
            <label>Address:</label>
            <span>Student Organization Office</span>
          </div>
          <div className="field-item full-width">
            <label>Particulars:</label>
            <span>Cash disbursement related to Cash Flow Statement for {formData.form_data.month} {formData.form_data.academic_year}</span>
          </div>
          <div className="field-item">
            <label>Amount:</label>
            <span>₱{parseFloat(formData.total_amount || 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}</span>
          </div>
          <div className="field-item">
            <label>Account Code:</label>
            <span>CV-{formData.form_data.month?.substring(0, 3).toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="field-section">
        <h4>Authorization & Signatures</h4>
        <div className="signature-grid">
          <div className="signature-item">
            <label>Prepared by:</label>
            <span>{formData.submitter?.profile?.first_name} {formData.submitter?.profile?.last_name}</span>
          </div>
          <div className="signature-item">
            <label>Approved by:</label>
            <span>{formData.form_data.signatories?.treasurer || 'Not signed'}</span>
          </div>
        </div>
      </div>

      {renderSubmissionContext()}
    </div>
  );

  const renderGenericForm = () => (
    <div className="form-fields-display">
      <div className="field-section">
        <h4>Form Information</h4>
        <div className="attached-form-info">
          <div className="info-box">
            <FileText size={24} />
            <div className="info-content">
              <h5>{getFormTitle(formId)} ({formId})</h5>
              <p>This form was attached as a reference document to the Cash Flow Statement submission.</p>
              <p className="note">Form-specific data display is not yet implemented for this form type.</p>
            </div>
          </div>
        </div>
      </div>

      {renderSubmissionContext()}
    </div>
  );

  const renderSubmissionContext = () => (
    <>
      <div className="field-section">
        <h4>Submission Context</h4>
        <div className="context-details">
          <div className="detail-item">
            <label>Submission Code:</label>
            <span>{formData.submission_code}</span>
          </div>
          <div className="detail-item">
            <label>Submitted:</label>
            <span>{new Date(formData.created_at).toLocaleString()}</span>
          </div>
          <div className="detail-item">
            <label>Status:</label>
            <span className={`status-badge status-${formData.status}`}>{formData.status}</span>
          </div>
        </div>
      </div>
    </>
  );

  // Placeholder functions for other forms (you can implement these similarly)
  const renderAcknowledgmentForm = () => renderGenericForm();
  const renderCommunicationExpenseForm = () => renderGenericForm();
  const renderTransportationForm = () => renderGenericForm();
  const renderReimbursementForm = () => renderGenericForm();
  const renderTravelForm = () => renderGenericForm();

  if (!isOpen) return null;

  return (
    <div className="submitted-form-viewer-overlay" onClick={onClose}>
      <div className="submitted-form-viewer" onClick={(e) => e.stopPropagation()}>
        <div className="submitted-form-viewer__header">
          <h2>View Submitted Form</h2>
          <button 
            className="submitted-form-viewer__close-btn"
            onClick={onClose}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="submitted-form-viewer__content">
          {isLoading && (
            <div className="loading-state">
              <p>Loading form data...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Error: {error}</p>
              <button onClick={fetchFormData} className="retry-btn">
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && renderFormContent()}
        </div>
      </div>
    </div>
  );
};

export default SubmittedFormViewer;
