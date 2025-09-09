import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';

const OrgNotif = ({
  notifications = [],
  onMarkNotificationAsRead,
  unreadNotificationsCount = 0
}) => {
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const notificationDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setIsNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleNotificationDropdown = () => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
  };

  const handleNotificationClick = (notificationId) => {
    if (onMarkNotificationAsRead) {
      onMarkNotificationAsRead(notificationId);
    }
    // Close notification dropdown after marking as read for better UX
    setIsNotificationDropdownOpen(false);
  };

  return (
    <div
      className="org-header__notification"
      onClick={toggleNotificationDropdown}
      ref={notificationDropdownRef}
    >
      <Bell />
      {unreadNotificationsCount > 0 && (
        <span className="org-header__notification-badge">
          {unreadNotificationsCount}
        </span>
      )}
      {isNotificationDropdownOpen && (
        <div className="org-header__notification-dropdown">
          <div className="org-header__notification-header">
            <h4 className="org-header__notification-title">
              <Bell size={16} />
              Notifications
            </h4>
            <div className="org-header__notification-actions">
              <button className="org-header__action-btn org-header__action-btn--read-all">
                Read All
              </button>
              <button className="org-header__action-btn org-header__action-btn--see-all">
                See All
              </button>
            </div>
          </div>
          <div className="org-header__notification-list">
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map(notification => (
                <div
                  key={notification.id}
                  className={`org-header__notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="org-header__notification-content">
                    <div className="org-header__notification-avatar">
                      <img
                        src={
                          notification.creator?.profilePic 
                            ? `/storage/${notification.creator.profilePic}` 
                            : "/images/csp.png"
                        }
                        alt={notification.creator?.name || "Event Creator"}
                        className="org-header__notification-profile-pic"
                        onError={(e) => {
                          e.target.src = "/images/csp.png";
                        }}
                      />
                      <span className="org-header__notification-role">
                        {notification.creator?.role || 'COA'}
                      </span>
                    </div>
                    <div className="org-header__notification-details">
                      <div className="org-header__notification-title">
                        {notification.title}
                      </div>
                      <div className="org-header__notification-date">
                        {notification.eventDetails?.date} {notification.eventDetails?.time && `at ${notification.eventDetails.time}`}
                      </div>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="org-header__notification-item-unread-indicator"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="org-header__notification-empty">
                <Bell size={24} />
                <p>No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgNotif;


