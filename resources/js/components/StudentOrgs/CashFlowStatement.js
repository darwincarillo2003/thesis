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
  setAcademicYear,
  // New activity functions
  addActivity,
  removeActivity,
  addActivityItem,
  removeActivityItem,
  updateActivityName,
  updateActivityItem,
  // New note functions
  addNote,
  removeNote,
  updateNoteName,
  addNoteItem,
  removeNoteItem,
  updateNoteItem
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
            <h3 className="form-header__office">Office of the Supreme Student Government Computer Studies Program</h3>
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
            <div className="form-header__academic-year">A.Y. {academicYear}</div>
          </div>
          <img src="/images/coalogo.svg" alt="COA Logo" className="form-header__logo form-header__logo-right" />
        </div>
        
        <div className="form-header__details">
          <div className="form-group">
            <label htmlFor="organizationName">Organization Name:</label>
            <span className="print-value">{formData.organizationName || '____________________'}</span>
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
            <span className="print-value">{academicYear || '____________________'}</span>
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
            <span className="print-value">{formData.month || '____________________'}</span>
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

      {/* Title Section for Print */}
      <div className="form-title-section">
        <h1 className="statement-title">Statement of Cash Flows</h1>
        <div className="statement-month">For the Month of {formData.month}</div>
        <div className="statement-semester">First Semester A.Y. {academicYear}</div>
      </div>

      {/* Section 1: Cash Inflows */}
      <section className="form-section">
        <h3 className="section-title">Cash Inflows</h3>
        
        {/* Professional Cash Inflows for Print */}
        <div className="cash-inflows-print">
          <div className="section-header">Cash Inflows</div>
          
          {/* Cash Balance Beginning */}
          <div className="inflow-item level-0">
            <span className="item-description">Cash Balance, Beginning - {formData.cashInflows.beginningCashInBank.month || 'Previous Month'}</span>
            <span className="item-amount">{formatAsPeso(formData.cashInflows.beginningCashInBank.amount)}</span>
          </div>
          
          {/* Total Cash in Bank Inflow */}
          <div className="inflow-item level-1">
            <span className="item-description">Total Cash in Bank Inflow</span>
            <span className="item-amount">{formatAsPeso(formData.cashInflows.beginningCashInBank.amount)}</span>
          </div>
          
          {/* ADD: Cash on Hand */}
          <div className="inflow-item level-0">
            <span className="item-description">ADD: Cash on Hand, Beginning Balance</span>
            <span className="item-amount">{formatAsPeso(formData.cashInflows.beginningCashOnHand.amount)}</span>
          </div>
          
          {/* Total Cash on Hand Inflows */}
          <div className="inflow-item level-1">
            <span className="item-description">Total Cash on Hand Inflows</span>
            <span className="item-amount">{formatAsPeso(formData.cashInflows.beginningCashOnHand.amount)}</span>
          </div>
          
          {/* Additional Cash Receipt Sources */}
          {formData.cashInflows.cashReceiptSources.map((source, index) => (
            source.description && (
              <div key={index} className="inflow-item level-1">
                <span className="item-description">{source.description}</span>
                <span className="item-amount">{formatAsPeso(source.amount)}</span>
              </div>
            )
          ))}
          
          <div className="subtotal">
            <span>Total Cash Inflows</span>
            <span className="subtotal-amount">{formatAsPeso(totals.totalCashInflows)}</span>
          </div>
        </div>
        
        {/* Form inputs for editing */}
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
        
        {/* Professional Cash Outflows for Print */}
        <div className="cash-outflows-print">
          <div className="outflow-label">Less: Cash Outflows</div>
          
          {formData.cashOutflows.activities.map((activity, activityIndex) => (
            activity.name && (
              <div key={activityIndex} className="outflow-category">
                <div className="outflow-item level-1">
                  <span className="item-description">{activity.name}</span>
                  <span className="item-amount"></span>
                </div>
                {activity.items.map((item, itemIndex) => (
                  item.description && (
                    <div key={itemIndex} className="outflow-item level-2">
                      <span className="item-description">{item.description}</span>
                      <span className="item-amount">{formatAsPeso(item.amount)}</span>
                    </div>
                  )
                ))}
              </div>
            )
          ))}
          
          {/* Example specific items for University Days */}
          {formData.cashOutflows.activities.length > 0 && formData.cashOutflows.activities[0].name && (
            <div className="outflow-category">
              <div className="outflow-item level-1">
                <span className="item-description">SSG SHIRT</span>
                <span className="item-amount"></span>
              </div>
              <div className="outflow-item level-2">
                <span className="item-description">Indoor Jersey</span>
                <span className="item-amount"></span>
              </div>
              <div className="outflow-item level-3">
                <span className="item-description">(E-Games, Badminton, Chess, Dart, Table Tennis)</span>
                <span className="item-amount"></span>
              </div>
              <div className="outflow-item level-2">
                <span className="item-description">Futsal Jersey (Men & Women)</span>
                <span className="item-amount"></span>
              </div>
              
              <div className="outflow-item level-1">
                <span className="item-description">Court (Volleyball, Basketball)</span>
                <span className="item-amount"></span>
              </div>
            </div>
          )}
          
          {formData.cashOutflows.contingencyFund.amount && (
            <div className="contingency-section">
              <div className="contingency-item">
                <span className="item-description">1% Contingency Fund</span>
                <span className="item-amount">{formatAsPeso(formData.cashOutflows.contingencyFund.amount)}</span>
              </div>
            </div>
          )}
          
          <div className="subtotal">
            <span>Total Cash Outflows</span>
            <span className="subtotal-amount">{formatAsPeso(totals.totalCashOutflows)}</span>
          </div>
        </div>
        
        {/* Form inputs for editing */}
        <div className="form-group">
          <label>Less:</label>
        </div>
        
        {/* Activities */}
        {formData.cashOutflows.activities.map((activity, activityIndex) => (
          <div key={activityIndex} className="activity-group">
            <div className="activity-header">
              <div className="activity-name-group">
                <label>Name of activity:</label>
                <input
                  type="text"
                  value={activity.name}
                  onChange={(e) => updateActivityName(activityIndex, e.target.value)}
                  placeholder="Enter activity name"
                  className="activity-name-input"
                />
                <button
                  type="button"
                  className="btn-add btn-add-item"
                  onClick={() => addActivityItem(activityIndex)}
                >
                  Add Item
                </button>
              </div>
              {formData.cashOutflows.activities.length > 1 && (
                <button
                  type="button"
                  className="btn-remove btn-remove-activity"
                  onClick={() => removeActivity(activityIndex)}
                >
                  Remove Activity
                </button>
              )}
            </div>
            
            {/* Activity Items */}
            <div className="activity-items">
              {activity.items.map((item, itemIndex) => (
                <div key={itemIndex} className="activity-item">
                  <div className="activity-item-group">
                    <label>Description:</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateActivityItem(activityIndex, itemIndex, 'description', e.target.value)}
                      placeholder="Enter description"
                      className="activity-item-description"
                    />
                    <input
                      type="text"
                      value={item.amount}
                      onChange={(e) => updateActivityItem(activityIndex, itemIndex, 'amount', e.target.value)}
                      onBlur={(e) => updateActivityItem(activityIndex, itemIndex, 'amount', formatAsPeso(e.target.value))}
                      placeholder="₱0.00"
                      className="activity-item-amount"
                    />
                    {activity.items.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove btn-remove-item"
                        onClick={() => removeActivityItem(activityIndex, itemIndex)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Add Activity Button */}
        <div className="form-group">
          <button
            type="button"
            className="btn-add btn-add-activity"
            onClick={addActivity}
          >
            Add Activity
          </button>
        </div>
        
        {/* 1% Contingency Fund */}
        <div className="form-group contingency-fund-group">
          <label>1% contingency fund:</label>
          <input
            type="text"
            value={formData.cashOutflows.contingencyFund.amount}
            onChange={(e) => handleInputChange('cashOutflows', 'contingencyFund', { amount: e.target.value })}
            onBlur={(e) => handleInputChange('cashOutflows', 'contingencyFund', { amount: formatAsPeso(e.target.value) })}
            placeholder="₱0.00"
            className="contingency-fund-input"
          />
        </div>
        
        <div className="form-group total-group">
          <label>Total Cash Outflows:</label>
          <div className="total-value">{formatAsPeso(totals.totalCashOutflows)}</div>
        </div>
      </section>

      {/* Section 3: Ending Cash Balance */}
      <section className="form-section">
        <h3 className="section-title">Ending Cash Balance</h3>
        
        {/* Professional Ending Balance for Print */}
        <div className="ending-balance-print">
          <div className="section-header">Ending Cash Balance</div>
          <div className="balance-item level-1">
            <span className="item-description">Cash in Bank</span>
            <span className="item-amount">{formatAsPeso(formData.endingCashBalance.cashInBank)}</span>
          </div>
          <div className="balance-item level-1">
            <span className="item-description">Cash on Hand</span>
            <span className="item-amount">{formatAsPeso(formData.endingCashBalance.cashOnHand)}</span>
          </div>
          <div className="balance-item total-balance">
            <span className="item-description">Total Ending Cash Balance</span>
            <span className="item-amount">{formatAsPeso(totals.totalEndingCashBalance)}</span>
          </div>
        </div>
        
        {/* Form inputs for editing */}
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
        
        {/* Receipt-style Notes for Print */}
        <div className="notes-print">
          {formData.notes.map((note, noteIndex) => (
            note.name && note.items.length > 0 && (
              <div key={noteIndex} className="note-section">
                <div className="note-title">Note {noteIndex + 1} - {note.name}</div>
                <table className="note-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Details</th>
                      <th>Sales Invoice/OR/Form No.</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {note.items.map((item, itemIndex) => (
                      item.details && (
                        <tr key={itemIndex}>
                          <td>{item.date || ''}</td>
                          <td>{item.details || ''}</td>
                          <td>{item.invoiceNumber || ''}</td>
                          <td className="amount">{formatAsPeso(item.amount)}</td>
                        </tr>
                      )
                    ))}
                    <tr>
                      <td colSpan="3" className="total">TOTAL</td>
                      <td className="total amount">
                        {formatAsPeso(note.items.reduce((sum, item) => sum + (parseFloat(item.amount?.replace(/[^\d.-]/g, '')) || 0), 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          ))}
        </div>
        
        {/* Form inputs for editing */}
        <div className="notes-section">
          {formData.notes.map((note, noteIndex) => (
            <div key={noteIndex} className="note-table">
              <div className="note-header">
                <div className="note-title-group">
                  <label>Note {noteIndex + 1}:</label>
                  <input
                    type="text"
                    value={note.name}
                    onChange={(e) => updateNoteName(noteIndex, e.target.value)}
                    placeholder="Enter note name"
                    className="note-name-input"
                  />
                </div>
                {formData.notes.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove btn-remove-note"
                    onClick={() => removeNote(noteIndex)}
                  >
                    Remove Note
                  </button>
                )}
              </div>
              
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
                  {note.items.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="no-data">No entries yet</td>
                    </tr>
                  ) : (
                    note.items.map((item, itemIndex) => (
                      <tr key={itemIndex}>
                        <td>
                          <input
                            type="date"
                            value={item.date || ''}
                            onChange={(e) => updateNoteItem(noteIndex, itemIndex, 'date', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.details || ''}
                            onChange={(e) => updateNoteItem(noteIndex, itemIndex, 'details', e.target.value)}
                            placeholder="Enter details"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.invoiceNumber || ''}
                            onChange={(e) => updateNoteItem(noteIndex, itemIndex, 'invoiceNumber', e.target.value)}
                            placeholder="Enter invoice number"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.amount || ''}
                            onChange={(e) => updateNoteItem(noteIndex, itemIndex, 'amount', e.target.value)}
                            onBlur={(e) => updateNoteItem(noteIndex, itemIndex, 'amount', formatAsPeso(e.target.value))}
                            placeholder="₱0.00"
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => removeNoteItem(noteIndex, itemIndex)}
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
                    <td className="total-amount">
                      {formatAsPeso(note.items.reduce((sum, item) => sum + (parseFloat(item.amount?.replace(/[^\d.-]/g, '')) || 0), 0))}
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan="5">
                      <button
                        type="button"
                        className="btn-add"
                        onClick={() => addNoteItem(noteIndex)}
                      >
                        Add Row
                      </button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ))}
          
          {/* Add Note Button */}
          <div className="notes-actions">
            <button
              type="button"
              className="btn-add btn-add-note"
              onClick={addNote}
            >
              Add Note
            </button>
          </div>
        </div>
      </section>

      {/* Section 5: Signatories */}
      <section className="form-section">
        <h3 className="section-title">Signatories</h3>
        
        {/* Receipt-style Signatories for Print */}
        <div className="signatories-print">
          <div className="signatory-row">
            <div className="signatory">
              <div className="signatory-name"></div>
              <div className="signatory-title">Treasurer</div>
            </div>
            <div className="signatory">
              <div className="signatory-name"></div>
              <div className="signatory-title">Auditor</div>
            </div>
          </div>
          <div className="signatory-row">
            <div className="signatory">
              <div className="signatory-name"></div>
              <div className="signatory-title">President / Governor / Chairperson</div>
            </div>
            <div className="signatory">
              <div className="signatory-name"></div>
              <div className="signatory-title">Assigned Auditor</div>
            </div>
          </div>
        </div>
        
        {/* Form inputs for editing */}
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
