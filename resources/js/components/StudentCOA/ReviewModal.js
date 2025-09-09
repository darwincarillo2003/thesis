import React, { useState } from 'react';
import { X, Check, Flag, AlertCircle, FileText, Download, Eye } from 'lucide-react';
import SubmittedFormViewer from './SubmittedFormViewer';

const ReviewModal = ({ isOpen, onClose, report, onReviewComplete }) => {
  const [reviewDecision, setReviewDecision] = useState('');
  const [comments, setComments] = useState('');
  const [activeTab, setActiveTab] = useState('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isFormViewerOpen, setIsFormViewerOpen] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const handleViewForm = (formId) => {
    setSelectedFormId(formId);
    setIsFormViewerOpen(true);
  };

  const handleCloseFormViewer = () => {
    setIsFormViewerOpen(false);
    setSelectedFormId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      let endpoint;
      let requestBody = { comments };

      // Determine the endpoint based on decision
      switch (reviewDecision) {
        case 'approve':
          endpoint = `/api/cashflow/${report.id}/approve`;
          break;
        case 'flag':
        case 'unliquidated':
          endpoint = `/api/cashflow/${report.id}/reject`;
          break;
        default:
          endpoint = `/api/cashflow/${report.id}/return`;
          requestBody.comments = comments || 'Please review and resubmit';
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (result.success) {
        // Notify parent component of successful review
        if (onReviewComplete) {
          onReviewComplete(report.id, reviewDecision, comments);
        }
        onClose();
      } else {
        setError(result.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotals = (formData) => {
    if (!formData) return {};
    
    // Calculate cash inflows total
    const beginningCashInBank = parseFloat(formData.cashInflows?.beginningCashInBank?.amount?.replace(/[₱,]/g, '') || 0);
    const beginningCashOnHand = parseFloat(formData.cashInflows?.beginningCashOnHand?.amount?.replace(/[₱,]/g, '') || 0);
    const cashReceiptSources = formData.cashInflows?.cashReceiptSources?.reduce((sum, source) => 
      sum + parseFloat(source.amount?.replace(/[₱,]/g, '') || 0), 0) || 0;
    const totalCashInflows = beginningCashInBank + beginningCashOnHand + cashReceiptSources;

    // Calculate cash outflows total - support both old and new data structures
    let organizationAllocations = 0;
    let otherDisbursements = 0;
    let contingencyFund = 0;
    let activitiesTotal = 0;

    // Check for new structure (activities-based)
    if (formData.cashOutflows?.activities && Array.isArray(formData.cashOutflows.activities)) {
      activitiesTotal = formData.cashOutflows.activities.reduce((activitySum, activity) => {
        const activityTotal = activity.items?.reduce((itemSum, item) => {
          return itemSum + parseFloat(item.amount?.replace(/[₱,]/g, '') || 0);
        }, 0) || 0;
        return activitySum + activityTotal;
      }, 0);
      
      // Add contingency fund from new structure
      contingencyFund = parseFloat(formData.cashOutflows?.contingencyFund?.amount?.replace(/[₱,]/g, '') || 0);
    } else {
      // Use old structure
      organizationAllocations = formData.cashOutflows?.organizationAllocations?.reduce((sum, item) => 
        sum + parseFloat(item.amount?.replace(/[₱,]/g, '') || 0), 0) || 0;
      otherDisbursements = formData.cashOutflows?.otherDisbursements?.reduce((sum, item) => 
        sum + parseFloat(item.amount?.replace(/[₱,]/g, '') || 0), 0) || 0;
      contingencyFund = formData.cashOutflows?.contingencyFund?.reduce((sum, item) => 
        sum + parseFloat(item.amount?.replace(/[₱,]/g, '') || 0), 0) || 0;
    }

    // Calculate totals from notes if available (new structure)
    let notesTotals = { organizationAllocations: 0, otherDisbursements: 0, contingencyFundNotes: 0 };
    if (formData.notes && Array.isArray(formData.notes)) {
      notesTotals = formData.notes.reduce((noteAcc, note) => {
        const noteTotal = note.items?.reduce((sum, item) => sum + parseFloat(item.amount?.replace(/[₱,]/g, '') || 0), 0) || 0;
        const noteName = note.name?.toLowerCase().replace(/[^a-z]/g, '') || '';
        noteAcc[noteName] = noteTotal;
        return noteAcc;
      }, {});
    }

    const totalCashOutflows = activitiesTotal + contingencyFund + organizationAllocations + otherDisbursements;

    // Calculate ending cash balance
    const endingCashInBank = parseFloat(formData.endingCashBalance?.cashInBank?.replace(/[₱,]/g, '') || 0);
    const endingCashOnHand = parseFloat(formData.endingCashBalance?.cashOnHand?.replace(/[₱,]/g, '') || 0);
    const totalEndingCashBalance = endingCashInBank + endingCashOnHand;

    return {
      totalCashInflows,
      organizationAllocations: organizationAllocations || notesTotals.organizationallocations || 0,
      otherDisbursements: otherDisbursements || notesTotals.otherdisbursements || 0,
      contingencyFund: contingencyFund || notesTotals.contingencyfund || 0,
      activitiesTotal,
      totalCashOutflows,
      totalEndingCashBalance,
      // Additional data for new structure
      activities: formData.cashOutflows?.activities || [],
      notes: formData.notes || []
    };
  };

  const formatAsPeso = (amount) => {
    if (!amount && amount !== 0) return '₱0.00';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'bank_statement':
      case 'invoice':
      case 'contract':
        return <FileText size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  if (!isOpen) return null;

  // Add debug logging
  console.log('ReviewModal - Report data:', report);
  console.log('ReviewModal - Form data:', report?.formData);
  
  const totals = report?.formData ? calculateTotals(report.formData) : {};
  console.log('ReviewModal - Calculated totals:', totals);

  // Error boundary check
  if (!report) {
    return (
      <div className="review-modal">
        <div className="review-modal__overlay" onClick={onClose}>
          <div className="review-modal__content" onClick={e => e.stopPropagation()}>
            <div className="review-modal__header">
              <h2 className="review-modal__title">Error Loading Report</h2>
              <button className="review-modal__close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>
            <div className="review-modal__body">
              <p>Unable to load report data. Please try again.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="review-modal">
      <div className="review-modal__overlay" onClick={onClose}>
        <div className="review-modal__content" onClick={e => e.stopPropagation()}>
          <div className="review-modal__header">
            <h2 className="review-modal__title">Review Report - {report?.reportType}</h2>
            <button className="review-modal__close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="review-modal__body">
            {report && (
              <>
                <div className="review-modal__report-info">
                  <div className="report-info-grid">
                    <div><strong>Organization:</strong> {report.orgName}</div>
                    <div><strong>Report Type:</strong> {report.reportType}</div>
                    <div><strong>Academic Year:</strong> {report.academicYear}</div>
                    <div><strong>Month:</strong> {report.month}</div>
                    <div><strong>Submission Date:</strong> {report.submissionDate}</div>
                    <div><strong>Total Amount:</strong> {report.amount}</div>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="review-modal__tabs">
                  <button 
                    className={`review-modal__tab ${activeTab === 'form' ? 'active' : ''}`}
                    onClick={() => setActiveTab('form')}
                  >
                    <FileText size={16} />
                    Form Details
                  </button>
                  <button 
                    className={`review-modal__tab ${activeTab === 'documents' ? 'active' : ''}`}
                    onClick={() => setActiveTab('documents')}
                  >
                    <Download size={16} />
                    Documents ({(report.documents?.length || 0) + (report.formData?.attached_forms?.length || 0)})
                  </button>
                  <button 
                    className={`review-modal__tab ${activeTab === 'review' ? 'active' : ''}`}
                    onClick={() => setActiveTab('review')}
                  >
                    <Eye size={16} />
                    Review & Decision
                  </button>
                </div>

                {/* Tab Content */}
                <div className="review-modal__tab-content">
                  {activeTab === 'form' && (
                    <div className="form-viewer">
                      {!report.formData ? (
                        <div className="form-error">
                          <p>No form data available for this report.</p>
                        </div>
                      ) : (
                        <>
                      {/* Cash Inflows Section */}
                      <div className="form-section">
                        <h4 className="section-title">Cash Inflows</h4>
                        
                        <div className="form-row">
                          <label>Cash in Bank, Beginning ({report.formData.cashInflows?.beginningCashInBank?.month || 'N/A'}):</label>
                          <span>{report.formData.cashInflows?.beginningCashInBank?.amount || '₱0.00'}</span>
                        </div>
                        
                        <div className="form-row">
                          <label>Cash on Hand, Beginning ({report.formData.cashInflows?.beginningCashOnHand?.month || 'N/A'}):</label>
                          <span>{report.formData.cashInflows?.beginningCashOnHand?.amount || '₱0.00'}</span>
                        </div>
                        
                        <div className="form-subsection">
                          <h5>Cash Receipt Sources:</h5>
                          <table className="form-table">
                            <thead>
                              <tr>
                                <th>Description</th>
                                <th>Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {report.formData.cashInflows?.cashReceiptSources?.map((source, index) => (
                                <tr key={index}>
                                  <td>{source.description || '-'}</td>
                                  <td>{source.amount || '₱0.00'}</td>
                                </tr>
                              )) || (
                                <tr>
                                  <td colSpan="2" className="no-data">No cash receipt sources</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="form-total">
                          <strong>Total Cash Inflows: {formatAsPeso(totals.totalCashInflows)}</strong>
                        </div>
                      </div>

                      {/* Cash Outflows Section */}
                      <div className="form-section">
                        <h4 className="section-title">Cash Outflows</h4>
                        
                        {/* Check if this is new structure (activities-based) or old structure */}
                        {totals.activities && totals.activities.length > 0 ? (
                          // New Structure - Activities Based
                          <>
                            {totals.activities.map((activity, activityIndex) => (
                              <div key={activityIndex} className="form-subsection">
                                <h5>Activity: {activity.name || `Activity ${activityIndex + 1}`}</h5>
                                {activity.items && activity.items.length > 0 ? (
                                  <table className="form-table">
                                    <thead>
                                      <tr>
                                        <th>Description</th>
                                        <th>Amount</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {activity.items.map((item, itemIndex) => (
                                        <tr key={itemIndex}>
                                          <td>{item.description || '-'}</td>
                                          <td>{item.amount || '₱0.00'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <p className="no-data">No items in this activity</p>
                                )}
                                <div className="subsection-total">
                                  <strong>Activity Total: {formatAsPeso(activity.items?.reduce((sum, item) => sum + parseFloat(item.amount?.replace(/[₱,]/g, '') || 0), 0) || 0)}</strong>
                                </div>
                              </div>
                            ))}
                            
                            {/* Contingency Fund for new structure */}
                            <div className="form-subsection">
                              <h5>1% Contingency Fund:</h5>
                              <div className="form-row">
                                <label>Amount:</label>
                                <span>{formatAsPeso(totals.contingencyFund)}</span>
                              </div>
                            </div>
                            
                            <div className="form-total">
                              <strong>Total Activities: {formatAsPeso(totals.activitiesTotal)}</strong>
                            </div>
                          </>
                        ) : (
                          // Old Structure - Legacy Format
                          <>
                            {/* Organization Allocations */}
                            <div className="form-subsection">
                              <h5>Organization Allocations:</h5>
                              {report.formData.cashOutflows?.organizationAllocations && report.formData.cashOutflows.organizationAllocations.length > 0 ? (
                                <table className="form-table">
                                  <thead>
                                    <tr>
                                      <th>Date</th>
                                      <th>Details</th>
                                      <th>Invoice/OR No.</th>
                                      <th>Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {report.formData.cashOutflows.organizationAllocations.map((item, index) => (
                                      <tr key={index}>
                                        <td>{item.date || '-'}</td>
                                        <td>{item.details || '-'}</td>
                                        <td>{item.invoiceNumber || '-'}</td>
                                        <td>{item.amount || '₱0.00'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p className="no-data">No entries</p>
                              )}
                              <div className="subsection-total">
                                <strong>Subtotal: {formatAsPeso(totals.organizationAllocations)}</strong>
                              </div>
                            </div>

                            {/* Other Disbursements */}
                            <div className="form-subsection">
                              <h5>Other Disbursements:</h5>
                              {report.formData.cashOutflows?.otherDisbursements && report.formData.cashOutflows.otherDisbursements.length > 0 ? (
                                <table className="form-table">
                                  <thead>
                                    <tr>
                                      <th>Date</th>
                                      <th>Details</th>
                                      <th>Invoice/OR No.</th>
                                      <th>Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {report.formData.cashOutflows.otherDisbursements.map((item, index) => (
                                      <tr key={index}>
                                        <td>{item.date || '-'}</td>
                                        <td>{item.details || '-'}</td>
                                        <td>{item.invoiceNumber || '-'}</td>
                                        <td>{item.amount || '₱0.00'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p className="no-data">No entries</p>
                              )}
                              <div className="subsection-total">
                                <strong>Subtotal: {formatAsPeso(totals.otherDisbursements)}</strong>
                              </div>
                            </div>

                            {/* Contingency Fund */}
                            <div className="form-subsection">
                              <h5>1% Contingency Fund:</h5>
                              {report.formData.cashOutflows?.contingencyFund && Array.isArray(report.formData.cashOutflows.contingencyFund) && report.formData.cashOutflows.contingencyFund.length > 0 ? (
                                <table className="form-table">
                                  <thead>
                                    <tr>
                                      <th>Date</th>
                                      <th>Details</th>
                                      <th>Invoice/OR No.</th>
                                      <th>Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {report.formData.cashOutflows.contingencyFund.map((item, index) => (
                                      <tr key={index}>
                                        <td>{item.date || '-'}</td>
                                        <td>{item.details || '-'}</td>
                                        <td>{item.invoiceNumber || '-'}</td>
                                        <td>{item.amount || '₱0.00'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p className="no-data">No entries</p>
                              )}
                              <div className="subsection-total">
                                <strong>Subtotal: {formatAsPeso(totals.contingencyFund)}</strong>
                              </div>
                            </div>
                          </>
                        )}
                        
                        <div className="form-total">
                          <strong>Total Cash Outflows: {formatAsPeso(totals.totalCashOutflows)}</strong>
                        </div>
                        
                        {/* Display Notes Section if available */}
                        {totals.notes && totals.notes.length > 0 && (
                          <div className="form-subsection">
                            <h5>Notes (Expense Details):</h5>
                            {totals.notes.map((note, noteIndex) => (
                              <div key={noteIndex} className="note-details">
                                <h6>Note {noteIndex + 1}: {note.name}</h6>
                                {note.items && note.items.length > 0 ? (
                                  <table className="form-table">
                                    <thead>
                                      <tr>
                                        <th>Date</th>
                                        <th>Details</th>
                                        <th>Invoice/OR No.</th>
                                        <th>Amount</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {note.items.map((item, itemIndex) => (
                                        <tr key={itemIndex}>
                                          <td>{item.date || '-'}</td>
                                          <td>{item.details || '-'}</td>
                                          <td>{item.invoiceNumber || '-'}</td>
                                          <td>{item.amount || '₱0.00'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                ) : (
                                  <p className="no-data">No entries in this note</p>
                                )}
                                <div className="subsection-total">
                                  <strong>Note Total: {formatAsPeso(note.items?.reduce((sum, item) => sum + parseFloat(item.amount?.replace(/[₱,]/g, '') || 0), 0) || 0)}</strong>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Ending Cash Balance Section */}
                      <div className="form-section">
                        <h4 className="section-title">Ending Cash Balance</h4>
                        
                        <div className="form-row">
                          <label>Cash in Bank:</label>
                          <span>{report.formData.endingCashBalance?.cashInBank || '₱0.00'}</span>
                        </div>
                        
                        <div className="form-row">
                          <label>Cash on Hand:</label>
                          <span>{report.formData.endingCashBalance?.cashOnHand || '₱0.00'}</span>
                        </div>
                        
                        <div className="form-total">
                          <strong>Total Ending Cash Balance: {formatAsPeso(totals.totalEndingCashBalance)}</strong>
                        </div>
                      </div>
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === 'documents' && (
                    <div className="documents-viewer">
                      {/* Attached Forms Section */}
                      {report.formData?.attached_forms && report.formData.attached_forms.length > 0 && (
                        <div className="attached-forms-section">
                          <h4>Attached Forms</h4>
                          <div className="documents-list">
                            {report.formData.attached_forms.map((form, index) => (
                              <div key={`form-${index}`} className="document-item">
                                <div className="document-info">
                                  <div className="document-icon">
                                    <FileText size={20} />
                                  </div>
                                  <div className="document-details">
                                    <div className="document-name">{form.name || form.id}</div>
                                    <div className="document-meta">
                                      <span className="document-type">FORM REFERENCE</span>
                                      <span className="document-id">{form.id}</span>
                                    </div>
                                    {form.description && (
                                      <div className="document-description">{form.description}</div>
                                    )}
                                  </div>
                                </div>
                                <div className="document-actions">
                                  <button 
                                    className="document-btn document-btn--view" 
                                    title="View Form"
                                    onClick={() => handleViewForm(form.id)}
                                  >
                                    <Eye size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Supporting Documents Section */}
                      <div className="supporting-documents-section">
                        <h4>Supporting Documents</h4>
                        {report.documents && report.documents.length > 0 ? (
                          <div className="documents-list">
                            {report.documents.map((doc, index) => (
                              <div key={`doc-${index}`} className="document-item">
                                <div className="document-info">
                                  <div className="document-icon">
                                    {getDocumentIcon(doc.type)}
                                  </div>
                                  <div className="document-details">
                                    <div className="document-name">{doc.name}</div>
                                    <div className="document-meta">
                                      <span className="document-type">{doc.type.replace('_', ' ').toUpperCase()}</span>
                                      <span className="document-size">{doc.size}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="document-actions">
                                  <button className="document-btn document-btn--view" title="View Document">
                                    <Eye size={14} />
                                  </button>
                                  <button className="document-btn document-btn--download" title="Download Document">
                                    <Download size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="no-documents">No supporting documents attached</p>
                        )}
                      </div>

                      {/* Show message if no documents at all */}
                      {(!report.formData?.attached_forms || report.formData.attached_forms.length === 0) && 
                       (!report.documents || report.documents.length === 0) && (
                        <p className="no-documents">No documents or forms attached</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'review' && (
                    <form onSubmit={handleSubmit} className="review-modal__form">
                      {error && (
                        <div className="review-modal__error">
                          <p>{error}</p>
                        </div>
                      )}
                      
                      <div className="review-modal__decision-group">
                        <label className="review-modal__label">Review Decision</label>
                        <div className="review-modal__buttons">
                          <button
                            type="button"
                            className={`decision-btn decision-btn--approve ${reviewDecision === 'approve' ? 'active' : ''}`}
                            onClick={() => setReviewDecision('approve')}
                            disabled={isSubmitting}
                          >
                            <Check size={18} />
                            Approve
                          </button>
                          <button
                            type="button"
                            className={`decision-btn decision-btn--flag ${reviewDecision === 'flag' ? 'active' : ''}`}
                            onClick={() => setReviewDecision('flag')}
                            disabled={isSubmitting}
                          >
                            <Flag size={18} />
                            Flag for Review
                          </button>
                          <button
                            type="button"
                            className={`decision-btn decision-btn--unliquidated ${reviewDecision === 'unliquidated' ? 'active' : ''}`}
                            onClick={() => setReviewDecision('unliquidated')}
                            disabled={isSubmitting}
                          >
                            <AlertCircle size={18} />
                            Mark Unliquidated
                          </button>
                        </div>
                      </div>

                      <div className="review-modal__comments-group">
                        <label htmlFor="comments" className="review-modal__label">
                          Review Comments
                        </label>
                        <textarea
                          id="comments"
                          className="review-modal__comments"
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          placeholder="Enter your review comments here..."
                          rows={4}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="review-modal__actions">
                        <button 
                          type="button" 
                          className="review-modal__cancel" 
                          onClick={onClose}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="review-modal__submit"
                          disabled={!reviewDecision || isSubmitting}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Submitted Form Viewer Modal */}
      <SubmittedFormViewer
        isOpen={isFormViewerOpen}
        onClose={handleCloseFormViewer}
        formId={selectedFormId}
        submissionId={report?.id}
      />
    </div>
  );
};

export default ReviewModal;
