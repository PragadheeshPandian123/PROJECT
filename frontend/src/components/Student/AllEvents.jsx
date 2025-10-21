import { useEffect, useState } from "react";
import Loading from "../Loading";
import "./Modal.css";
import "./EventCards.css";

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModalFor, setShowModalFor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reg_no: "",
    department: "",
    year: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/student/all-events");
      const data = await res.json();
      if (data.success) setEvents(data.events);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (eventId) => {
    console.log("Opening modal for event ID:", eventId);
    setShowModalFor(eventId);
    setFormData({
      name: "",
      email: "",
      phone: "",
      reg_no: "",
      department: "",
      year: "",
    });
  };

  const closeModal = () => {
    console.log("Closing modal");
    setShowModalFor(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      reg_no: "",
      department: "",
      year: "",
    });
  };

  const handleFormSubmit = async (e, eventId) => {
    e.preventDefault();
    console.log("Submitting form for event:", eventId, formData);
    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:5000/api/registrations/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          ...formData,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert("✅ Registration successful!");
        closeModal();
        fetchAllEvents();
      } else {
        alert("❌ " + (data.error || "Registration failed"));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error submitting registration");
    } finally {
      setSubmitting(false);
    }
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
                <p><strong>Category:</strong> {event.category || "General"}</p>
                <p>{event.description}</p>
              </div>
              <div className="event-actions">
                <button 
                  className="btn register-btn" 
                  onClick={() => openModal(event.id)}
                >
                  Register
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Rendered at root level, outside the grid */}
      {showModalFor && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal1" onClick={(e) => e.stopPropagation()}>
            <h3>Register for Event</h3>
            <form onSubmit={(e) => handleFormSubmit(e, showModalFor)}>
              <input
                type="text"
                name="name"
                placeholder="Full Name *"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="reg_no"
                placeholder="Registration Number"
                value={formData.reg_no}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="department"
                placeholder="Department"
                value={formData.department}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="year"
                placeholder="Year (e.g., 2nd year)"
                value={formData.year}
                onChange={handleInputChange}
              />
              <div className="modal-actions">
                <button 
                  type="submit" 
                  className="btn submit-btn"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
                <button 
                  type="button" 
                  className="btn cancel-btn" 
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEvents;