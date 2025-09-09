import React, { useState, useEffect } from "react";
import { Calendar, RefreshCw } from "lucide-react";

const CalendarComponent = ({ onNotificationsUpdate }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [userOrganization, setUserOrganization] = useState("");

  // Normalize helper for org name comparison
  const normalize = (str) => (str || "").trim().toLowerCase();

  // Get user's organizations from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      
      if (user.organizations && user.organizations.length > 0) {
        const orgName = user.organizations[0].organization_name;
        setUserOrganization(orgName);
      } else if (user.organization_name) {
        // Fallback to direct organization_name if available
        setUserOrganization(user.organization_name);
      } else {
        setUserOrganization("Computer Studies Program"); // Update default to match your actual org
      }
    }
  }, []);

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      // Get user data first to ensure we have the organization
      const userData = localStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;
      if (user?.organizations?.length > 0) {
        setUserOrganization(user.organizations[0].organization_name);
      }

      console.log("🔍 Current user organization:", userOrganization);

      const response = await fetch("/api/events?upcoming=1&days=90", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ Raw events from API:", result.data.events);
        
        // Ensure events have the correct structure
        const processedEvents = (result.data.events || []).map(event => ({
          ...event,
          target_organizations: Array.isArray(event.target_organizations) 
            ? event.target_organizations 
            : event.target_organizations?.split(',').map(org => org.trim()) || []
        }));

        console.log("📅 Processed events:", processedEvents);
        setEvents(processedEvents);
        
        if (onNotificationsUpdate) {
          onNotificationsUpdate(processedEvents);
        }
      } else {
        console.error("Failed to fetch events:", result.message);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  // Poll every 15s for updates
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchEvents();
    }, 15000);
    return () => clearInterval(pollInterval);
  }, []);

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date &&
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date) => {
    return (
      selectedDate &&
      date &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const handleDateClick = (date) => {
    if (date) setSelectedDate(date);
  };

  // ✅ Match events to org using backend-consistent key
  const getDayEvents = (date) => {
    if (!date) return [];
    const dateStr = formatDate(date);

    return events.filter((event) => {
      // Basic validation of event data
      if (!event || !event.date) return false;

      // Normalize the event date to YYYY-MM-DD format
      const eventDate = event.date.split('T')[0]; // Handle potential ISO date format
      
      // Compare dates
      if (eventDate !== dateStr) return false;

      // Get the user's organization, defaulting to an empty string if not set
      const currentOrg = userOrganization || '';

      // If no target organizations or not an array, show the event
      if (!event.target_organizations || !Array.isArray(event.target_organizations)) {
        return true;
      }

      // Check if the event is for all organizations or matches the user's organization
      const isForAllOrgs = event.target_organizations.some(org => 
        normalize(org) === 'all organizations'
      );

      const isForUserOrg = event.target_organizations.some(org => {
        const normalizedEventOrg = normalize(org);
        const normalizedUserOrg = normalize(currentOrg);
        return normalizedEventOrg === normalizedUserOrg;
      });

      return isForAllOrgs || isForUserOrg;
    });
  };

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="calendar-component">
      <div className="calendar__header">
        <h1 className="calendar__title">
          <Calendar size={24} />
          Event Calendar
        </h1>
      </div>

      <div className="calendar__content">
        <div className="calendar__events-section">
          <div className="calendar__section-header">
            <h2 className="calendar__section-title">
              <Calendar size={20} />
              Event Calendar
            </h2>
            <div className="calendar__nav">
              <button
                className="calendar__nav-btn"
                onClick={() => navigateMonth(-1)}
              >
                ‹
              </button>
              <h3 className="calendar__month">
                {monthNames[currentMonth.getMonth()]}{" "}
                {currentMonth.getFullYear()}
              </h3>
              <button
                className="calendar__nav-btn"
                onClick={() => navigateMonth(1)}
              >
                ›
              </button>
              <button
                className="calendar__nav-btn calendar__refresh-btn"
                onClick={fetchEvents}
                title="Refresh events"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="calendar__grid">
            {dayNames.map((day) => (
              <div key={day} className="calendar__day-header">
                {day}
              </div>
            ))}

            {getDaysInMonth(currentMonth).map((date, index) => {
              const dayEvents = getDayEvents(date);

              return (
                <div
                  key={index}
                  className={`calendar__day 
                    ${!date ? "empty" : ""} 
                    ${isToday(date) ? "today" : ""} 
                    ${isSelected(date) ? "selected" : ""} 
                    ${dayEvents.length > 0 ? "has-event" : ""}`}
                  onClick={() => handleDateClick(date)}
                >
                  {date && (
                    <>
                      <span className="calendar__day-number">
                        {date.getDate()}
                      </span>
                      {dayEvents.length > 0 && (
                        <div className="calendar__day-events">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className="calendar__event-title"
                              title={event.title}
                            >
                              {event.title.length > 14
                                ? `${event.title.substring(0, 14)}…`
                                : event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="calendar__event-more">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
