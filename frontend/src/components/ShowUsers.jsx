import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ShowUsers = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:5000/api/users");
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const res = await fetch(`http://localhost:5000/api/users/${id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (result.success) {
      setUsers(users.filter((u) => u._id !== id));
    } else {
      alert(result.message);
    }
  };

  return (
    <table border="1" className="users-table">
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
        {users.map((user) => (
          <tr key={user._id}>
            <td>{user.reg_no}</td>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>{user.department}</td>
            <td>{user.year}</td>
            <td>{user.created_at}</td>
            <td>
              <button onClick={() => navigate(`/admin-dashboard/add-user/${user._id}`)}>Edit</button>
              <button onClick={() => deleteUser(user._id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ShowUsers;
