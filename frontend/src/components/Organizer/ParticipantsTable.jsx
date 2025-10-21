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
  const [viewMode, setViewMode] = useState("table"); // "table" | "cards"

  // ✅ Fetch participants for this event
  const fetchRows = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/participants?event_id=${eventId}`
      );
      const data = await res.json();

      if (data.success) {
        // backend returns { success: true, rows: [...] }
        setRows(data.rows || []);
      } else {
        alert(data.error || "Failed to load participants");
      }
    } catch (err) {
      console.error(err);
      alert("Error loading participants");
    } finally {
      setLoading(false);
    }
  };

  // ✅ On mount or when eventId changes
  useEffect(() => {
    if (eventId) fetchRows();
  }, [eventId]);

  // ✅ Delete participant
  const handleDeleteParticipant = async (participantId) => {
    if (!window.confirm("Are you sure you want to delete this participant?"))
      return;

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/participants/${participantId}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (data.success) {
        alert("Participant deleted successfully.");
        fetchRows(); // refresh
      } else {
        alert(data.error || "Failed to delete participant");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting participant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="participants-container">
      <div className="participants-header">
        <h3>Participants</h3>
        <div className="participants-actions">
          <button onClick={fetchRows}>🔄 Refresh</button>
          <button
            onClick={() =>
              setViewMode(viewMode === "table" ? "cards" : "table")
            }
          >
            {viewMode === "table" ? "📇 View as Cards" : "📋 View as Table"}
          </button>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading participants..." />
      ) : rows.length === 0 ? (
        <p>No participants registered for this event yet.</p>
      ) : viewMode === "table" ? (
        <table className="participants-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Reg No</th>
              <th>Department</th>
              <th>Year</th>
              <th>Registered At</th>
              <th>Actions</th>
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
                  <button
                    className="btn edit-btn"
                    onClick={() => setEditingParticipant(r)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn delete-btn"
                    onClick={() =>
                      handleDeleteParticipant(r.participant_id)
                    }
                    style={{ marginLeft: 8 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="participants-cards">
          {rows.map((r) => (
            <div key={r.registration_id} className="participant-card">
              <h4>{r.name}</h4>
              <p>
                <strong>Email:</strong> {r.email}
              </p>
              <p>
                <strong>Phone:</strong> {r.phone}
              </p>
              <p>
                <strong>Reg No:</strong> {r.reg_no}
              </p>
              <p>
                <strong>Department:</strong> {r.department}
              </p>
              <p>
                <strong>Year:</strong> {r.year}
              </p>
              <p>
                <strong>Registered:</strong>{" "}
                {new Date(r.registration_time).toLocaleString()}
              </p>
              <div className="card-actions">
                <button
                  className="btn edit-btn"
                  onClick={() => setEditingParticipant(r)}
                >
                  Edit
                </button>
                <button
                  className="btn delete-btn"
                  onClick={() =>
                    handleDeleteParticipant(r.participant_id)
                  }
                  style={{ marginLeft: 8 }}
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
