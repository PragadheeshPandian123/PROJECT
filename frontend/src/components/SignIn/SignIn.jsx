import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserAlt, FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import { useSnackbar } from "notistack";
import "./SignIn.css";

function SignIn({ setRole }) {
  const navigate = useNavigate();
  const [reg_no, setReg_no] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reg_no, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("userId", data.user_id);
        localStorage.setItem("role", data.role);
        localStorage.setItem("name", data.name);
        setRole(data.role);
        navigate(`/${data.role}-dashboard`);
        enqueueSnackbar("Logged In successfully!", { 
          variant: "success",
          style: {
            backgroundColor: "#4caf50", 
            color: "#fff",               
          },
        });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="signin-container">
      {/* App Title */}
      <div className="app-title">
        <h1>Evently</h1>
        <p>College Event Management System</p>
      </div>

      {/* Sign In Card */}
      <div className="signin-card">
        <h3 className="signin-heading">
          <FaSignInAlt className="heading-icon" />
          Sign In
        </h3>

        <div className="form-group">
          <label className="form-label">
            <FaUserAlt className="label-icon" />
            Registration Number
          </label>
          <input
            type="number"
            className="form-input"
            placeholder="Enter registration number"
            value={reg_no}
            onChange={(e) => setReg_no(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <FaEnvelope className="label-icon" />
            Email
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <FaLock className="label-icon" />
            Password
          </label>
          <input
            type="password"
            className="form-input"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button className="signin-button" onClick={handleLogin}>
          <FaSignInAlt /> Login
        </button>

        <p className="signup-link">
          Don't have an account?{" "}
          <a href="/signup" className="link">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}

export default SignIn;