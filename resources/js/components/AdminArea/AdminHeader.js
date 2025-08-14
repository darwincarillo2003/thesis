import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';

const AdminHeader = ({ toggleSidebar, onLogout, userData }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout();
    }
  };

  return (
    <header className="admin-header">
      <div className="admin-header__hamburger" onClick={toggleSidebar}>
        <Menu size={24} color="#0036AF" strokeWidth={2} />
      </div>

      <div className="admin-header__actions">
        <div className="admin-header__notification" title="Notifications">
          <Bell size={20} />
        </div>

        <div className="admin-header__profile" onClick={toggleDropdown} ref={dropdownRef}>
          <img
            src="/images/csp.png"
            alt={userData?.profile?.first_name || 'Admin'}
            className="admin-header__profile-picture"
          />
          <span className="admin-header__user-name">
            {userData ? `${userData.profile?.first_name || ''} ${userData.profile?.last_name || ''}` : 'Loading...'}
          </span>
          <ChevronDown
            className={`admin-header__dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
            size={16}
          />
          {isDropdownOpen && (
            <div className="admin-header__dropdown-menu">
              <div className="admin-header__dropdown-item">
                <User size={16} /> Profile
              </div>
              <div className="admin-header__dropdown-item">
                <Settings size={16} /> Settings
              </div>
              <div className="admin-header__dropdown-separator"></div>
              <button className="admin-header__dropdown-item" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;






