import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import "./ShowUsers.css";

const ShowUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterRole, users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let result = users;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.reg_no.toString().includes(searchTerm)
      );
    }

    // Filter by role
    if (filterRole !== "all") {
      result = result.filter((user) => user.role === filterRole);
    }

    setFilteredUsers(result);
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        setUsers(users.filter((u) => u._id !== id));
        alert("User deleted successfully");
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error deleting user");
    }
  };

  return (
    <div className="users-container">
      <h2>Manage Users</h2>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, email, or reg no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="organizer">Organizer</option>
          <option value="student">Student</option>
        </select>

        <button onClick={fetchUsers} className="refresh-btn">
          ↻ Refresh
        </button>
      </div>

      {/* Results Info */}
      <div className="results-info">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {loading ? (
        <Loading message="Loading users..." />
      ) : filteredUsers.length === 0 ? (
        <div className="no-results">
          <p>No users found matching your criteria.</p>
        </div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Reg No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Year</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.reg_no}</td>
                  <td className="name-cell">{user.name}</td>
                  <td className="email-cell">{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.department}</td>
                  <td>{user.year}</td>
                  <td className="date-cell">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="actions-cell">
                    <button
                      className="edit-btn"
                      onClick={() =>
                        navigate(`/admin-dashboard/add-user/${user._id}`)
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ShowUsers;