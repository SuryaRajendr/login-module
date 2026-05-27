
import { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    location: "",
    businessName: "",
    businessType: "supplier",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("Registration Successful");
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
            onChange={handleChange}
          />

          <input
            type="text"
            name="mobile"
            placeholder="Mobile Number"
            onChange={handleChange}
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            onChange={handleChange}
          />

          <input
            type="text"
            name="businessName"
            placeholder="Business Name"
            onChange={handleChange}
          />

          <select
            name="businessType"
            onChange={handleChange}
          >
            <option value="supplier">Supplier</option>
            <option value="vendor">Vendor</option>
          </select>

          <button type="submit">
            Register
          </button>
        </form>

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
