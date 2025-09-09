import React from 'react';
import { Calendar, Edit, Trash2, Clock } from 'lucide-react';

const AllEvents = ({ events, onEditEvent, onDeleteEvent, currentUser }) => {
  // Debug logging
  console.log('AllEvents Debug:', {
    eventsCount: events.length,
    currentUser: currentUser,
    sampleEvent: events[0] // Show structure of first event
  });

  // Get all events created by current user
  const userEvents = events.filter(event => {
    // Handle both string and numeric ID comparison
    const currentUserId = currentUser?.id || currentUser?.user_id;
    const eventCreatedBy = event.created_by || event.createdBy; // Handle both snake_case and camelCase
    
    console.log('Debug event filtering:', {
      eventId: event.id,
      eventTitle: event.title,
      eventCreatedBy: eventCreatedBy,
      currentUserId: currentUserId,
      match: String(eventCreatedBy) === String(currentUserId)
    });
    
    const isMatch = String(eventCreatedBy) === String(currentUserId);
    return isMatch;
  });

  return (
    <div className="all-events">
      <div className="all-events__container">
        <h2 className="all-events__title">
          All Events Created ({userEvents.length})
        </h2>

        <div className="all-events__list">
          {userEvents.length > 0 ? (
            userEvents.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-card__header">
                  <div className="event-card__info">
                    <div className="event-card__date-time">
                      <div className="event-card__detail">
                        <Calendar size={14} />
                        <span>{new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                      {event.time && (
                        <div className="event-card__detail">
                          <Clock size={14} />
                          <span>{event.time}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="event-card__title">{event.title}</h3>
                  </div>
                  <div className="event-card__actions">
                    <button
                      className="event-card__action-btn"
                      onClick={() => onEditEvent(event)}
                      title="Edit Event"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="event-card__action-btn event-card__action-btn--delete"
                      onClick={() => onDeleteEvent(event.id)}
                      title="Delete Event"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="all-events__empty">
              <Calendar size={48} />
              <p>No events created yet</p>
              <p className="all-events__empty-subtitle">Create your first event to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllEvents;
