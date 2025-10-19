import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AddUser = () => {
  const { id } = useParams();           // get user id from URL for edit
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reg_no: "",
    name: "",
    email: "",
    role: "student",
    department: "CSE",
    year: "1st year",
    password: "",
  });

  // Fetch user data if editing
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/users/${id}`)
      .then(res => res.json())
      .then(data => {
        setFormData({
          reg_no: data.reg_no || "",
          name: data.name || "",
          email: data.email || "",
          role: data.role || "student",
          department: data.department || "CSE",
          year: data.year || "1st year",
          password: "", // empty password, only update if typed
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Omit password if empty during edit
    const payload = { ...formData };
    if (id && !payload.password) delete payload.password;

    const method = id ? "PUT" : "POST";
    const url = id
      ? `http://localhost:5000/api/users/${id}`
      : `http://localhost:5000/api/users`;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        alert(id ? "User Updated" : "User Added");
        navigate("/admin-dashboard/show-users"); // redirect to show users
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <h3>{id ? "Edit User" : "Add User"}</h3>

      <input
        type="text"
        placeholder="Reg No"
        value={formData.reg_no}
        onChange={(e) => setFormData({ ...formData, reg_no: e.target.value })}
        required
      /><br /><br />

      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      /><br /><br />

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      /><br /><br />

      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required={!id} // only required for new user
      /><br /><br />

      <select
        value={formData.role}
        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
      >
        <option value="student">Student</option>
        <option value="organizer">Event Organizer</option>
        <option value="admin">Admin</option>
      </select><br /><br />

      <select
        value={formData.department}
        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
      >
        <option value="CSE">CSE</option>
        <option value="IT">IT</option>
        <option value="AIDS">AIDS</option>
        <option value="ECE">ECE</option>
      </select><br /><br />

      <select
        value={formData.year}
        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
      >
        <option value="1st year">1st year</option>
        <option value="2nd year">2nd year</option>
        <option value="3rd year">3rd year</option>
        <option value="4th year">4th year</option>
      </select><br /><br />

      <button type="submit">{id ? "Update User" : "Add User"}</button>
    </form>
  );
};

export default AddUser;
