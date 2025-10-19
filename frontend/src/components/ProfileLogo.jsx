import React from "react";

const ProfileLogo = () => {
  // Retrieve name and role from localStorage
  let name = localStorage.getItem("name") || "Organizer";
  let role = localStorage.getItem("role") || "Role";
  role=(role==='organizer')?`Event Organizer`:role;
  return (
    <div className="profile-logo">
      <div className="avatar">{name.charAt(0).toUpperCase()}</div>
      <div className="profile-info">
        <span className="profile-name">{name}</span>
        <span className="profile-role">{role}</span>
      </div>
    </div>
  );
};

export default ProfileLogo;
