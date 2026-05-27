
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleVerify = () => {
    if (otp !== "1234") {
      alert("Invalid OTP");
      return;
    }

    const mobile = localStorage.getItem("mobile");

    let role = "";

    if (mobile === "9999999999") {
      role = "admin";
    } else if (mobile.endsWith("1")) {
      role = "supplier";
    } else {
      role = "vendor";
    }

    login({
      mobile,
      role,
    });

    navigate(`/${role}/dashboard`);
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

        <p style={{ marginTop: "15px", textAlign: "center" }}>
          Demo OTP: 1234
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;
