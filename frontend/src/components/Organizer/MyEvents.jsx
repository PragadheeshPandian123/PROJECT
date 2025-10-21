import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../Loading";
import RegisterParticipantModal from "./RegisterParticipantModal"; // ✅ import
import "./MyEvents.css";

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalEvent, setModalEvent] = useState(null); // track which modal is open
  const organizerId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/events/organizer/${organizerId}`);
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
      const res = await fetch(`http://localhost:5000/api/events/${eventId}`, { method: "DELETE" });
      if (res.ok) setEvents((prev) => prev.filter((e) => e.id !== eventId));
      else alert("Failed to delete event.");
    } catch (err) {
      console.error(err);
      alert("Error deleting event");
    }
  };

  const handleEdit = (eventId) => navigate(`/organizer-dashboard/add-event/${eventId}`);

  // ✅ handle participant form submission
  const handleRegisterParticipant = async (eventId, formData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, ...formData }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Participant registered!");
        setModalEvent(null);
      } else {
        alert("Failed: " + (data.error || "unknown"));
      }
    } catch (err) {
      console.error(err);
      alert("Error registering participant");
    }
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
              {event.image_url && <img src={event.image_url} alt={event.title} className="event-image" />}
              <div className="event-details">
                <h3>{event.title}</h3>
                <p><strong>Date:</strong> {event.date}</p>
                <p><strong>Time:</strong> {event.start_time} - {event.end_time}</p>
                <p><strong>Venue:</strong> {event.venue}</p>
                <p>{event.description}</p>
              </div>
              <div className="event-actions">
                <button className="btn register-btn" onClick={() => setModalEvent(event)}>
                  Register
                </button>
                <button className="btn participants-btn" onClick={() => navigate(`/organizer-dashboard/participants/${event.id}`)}>
                  Show Participants
                </button>
                <button className="btn edit-btn" onClick={() => handleEdit(event.id)}>Edit</button>
                <button className="btn delete-btn" onClick={() => handleDelete(event.id)}>Delete</button>
              </div>

              {/* ✅ Modal */}
              {modalEvent?.id === event.id && (
                <RegisterParticipantModal
                  event={event}
                  onClose={() => setModalEvent(null)}
                  onSubmit={handleRegisterParticipant}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvents;
