// src/components/Organizer/AddEvents.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AddEvents.css"; // ensure this file exists

const AddEvents = () => {
  const { eventId } = useParams(); // for editing an existing event
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    start_time: "",
    end_time: "",
    max_participants: "",
    venue_id: "",
    gform_link: "",
    gspreadsheet_link: "",
    image_url: "",
    phone_number: "",
    mail_id: "",
    status: "Green",
  });

  const [venues, setVenues] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // success or error
  const organizerId = localStorage.getItem("userId");

  // Fetch all venues
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/venues");
        const data = await res.json();
        if (data.success) {
          setVenues(data.venues);
        } else {
          setMessageType("error");
          setMessage(data.message || "Failed to fetch venues");
        }
      } catch (err) {
        setMessageType("error");
        setMessage("Server error: " + err.message);
      }
    };
    fetchVenues();
  }, []);

  // Fetch existing event data if editing
  useEffect(() => {
    if (!eventId) {
      return;}

    const fetchEvent = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/events/${eventId}`);
        const data = await res.json();
        console.log(data);
        if (data.success && data.event) {
          const e=data.event;
          setFormData({
            title: e.title || "",
            description: e.description || "",
            category:e.category || "",
            date: e.date || "",
            start_time: e.start_time || "",
            end_time: e.end_time || "",
            max_participants: e.max_participants || "",
            venue_id: e.venue_id || "",
            gform_link: e.gform_link || "",
            gspreadsheet_link: e.gspreadsheet_link || "",
            image_url: e.image_url || "",
            phone_number: e.phone_number || "",
            mail_id: e.mail_id || "",
            status: e.status || "Green",
          });
        } else {
          setMessageType("error");
          setMessage("Event data not found.");
        }
      } catch (err) {
        setMessageType("error");
        setMessage("Server error: " + err.message);
      }
    };

    fetchEvent();
  }, [eventId]);

  // Input change handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      "title",
      "date",
      "start_time",
      "end_time",
      "max_participants",
      "venue_id",
    ];

    const missingFields = requiredFields.filter(
      (field) => !formData[field] || formData[field] === "Select Venue"
    );

    if (missingFields.length > 0) {
      setMessageType("error");
      setMessage("Please fill all required fields");
      return;
    }

    const body = { ...formData, organizer_id: organizerId, max_participants: Number(formData.max_participants) };
    const url = eventId 
      ? `http://localhost:5000/api/events/${eventId}`
      : "http://localhost:5000/api/events/";
    const method = eventId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (res.ok) {
        setMessageType("success");
        setMessage(eventId ? "Event updated successfully!" : "Event created successfully!");
        if (!eventId) {
          setFormData({
            title: "",
            description: "",
            category: "",
            date: "",
            start_time: "",
            end_time: "",
            max_participants: "",
            venue_id: "",
            gform_link: "",
            gspreadsheet_link: "",
            image_url: "",
            phone_number: "",
            mail_id: "",
            status: "Green",
          });
        }
        navigate("/organizer-dashboard/myevents");
      } else {
        setMessageType("error");
        setMessage(data.error || "Failed to save event");
      }
    } catch (err) {
      setMessageType("error");
      setMessage("Server error: " + err.message);
    }
  };

  return (
    <div className="add-event-container">
      <h2>{eventId ? "Edit Event" : "Create Event"}</h2>
      {message && <div className={`message ${messageType}`}>{message}</div>}

      <form className="add-event-form" onSubmit={handleSubmit}>
  <label>Event Title *</label>
  <input type="text" name="title" placeholder="Enter event title" value={formData.title} onChange={handleChange} />

  <label>Description</label>
  <textarea name="description" placeholder="Enter event description" value={formData.description} onChange={handleChange} />

  <label>Category</label>
  <input type="text" name="category" placeholder="Enter category" value={formData.category} onChange={handleChange} />

  <label>Date *</label>
  <input type="date" name="date" value={formData.date} onChange={handleChange} />

  <label>Start Time *</label>
  <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} />

  <label>End Time *</label>
  <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} />

  <label>Max Participants *</label>
  <input type="number" name="max_participants" placeholder="Enter max participants" value={formData.max_participants} onChange={handleChange} />

  <label>Venue *</label>
  <select name="venue_id" value={formData.venue_id} onChange={handleChange}>
    <option>Select Venue</option>
    {venues.map((v) => (
      <option key={v.id} value={v.id}>{v.venue_name}</option>
    ))}
  </select>

  <label>Google Form Link</label>
  <input type="url" name="gform_link" placeholder="Enter Google Form link" value={formData.gform_link} onChange={handleChange} />

  <label>Google Spreadsheet Link</label>
  <input type="url" name="gspreadsheet_link" placeholder="Enter spreadsheet link" value={formData.gspreadsheet_link} onChange={handleChange} />

  <label>Image URL</label>
  <input type="url" name="image_url" placeholder="Enter image URL" value={formData.image_url} onChange={handleChange} />

  <label>Phone Number</label>
  <input type="text" name="phone_number" placeholder="Enter contact phone" value={formData.phone_number} onChange={handleChange} />

  <label>Email ID</label>
  <input type="email" name="mail_id" placeholder="Enter contact email" value={formData.mail_id} onChange={handleChange} />

  <button type="submit">{eventId ? "Update Event" : "Create Event"}</button>
</form>

    </div>
  );
};

export default AddEvents;
