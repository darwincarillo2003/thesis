import React, { useState, useEffect } from 'react';
import {
  Home,
  ClipboardCheck,
  CheckSquare,
  LogOut
} from 'lucide-react';

const CoaSidebar = ({ isOpen, toggleSidebar, onNavigate, onLogout }) => {
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
    <div className={`coa-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="coa-sidebar__nav">
        <div className="coa-sidebar__logo">
          <img src="/images/coa.svg" alt="Commission on Audit" className="coa-sidebar__logo-image" />
        </div>
        <ul className="coa-sidebar__list">
          <li className="coa-sidebar__item">
            <div 
              className={`coa-sidebar__link ${activeItem === 'dashboard' ? 'active' : ''}`} 
              onClick={() => handleItemClick('dashboard')}
            >
              <Home size={20} className="coa-sidebar__icon" />
              <span className="coa-sidebar__label">Dashboard</span>
            </div>
          </li>
          <li className="coa-sidebar__item">
            <div 
              className={`coa-sidebar__link ${activeItem === 'review-reports' ? 'active' : ''}`} 
              onClick={() => handleItemClick('review-reports')}
            >
              <ClipboardCheck size={20} className="coa-sidebar__icon" />
              <span className="coa-sidebar__label">Review Reports</span>
            </div>
          </li>
          <li className="coa-sidebar__item">
            <div 
              className={`coa-sidebar__link ${activeItem === 'approved-reports' ? 'active' : ''}`} 
              onClick={() => handleItemClick('approved-reports')}
            >
              <CheckSquare size={20} className="coa-sidebar__icon" />
              <span className="coa-sidebar__label">Approved Reports</span>
            </div>
          </li>
        </ul>
      </nav>
      <div className="coa-sidebar__footer">
        <button className="coa-sidebar__logout-btn" onClick={handleLogout}>
          <LogOut size={18} className="coa-sidebar__icon" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default CoaSidebar;



