import React, { useState, useEffect } from 'react';

const CashVoucher = ({ formData, onDataChange, onSave, onCancel }) => {
  const [data, setData] = useState({
    voucherNo: '',
    date: '',
    payTo: '',
    amount: '',
    description: '',
    preparedBy: '',
    approvedBy: '',
    ...formData
  });

  useEffect(() => {
    onDataChange(data);
  }, [data]);

  const handleInputChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="cash-voucher">
      <div className="form-header">
        <h3 className="form-title">FORM-02 Cash Voucher</h3>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Voucher No. <span className="required">*</span></label>
          <input
            type="text"
            value={data.voucherNo}
            onChange={(e) => handleInputChange('voucherNo', e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Date <span className="required">*</span></label>
          <input
            type="date"
            value={data.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="form-input"
            required
          />
        </div>
      </div>

      <div className="form-group full-width">
        <label>Pay To <span className="required">*</span></label>
        <input
          type="text"
          value={data.payTo}
          onChange={(e) => handleInputChange('payTo', e.target.value)}
          className="form-input"
          placeholder="Name of payee"
          required
        />
      </div>

      <div className="form-group full-width">
        <label>Amount <span className="required">*</span></label>
        <input
          type="number"
          value={data.amount}
          onChange={(e) => handleInputChange('amount', e.target.value)}
          className="form-input"
          placeholder="0.00"
          step="0.01"
          required
        />
      </div>

      <div className="form-group full-width">
        <label>Description</label>
        <textarea
          value={data.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="form-textarea"
          rows="3"
          placeholder="Enter description of payment"
        />
      </div>

      <div className="signatures-section">
        <div className="signature-grid">
          <div className="signature-group">
            <label>Prepared By:</label>
            <input
              type="text"
              value={data.preparedBy}
              onChange={(e) => handleInputChange('preparedBy', e.target.value)}
              className="signature-input"
            />
          </div>

          <div className="signature-group">
            <label>Approved By:</label>
            <input
              type="text"
              value={data.approvedBy}
              onChange={(e) => handleInputChange('approvedBy', e.target.value)}
              className="signature-input"
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="form-btn form-btn--secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="form-btn form-btn--primary" onClick={onSave}>
          Next
        </button>
      </div>
    </div>
  );
};

export default CashVoucher;

