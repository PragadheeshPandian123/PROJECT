import { Link, Routes, Route, Navigate } from "react-router-dom";
import MyEvents from "./MyEvents";
import AddEvents from "./AddEvents";
import ViewVenues from "./ViewVenues";
import ParticipantsTable from "./ParticipantsTable";
import RegisterEvent from "./RegisterEvent"; // ✅ Import the registration page
import ProfileLogo from "../ProfileLogo";
import SignOutButton from "../SignOutButton";
import "./OrganizerDashboard.css";

const OrganizerDashboard = () => {
  return (
    <div className="organizer-dashboard">
      {/* Left Sidebar */}
      <nav className="organizer-sidebar">
        <ProfileLogo /> {/* Profile */}
        <ul>
          <li>
            <Link to="/organizer-dashboard/myevents">My Events</Link>
          </li>
          <li>
            <Link to="/organizer-dashboard/add-event">Create Event</Link>
          </li>
          <li>
            <Link to="/organizer-dashboard/venues">View Venues</Link>
          </li>
        </ul>
        <SignOutButton /> {/* Sign Out */}
      </nav>

      {/* Right Content Area */}
      <div className="organizer-content">
        <Routes>
          <Route path="/" element={<Navigate to="myevents" />} />
          <Route path="myevents" element={<MyEvents />} />
          <Route path="add-event" element={<AddEvents />} />
          <Route path="add-event/:eventId" element={<AddEvents />} />
          <Route path="venues" element={<ViewVenues />} />
          <Route path="participants/:eventId" element={<ParticipantsTable />} />

          {/* ✅ Register form route INSIDE the organizer dashboard */}
          <Route path="register-event/:eventId" element={<RegisterEvent />} />
        </Routes>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
