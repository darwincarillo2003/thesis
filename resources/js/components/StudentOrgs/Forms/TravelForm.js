import React, { useState, useEffect } from 'react';

const TravelForm = ({ formData, onDataChange, onSave, onCancel }) => {
  const [data, setData] = useState({
    date: '',
    traveler: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    purpose: '',
    estimatedCost: '',
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
    <div className="travel-form">
      <div className="form-header">
        <h3 className="form-title">FORM-07 Travel Form</h3>
      </div>

      <div className="form-group">
        <label>Date <span className="required">*</span></label>
        <input type="date" value={data.date} onChange={(e) => handleInputChange('date', e.target.value)} className="form-input" required />
      </div>

      <div className="form-group full-width">
        <label>Traveler <span className="required">*</span></label>
        <input type="text" value={data.traveler} onChange={(e) => handleInputChange('traveler', e.target.value)} className="form-input" required />
      </div>

      <div className="form-group full-width">
        <label>Destination <span className="required">*</span></label>
        <input type="text" value={data.destination} onChange={(e) => handleInputChange('destination', e.target.value)} className="form-input" required />
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Departure Date <span className="required">*</span></label>
          <input type="date" value={data.departureDate} onChange={(e) => handleInputChange('departureDate', e.target.value)} className="form-input" required />
        </div>

        <div className="form-group">
          <label>Return Date <span className="required">*</span></label>
          <input type="date" value={data.returnDate} onChange={(e) => handleInputChange('returnDate', e.target.value)} className="form-input" required />
        </div>
      </div>

      <div className="form-group">
        <label>Estimated Cost <span className="required">*</span></label>
        <input type="number" value={data.estimatedCost} onChange={(e) => handleInputChange('estimatedCost', e.target.value)} className="form-input" step="0.01" required />
      </div>

      <div className="form-group full-width">
        <label>Purpose of Travel</label>
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

export default TravelForm;

