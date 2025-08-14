import React, { useState, useEffect } from 'react';
import {
  Home,
  Users,
  FileText,
  LogOut
} from 'lucide-react';

const AdminSidebar = ({ isOpen, toggleSidebar, onNavigate, onLogout }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeItem, setActiveItem] = useState('dashboard');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleItemClick = (section) => {
    setActiveItem(section);
    if (typeof onNavigate === 'function') {
      onNavigate(section);
    }
    if (isMobile) {
      toggleSidebar();
    }
  };

  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout();
    }
  };

  return (
    <div className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="admin-sidebar__nav">
        <div className="admin-sidebar__logo">
          <img src="/images/urioslogo.svg" alt="FSUU" className="admin-sidebar__logo-image" />
        </div>
        <ul className="admin-sidebar__list">
          <li className="admin-sidebar__item">
            <div
              className={`admin-sidebar__link ${activeItem === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleItemClick('dashboard')}
            >
              <Home size={20} className="admin-sidebar__icon" />
              <span className="admin-sidebar__label">Dashboard</span>
            </div>
          </li>
          <li className="admin-sidebar__item">
            <div
              className={`admin-sidebar__link ${activeItem === 'user-management' ? 'active' : ''}`}
              onClick={() => handleItemClick('user-management')}
            >
              <Users size={20} className="admin-sidebar__icon" />
              <span className="admin-sidebar__label">User Management</span>
            </div>
          </li>
          <li className="admin-sidebar__item">
            <div
              className={`admin-sidebar__link ${activeItem === 'form-management' ? 'active' : ''}`}
              onClick={() => handleItemClick('form-management')}
            >
              <FileText size={20} className="admin-sidebar__icon" />
              <span className="admin-sidebar__label">Form Management</span>
            </div>
          </li>
        </ul>
      </nav>
      <div className="admin-sidebar__footer">
        <button className="admin-sidebar__logout-btn" onClick={handleLogout}>
          <LogOut size={18} className="admin-sidebar__icon" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;






