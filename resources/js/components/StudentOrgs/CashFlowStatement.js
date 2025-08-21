import React from 'react';

const CashFlowStatement = ({ 
  formData, 
  handleInputChange, 
  handleAcademicYearChange,
  addTableRow,
  removeTableRow,
  calculateTotals,
  formatAsPeso,
  handleSubmit,
  months,
  academicYear,
  setAcademicYear
}) => {
  const totals = calculateTotals();

  return (
    <form className="cash-flow-form" onSubmit={handleSubmit}>
      {/* Form Header */}
      <div className="form-header">
        <div className="form-header__logos">
          <img src="/images/ssglogo.svg" alt="SSG Logo" className="form-header__logo form-header__logo-left" />
          <div className="form-header__text">
            <h2 className="form-header__university">Father Saturnino Urios University</h2>
            <p className="form-header__address">San Francisco Street, Butuan City, Caraga, Philippines, 8600</p>
            <h3 className="form-header__office">Office of the Supreme Student Government</h3>
            <div className="form-header__org-input">
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) => handleInputChange('organizationName', null, e.target.value)}
                placeholder="Organization Name"
                className="form-header__org-field"
              />
            </div>
            <div className="form-header__year-input">
              <label htmlFor="academicYear">A.Y.</label>
              <input
                type="text"
                id="academicYear"
                value={academicYear}
                onChange={handleAcademicYearChange}
                className="form-header__year-field"
              />
            </div>
          </div>
          <img src="/images/coalogo.svg" alt="COA Logo" className="form-header__logo form-header__logo-right" />
        </div>
        
        <div className="form-header__details">
          <div className="form-group">
            <label htmlFor="organizationName">Organization Name:</label>
            <input
              type="text"
              id="organizationName"
              value={formData.organizationName}
              onChange={(e) => handleInputChange('organizationName', null, e.target.value)}
              placeholder="Enter organization name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="academicYearField">Academic Year:</label>
            <input
              type="text"
              id="academicYearField"
              value={academicYear}
              onChange={handleAcademicYearChange}
              placeholder="YYYY-YYYY"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="month">For the Month of:</label>
            <select
              id="month"
              value={formData.month}
              onChange={(e) => handleInputChange('month', null, e.target.value)}
              required
            >
              <option value="">Select Month</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 1: Cash Inflows */}
      <section className="form-section">
        <h3 className="section-title">Cash Inflows</h3>
        
        <div className="form-group">
          <label htmlFor="beginningCashInBank">Cash in Bank, Beginning:</label>
          <div className="input-group">
            <select
              value={formData.cashInflows.beginningCashInBank.month}
              onChange={(e) => handleInputChange('cashInflows', 'beginningCashInBank', { month: e.target.value })}
            >
              <option value="">Select Month</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <input
              type="text"
              value={formData.cashInflows.beginningCashInBank.amount}
              onChange={(e) => handleInputChange('cashInflows', 'beginningCashInBank', { amount: e.target.value })}
              onBlur={(e) => handleInputChange('cashInflows', 'beginningCashInBank', { amount: formatAsPeso(e.target.value) })}
              placeholder="₱0.00"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="beginningCashOnHand">Cash on Hand, Beginning:</label>
          <div className="input-group">
            <select
              value={formData.cashInflows.beginningCashOnHand.month}
              onChange={(e) => handleInputChange('cashInflows', 'beginningCashOnHand', { month: e.target.value })}
            >
              <option value="">Select Month</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <input
              type="text"
              value={formData.cashInflows.beginningCashOnHand.amount}
              onChange={(e) => handleInputChange('cashInflows', 'beginningCashOnHand', { amount: e.target.value })}
              onBlur={(e) => handleInputChange('cashInflows', 'beginningCashOnHand', { amount: formatAsPeso(e.target.value) })}
              placeholder="₱0.00"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Cash Receipt Sources:</label>
          <table className="data-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {formData.cashInflows.cashReceiptSources.map((source, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={source.description}
                      onChange={(e) => handleInputChange('cashInflows', 'cashReceiptSources', { description: e.target.value }, index)}
                      placeholder="Enter description"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={source.amount}
                      onChange={(e) => handleInputChange('cashInflows', 'cashReceiptSources', { amount: e.target.value }, index)}
                      onBlur={(e) => handleInputChange('cashInflows', 'cashReceiptSources', { amount: formatAsPeso(e.target.value) }, index)}
                      placeholder="₱0.00"
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeTableRow('cashInflows', 'cashReceiptSources', index)}
                      disabled={formData.cashInflows.cashReceiptSources.length <= 1}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3">
                  <button
                    type="button"
                    className="btn-add"
                    onClick={() => addTableRow('cashInflows', 'cashReceiptSources')}
                  >
                    Add Row
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="form-group total-group">
          <label>Total Cash Inflows:</label>
          <div className="total-value">{formatAsPeso(totals.totalCashInflows)}</div>
        </div>
      </section>

      {/* Section 2: Cash Outflows */}
      <section className="form-section">
        <h3 className="section-title">Cash Outflows</h3>
        
        <div className="form-group">
          <label>Organization Allocations (Note 1):</label>
          <div className="total-value">{formatAsPeso(totals.organizationAllocations)}</div>
        </div>
        
        <div className="form-group">
          <label>Other Disbursements (Note 2):</label>
          <div className="total-value">{formatAsPeso(totals.otherDisbursements)}</div>
        </div>
        
        <div className="form-group">
          <label>1% Contingency Fund (Note 3):</label>
          <div className="total-value">{formatAsPeso(totals.contingencyFund)}</div>
        </div>
        
        <div className="form-group total-group">
          <label>Total Cash Outflows:</label>
          <div className="total-value">{formatAsPeso(totals.totalCashOutflows)}</div>
        </div>
      </section>

      {/* Section 3: Ending Cash Balance */}
      <section className="form-section">
        <h3 className="section-title">Ending Cash Balance</h3>
        
        <div className="form-group">
          <label htmlFor="endingCashInBank">Cash in Bank:</label>
          <input
            type="text"
            id="endingCashInBank"
            value={formData.endingCashBalance.cashInBank}
            onChange={(e) => handleInputChange('endingCashBalance', 'cashInBank', e.target.value)}
            onBlur={(e) => handleInputChange('endingCashBalance', 'cashInBank', formatAsPeso(e.target.value))}
            placeholder="₱0.00"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="endingCashOnHand">Cash on Hand:</label>
          <input
            type="text"
            id="endingCashOnHand"
            value={formData.endingCashBalance.cashOnHand}
            onChange={(e) => handleInputChange('endingCashBalance', 'cashOnHand', e.target.value)}
            onBlur={(e) => handleInputChange('endingCashBalance', 'cashOnHand', formatAsPeso(e.target.value))}
            placeholder="₱0.00"
          />
        </div>
        
        <div className="form-group total-group">
          <label>Total Ending Cash Balance:</label>
          <div className="total-value">{formatAsPeso(totals.totalEndingCashBalance)}</div>
        </div>
      </section>

      {/* Section 4: Notes (Expense Details) */}
      <section className="form-section">
        <h3 className="section-title">Notes (Expense Details)</h3>
        
        <div className="notes-section">
          <div className="note-table">
            <h4>Note 1: Organization Allocations</h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Details</th>
                  <th>Sales Invoice / OR / Form No.</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.cashOutflows.organizationAllocations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">No entries yet</td>
                  </tr>
                ) : (
                  formData.cashOutflows.organizationAllocations.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="date"
                          value={item.date || ''}
                          onChange={(e) => handleInputChange('cashOutflows', 'organizationAllocations', { date: e.target.value }, index)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.details || ''}
                          onChange={(e) => handleInputChange('cashOutflows', 'organizationAllocations', { details: e.target.value }, index)}
                          placeholder="Enter details"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.invoiceNumber || ''}
                          onChange={(e) => handleInputChange('cashOutflows', 'organizationAllocations', { invoiceNumber: e.target.value }, index)}
                          placeholder="Enter invoice number"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.amount || ''}
                          onChange={(e) => handleInputChange('cashOutflows', 'organizationAllocations', { amount: e.target.value }, index)}
                          onBlur={(e) => handleInputChange('cashOutflows', 'organizationAllocations', { amount: formatAsPeso(e.target.value) }, index)}
                          placeholder="₱0.00"
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => removeTableRow('cashOutflows', 'organizationAllocations', index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="total-label">TOTAL</td>
                  <td className="total-amount">{formatAsPeso(totals.organizationAllocations)}</td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan="5">
                    <button
                      type="button"
                      className="btn-add"
                      onClick={() => addTableRow('cashOutflows', 'organizationAllocations')}
                    >
                      Add Row
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="note-table">
            <h4>Note 2: Other Disbursements</h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Details</th>
                  <th>Sales Invoice / OR / Form No.</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.cashOutflows.otherDisbursements.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">No entries yet</td>
                  </tr>
                ) : (
                  formData.cashOutflows.otherDisbursements.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="date"
                          value={item.date || ''}
                          onChange={(e) => handleInputChange('cashOutflows', 'otherDisbursements', { date: e.target.value }, index)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.details || ''}
                          onChange={(e) => handleInputChange('cashOutflows', 'otherDisbursements', { details: e.target.value }, index)}
                          placeholder="Enter details"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.invoiceNumber || ''}
                          onChange={(e) => handleInputChange('cashOutflows', 'otherDisbursements', { invoiceNumber: e.target.value }, index)}
                          placeholder="Enter invoice number"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.amount || ''}
                          onChange={(e) => handleInputChange('cashOutflows', 'otherDisbursements', { amount: e.target.value }, index)}
                          onBlur={(e) => handleInputChange('cashOutflows', 'otherDisbursements', { amount: formatAsPeso(e.target.value) }, index)}
                          placeholder="₱0.00"
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => removeTableRow('cashOutflows', 'otherDisbursements', index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="total-label">TOTAL</td>
                  <td className="total-amount">{formatAsPeso(totals.otherDisbursements)}</td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan="5">
                    <button
                      type="button"
                      className="btn-add"
                      onClick={() => addTableRow('cashOutflows', 'otherDisbursements')}
                    >
                      Add Row
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div className="note-table">
            <h4>Note 3: 1% Contingency Fund</h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Details</th>
                  <th>Sales Invoice / OR / Form No.</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.cashOutflows.contingencyFund.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">No entries yet</td>
                  </tr>
                ) : (
                  formData.cashOutflows.contingencyFund.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="date"
                          value={item.date || ''}
                          onChange={(e) => handleInputChange('cashOutflows', 'contingencyFund', { date: e.target.value }, index)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.details || ''}
                          onChange={(e) => handleInputChange('cashOutflows', 'contingencyFund', { details: e.target.value }, index)}
                          placeholder="Enter details"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.invoiceNumber || ''}
                          onChange={(e) => handleInputChange('cashOutflows', 'contingencyFund', { invoiceNumber: e.target.value }, index)}
                          placeholder="Enter invoice number"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.amount || ''}
                          onChange={(e) => handleInputChange('cashOutflows', 'contingencyFund', { amount: e.target.value }, index)}
                          onBlur={(e) => handleInputChange('cashOutflows', 'contingencyFund', { amount: formatAsPeso(e.target.value) }, index)}
                          placeholder="₱0.00"
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => removeTableRow('cashOutflows', 'contingencyFund', index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="total-label">TOTAL</td>
                  <td className="total-amount">{formatAsPeso(totals.contingencyFund)}</td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan="5">
                    <button
                      type="button"
                      className="btn-add"
                      onClick={() => addTableRow('cashOutflows', 'contingencyFund')}
                    >
                      Add Row
                    </button>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* Section 5: Signatories */}
      <section className="form-section">
        <h3 className="section-title">Signatories</h3>
        
        <div className="signatories">
          <div className="signatory-group">
            <div className="signatory">
              <input type="text" placeholder="Treasurer's Name" />
              <div className="signatory-line"></div>
              <div className="signatory-title">Treasurer</div>
            </div>
            
            <div className="signatory">
              <input type="text" placeholder="Auditor's Name" />
              <div className="signatory-line"></div>
              <div className="signatory-title">Auditor</div>
            </div>
          </div>
          
          <div className="signatory-group">
            <div className="signatory">
              <input type="text" placeholder="President/Governor/Chairperson's Name" />
              <div className="signatory-line"></div>
              <div className="signatory-title">President / Governor / Chairperson</div>
            </div>
            
            <div className="signatory">
              <input type="text" placeholder="Assigned Auditor's Name" />
              <div className="signatory-line"></div>
              <div className="signatory-title">Assigned Auditor</div>
            </div>
          </div>
        </div>
      </section>

    </form>
  );
};

export default CashFlowStatement;
