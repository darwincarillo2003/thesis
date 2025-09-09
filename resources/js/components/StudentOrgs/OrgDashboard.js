import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OrgSidebar from './OrgSidebar';
import OrgHeader from './OrgHeader';
import Dashboard from './Dashboard';
import SubmitForm from './SubmitForm';
import MyReports from './MyReports';
import Calendar from './Calendar';
import Settings from './Settings';
import '../../../sass/StudentOrgDashboard/OrgDashboard.scss';
import '../../../sass/StudentOrgDashboard/OrgSidebar.scss';
import '../../../sass/StudentOrgDashboard/OrgHeader.scss';
import '../../../sass/StudentOrgDashboard/Dashboard.scss';
import '../../../sass/StudentOrgDashboard/SubmitForm.scss';
import '../../../sass/StudentOrgDashboard/MyReports.scss';
import '../../../sass/StudentOrgDashboard/Calendar.scss';
import '../../../sass/StudentOrgDashboard/Settings.scss';

const OrgDashboard = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Get read notifications from localStorage
  const getReadNotifications = () => {
    try {
      const readNotifications = localStorage.getItem('readNotifications');
      return readNotifications ? JSON.parse(readNotifications) : [];
    } catch (error) {
      console.error('Error reading notifications from localStorage:', error);
      return [];
    }
  };

  // Save read notification to localStorage
  const saveReadNotification = (notificationId) => {
    try {
      const readNotifications = getReadNotifications();
      if (!readNotifications.includes(notificationId)) {
        readNotifications.push(notificationId);
        
        // Keep only the last 100 read notifications to prevent localStorage bloat
        if (readNotifications.length > 100) {
          readNotifications.splice(0, readNotifications.length - 100);
        }
        
        localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
      }
    } catch (error) {
      console.error('Error saving notification to localStorage:', error);
    }
  };

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found for notifications');
        return;
      }

      console.log('🔔 Fetching notifications from API...');
      // Add cache-busting timestamp to prevent browser caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/events?upcoming=1&days=365&_t=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      const result = await response.json();
      console.log('📥 API Response:', result);

      if (result.success && result.data.events) {
        console.log(`✅ Found ${result.data.events.length} events for notifications`);
        
        // Get read notifications from localStorage
        const readNotificationIds = getReadNotifications();

        // Generate notifications from events, preserving read status from localStorage
        const eventNotifications = result.data.events.slice(0, 10).map(event => {
          return {
            id: event.id,
            type: 'event_created',
            title: event.title,
            message: `Scheduled for ${event.date}${event.time ? ' at ' + event.time : ''}`,
            targetOrganizations: event.target_organizations,
            timestamp: event.created_at,
            read: readNotificationIds.includes(event.id),
            relatedEventId: event.id,
            creator: {
              name: event.creator?.name || 'COA',
              profilePic: event.creator?.profile_pic || null,
              role: event.creator?.role || 'COA'
            },
            eventDetails: {
              date: event.date,
              time: event.time,
              location: event.location,
              priority: event.priority
            }
          };
        });

        // Sort notifications by date (latest first)
        const sortedNotifications = eventNotifications.sort((a, b) => {
          const dateA = new Date(a.eventDetails.date);
          const dateB = new Date(b.eventDetails.date);
          return dateB - dateA; // Latest first
        });

        console.log('🔔 Generated notifications (sorted):', sortedNotifications);
        setNotifications(sortedNotifications);

        // Update unread count
        const unreadCount = sortedNotifications.filter(notification => !notification.read).length;
        console.log(`🔢 Unread count: ${unreadCount}`);
        setUnreadNotificationsCount(unreadCount);
      } else {
        console.log('❌ No events found or API error:', result);
        setNotifications([]);
        setUnreadNotificationsCount(0);
      }
    } catch (error) {
      console.error('❌ OrgDashboard: Error fetching notifications:', error);
    }
  };

  // Split the useEffects to optimize rendering
  // First useEffect for immediate UI display from localStorage
  useEffect(() => {
    // Get user data from localStorage for immediate display
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const tokenType = localStorage.getItem('token_type');
    
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
      // Set loading to false immediately if we have cached data
      setIsLoading(false);
    }

    // Set up axios authorization header
    if (token && tokenType) {
      axios.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;
    }
  }, []);
  
  // Second useEffect for API data fetch - runs only once on component mount
  useEffect(() => {
    // Fetch fresh user data from the API
    const fetchUserData = async () => {
      try {
        // Only show loading if we don't already have user data from localStorage
        if (!userData) {
          setIsLoading(true);
        }
        
        const response = await axios.get('/api/user');
        
        if (response.data.success) {
          setUserData(response.data.data.user);
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
        } else {
          setError('Failed to fetch user data');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        // Only show error if we don't have cached data
        if (!userData) {
          setError('Error fetching user data. Please try logging in again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);
  
  // Third useEffect for mobile sidebar handling
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile && isSidebarOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }, [isSidebarOpen]);

  // Fourth useEffect for notifications - fetch immediately and poll
  useEffect(() => {
    // Fetch notifications immediately
    fetchNotifications();

    // Set up polling for notifications every 5 seconds for faster updates
    const notificationInterval = setInterval(() => {
      console.log('🔄 Polling for notification updates...');
      fetchNotifications();
    }, 5000);

    return () => clearInterval(notificationInterval);
  }, []); // Remove notifications dependency to prevent unnecessary re-fetching

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigation = (section) => {
    setActiveSection(section);
  };

  // Handle notifications updates from Calendar component (for events data)
  const handleNotificationsUpdate = (eventsData) => {
    // This is now handled by fetchNotifications, so we don't need to process it here
    // Just refresh notifications to ensure sync
    fetchNotifications();
  };

  // Handle marking notifications as read
  const handleMarkNotificationAsRead = (notificationId) => {
    // Save to localStorage for persistence
    saveReadNotification(notificationId);
    
    // Update local state
    setNotifications(prev =>
      prev.map(notification => {
        if (notification.id === notificationId) {
          return { ...notification, read: true };
        }
        return notification;
      })
    );
    setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
  };
  
  // Handle logout with API call
  const handleLogout = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      const tokenType = localStorage.getItem('token_type');
      
      if (token && tokenType) {
        // Set authorization header
        axios.defaults.headers.common['Authorization'] = `${tokenType} ${token}`;
        
        // Call logout API
        await axios.post('/api/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage and call onLogout regardless of API success/failure
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('userRole');
      
      if (typeof onLogout === 'function') {
        onLogout();
      }
    }
  };

  // Dashboard content
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onLogout={onLogout} role="treasurer" />;
      case 'submit-report':
        return <SubmitForm userData={userData} />;
      case 'my-reports':
        return <MyReports />;
      case 'calendar':
        return <Calendar onNotificationsUpdate={handleNotificationsUpdate} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onLogout={onLogout} role="treasurer" />;
    }
  };

  // Only show full-screen loading if we have no cached data
  if (isLoading && !userData) {
    return (
      <div className="loader-container">
        <div className="spinner-loader"></div>
        <p className="loading-text">Loading your dashboard...</p>
      </div>
    );
  }

  // Show error state
  if (error && !userData) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Retry
        </button>
        <button className="logout-button" onClick={onLogout}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="org-dashboard">
      <OrgSidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        activeSection={activeSection}
      />
      <div className={`org-dashboard__wrapper ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <OrgHeader
          toggleSidebar={toggleSidebar}
          isOpen={isSidebarOpen}
          onLogout={handleLogout}
          userData={userData}
          onNavigate={handleNavigation}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          unreadNotificationsCount={unreadNotificationsCount}
        />
        <main className="org-dashboard__content">
          {renderContent()}
          {isLoading && userData && (
            <div className="content-refreshing">
              <div className="spinner-loader mini"></div>
              <span>Refreshing...</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OrgDashboard;
