import React, { useState, useEffect } from 'react';

const AcknowledgmentForm = ({ formData, onDataChange, onSave, onCancel }) => {
  const [data, setData] = useState({
    date: '',
    receivedFrom: '',
    amount: '',
    purpose: '',
    acknowledgedBy: '',
    ...formData
  });

  useEffect(() => {
    onDataChange(data);
  }, [data]);

  const handleInputChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="acknowledgment-form">
      <div className="form-header">
        <h3 className="form-title">FORM-03 Acknowledgment Form</h3>
      </div>

      <div className="form-group">
        <label>Date <span className="required">*</span></label>
        <input type="date" value={data.date} onChange={(e) => handleInputChange('date', e.target.value)} className="form-input" required />
      </div>

      <div className="form-group full-width">
        <label>Received From <span className="required">*</span></label>
        <input type="text" value={data.receivedFrom} onChange={(e) => handleInputChange('receivedFrom', e.target.value)} className="form-input" required />
      </div>

      <div className="form-group">
        <label>Amount <span className="required">*</span></label>
        <input type="number" value={data.amount} onChange={(e) => handleInputChange('amount', e.target.value)} className="form-input" step="0.01" required />
      </div>

      <div className="form-group full-width">
        <label>Purpose</label>
        <textarea value={data.purpose} onChange={(e) => handleInputChange('purpose', e.target.value)} className="form-textarea" rows="3" />
      </div>

      <div className="signature-group">
        <label>Acknowledged By:</label>
        <input type="text" value={data.acknowledgedBy} onChange={(e) => handleInputChange('acknowledgedBy', e.target.value)} className="signature-input" />
      </div>

      <div className="form-actions">
        <button type="button" className="form-btn form-btn--secondary" onClick={onCancel}>Cancel</button>
        <button type="button" className="form-btn form-btn--primary" onClick={onSave}>Next</button>
      </div>
    </div>
  );
};

export default AcknowledgmentForm;

