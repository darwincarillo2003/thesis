import React, { useState, useEffect } from 'react';
import OrgSidebar from './OrgSidebar';
import OrgHeader from './OrgHeader';
import Dashboard from './Dashboard';
import SubmitForm from './SubmitForm';
import '../../../sass/StudentOrgDashboard/OrgDashboard.scss';
import '../../../sass/StudentOrgDashboard/OrgSidebar.scss';
import '../../../sass/StudentOrgDashboard/OrgHeader.scss';
import '../../../sass/StudentOrgDashboard/Dashboard.scss';
import '../../../sass/StudentOrgDashboard/SubmitForm.scss';

const OrgDashboard = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigation = (section) => {
    setActiveSection(section);
  };

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile && isSidebarOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [isSidebarOpen]);

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'submit-report':
        return <SubmitForm />;
      case 'my-reports':
        return <div>My Reports Page (Coming Soon)</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="org-dashboard">
      <OrgSidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        onNavigate={handleNavigation}
        onLogout={onLogout}
      />
      <div className={`org-dashboard__wrapper ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <OrgHeader 
          toggleSidebar={toggleSidebar} 
          isOpen={isSidebarOpen} 
          onLogout={onLogout}
        />
        <main className="org-dashboard__content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default OrgDashboard;
