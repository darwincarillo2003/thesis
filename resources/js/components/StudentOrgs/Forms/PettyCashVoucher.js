import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';

const PettyCashVoucher = ({ formData, onDataChange, onSave, onCancel }) => {
  const [data, setData] = useState({
    pettyCashStatus: {
      monthlyLimit: 300.00,
      used: 0.00,
      available: 300.00
    },
    no: '',
    date: '',
    paidTo: '',
    particulars: [
      { item: '', amount: '' }
    ],
    total: 0,
    approvedBy: '',
    receivedPaymentBy: '',
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

  // Helper function to handle monetary calculations with proper precision
  const roundToTwoDecimals = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  };

  const handleStatusChange = (field, value) => {
    const numValue = roundToTwoDecimals(parseFloat(value) || 0);
    setData(prev => {
      const newStatus = { ...prev.pettyCashStatus, [field]: numValue };
      
      // Calculate available amount with proper precision
      if (field === 'monthlyLimit' || field === 'used') {
        newStatus.available = roundToTwoDecimals(newStatus.monthlyLimit - newStatus.used);
      }
      
      return {
        ...prev,
        pettyCashStatus: newStatus
      };
    });
  };

  const handleParticularChange = (index, field, value) => {
    setData(prev => {
      const newParticulars = [...prev.particulars];
      newParticulars[index] = {
        ...newParticulars[index],
        [field]: value
      };
      
      // Calculate total with proper precision
      const total = newParticulars.reduce((sum, item) => {
        return sum + (roundToTwoDecimals(parseFloat(item.amount) || 0));
      }, 0);
      
      return {
        ...prev,
        particulars: newParticulars,
        total: roundToTwoDecimals(total)
      };
    });
  };

  const addParticular = () => {
    setData(prev => ({
      ...prev,
      particulars: [...prev.particulars, { item: '', amount: '' }]
    }));
  };

  const removeParticular = (index) => {
    if (data.particulars.length > 1) {
      setData(prev => {
        const newParticulars = prev.particulars.filter((_, i) => i !== index);
        const total = newParticulars.reduce((sum, item) => {
          return sum + (roundToTwoDecimals(parseFloat(item.amount) || 0));
        }, 0);
        
        return {
          ...prev,
          particulars: newParticulars,
          total: roundToTwoDecimals(total)
        };
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  return (
    <div className="petty-cash-voucher">
      <div className="form-header">
        <h3 className="form-title">FORM-01 Petty Cash Voucher</h3>
      </div>

      {/* Petty Cash Status */}
      <div className="petty-cash-status">
        <h4 className="status-title">Petty Cash Status</h4>
        <div className="status-grid">
          <div className="status-item">
            <label>Monthly Limit:</label>
            <input
              type="number"
              value={data.pettyCashStatus.monthlyLimit}
              onChange={(e) => handleStatusChange('monthlyLimit', e.target.value)}
              className="status-input"
              step="0.01"
            />
          </div>
          <div className="status-item">
            <label>Used:</label>
            <input
              type="number"
              value={data.pettyCashStatus.used}
              onChange={(e) => handleStatusChange('used', e.target.value)}
              className="status-input"
              step="0.01"
            />
          </div>
          <div className="status-item">
            <label>Available:</label>
            <div className="status-display">
              {formatCurrency(data.pettyCashStatus.available)}
            </div>
          </div>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="no">
            No. <span className="required">*</span>
          </label>
          <input
            type="text"
            id="no"
            value={data.no}
            onChange={(e) => handleInputChange('no', e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">
            Date <span className="required">*</span>
          </label>
          <div className="date-input-wrapper">
            <input
              type="date"
              id="date"
              value={data.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="form-input"
              required
            />
            <Calendar size={16} className="date-icon" />
          </div>
        </div>
      </div>

      <div className="form-group full-width">
        <label htmlFor="paidTo">
          Paid To <span className="required">*</span>
        </label>
        <input
          type="text"
          id="paidTo"
          value={data.paidTo}
          onChange={(e) => handleInputChange('paidTo', e.target.value)}
          className="form-input"
          placeholder="Name of payee"
          required
        />
      </div>

      {/* Table of Particulars */}
      <div className="particulars-section">
        <div className="particulars-header">
          <label>
            Table of Particulars <span className="required">*</span>
          </label>
          <button
            type="button"
            className="add-item-btn"
            onClick={addParticular}
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>

        <div className="particulars-table">
          <div className="table-header">
            <div className="table-cell header-cell">ITEM</div>
            <div className="table-cell header-cell">AMOUNT</div>
            <div className="table-cell header-cell">ACTION</div>
          </div>

          {data.particulars.map((particular, index) => (
            <div key={index} className="table-row">
              <div className="table-cell">
                <input
                  type="text"
                  value={particular.item}
                  onChange={(e) => handleParticularChange(index, 'item', e.target.value)}
                  className="table-input"
                  placeholder="Enter item description"
                />
              </div>
              <div className="table-cell">
                <input
                  type="number"
                  value={particular.amount}
                  onChange={(e) => handleParticularChange(index, 'amount', e.target.value)}
                  className="table-input"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="table-cell">
                <button
                  type="button"
                  className="remove-item-btn"
                  onClick={() => removeParticular(index)}
                  disabled={data.particulars.length === 1}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          <div className="table-footer">
            <div className="table-cell total-label">Total:</div>
            <div className="table-cell total-amount">
              {formatCurrency(data.total)}
            </div>
            <div className="table-cell"></div>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="signatures-section">
        <div className="signature-grid">
          <div className="signature-group">
            <label htmlFor="approvedBy">Approved By:</label>
            <input
              type="text"
              id="approvedBy"
              value={data.approvedBy}
              onChange={(e) => handleInputChange('approvedBy', e.target.value)}
              className="signature-input"
              placeholder="Name and signature"
            />
          </div>

          <div className="signature-group">
            <label htmlFor="receivedPaymentBy">Received Payment by:</label>
            <input
              type="text"
              id="receivedPaymentBy"
              value={data.receivedPaymentBy}
              onChange={(e) => handleInputChange('receivedPaymentBy', e.target.value)}
              className="signature-input"
              placeholder="Name and signature"
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <button
          type="button"
          className="form-btn form-btn--secondary"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="form-btn form-btn--primary"
          onClick={onSave}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PettyCashVoucher;



