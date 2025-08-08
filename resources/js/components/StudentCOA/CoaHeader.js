import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';

const CoaHeader = ({ toggleSidebar, onLogout, userData }) => {
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
    <header className="coa-header">
      <div className="coa-header__hamburger" onClick={toggleSidebar}>
        <Menu size={24} color="#b12224" strokeWidth={2} />
      </div>

      <div className="coa-header__actions">
        <div className="coa-header__notification">
          <Bell size={20} />
        </div>

        <div className="coa-header__profile" onClick={toggleDropdown} ref={dropdownRef}>
          <img
            src="/images/csp.png"
            alt={userData?.profile?.first_name || "User"}
            className="coa-header__profile-picture"
          />
          <span className="coa-header__user-name">
            {userData ? `${userData.profile?.first_name || ''} ${userData.profile?.last_name || ''}` : 'Loading...'}
          </span>
          <ChevronDown
            className={`coa-header__dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
            size={16}
          />
          {isDropdownOpen && (
            <div className="coa-header__dropdown-menu">
              <div className="coa-header__dropdown-item">
                <User size={16} /> Profile
              </div>
              <div className="coa-header__dropdown-item">
                <Settings size={16} /> Settings
              </div>
              <div className="coa-header__dropdown-separator"></div>
              <button className="coa-header__dropdown-item" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default CoaHeader;

