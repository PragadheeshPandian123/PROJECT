import { useState } from "react";
import "./Modal.css";

const RegisterParticipantModal = ({ event, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reg_no: "",
    department: "",
    year: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(event.id, formData);
    setSubmitting(false);
  };
      console.log("Inside modal");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal1" onClick={(e) => e.stopPropagation()}>
        <h3>Register Participant for {event.title}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name *"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email *"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
          />
          <input
            type="text"
            name="reg_no"
            placeholder="Registration Number"
            value={formData.reg_no}
            onChange={handleChange}
          />
          <input
            type="text"
            name="department"
            placeholder="Department"
            value={formData.department}
            onChange={handleChange}
          />
          <input
            type="text"
            name="year"
            placeholder="Year (e.g., 2nd year)"
            value={formData.year}
            onChange={handleChange}
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
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterParticipantModal;