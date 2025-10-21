import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserAlt, FaEnvelope, FaLock, FaArrowLeft, FaGraduationCap, FaBuilding, FaUserGraduate } from "react-icons/fa";
import "./SignUp.css";

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    reg_no: "",
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "IT",
    year: "1st year",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setMessageType("success");
        setMessage("✅ Account created successfully! You can sign in now.");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setMessageType("error");
        setMessage(data.message);
      }
    } catch (err) {
      setMessageType("error");
      setMessage("Server error, please try again.");
    }
  };

  return (
    <div className="signup-container">
      {/* App Title */}
      <div className="app-title">
        <h1>Evently</h1>
        <p>College Event Management System</p>
      </div>

      {/* Sign Up Card */}
      <div className="signup-card">
        <h3 className="signup-heading">
          <FaUserAlt className="heading-icon" />
          Sign Up
        </h3>

        {/* Registration Number */}
        <div className="form-group">
          <label className="form-label">
            <FaUserAlt className="label-icon" />
            Registration Number
          </label>
          <input
            type="number"
            name="reg_no"
            placeholder="Enter registration number"
            value={formData.reg_no}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        {/* Full Name */}
        <div className="form-group">
          <label className="form-label">
            <FaUserAlt className="label-icon" />
            Full Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label">
            <FaEnvelope className="label-icon" />
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label">
            <FaLock className="label-icon" />
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        {/* Role */}
        <div className="form-group">
          <label className="form-label">
            <FaUserGraduate className="label-icon" />
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="form-select"
          >
            <option value="student">Student</option>
            <option value="organizer">Event Organizer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Department */}
        <div className="form-group">
          <label className="form-label">
            <FaBuilding className="label-icon" />
            Department
          </label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="form-select"
          >
            <option value="CSE">CSE</option>
            <option value="IT">IT</option>
            <option value="AIDS">AIDS</option>
            <option value="ECE">ECE</option>
          </select>
        </div>

        {/* Year */}
        <div className="form-group">
          <label className="form-label">
            <FaGraduationCap className="label-icon" />
            Year
          </label>
          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="form-select"
          >
            <option value="1st year">1st year</option>
            <option value="2nd year">2nd year</option>
            <option value="3rd year">3rd year</option>
            <option value="4th year">4th year</option>
          </select>
        </div>

        {/* Message */}
        {message && (
          <p className={`message ${messageType}`}>
            {message}
          </p>
        )}

        {/* Sign Up Button */}
        <button
          className="signup-button"
          onClick={handleSubmit}
        >
          <FaUserAlt /> Sign Up
        </button>

        {/* Back to Sign In */}
        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          <FaArrowLeft /> Back to Sign In
        </button>
      </div>
    </div>
  );
}

export default SignUp;