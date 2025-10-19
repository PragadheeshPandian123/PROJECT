import { NavLink, Routes, Route } from "react-router-dom";
import ShowUsers from "./ShowUsers";
import AddUser from "./AddUser";
import AddVenue from "./AddVenue";
import ViewVenues from "./Organizer/ViewVenues"
import "./AdminDashboard.css";

function AdminDashboard() {
  return (
    <div className="admin-wrapper">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Admin Panel</h2>
        <NavLink to="/admin-dashboard/show-users">Show Users</NavLink>
        <NavLink to="/admin-dashboard/add-user">Add User</NavLink>
        <NavLink to="/admin-dashboard/add-venue">Add Venue</NavLink>
        <NavLink to="/admin-dashboard/view-venue">View Venue</NavLink>
      </div>

      {/* Right content */}
      <div className="content">
        <Routes>
          <Route path="show-users" element={<ShowUsers />} />
          <Route path="add-user" element={<AddUser />} />
          <Route path="add-user/:id" element={<AddUser />} />
          <Route path="add-venue" element={<AddVenue />} />
          <Route path="view-venue" element={<ViewVenues/>}></Route>
        </Routes>
      </div>
    </div>
  );
}

export default AdminDashboard;
