
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { registerUser } from "../../services/authApi";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    location: "",
    businessName: "",
    role: "Supplier",
    businessType: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.mobile.trim()) {
      setStatus("Please enter name and mobile number.");
      return;
    }

    try {
      setStatus("Creating account...");
      const user = await registerUser(formData);
      login(user);
      navigate(user.redirectTo || `/${user.role}/dashboard`);
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h2>Register</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="text"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
          />

          <input
            type="text"
            name="businessName"
            placeholder="Business Name"
            value={formData.businessName}
            onChange={handleChange}
          />

          <input
            type="text"
            name="businessType"
            placeholder="Business Type"
            value={formData.businessType}
            onChange={handleChange}
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="Supplier">Supplier</option>
            <option value="Vendor">Vendor</option>
          </select>

          <button type="submit">
            Register
          </button>
        </form>

        {status && <p className="auth-status">{status}</p>}

        <div className="link-text">
          <Link to="/login">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
