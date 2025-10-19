import React, { useEffect, useState } from "react";
import ParticipantEditModal from "./ParticipantEditModal";
import { useParams } from "react-router-dom";
import "./ParticipantTables.css";
import Loading from "../Loading";

const ParticipantsTable = () => {
  const { eventId } = useParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // table | cards
  const organizerId = localStorage.getItem("userId");

  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/registrations?event_id=${eventId}`
      );
      const data = await res.json();
      if (data.success) setRows(data.registrations);
      else alert("Failed to load participants");
    } catch (err) {
      console.error(err);
      alert("Error loading participants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) fetchRows();
  }, [eventId]);

  const handleDeleteParticipant = async (participantId) => {
    if (!window.confirm("Delete participant?")) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/registrations/participants/${participantId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) fetchRows();
      else alert(data.error || "Delete failed");
    } catch (err) {
      console.error(err);
      alert("Error deleting participant");
      setLoading(false);
    }
  };

  const handleCheckNew = async () => {
    if (!window.confirm("Check spreadsheet for new registrations now?")) return;
    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/registrations/check-new",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_id: eventId,
            organizer_id: organizerId,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        alert(
          `Inserted participants: ${data.inserted_participants}
Inserted registrations: ${data.inserted_registrations}
Duplicates: ${data.duplicates.length}`
        );
        fetchRows();
      } else {
        alert("Check failed: " + (data.error || "unknown"));
      }
    } catch (err) {
      console.error(err);
      alert("Error checking sheet");
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h3>Participants</h3>
        <div>
          <button onClick={handleCheckNew}>Check New Registrations</button>
          <button onClick={fetchRows} style={{ marginLeft: 8 }}>Refresh</button>
          <button
            onClick={() =>
              setViewMode(viewMode === "table" ? "cards" : "table")
            }
            style={{ marginLeft: 8 }}
          >
            View as {viewMode === "table" ? "Cards" : "Table"}
          </button>
        </div>
      </div>

      {loading ? (
        <Loading message="Processing..." />
      ) : viewMode === "table" ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Phone</th><th>Reg No</th>
              <th>Dept</th><th>Year</th><th>Registered At</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.registration_id}>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>{r.phone}</td>
                <td>{r.reg_no}</td>
                <td>{r.department}</td>
                <td>{r.year}</td>
                <td>{new Date(r.registration_time).toLocaleString()}</td>
                <td>
                  <button onClick={() => setEditingParticipant(r)}>Edit</button>
                  <button
                    onClick={() => handleDeleteParticipant(r.participant_id)}
                    style={{ marginLeft: 6 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="cards-container">
          {rows.map((r) => (
            <div key={r.registration_id} className="participant-card">
              <h4>{r.name}</h4>
              <p><strong>Email:</strong> {r.email}</p>
              <p><strong>Phone:</strong> {r.phone}</p>
              <p><strong>Reg No:</strong> {r.reg_no}</p>
              <p><strong>Dept:</strong> {r.department}</p>
              <p><strong>Year:</strong> {r.year}</p>
              <p><strong>Registered:</strong> {new Date(r.registration_time).toLocaleString()}</p>
              <div className="card-actions">
                <button onClick={() => setEditingParticipant(r)}>Edit</button>
                <button
                  onClick={() => handleDeleteParticipant(r.participant_id)}
                  style={{ marginLeft: 6 }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingParticipant && (
        <ParticipantEditModal
          participant={editingParticipant}
          onClose={() => {
            setEditingParticipant(null);
            fetchRows();
          }}
        />
      )}
    </div>
  );
};

export default ParticipantsTable;
