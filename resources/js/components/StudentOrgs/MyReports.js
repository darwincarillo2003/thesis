import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown, Eye, Download } from 'lucide-react';

const MyReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Static data for liquidation reports
  const [reports] = useState([
    {
      id: 1,
      organizationName: 'Student Council',
      submittedBy: 'Maria Santos',
      date: '2024-01-15',
      status: 'Approved',
      formType: 'Monthly Liquidation'
    },
    {
      id: 2,
      organizationName: 'Computer Science Society',
      submittedBy: 'John Dela Cruz',
      date: '2024-01-12',
      status: 'Pending',
      formType: 'Event Liquidation'
    },
    {
      id: 3,
      organizationName: 'Engineering Club',
      submittedBy: 'Anna Rodriguez',
      date: '2024-01-10',
      status: 'Under Review',
      formType: 'Project Liquidation'
    },
    {
      id: 4,
      organizationName: 'Business Society',
      submittedBy: 'Mark Johnson',
      date: '2024-01-08',
      status: 'Approved',
      formType: 'Quarterly Liquidation'
    },
    {
      id: 5,
      organizationName: 'Arts and Culture Club',
      submittedBy: 'Sarah Lee',
      date: '2024-01-05',
      status: 'Rejected',
      formType: 'Event Liquidation'
    },
    {
      id: 6,
      organizationName: 'Sports Committee',
      submittedBy: 'David Kim',
      date: '2024-01-03',
      status: 'Approved',
      formType: 'Monthly Liquidation'
    }
  ]);

  // Filter reports based on search term
  const filteredReports = reports.filter(report =>
    report.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort reports
  const sortedReports = [...filteredReports].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'organization':
        aValue = a.organizationName.toLowerCase();
        bValue = b.organizationName.toLowerCase();
        break;
      case 'submittedBy':
        aValue = a.submittedBy.toLowerCase();
        bValue = b.submittedBy.toLowerCase();
        break;
      case 'date':
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case 'status':
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
        break;
      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'my-reports__status-badge--approved';
      case 'pending':
        return 'my-reports__status-badge--pending';
      case 'under review':
        return 'my-reports__status-badge--review';
      case 'rejected':
        return 'my-reports__status-badge--rejected';
      default:
        return 'my-reports__status-badge--default';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  return (
    <div className="my-reports">
      <div className="my-reports__header">
        <h2 className="my-reports__title">My Liquidation Reports</h2>
      </div>

      <div className="my-reports__section-title">Reports</div>
      
      <div className="my-reports__table-container">
        <div className="my-reports__controls">
          <div className="my-reports__left-controls">
            <div className="my-reports__search-bar">
              <Search className="my-reports__search-icon" size={16} />
              <input
                type="text"
                className="my-reports__search-input"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="my-reports__right-controls">
            <div className="my-reports__sort-controls">
              <label htmlFor="sortBy">Sort By:</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="my-reports__sort-select"
              >
                <option value="date">Date</option>
                <option value="organization">Organization</option>
                <option value="submittedBy">Submitted By</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        <div className="my-reports__table-wrapper">
          <table className="my-reports__table">
            <thead>
              <tr>
                <th>Actions</th>
                <th 
                  className="my-reports__sortable" 
                  onClick={() => handleSort('organization')}
                >
                  Organization Name
                  <div className="my-reports__sort-icon">
                    <ChevronUp size={12} className={`my-reports__sort-icon-up ${sortBy === 'organization' && sortDirection === 'asc' ? 'active' : ''}`} />
                    <ChevronDown size={12} className={`my-reports__sort-icon-down ${sortBy === 'organization' && sortDirection === 'desc' ? 'active' : ''}`} />
                  </div>
                </th>
                <th 
                  className="my-reports__sortable" 
                  onClick={() => handleSort('submittedBy')}
                >
                  Submitted By
                  <div className="my-reports__sort-icon">
                    <ChevronUp size={12} className={`my-reports__sort-icon-up ${sortBy === 'submittedBy' && sortDirection === 'asc' ? 'active' : ''}`} />
                    <ChevronDown size={12} className={`my-reports__sort-icon-down ${sortBy === 'submittedBy' && sortDirection === 'desc' ? 'active' : ''}`} />
                  </div>
                </th>
                <th 
                  className="my-reports__sortable" 
                  onClick={() => handleSort('date')}
                >
                  Date
                  <div className="my-reports__sort-icon">
                    <ChevronUp size={12} className={`my-reports__sort-icon-up ${sortBy === 'date' && sortDirection === 'asc' ? 'active' : ''}`} />
                    <ChevronDown size={12} className={`my-reports__sort-icon-down ${sortBy === 'date' && sortDirection === 'desc' ? 'active' : ''}`} />
                  </div>
                </th>
                <th 
                  className="my-reports__sortable" 
                  onClick={() => handleSort('status')}
                >
                  Status
                  <div className="my-reports__sort-icon">
                    <ChevronUp size={12} className={`my-reports__sort-icon-up ${sortBy === 'status' && sortDirection === 'asc' ? 'active' : ''}`} />
                    <ChevronDown size={12} className={`my-reports__sort-icon-down ${sortBy === 'status' && sortDirection === 'desc' ? 'active' : ''}`} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedReports.length > 0 ? (
                sortedReports.map((report) => (
                  <tr key={report.id}>
                    <td className="my-reports__actions">
                      <div className="my-reports__action-buttons">
                        <button 
                          className="my-reports__action-btn my-reports__view-btn"
                          title="View Report"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="my-reports__action-btn my-reports__download-btn"
                          title="Download Report"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="my-reports__organization-name">
                      <div className="my-reports__org-info">
                        <div>
                          <div className="my-reports__org-name">{report.organizationName}</div>
                          <div className="my-reports__form-type">{report.formType}</div>
                        </div>
                      </div>
                    </td>
                    <td>{report.submittedBy}</td>
                    <td>{formatDate(report.date)}</td>
                    <td>
                      <span className={`my-reports__status-badge ${getStatusBadgeClass(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="my-reports__no-results">
                    No reports found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyReports;
