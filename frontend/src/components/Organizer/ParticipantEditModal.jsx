import React, { useState } from "react";
import "./ParticipantEditModal.css";

const ParticipantEditModal = ({ participant, onClose }) => {
  const [form, setForm] = useState({
    participant_id: participant.participant_id,
    name: participant.name,
    email: participant.email,
    phone: participant.phone,
    reg_no: participant.reg_no,
    department: participant.department,
    year: participant.year
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/registrations/participants/${form.participant_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Participant updated successfully");
        onClose(true); // Pass true to indicate refresh needed
      } else {
        alert("❌ Update failed: " + (data.error || data.message));
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error updating participant");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h4>Edit Participant</h4>

        <input 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          placeholder="Name *" 
          required
        />
        <input 
          name="email" 
          value={form.email} 
          onChange={handleChange} 
          placeholder="Email *" 
          type="email"
          required
        />
        <input 
          name="phone" 
          value={form.phone} 
          onChange={handleChange} 
          placeholder="Phone Number" 
        />
        <input 
          name="reg_no" 
          value={form.reg_no} 
          onChange={handleChange} 
          placeholder="Registration Number" 
        />
        <input 
          name="department" 
          value={form.department} 
          onChange={handleChange} 
          placeholder="Department" 
        />
        <input 
          name="year" 
          value={form.year} 
          onChange={handleChange} 
          placeholder="Year" 
        />

        <div className="modal-actions">
          <button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={() => onClose(false)} disabled={saving}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantEditModal;