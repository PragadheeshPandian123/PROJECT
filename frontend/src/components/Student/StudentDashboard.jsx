import { Link, Routes, Route, Navigate } from "react-router-dom";
import MyRegisteredEvents from "./MyRegisteredEvents";
import AllEvents from "./AllEvents";
import ViewVenues from "./ViewVenues";
import ProfileLogo from "../ProfileLogo";
import SignOutButton from "../SignOutButton";
import EditProfile from "./EditProfile";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  return (
    <div className="student-dashboard">
      <nav className="student-sidebar">
        <ProfileLogo />
        <ul>
          <li>
            <Link to="/student-dashboard/my-events">My Events</Link>
          </li>
          <li>
            <Link to="/student-dashboard/all-events">All Events</Link>
          </li>
          <li>
            <Link to="/student-dashboard/venues">View Venues</Link>
          </li>
        </ul>
        <SignOutButton />
      </nav>

      <div className="student-content">
        <Routes>
          <Route path="/" element={<Navigate to="my-events" />} />
          <Route path="my-events" element={<MyRegisteredEvents />} />
          <Route path="all-events" element={<AllEvents />} />
          <Route path="venues" element={<ViewVenues />} />
          <Route path="edit-profile" element={<EditProfile />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;