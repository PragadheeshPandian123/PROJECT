import { useEffect, useState } from "react";
import Loading from "../Loading";
import "./EventCards.css";

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/student/all-events");
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (gformLink) => {
    if (!gformLink) {
      alert("No registration form available for this event");
      return;
    }
    window.open(gformLink, "_blank");
  };

  return (
    <div className="events-container">
      <h2>All Events</h2>
      {loading ? (
        <Loading message="Fetching all events..." />
      ) : events.length === 0 ? (
        <p className="no-events">No events available.</p>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="event-image"
                />
              )}
              <div className="event-details">
                <h3>{event.title}</h3>
                <p><strong>Date:</strong> {event.date}</p>
                <p><strong>Time:</strong> {event.start_time} - {event.end_time}</p>
                <p><strong>Venue:</strong> {event.venue}</p>
                <p><strong>Status:</strong> <span className="status">{event.status}</span></p>
                <p><strong>Participants:</strong> {event.registrations_count}/{event.max_participants}</p>
                <p>{event.description}</p>
              </div>
              <div className="event-actions">
                <button
                  className="btn register-btn"
                  onClick={() => handleRegister(event.gform_link)}
                >
                  Register
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllEvents;
