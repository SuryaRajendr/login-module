
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [mobile, setMobile] = useState("");
  const navigate = useNavigate();

  const handleSendOTP = () => {
    if (!mobile) {
      alert("Please enter mobile number");
      return;
    }

    localStorage.setItem("mobile", mobile);

    navigate("/verify-otp");
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h2>Login</h2>

        <input
          type="text"
          placeholder="Enter Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        <button onClick={handleSendOTP}>
          Send OTP
        </button>

        <div className="link-text">
          <Link to="/register">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
