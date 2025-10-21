import React from "react";
import { useNavigate } from "react-router-dom";

const ProfileLogo = () => {
  const navigate = useNavigate();
  let name = localStorage.getItem("name") || "User";
  let role = localStorage.getItem("role") || "Role";
  role = (role === 'organizer') ? `Event Organizer` : role.charAt(0).toUpperCase() + role.slice(1);
  
  const handleProfileClick = () => {
    if (role.toLowerCase().includes('student')) {
      navigate("/student-dashboard/edit-profile");
    } else if (role.toLowerCase().includes('organizer')) {
      navigate("/organizer-dashboard/edit-profile");
    }
  };

  return (
    <div className="profile-logo" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
      <div className="avatar">{name.charAt(0).toUpperCase()}</div>
      <div className="profile-info">
        <span className="profile-name">{name}</span>
        <span className="profile-role">{role}</span>
      </div>
    </div>
  );
};

export default ProfileLogo;