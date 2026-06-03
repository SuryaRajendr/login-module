
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginWithMobile } from "../../services/authApi";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleVerify = async () => {
    if (otp !== "1234") {
      alert("Invalid OTP");
      return;
    }

    const mobile = localStorage.getItem("mobile");
    if (!mobile) {
      navigate("/login");
      return;
    }

    try {
      setStatus("Logging in...");
      const user = await loginWithMobile(mobile);

      login(user);
      localStorage.removeItem("mobile");
      navigate(user.redirectTo || `/${user.role}/dashboard`);
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h2>Verify OTP</h2>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button onClick={handleVerify}>
          Verify OTP
        </button>

        {status && <p className="auth-status">{status}</p>}

        <p style={{ marginTop: "15px", textAlign: "center" }}>
          Demo OTP: 1234
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;
