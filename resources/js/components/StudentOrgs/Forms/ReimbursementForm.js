import React, { useState, useEffect } from 'react';

const ReimbursementForm = ({ formData, onDataChange, onSave, onCancel }) => {
  const [data, setData] = useState({
    date: '',
    claimant: '',
    expenseDate: '',
    expenseType: '',
    amount: '',
    description: '',
    requestedBy: '',
    approvedBy: '',
    ...formData
  });

  useEffect(() => {
    onDataChange(data);
  }, [data]);

  const handleInputChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="reimbursement-form">
      <div className="form-header">
        <h3 className="form-title">FORM-06 Reimbursement Form</h3>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Date <span className="required">*</span></label>
          <input type="date" value={data.date} onChange={(e) => handleInputChange('date', e.target.value)} className="form-input" required />
        </div>

        <div className="form-group">
          <label>Expense Date <span className="required">*</span></label>
          <input type="date" value={data.expenseDate} onChange={(e) => handleInputChange('expenseDate', e.target.value)} className="form-input" required />
        </div>
      </div>

      <div className="form-group full-width">
        <label>Claimant <span className="required">*</span></label>
        <input type="text" value={data.claimant} onChange={(e) => handleInputChange('claimant', e.target.value)} className="form-input" required />
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Expense Type <span className="required">*</span></label>
          <select value={data.expenseType} onChange={(e) => handleInputChange('expenseType', e.target.value)} className="form-input" required>
            <option value="">Select Type</option>
            <option value="office-supplies">Office Supplies</option>
            <option value="transportation">Transportation</option>
            <option value="meals">Meals</option>
            <option value="accommodation">Accommodation</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Amount <span className="required">*</span></label>
          <input type="number" value={data.amount} onChange={(e) => handleInputChange('amount', e.target.value)} className="form-input" step="0.01" required />
        </div>
      </div>

      <div className="form-group full-width">
        <label>Description</label>
        <textarea value={data.description} onChange={(e) => handleInputChange('description', e.target.value)} className="form-textarea" rows="3" />
      </div>

      <div className="signatures-section">
        <div className="signature-grid">
          <div className="signature-group">
            <label>Requested By:</label>
            <input type="text" value={data.requestedBy} onChange={(e) => handleInputChange('requestedBy', e.target.value)} className="signature-input" />
          </div>
          <div className="signature-group">
            <label>Approved By:</label>
            <input type="text" value={data.approvedBy} onChange={(e) => handleInputChange('approvedBy', e.target.value)} className="signature-input" />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="form-btn form-btn--secondary" onClick={onCancel}>Cancel</button>
        <button type="button" className="form-btn form-btn--primary" onClick={onSave}>Next</button>
      </div>
    </div>
  );
};

export default ReimbursementForm;

