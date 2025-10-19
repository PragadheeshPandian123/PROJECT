import { NavLink, Routes, Route } from "react-router-dom";
import ShowUsers from "./ShowUsers";
import AddUser from "./AddUser";
import AddVenue from "./AddVenue";
import ViewVenues from "./Organizer/ViewVenues";
import ProfileLogo from "./ProfileLogo";
import SignOutButton from "./SignOutButton";
import "./AdminDashboard.css";

function AdminDashboard() {
  return (
    <div className="admin-wrapper">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <ProfileLogo />
        <ul>
          <li>
            <NavLink to="/admin-dashboard/show-users">Show Users</NavLink>
          </li>
          <li>
            <NavLink to="/admin-dashboard/add-user">Add User</NavLink>
          </li>
          <li>
            <NavLink to="/admin-dashboard/add-venue">Add Venue</NavLink>
          </li>
          <li>
            <NavLink to="/admin-dashboard/view-venue">View Venues</NavLink>
          </li>
        </ul>
        <SignOutButton />
      </div>

      {/* Right content */}
      <div className="admin-content">
        <Routes>
          <Route path="show-users" element={<ShowUsers />} />
          <Route path="add-user" element={<AddUser />} />
          <Route path="add-user/:id" element={<AddUser />} />
          <Route path="add-venue" element={<AddVenue />} />
          <Route path="view-venue" element={<ViewVenues />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminDashboard;