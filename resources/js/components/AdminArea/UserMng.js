import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Edit, Trash2, Search, Plus, Archive, Printer, ChevronUp, ChevronDown, Camera, X } from 'lucide-react';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import SuccessNotif from '../SuccessPops/SuccessNotif';
import '../../../sass/AdminAreas/UserMng.scss';

const placeholderImage = '/images/csp.png';

const UserMng = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState('first_name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isSearching, setIsSearching] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showSuccessNotif, setShowSuccessNotif] = useState(false);
  const [uploadingProfileId, setUploadingProfileId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('token_type');
    if (token && tokenType) {
      axios.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;
    }
  }, []);

  // Debounce search term
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    }
    
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          per_page: '10',
          page: currentPage.toString(),
        });
        if (debouncedSearchTerm.trim()) {
          params.append('search', debouncedSearchTerm.trim());
        }

        const response = await axios.get(`/api/profiles?${params}`);
        const profilesData = response?.data?.data?.profiles;
        const rows = profilesData?.data || [];

        setProfiles(rows);
        setTotalPages(profilesData?.last_page || 1);
      } catch (err) {
        console.error('Fetch profiles error', err);
        setError('Failed to load profiles');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => {
    if (!selectAll) return;
    setSelectedIds(profiles.map((p) => p.profile_id));
  }, [selectAll, profiles]);

  const allSelected = useMemo(() => {
    if (!profiles.length) return false;
    return selectedIds.length === profiles.length;
  }, [profiles.length, selectedIds.length]);

  const handleToggleSelectAll = () => {
    const next = !(selectAll || allSelected);
    setSelectAll(next);
    setSelectedIds(next ? profiles.map((p) => p.profile_id) : []);
  };

  const handleToggleRow = (id) => {
    setSelectAll(false);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleProfilePictureUpload = async (profileId, file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setUploadingProfileId(profileId);
    
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);

      const response = await axios.post(`/api/profiles/${profileId}/upload-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Refresh the profiles list to show the new picture
        fetchProfiles();
        setShowSuccessNotif(true);
      } else {
        setError('Failed to upload profile picture');
      }
    } catch (err) {
      console.error('Profile picture upload error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError('Upload failed: ' + err.response.data.message);
      } else {
        setError('Failed to upload profile picture');
      }
    } finally {
      setUploadingProfileId(null);
    }
  };

  const handleProfilePictureDelete = async (profileId) => {
    if (!window.confirm('Are you sure you want to delete this profile picture?')) {
      return;
    }

    setUploadingProfileId(profileId);
    
    try {
      const response = await axios.delete(`/api/profiles/${profileId}/delete-picture`);

      if (response.data.success) {
        // Refresh the profiles list to show the default picture
        fetchProfiles();
        setShowSuccessNotif(true);
      } else {
        setError('Failed to delete profile picture');
      }
    } catch (err) {
      console.error('Profile picture delete error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError('Delete failed: ' + err.response.data.message);
      } else {
        setError('Failed to delete profile picture');
      }
    } finally {
      setUploadingProfileId(null);
    }
  };

  const renderImage = (profile) => {
    // Build profile picture URL
    let src = placeholderImage; // Default fallback
    
    if (profile.profile_pic) {
      // If profile has a custom profile picture
      src = `/storage/${profile.profile_pic}`;
    } else if (profile.image_url || profile.photo || profile.avatar) {
      // Fallback to other image fields if they exist
      src = profile.image_url || profile.photo || profile.avatar;
    }
    
    const alt = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User';
    
    return (
      <img 
        src={src} 
        alt={alt} 
        className="user-mng__avatar"
        onError={(e) => {
          // If the image fails to load, use the placeholder
          e.target.src = placeholderImage;
        }}
      />
    );
  };

  const renderRoleBadge = (profile) => {
    const roleName = profile.user?.role?.role_name || 'No Role';
    const roleClass = getRoleClass(roleName);
    return (
      <span className={`user-mng__role-badge ${roleClass}`}>
        {roleName}
      </span>
    );
  };

  const getRoleClass = (roleName) => {
    if (!roleName || roleName === 'No Role') return 'user-mng__role-badge--default';

    const role = roleName.toLowerCase();
    if (role.includes('admin')) return 'user-mng__role-badge--admin';
    if (role.includes('student')) return 'user-mng__role-badge--student';
    if (role.includes('coa')) return 'user-mng__role-badge--coa';
    if (role.includes('faculty')) return 'user-mng__role-badge--faculty';

    return 'user-mng__role-badge--default';
  };

  const renderOrganizationBadge = (profile) => {
    // Try different possible paths for organization data
    let organizationName = '';

    // Check if organization data is available through user relationships
    if (profile.user?.organizations && profile.user.organizations.length > 0) {
      organizationName = profile.user.organizations[0].organization_name || '';
    } else if (profile.organization?.organization_name) {
      organizationName = profile.organization.organization_name;
    } else if (profile.user?.organization?.organization_name) {
      organizationName = profile.user.organization.organization_name;
    }

    if (!organizationName) {
      return <span className="user-mng__organization-badge user-mng__organization-badge--none">No Organization</span>;
    }

    return <span className="user-mng__organization-badge">{organizationName}</span>;
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Reset to first page when debounced search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const renderSortIcon = (field) => (
    <div className="user-mng__sort-icon">
      <ChevronUp size={14} className={`user-mng__sort-icon-up ${sortField === field && sortDirection === 'asc' ? 'active' : ''}`} />
      <ChevronDown size={14} className={`user-mng__sort-icon-down ${sortField === field && sortDirection === 'desc' ? 'active' : ''}`} />
    </div>
  );

  const selectedCount = selectedIds.length;

  const handleAddUser = () => {
    setIsAddUserModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddUserModalOpen(false);
  };

  const handleEditUser = (profile) => {
    setEditingUser(profile);
    setIsEditUserModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditUserModalOpen(false);
    setEditingUser(null);
  };

  const handleShowSuccess = () => {
    setShowSuccessNotif(true);
  };

  const handleCloseSuccessNotif = () => {
    setShowSuccessNotif(false);
  };

  const handlePrint = () => {
    // Create a printable version of the user table
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString();
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>User Management Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #0036AF;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #0036AF;
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .stats {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 5px;
          }
          .stats div {
            text-align: center;
          }
          .stats .label {
            font-weight: bold;
            color: #0036AF;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #0036AF;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f2f2f2;
          }
          .role-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            text-align: center;
          }
          .role-admin { background-color: #dc3545; color: white; }
          .role-student { background-color: #28a745; color: white; }
          .role-coa { background-color: #ffc107; color: #333; }
          .role-faculty { background-color: #6f42c1; color: white; }
          .role-default { background-color: #6c757d; color: white; }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
          @media print {
            body { margin: 0; }
            .header { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>User Management Report</h1>
          <p>Father Saturnino Urios University</p>
          <p>Student Organization Liquidation System</p>
          <p>Generated on: ${currentDate}</p>
        </div>
        
        <div class="stats">
          <div>
            <div class="label">Total Users</div>
            <div>${profiles.length}</div>
          </div>
          <div>
            <div class="label">Search Term</div>
            <div>${searchTerm || 'All Users'}</div>
          </div>
          <div>
            <div class="label">Sort By</div>
            <div>${sortField} (${sortDirection})</div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            ${profiles.map(profile => {
              const fullName = `${profile.first_name || ''} ${profile.middle_name || ''} ${profile.last_name || ''} ${profile.suffix || ''}`.replace(/\s+/g, ' ').trim();
              const email = profile.user?.email || 'N/A';
              const roleName = profile.user?.role?.role_name || 'No Role';
              const roleClass = getRoleClass(roleName);
              
              return `
                <tr>
                  <td>${fullName}</td>
                  <td>${email}</td>
                  <td><span class="role-badge ${roleClass}">${roleName}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>This report contains ${profiles.length} user record(s)</p>
          <p>Generated by User Management System - FSUU</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const handleUserAdded = () => {
    // Refresh the profiles list after a user is added
    const fetchProfiles = async () => {
      setIsLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          per_page: '10',
          page: currentPage.toString(),
        });
        if (debouncedSearchTerm.trim()) {
          params.append('search', debouncedSearchTerm.trim());
        }
        
        const response = await axios.get(`/api/profiles?${params}`);
        const profilesData = response?.data?.data?.profiles;
        const rows = profilesData?.data || [];
        setProfiles(rows);
        setTotalPages(profilesData?.last_page || 1);
      } catch (err) {
        console.error('Fetch profiles error', err);
        setError('Failed to load profiles');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfiles();
  };

  return (
    <div className="user-mng">
      <div className="user-mng__header">
        <h1 className="user-mng__title">User Management</h1>
      </div>

      {isLoading && (
        <div className="user-mng__state">Loading profiles...</div>
      )}
      {error && !isLoading && (
        <div className="user-mng__state user-mng__state--error">{error}</div>
      )}

      {!isLoading && !error && (
        <>
          <div className="user-mng__tab-wrapper">
            <h2 className="user-mng__section-title">User Profiles</h2>
          </div>
          <div className="user-mng__table-container">
          
          {/* Control Bar inside container */}
          <div className="user-mng__controls">
            <div className="user-mng__left-controls">
              <div className="user-mng__search-bar">
                <Search size={18} className="user-mng__search-icon" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className={`user-mng__search-input ${isSearching ? 'searching' : ''}`}
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {isSearching && (
                  <div className="user-mng__search-spinner">
                    <div className="spinner"></div>
                  </div>
                )}
              </div>
              <button className="user-mng__action-button user-mng__action-button--secondary">
                <Archive size={16} />
                Archives
              </button>
            </div>
            
            <div className="user-mng__right-controls">
              <button 
                className="user-mng__action-button user-mng__action-button--secondary"
                onClick={handlePrint}
                title="Print User Report"
              >
                <Printer size={16} />
                Print
              </button>
              <button 
                className="user-mng__action-button user-mng__action-button--primary"
                onClick={handleAddUser}
              >
                <Plus size={16} />
                Add User
              </button>
              {selectedCount > 0 && (
                <button className="user-mng__action-button user-mng__action-button--danger">
                  Remove
                </button>
              )}
            </div>
          </div>

          {selectedCount > 0 && (
            <div className="user-mng__selection-info">
              {selectedCount} Item{selectedCount > 1 ? 's' : ''} Selected
            </div>
          )}

          <div className="user-mng__table-wrapper">
            <table className="user-mng__table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      className="user-mng__select-all"
                      checked={allSelected}
                      onChange={handleToggleSelectAll}
                      aria-label="Select all"
                    />
                  </th>
                  <th>Actions</th>
                  <th>Image</th>
                  <th 
                    className={`user-mng__sortable ${sortField === 'first_name' ? `user-mng__active-sort user-mng__sort-${sortDirection}` : ''}`}
                    onClick={() => handleSort('first_name')}
                  >
                    First Name
                    {renderSortIcon('first_name')}
                  </th>
                  <th 
                    className={`user-mng__sortable ${sortField === 'middle_name' ? `user-mng__active-sort user-mng__sort-${sortDirection}` : ''}`}
                    onClick={() => handleSort('middle_name')}
                  >
                    Middle Name
                    {renderSortIcon('middle_name')}
                  </th>
                  <th 
                    className={`user-mng__sortable ${sortField === 'last_name' ? `user-mng__active-sort user-mng__sort-${sortDirection}` : ''}`}
                    onClick={() => handleSort('last_name')}
                  >
                    Last Name
                    {renderSortIcon('last_name')}
                  </th>
                  <th 
                    className={`user-mng__sortable ${sortField === 'suffix' ? `user-mng__active-sort user-mng__sort-${sortDirection}` : ''}`}
                    onClick={() => handleSort('suffix')}
                  >
                    Suffix
                    {renderSortIcon('suffix')}
                  </th>
                  <th>Role</th>
                  <th>Organization</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.profile_id}>
                    <td className="user-mng__checkbox-cell">
                      <input
                        type="checkbox"
                        className="user-mng__select-row"
                        checked={selectedIds.includes(p.profile_id)}
                        onChange={() => handleToggleRow(p.profile_id)}
                        aria-label={`Select ${p.first_name || ''} ${p.last_name || ''}`}
                      />
                    </td>
                    <td className="user-mng__table-actions">
                      <div className="user-mng__action-buttons">
                        <button 
                          className="user-mng__action-btn user-mng__edit-btn" 
                          onClick={() => handleEditUser(p)}
                          title="Edit Profile"
                        >
                          <Edit size={16} />
                        </button>
                        <button className="user-mng__action-btn user-mng__delete-btn" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                    <td>{renderImage(p)}</td>
                    <td>{p.first_name || ''}</td>
                    <td>{p.middle_name || ''}</td>
                    <td>{p.last_name || ''}</td>
                    <td>{p.suffix || ''}</td>
                    <td>{renderRoleBadge(p)}</td>
                    <td>{renderOrganizationBadge(p)}</td>
                  </tr>
                ))}
                {!profiles.length && (
                  <tr>
                    <td colSpan={9} className="user-mng__no-results">No entries found</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="user-mng__pagination">
              <div className="user-mng__page-info">Page {currentPage} of {totalPages}</div>
              <div className="user-mng__page-buttons">
                <button
                  className="user-mng__page-button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Previous
                </button>
                <button
                  className="user-mng__page-button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          </div>
        </>
      )}
      
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={handleCloseModal}
        onUserAdded={handleUserAdded}
        onShowSuccess={handleShowSuccess}
      />

      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={handleCloseEditModal}
        user={editingUser}
        onUserUpdated={handleUserAdded}
        onShowSuccess={handleShowSuccess}
      />
      
      <SuccessNotif
        isVisible={showSuccessNotif}
        message="Profile updated successfully!"
        onClose={handleCloseSuccessNotif}
      />
    </div>
  );
};

export default UserMng;

