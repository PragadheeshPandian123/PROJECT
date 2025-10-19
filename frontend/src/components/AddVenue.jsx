import React, { useState, useEffect } from "react";

function AddVenue() {
  const [formData, setFormData] = useState({
    venue_name: "",
    venue_description: "",
    image_url: "",
    phone_number: "",
    mail_id: "",
  });
  const [message, setMessage] = useState("");

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
        setMessage("✅ Venue added successfully!");
        // Reset form
        setFormData({
          venue_name: "",
          venue_description: "",
          image_url: "",
          phone_number: "",
          mail_id: "",
        });
      } else {
        setMessage("⚠️ " + data.message);
      }
    } catch (error) {
      setMessage("⚠️ Server error: " + error.message);
    }
  };

  // Optional: auto-hide message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="container mt-4">
      <h2>Add Venue</h2>
      {message && (
        <div className="alert alert-info">
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="venue_name"
          placeholder="Venue Name"
          value={formData.venue_name}
          onChange={handleChange}
          className="form-control mb-2"
          required
        />
        <textarea
          name="venue_description"
          placeholder="Venue Description"
          value={formData.venue_description}
          onChange={handleChange}
          className="form-control mb-2"
        />
        <input
          type="text"
          name="image_url"
          placeholder="Image URL"
          value={formData.image_url}
          onChange={handleChange}
          className="form-control mb-2"
        />
        <input
          type="text"
          name="phone_number"
          placeholder="Phone Number"
          value={formData.phone_number}
          onChange={handleChange}
          className="form-control mb-2"
        />
        <input
          type="email"
          name="mail_id"
          placeholder="Email ID"
          value={formData.mail_id}
          onChange={handleChange}
          className="form-control mb-2"
        />
        <button type="submit" className="btn btn-primary">
          Add Venue
        </button>
      </form>
    </div>
  );
}

export default AddVenue;
