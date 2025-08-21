import React, { useState, useEffect } from 'react';

const TransportationForm = ({ formData, onDataChange, onSave, onCancel }) => {
  const [data, setData] = useState({
    date: '',
    destination: '',
    purpose: '',
    transportMode: '',
    amount: '',
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
    <div className="transportation-form">
      <div className="form-header">
        <h3 className="form-title">FORM-05 Transportation Form</h3>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Date <span className="required">*</span></label>
          <input type="date" value={data.date} onChange={(e) => handleInputChange('date', e.target.value)} className="form-input" required />
        </div>

        <div className="form-group">
          <label>Transport Mode <span className="required">*</span></label>
          <select value={data.transportMode} onChange={(e) => handleInputChange('transportMode', e.target.value)} className="form-input" required>
            <option value="">Select Mode</option>
            <option value="taxi">Taxi</option>
            <option value="bus">Bus</option>
            <option value="jeepney">Jeepney</option>
            <option value="tricycle">Tricycle</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="form-group full-width">
        <label>Destination <span className="required">*</span></label>
        <input type="text" value={data.destination} onChange={(e) => handleInputChange('destination', e.target.value)} className="form-input" required />
      </div>

      <div className="form-group">
        <label>Amount <span className="required">*</span></label>
        <input type="number" value={data.amount} onChange={(e) => handleInputChange('amount', e.target.value)} className="form-input" step="0.01" required />
      </div>

      <div className="form-group full-width">
        <label>Purpose</label>
        <textarea value={data.purpose} onChange={(e) => handleInputChange('purpose', e.target.value)} className="form-textarea" rows="3" />
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

export default TransportationForm;

