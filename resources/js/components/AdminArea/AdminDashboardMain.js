import React, { useState } from 'react';
import { FileText, Clock, CheckCircle, AlertTriangle, Search, Edit, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

const AdminDashboardMain = () => {
  const stats = {
    totalForms: 124,
    pendingApproval: 12,
    approved: 101,
    flagged: 11
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const tableData = [
    { id: 1, organization: 'Computer Science Society', submittedBy: 'John Doe', date: '2025-07-15', status: 'Approved' },
    { id: 2, organization: 'Engineering Student Council', submittedBy: 'Jane Smith', date: '2025-07-14', status: 'Pending' },
    { id: 3, organization: 'Business Administration Club', submittedBy: 'Robert Johnson', date: '2025-07-12', status: 'Flagged' },
    { id: 4, organization: 'Nursing Student Association', submittedBy: 'Maria Garcia', date: '2025-07-10', status: 'Approved' },
    { id: 5, organization: 'Psychology Society', submittedBy: 'David Wilson', date: '2025-07-08', status: 'Pending' }
  ];

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'pending':
        return 'status-pending';
      case 'flagged':
        return 'status-flagged';
      default:
        return '';
    }
  };

  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      setSelectedItems(filteredRows.map((row) => row.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
      setSelectAll(false);
    } else {
      const newSelection = [...selectedItems, id];
      setSelectedItems(newSelection);
      if (newSelection.length === filteredRows.length) {
        setSelectAll(true);
      }
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredRows = tableData
    .filter((row) =>
      row.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === 'date') {
        return sortDirection === 'asc'
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      } else {
        const aValue = a[sortField]?.toLowerCase() || '';
        const bValue = b[sortField]?.toLowerCase() || '';
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
    });

  const renderSortIcon = (field) => (
    <div className="sort-icon">
      <ChevronUp size={14} className={`sort-icon-up ${sortField === field && sortDirection === 'asc' ? 'active' : ''}`} />
      <ChevronDown size={14} className={`sort-icon-down ${sortField === field && sortDirection === 'desc' ? 'active' : ''}`} />
    </div>
  );

  return (
    <div className="admin-main">
      <div className="admin-main__header">
        <h1 className="admin-main__title">Admin Dashboard</h1>
      </div>

      <div className="admin-main__stats">
        <div className="admin-main__stat-card total">
          <p className="admin-main__stat-label">Total Forms</p>
          <div className="admin-main__stat-content">
            <h3 className="admin-main__stat-value">{stats.totalForms}</h3>
            <div className="admin-main__stat-icon total">
              <FileText size={32} />
            </div>
          </div>
        </div>

        <div className="admin-main__stat-card pending">
          <p className="admin-main__stat-label">Pending Approval</p>
          <div className="admin-main__stat-content">
            <h3 className="admin-main__stat-value">{stats.pendingApproval}</h3>
            <div className="admin-main__stat-icon pending">
              <Clock size={32} />
            </div>
          </div>
        </div>

        <div className="admin-main__stat-card approved">
          <p className="admin-main__stat-label">Approved</p>
          <div className="admin-main__stat-content">
            <h3 className="admin-main__stat-value">{stats.approved}</h3>
            <div className="admin-main__stat-icon approved">
              <CheckCircle size={32} />
            </div>
          </div>
        </div>

        <div className="admin-main__stat-card flagged">
          <p className="admin-main__stat-label">Flagged</p>
          <div className="admin-main__stat-content">
            <h3 className="admin-main__stat-value">{stats.flagged}</h3>
            <div className="admin-main__stat-icon flagged">
              <AlertTriangle size={32} />
            </div>
          </div>
        </div>
      </div>

      <div className="admin-main__search-container">
        <div className="admin-main__search-bar">
          <Search size={18} className="admin-main__search-icon" />
          <input
            type="text"
            placeholder="Search forms..."
            className="admin-main__search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-main__table-container">
        <h2 className="admin-main__section-title">Recent Submissions</h2>
        <div className="admin-main__table-wrapper">
          <table className="admin-main__table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="admin-main__select-all"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Actions</th>
                <th
                  className={`sortable ${sortField === 'organization' ? `active-sort sort-${sortDirection}` : ''}`}
                  onClick={() => handleSort('organization')}
                >
                  Organization Name
                  {renderSortIcon('organization')}
                </th>
                <th
                  className={`sortable ${sortField === 'submittedBy' ? `active-sort sort-${sortDirection}` : ''}`}
                  onClick={() => handleSort('submittedBy')}
                >
                  Submitted By
                  {renderSortIcon('submittedBy')}
                </th>
                <th
                  className={`sortable ${sortField === 'date' ? `active-sort sort-${sortDirection}` : ''}`}
                  onClick={() => handleSort('date')}
                >
                  Date Submitted
                  {renderSortIcon('date')}
                </th>
                <th
                  className={`sortable ${sortField === 'status' ? `active-sort sort-${sortDirection}` : ''}`}
                  onClick={() => handleSort('status')}
                >
                  Status
                  {renderSortIcon('status')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td className="admin-main__checkbox-cell">
                      <input
                        type="checkbox"
                        className="admin-main__select-row"
                        checked={selectedItems.includes(row.id)}
                        onChange={() => handleSelectItem(row.id)}
                      />
                    </td>
                    <td className="admin-main__table-actions">
                      <div className="admin-main__action-buttons">
                        <button className="admin-main__action-btn admin-main__edit-btn" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button className="admin-main__action-btn admin-main__delete-btn" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                    <td>{row.organization}</td>
                    <td>{row.submittedBy}</td>
                    <td>{formatDate(row.date)}</td>
                    <td>
                      <span className={`admin-main__status ${getStatusClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="admin-main__no-results">No entries found</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="admin-main__pagination">
            <div className="admin-main__page-info">Page 1 of 10</div>
            <div className="admin-main__page-buttons">
              <button className="admin-main__page-button" disabled>
                Previous
              </button>
              <button className="admin-main__page-button">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardMain;






