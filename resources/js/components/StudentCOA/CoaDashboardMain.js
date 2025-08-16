import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, AlertTriangle, Search, Edit, Trash2, ChevronUp, ChevronDown, LogOut } from 'lucide-react';
import axios from 'axios';

const CoaDashboardMain = ({ onLogout, role = 'coa' }) => {
  // Sample data - would come from API in real application
  const stats = {
    totalReports: 36,
    pendingReview: 8,
    approved: 25,
    flagged: 3
  };

  // Sample table data
  const reportsData = [
    {
      id: 1,
      organization: 'Computer Science Society',
      submittedBy: 'John Doe',
      date: '2023-07-15',
      status: 'Approved'
    },
    {
      id: 2,
      organization: 'Engineering Student Council',
      submittedBy: 'Jane Smith',
      date: '2023-07-14',
      status: 'Pending'
    },
    {
      id: 3,
      organization: 'Business Administration Club',
      submittedBy: 'Robert Johnson',
      date: '2023-07-12',
      status: 'Flagged'
    },
    {
      id: 4,
      organization: 'Nursing Student Association',
      submittedBy: 'Maria Garcia',
      date: '2023-07-10',
      status: 'Approved'
    },
    {
      id: 5,
      organization: 'Psychology Society',
      submittedBy: 'David Wilson',
      date: '2023-07-08',
      status: 'Pending'
    }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }
  }, []);

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to get status class
  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
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

  // Handle select all checkbox
  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      setSelectedItems(filteredReports.map(report => report.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Handle individual checkbox selection
  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
      setSelectAll(false);
    } else {
      setSelectedItems([...selectedItems, id]);
      if (selectedItems.length + 1 === filteredReports.length) {
        setSelectAll(true);
      }
    }
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter reports based on search term
  const filteredReports = reportsData
    .filter(report => 
      report.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      } else {
        const aValue = a[sortField]?.toLowerCase() || '';
        const bValue = b[sortField]?.toLowerCase() || '';
        
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });

  // Render sort icon for column headers
  const renderSortIcon = (field) => {
    return (
      <div className="sort-icon">
        <ChevronUp 
          size={14} 
          className={`sort-icon-up ${sortField === field && sortDirection === 'asc' ? 'active' : ''}`}
        />
        <ChevronDown 
          size={14} 
          className={`sort-icon-down ${sortField === field && sortDirection === 'desc' ? 'active' : ''}`}
        />
      </div>
    );
  };

  // Get dashboard title based on role
  const getDashboardTitle = () => {
    switch(role) {
      case 'coa':
        return 'COA Dashboard';
      case 'auditor':
        return 'Auditor Dashboard';
      default:
        return 'COA Dashboard';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">{getDashboardTitle()}</h1>
      </div>
      
      <div className="dashboard__stats">
        <div className="dashboard__stat-card total">
          <p className="dashboard__stat-label">Total Reports</p>
          <div className="dashboard__stat-content">
            <h3 className="dashboard__stat-value">{stats.totalReports}</h3>
            <div className="dashboard__stat-icon total">
              <FileText size={32} />
            </div>
          </div>
        </div>
        
        <div className="dashboard__stat-card pending">
          <p className="dashboard__stat-label">Pending Review</p>
          <div className="dashboard__stat-content">
            <h3 className="dashboard__stat-value">{stats.pendingReview}</h3>
            <div className="dashboard__stat-icon pending">
              <Clock size={32} />
            </div>
          </div>
        </div>
        
        <div className="dashboard__stat-card approved">
          <p className="dashboard__stat-label">Approved</p>
          <div className="dashboard__stat-content">
            <h3 className="dashboard__stat-value">{stats.approved}</h3>
            <div className="dashboard__stat-icon approved">
              <CheckCircle size={32} />
            </div>
          </div>
        </div>
        
        <div className="dashboard__stat-card flagged">
          <p className="dashboard__stat-label">Flagged</p>
          <div className="dashboard__stat-content">
            <h3 className="dashboard__stat-value">{stats.flagged}</h3>
            <div className="dashboard__stat-icon flagged">
              <AlertTriangle size={32} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="dashboard__search-container">
        <div className="dashboard__search-bar">
          <Search size={18} className="dashboard__search-icon" />
          <input 
            type="text" 
            placeholder="Search reports..." 
            className="dashboard__search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="dashboard__table-container">
        <h2 className="dashboard__section-title">Liquidation Reports</h2>
        <div className="dashboard__table-wrapper">
          <table className="dashboard__table">
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    className="dashboard__select-all" 
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
              {filteredReports.length > 0 ? (
                filteredReports.map(report => (
                  <tr key={report.id}>
                    <td className="dashboard__checkbox-cell">
                      <input 
                        type="checkbox" 
                        className="dashboard__select-row" 
                        checked={selectedItems.includes(report.id)}
                        onChange={() => handleSelectItem(report.id)}
                      />
                    </td>
                    <td className="dashboard__table-actions">
                      <div className="dashboard__action-buttons">
                        <button className="dashboard__action-btn dashboard__edit-btn" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button className="dashboard__action-btn dashboard__delete-btn" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                    <td>{report.organization}</td>
                    <td>{report.submittedBy}</td>
                    <td>{formatDate(report.date)}</td>
                    <td>
                      <span className={`dashboard__status ${getStatusClass(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="dashboard__no-results">No reports found</td>
                </tr>
              )}
            </tbody>
          </table>
          
          <div className="dashboard__pagination">
            <div className="dashboard__page-info">
              Page 1 of 100
            </div>
            <div className="dashboard__page-buttons">
              <button className="dashboard__page-button" disabled>Previous</button>
              <button className="dashboard__page-button">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoaDashboardMain;









