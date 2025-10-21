import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./RegisterEvent.css";
import Loading from "../Loading";

const RegisterEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    year: "",
    rollNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/events/${eventId}`);
        const data = await res.json();
        setEvent(data);
      } catch (err) {
        console.error("Error fetching event:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  // ✅ Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch(`http://localhost:5000/api/event-registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          eventId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("🎉 Registration successful!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          department: "",
          year: "",
          rollNumber: "",
        });
        setTimeout(() => navigate("/student-dashboard/my-registrations"), 1500);
      } else {
        setMessage(data.error || "Registration failed. Try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage("Server error. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading event details..." />;

  if (!event) return <p>Event not found.</p>;

  return (
    <div className="register-event-container">
      <h2>Register for {event.title}</h2>

      <div className="event-summary">
        <p>
          <strong>Date:</strong> {event.date}
        </p>
        <p>
          <strong>Time:</strong> {event.start_time} - {event.end_time}
        </p>
        <p>
          <strong>Venue:</strong> {event.venue}
        </p>
      </div>

      <form className="register-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="year"
          placeholder="Year (e.g., 2nd Year)"
          value={formData.year}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="rollNumber"
          placeholder="Roll Number"
          value={formData.rollNumber}
          onChange={handleChange}
          required
        />

        <button type="submit" className="btn submit-btn" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Registration"}
        </button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default RegisterEvent;
