import React, { useState } from 'react';
import { FileText, Clock, CheckCircle, AlertTriangle, Eye, Search } from 'lucide-react';

const Dashboard = () => {
  // Sample data - would come from API in real application
  const stats = {
    totalReports: 24,
    pendingReview: 5,
    approved: 18,
    flagged: 1
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

  // Filter reports based on search term
  const filteredReports = reportsData.filter(report => 
    report.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Dashboard</h1>
      
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
        <h2 className="dashboard__section-title">Reports</h2>
        <div className="dashboard__table-wrapper">
          <table className="dashboard__table">
            <thead>
              <tr>
                <th>Actions</th>
                <th>Organization Name</th>
                <th>Submitted By</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map(report => (
                  <tr key={report.id}>
                    <td className="dashboard__table-actions">
                      <button className="dashboard__view-btn">
                        <Eye size={16} /> View
                      </button>
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
                  <td colSpan="5" className="dashboard__no-results">No reports found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 