import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserAlt, FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import { useSnackbar } from "notistack";

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
        enqueueSnackbar("Logged In successfully!", { variant: "success" ,style: {
    backgroundColor: "#6f42c1", 
    color: "#fff",               
  },});
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-lg" style={{ width: "28rem", borderRadius: "1rem" }}>
        <h3 className="text-center text-dark mb-4 d-flex align-items-center justify-content-center gap-2">
          <FaSignInAlt className="text-primary" /> <span className="text-primary" >Sign In</span>
        </h3>

        <div className="mb-3">
          <label className="form-label">
            <FaUserAlt className="me-2 text-primary" />
            Registration Number
          </label>
          <input
            type="number"
            className="form-control"
            placeholder="Enter registration number"
            value={reg_no}
            onChange={(e) => setReg_no(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            <FaEnvelope className="me-2 text-primary" />
            Email
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">
            <FaLock className="me-2 text-primary" />
            Password
          </label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-danger mb-3 text-center">{error}</p>}

        <button className="btn btn-primary w-100 mb-3 d-flex align-items-center justify-content-center gap-2" onClick={handleLogin}>
          <FaSignInAlt /> Login
        </button>

        <p className="text-center">
          Don't have an account?{" "}
          <a href="/signup" className="text-decoration-none text-primary fw-bold">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
