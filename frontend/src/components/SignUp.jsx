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
        setMessage("Account created successfully! You can sign in now.");
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage("Server error, please try again.");
    }
  };

  return (
    <div className="signup-container d-flex justify-content-center align-items-start py-5 bg-light" style={{ minHeight: "100vh" }}>
      <div className="card p-4 shadow-lg" style={{ width: "28rem", borderRadius: "1rem" }}>
        <h3 className="text-center mb-4 d-flex align-items-center justify-content-center gap-2 text-primary">
          <FaUserAlt /> Sign Up
        </h3>

        {/* Registration Number */}
        <div className="mb-3">
          <label className="form-label">
            <FaUserAlt className="me-2 text-primary" />
            Registration Number
          </label>
          <input
            type="number"
            name="reg_no"
            placeholder="Enter registration number"
            value={formData.reg_no}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        {/* Full Name */}
        <div className="mb-3">
          <label className="form-label">
            <FaUserAlt className="me-2 text-primary" />
            Full Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="form-label">
            <FaEnvelope className="me-2 text-primary" />
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="form-label">
            <FaLock className="me-2 text-primary" />
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        {/* Role */}
        <div className="mb-3">
          <label className="form-label">
            <FaUserGraduate className="me-2 text-primary" />
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
        <div className="mb-3">
          <label className="form-label">
            <FaBuilding className="me-2 text-primary" />
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
        <div className="mb-3">
          <label className="form-label">
            <FaGraduationCap className="me-2 text-primary" />
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
        {message && <p className="text-center text-danger">{message}</p>}

        {/* Sign Up Button */}
        <button
          className="btn btn-primary w-100 mb-2 d-flex align-items-center justify-content-center gap-2"
          onClick={handleSubmit}
        >
          <FaUserAlt /> Sign Up
        </button>

        {/* Back to Sign In */}
        <button
          className="btn btn-secondary w-100 d-flex align-items-center justify-content-center gap-2"
          onClick={() => navigate("/")}
        >
          <FaArrowLeft /> Back to Sign In
        </button>
      </div>
    </div>
  );
}

export default SignUp;
