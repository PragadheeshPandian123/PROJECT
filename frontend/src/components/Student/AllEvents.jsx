import { useEffect, useState } from "react";
import Loading from "../Loading";
import "./Modal.css";

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModalFor, setShowModalFor] = useState(null); // event id for which modal is open
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reg_no: "",
    department: "",
    year: "",
  });

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
    setShowModalFor(null);
  };

  const handleFormSubmit = async (eventId) => {
    try {
      const studentId = localStorage.getItem("userId");
      const res = await fetch(`http://localhost:5000/api/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          participant_id: studentId,
          ...formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Registration successful!");
        closeModal();
        fetchAllEvents(); // refresh events if needed
      } else {
        alert("Registration failed: " + (data.error || "unknown"));
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting registration");
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
                <p>
                  <strong>Time:</strong> {event.start_time} - {event.end_time}
                </p>
                <p><strong>Venue:</strong> {event.venue}</p>
                <p>{event.description}</p>
              </div>
              <div className="event-actions">
                <button className="btn register-btn" onClick={() => openModal(event.id)}>
                  Register
                </button>
              </div>

              {/* Modal */}
              {showModalFor === event.id && (
                <div className="modal-overlay">
                  <div className="modal">
                    <h3>Register for {event.title}</h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleFormSubmit(event.id);
                      }}
                    >
                      <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="phone"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                      <input
                        type="text"
                        name="reg_no"
                        placeholder="Reg No"
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
                        placeholder="Year"
                        value={formData.year}
                        onChange={handleInputChange}
                      />
                      <div className="modal-actions">
                        <button type="submit" className="btn submit-btn">
                          Submit
                        </button>
                        <button type="button" className="btn cancel-btn" onClick={closeModal}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllEvents;
