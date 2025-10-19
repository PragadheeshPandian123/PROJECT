import { useEffect, useState } from "react";
import Loading from "../Loading";
import "./EventCards.css";

const MyRegisteredEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const studentId = localStorage.getItem("userId");

  useEffect(() => {
    fetchRegisteredEvents();
  }, [studentId]);

  const fetchRegisteredEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/student/registered-events/${studentId}`
      );
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

  const handleUnregister = async (registrationId, eventId) => {
    if (!window.confirm("Are you sure you want to unregister from this event?")) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/registrations/${registrationId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        setEvents(events.filter((e) => e.event_id !== eventId));
        alert("Unregistered successfully");
      }
    } catch (err) {
      console.error("Error unregistering:", err);
      alert("Error unregistering from event");
    }
  };

  return (
    <div className="events-container">
      <h2>My Registered Events</h2>
      {loading ? (
        <Loading message="Fetching your events..." />
      ) : events.length === 0 ? (
        <p className="no-events">You haven't registered for any events yet.</p>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.registration_id} className="event-card">
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
                <p>{event.description}</p>
              </div>
              <div className="event-actions">
                <button
                  className="btn unregister-btn"
                  onClick={() => handleUnregister(event.registration_id, event.event_id)}
                >
                  Unregister
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRegisteredEvents;