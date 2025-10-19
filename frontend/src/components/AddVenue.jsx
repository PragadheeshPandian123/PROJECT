import React, { useState, useEffect } from "react";
import "./AddVenue.css";

function AddVenue() {
  const [formData, setFormData] = useState({
    venue_name: "",
    venue_description: "",
    image_url: "",
    phone_number: "",
    mail_id: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/venues/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setMessageType("success");
        setMessage("✅ Venue added successfully!");
        setFormData({
          venue_name: "",
          venue_description: "",
          image_url: "",
          phone_number: "",
          mail_id: "",
        });
      } else {
        setMessageType("error");
        setMessage("⚠️ " + data.message);
      }
    } catch (error) {
      setMessageType("error");
      setMessage("⚠️ Server error: " + error.message);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="add-venue-container">
      <h2>Add New Venue</h2>
      {message && (
        <div className={`message ${messageType}`}>{message}</div>
      )}
      <form onSubmit={handleSubmit} className="add-venue-form">
        <div className="form-group">
          <label>Venue Name *</label>
          <input
            type="text"
            name="venue_name"
            placeholder="Enter venue name"
            value={formData.venue_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="venue_description"
            placeholder="Enter venue description"
            value={formData.venue_description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Image URL</label>
          <input
            type="url"
            name="image_url"
            placeholder="Enter image URL"
            value={formData.image_url}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="text"
            name="phone_number"
            placeholder="Enter phone number"
            value={formData.phone_number}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="mail_id"
            placeholder="Enter email"
            value={formData.mail_id}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="submit-btn">
          Add Venue
        </button>
      </form>
    </div>
  );
}

export default AddVenue;