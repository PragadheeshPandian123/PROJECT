import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../Loading";
import "./EditProfile.css";

const EditProfile = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    department: "",
    year: "",
  });

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`);
      const data = await res.json();
      if (data) {
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone_number: data.phone_number || "",
          department: data.department || "",
          year: data.year || "",
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setMessageType("error");
      setMessage("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setMessageType("success");
        setMessage("Profile updated successfully!");
        localStorage.setItem("name", formData.name);
        setTimeout(() => navigate("/student-dashboard/my-events"), 2000);
      } else {
        setMessageType("error");
        setMessage(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessageType("error");
      setMessage("Server error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.name) return <Loading message="Loading profile..." />;

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      {message && (
        <div className={`message ${messageType}`}>{message}</div>
      )}
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
        </div>

        <div className="form-group">
          <label>Department</label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
          >
            <option value="">Select Department</option>
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="AIDS">AIDS</option>
            <option value="ECE">ECE</option>
          </select>
        </div>

        <div className="form-group">
          <label>Year</label>
          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
          >
            <option value="">Select Year</option>
            <option value="1st year">1st year</option>
            <option value="2nd year">2nd year</option>
            <option value="3rd year">3rd year</option>
            <option value="4th year">4th year</option>
          </select>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;