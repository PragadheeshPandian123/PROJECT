import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyEvents.css";
import Loading from "../Loading"; // ✅ Make sure the path is correct

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const organizerId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:5000/api/events/organizer/${organizerId}`
        );
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [organizerId]);

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/events/${eventId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEvents(events.filter((e) => e.id !== eventId));
      } else {
        alert("Failed to delete event.");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting event");
    }
  };

  const handleEdit = (eventId) => {
    navigate(`/organizer-dashboard/add-event/${eventId}`);
  };

  return (
    <div className="my-events-container">
      <h2>My Events</h2>

      {loading ? (
        <Loading message="Fetching your events..." />
      ) : events.length === 0 ? (
        <p>No events yet.</p>
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
                <p>
                  <strong>Date:</strong> {event.date}
                </p>
                <p>
                  <strong>Time:</strong> {event.start_time} - {event.end_time}
                </p>
                <p>
                  <strong>Venue:</strong> {event.venue}
                </p>
                <p>{event.description}</p>
              </div>
              <div className="event-actions">
                {event.gform_link && (
                  <a
                    href={event.gform_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn register-btn"
                  >
                    Register
                  </a>
                )}
                <button
                  className="btn participants-btn"
                  onClick={() =>
                    navigate(`/organizer-dashboard/participants/${event.id}`)
                  }
                >
                  Show Participants
                </button>
                <button
                  className="btn edit-btn"
                  onClick={() => handleEdit(event.id)}
                >
                  Edit
                </button>
                <button
                  className="btn delete-btn"
                  onClick={() => handleDelete(event.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvents;
