import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../Config/Base-url";
import logo from "../../public/assets/images/secure-circuit-logo.png";

function Resetpass() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [tokenMessage, setTokenMessage] = useState("");


  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}customer/check-reset-token?email=${email}&token=${token}`
      );

      if (!res.data.status) {
        setTokenValid(false);
        setTokenMessage(res.data.message);
      }
    } catch (err) {
      setTokenValid(false);
      setTokenMessage("This reset link has expired or is invalid.");
    }
  };

  const [formData, setFormData] = useState({
    password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password || !formData.confirm_password) {
      toast.error("Please fill all fields");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${BASE_URL}customer/reset-password`,
        {
          email,
          token,
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.status) {
        toast.success(res.data.message);

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper-blue">
      {/* <div className="admin-login-bg-circles-blue d-none d-lg-block">
        <span className="admin-login-circle1-blue"></span>
        <span className="admin-login-circle2-blue"></span>
        <span className="admin-login-circle3-blue"></span>
        <span className="admin-login-circle4-blue"></span>
      </div> */}

      <div className="admin-login-box-blue">
        <img src={logo} alt="Logo" className="admin-login-logo-blue" />

        <p className="admin-login-subtitle-blue">
          Reset your account password.
        </p>

        {tokenValid ? (
          <form onSubmit={handleSubmit}>
            <div className="admin-login-input-box-blue">
              <label>New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="admin-login-input-box-blue">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="admin-login-btn-blue"
              disabled={loading}
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        ) : (
          <div className="text-center mt-4">
            <h5 className="text-danger mb-3">
              This reset link has expired or has already been used.
            </h5>

            <button
              className="admin-login-btn-blue"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Resetpass;