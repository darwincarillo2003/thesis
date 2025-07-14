import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';

const OrgHeader = ({ toggleSidebar, onLogout }) => {
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
    // Call the onLogout function passed from parent
    if (typeof onLogout === 'function') {
      onLogout();
    }
  };

  return (
    <header className="org-header">
      <div className="org-header__hamburger" onClick={toggleSidebar}>
        <Menu size={24} />
      </div>

      <div className="org-header__actions">
        <div className="org-header__notification">
          <Bell size={20} />
        </div>

        <div className="org-header__profile" onClick={toggleDropdown} ref={dropdownRef}>
          <img
            src="/images/csp.png"
            alt="CSP Treasurer"
            className="org-header__profile-picture"
          />
          <span className="org-header__user-name">CSP Treasurer</span>
          <ChevronDown
            className={`org-header__dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
            size={16}
          />
          {isDropdownOpen && (
            <div className="org-header__dropdown-menu">
              <div className="org-header__dropdown-item">
                <User size={16} /> Profile
              </div>
              <div className="org-header__dropdown-item">
                <Settings size={16} /> Settings
              </div>
              <div className="org-header__dropdown-separator"></div>
              <button className="org-header__dropdown-item" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default OrgHeader;
