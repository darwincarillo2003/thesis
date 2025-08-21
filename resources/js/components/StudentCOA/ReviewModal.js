import React, { useState } from 'react';
import { X, Check, Flag, AlertCircle, FileText, Download, Eye } from 'lucide-react';

const ReviewModal = ({ isOpen, onClose, report }) => {
  const [reviewDecision, setReviewDecision] = useState('');
  const [comments, setComments] = useState('');
  const [activeTab, setActiveTab] = useState('form');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle the review submission
    console.log('Review submitted:', {
      decision: reviewDecision,
      comments,
      reportId: report?.id
    });
    onClose();
  };

  const calculateTotals = (formData) => {
    if (!formData) return {};
    
    // Calculate cash inflows total
    const beginningCashInBank = parseFloat(formData.cashInflows?.beginningCashInBank?.amount?.replace(/[₱,]/g, '') || 0);
    const beginningCashOnHand = parseFloat(formData.cashInflows?.beginningCashOnHand?.amount?.replace(/[₱,]/g, '') || 0);
    const cashReceiptSources = formData.cashInflows?.cashReceiptSources?.reduce((sum, source) => 
      sum + parseFloat(source.amount?.replace(/[₱,]/g, '') || 0), 0) || 0;
    const totalCashInflows = beginningCashInBank + beginningCashOnHand + cashReceiptSources;

    // Calculate cash outflows total
    const organizationAllocations = formData.cashOutflows?.organizationAllocations?.reduce((sum, item) => 
      sum + parseFloat(item.amount?.replace(/[₱,]/g, '') || 0), 0) || 0;
    const otherDisbursements = formData.cashOutflows?.otherDisbursements?.reduce((sum, item) => 
      sum + parseFloat(item.amount?.replace(/[₱,]/g, '') || 0), 0) || 0;
    const contingencyFund = formData.cashOutflows?.contingencyFund?.reduce((sum, item) => 
      sum + parseFloat(item.amount?.replace(/[₱,]/g, '') || 0), 0) || 0;
    const totalCashOutflows = organizationAllocations + otherDisbursements + contingencyFund;

    // Calculate ending cash balance
    const endingCashInBank = parseFloat(formData.endingCashBalance?.cashInBank?.replace(/[₱,]/g, '') || 0);
    const endingCashOnHand = parseFloat(formData.endingCashBalance?.cashOnHand?.replace(/[₱,]/g, '') || 0);
    const totalEndingCashBalance = endingCashInBank + endingCashOnHand;

    return {
      totalCashInflows,
      organizationAllocations,
      otherDisbursements,
      contingencyFund,
      totalCashOutflows,
      totalEndingCashBalance
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

  const totals = report?.formData ? calculateTotals(report.formData) : {};

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
                    Documents ({report.documents?.length || 0})
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
                  {activeTab === 'form' && report.formData && (
                    <div className="form-viewer">
                      {/* Cash Inflows Section */}
                      <div className="form-section">
                        <h4 className="section-title">Cash Inflows</h4>
                        
                        <div className="form-row">
                          <label>Cash in Bank, Beginning ({report.formData.cashInflows.beginningCashInBank.month}):</label>
                          <span>{report.formData.cashInflows.beginningCashInBank.amount}</span>
                        </div>
                        
                        <div className="form-row">
                          <label>Cash on Hand, Beginning ({report.formData.cashInflows.beginningCashOnHand.month}):</label>
                          <span>{report.formData.cashInflows.beginningCashOnHand.amount}</span>
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
                              {report.formData.cashInflows.cashReceiptSources.map((source, index) => (
                                <tr key={index}>
                                  <td>{source.description}</td>
                                  <td>{source.amount}</td>
                                </tr>
                              ))}
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
                        
                        {/* Organization Allocations */}
                        <div className="form-subsection">
                          <h5>Organization Allocations:</h5>
                          {report.formData.cashOutflows.organizationAllocations.length > 0 ? (
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
                                    <td>{item.date}</td>
                                    <td>{item.details}</td>
                                    <td>{item.invoiceNumber}</td>
                                    <td>{item.amount}</td>
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
                          {report.formData.cashOutflows.otherDisbursements.length > 0 ? (
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
                                    <td>{item.date}</td>
                                    <td>{item.details}</td>
                                    <td>{item.invoiceNumber}</td>
                                    <td>{item.amount}</td>
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
                          {report.formData.cashOutflows.contingencyFund.length > 0 ? (
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
                                    <td>{item.date}</td>
                                    <td>{item.details}</td>
                                    <td>{item.invoiceNumber}</td>
                                    <td>{item.amount}</td>
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
                        
                        <div className="form-total">
                          <strong>Total Cash Outflows: {formatAsPeso(totals.totalCashOutflows)}</strong>
                        </div>
                      </div>

                      {/* Ending Cash Balance Section */}
                      <div className="form-section">
                        <h4 className="section-title">Ending Cash Balance</h4>
                        
                        <div className="form-row">
                          <label>Cash in Bank:</label>
                          <span>{report.formData.endingCashBalance.cashInBank}</span>
                        </div>
                        
                        <div className="form-row">
                          <label>Cash on Hand:</label>
                          <span>{report.formData.endingCashBalance.cashOnHand}</span>
                        </div>
                        
                        <div className="form-total">
                          <strong>Total Ending Cash Balance: {formatAsPeso(totals.totalEndingCashBalance)}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'documents' && (
                    <div className="documents-viewer">
                      <h4>Supporting Documents</h4>
                      {report.documents && report.documents.length > 0 ? (
                        <div className="documents-list">
                          {report.documents.map((doc, index) => (
                            <div key={index} className="document-item">
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
                        <p className="no-documents">No documents attached</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'review' && (
                    <form onSubmit={handleSubmit} className="review-modal__form">
                      <div className="review-modal__decision-group">
                        <label className="review-modal__label">Review Decision</label>
                        <div className="review-modal__buttons">
                          <button
                            type="button"
                            className={`decision-btn decision-btn--approve ${reviewDecision === 'approve' ? 'active' : ''}`}
                            onClick={() => setReviewDecision('approve')}
                          >
                            <Check size={18} />
                            Approve
                          </button>
                          <button
                            type="button"
                            className={`decision-btn decision-btn--flag ${reviewDecision === 'flag' ? 'active' : ''}`}
                            onClick={() => setReviewDecision('flag')}
                          >
                            <Flag size={18} />
                            Flag for Review
                          </button>
                          <button
                            type="button"
                            className={`decision-btn decision-btn--unliquidated ${reviewDecision === 'unliquidated' ? 'active' : ''}`}
                            onClick={() => setReviewDecision('unliquidated')}
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
                        />
                      </div>

                      <div className="review-modal__actions">
                        <button type="button" className="review-modal__cancel" onClick={onClose}>
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="review-modal__submit"
                          disabled={!reviewDecision}
                        >
                          Submit Review
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
    </div>
  );
};

export default ReviewModal;
