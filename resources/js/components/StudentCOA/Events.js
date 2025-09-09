import React, { useState, useEffect } from 'react';
import { Calendar, Plus } from 'lucide-react';
import EventModal from './EventModal';
import AllEvents from './AllEvents';

const Events = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Sample organizations - in real app this would come from API
  const organizations = [
    'Computer Science Society',
    'Engineering Student Council',
    'Business Administration Club',
    'Nursing Student Association',
    'Psychology Society',
    'Arts and Culture Organization',
    'Sports Federation',
    'Environmental Club'
  ];

  // Get current user information
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
    }
  }, []);

  // Fetch events from API
  useEffect(() => {
    if (currentUser) {
      fetchEvents();
    }
  }, [currentUser]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/events', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        setEvents(result.data.events);
      } else {
        console.error('Failed to fetch events:', result.message);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const formatDate = (date) => {
    if (!date) return '';
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

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  // Event management functions
  const handleCreateEvent = () => {
    setEditingEvent(null);
    setShowEventModal(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const handleSaveEvent = async () => {
    setShowEventModal(false);
    setEditingEvent(null);
    fetchEvents();
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You are not authenticated. Please log in again.');
        return;
      }

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        fetchEvents();
      } else {
        alert(result.message || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="events">
      <div className="events__header">
        <h1 className="events__title">Event Management</h1>
      </div>

      <div className="events__content">
        {/* Calendar Section */}
        <div className="events__calendar-section">
          <div className="events__calendar-header">
            <h2 className="events__section-title">
              <Calendar size={20} />
              Event Calendar
            </h2>
            <button className="events__create-btn" onClick={handleCreateEvent}>
              <Plus size={16} />
              Create Event
            </button>
          </div>

          <div className="events__calendar">
            <div className="calendar__header">
              <button className="calendar__nav-btn" onClick={() => navigateMonth(-1)}>‹</button>
              <h3 className="calendar__month">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button className="calendar__nav-btn" onClick={() => navigateMonth(1)}>›</button>
            </div>

            <div className="calendar__grid">
              {dayNames.map((day) => (
                <div key={day} className="calendar__day-header">{day}</div>
              ))}

              {getDaysInMonth(currentMonth).map((date, index) => {
                const dayEvents = events.filter(
                  (event) => event.date === formatDate(date)
                );

                return (
                  <div
                    key={index}
                    className={`calendar__day 
                      ${!date ? 'empty' : ''} 
                      ${isToday(date) ? 'today' : ''} 
                      ${dayEvents.length > 0 ? 'has-event' : ''}`}
                  >
                    {date && (
                      <>
                        <span className="calendar__day-number">{date.getDate()}</span>
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

        {/* All Events Section */}
        <AllEvents
          events={events}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
          currentUser={currentUser}
        />
      </div>

      <EventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSave={handleSaveEvent}
        editingEvent={editingEvent}
        organizations={organizations}
      />
    </div>
  );
};

export default Events;
