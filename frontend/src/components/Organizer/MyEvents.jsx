import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../Loading";
import RegisterParticipantModal from "./RegisterParticipantModal";
import "./MyEvents.css";

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalEvent, setModalEvent] = useState(null);
  const organizerId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, [organizerId]);

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

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/events/${eventId}`, { 
        method: "DELETE" 
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        alert("✅ Event deleted successfully");
      } else {
        alert("❌ Failed to delete event");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error deleting event");
    }
  };

  const handleEdit = (eventId) => {
    navigate(`/organizer-dashboard/add-event/${eventId}`);
  };

  const handleOpenModal = (event) => {
    console.log("Opening modal for event:", event.title);
    setModalEvent(event);
  };

  const handleCloseModal = () => {
    console.log("Closing modal");
    setModalEvent(null);
  };

  const handleRegisterParticipant = async (eventId, formData) => {
    console.log("Submitting registration for event:", eventId, formData);
    try {
      const res = await fetch("http://localhost:5000/api/registrations/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          event_id: eventId, 
          ...formData 
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        alert("✅ Participant registered successfully!");
        handleCloseModal();
        fetchEvents(); // Refresh to update counts
      } else {
        alert("❌ " + (data.error || "Registration failed"));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error registering participant");
    }
  };

  return (
    <div className="my-events-container">
      <h2>My Events</h2>
      {loading ? (
        <Loading message="Fetching your events..." />
      ) : events.length === 0 ? (
        <p className="no-events">No events yet. Create your first event!</p>
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
                <p><strong>Category:</strong> {event.category || "General"}</p>
                <p><strong>Registrations:</strong> {event.registrations_count} / {event.max_participants}</p>
                <p>{event.description}</p>
              </div>
              <div className="event-actions">
                <button 
                  className="btn register-btn" 
                  onClick={() => handleOpenModal(event)}
                >
                  Register Participant
                </button>
                <button 
                  className="btn participants-btn" 
                  onClick={() => navigate(`/organizer-dashboard/participants/${event.id}`)}
                >
                  View Participants
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

      {/* Modal - Rendered at root level */}
      {modalEvent && (
        <RegisterParticipantModal
          event={modalEvent}
          onClose={handleCloseModal}
          onSubmit={handleRegisterParticipant}
        />
      )}
    </div>
  );
};

export default MyEvents;