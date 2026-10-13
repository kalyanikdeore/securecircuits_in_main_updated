import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import logo from "../../public/assets/images/secure-circuit-logo.png";
import toast from "react-hot-toast";

function Login() {

  const admin = JSON.parse(localStorage.getItem("admin"));
  const navigate = useNavigate();

  useEffect(() => {
    if (admin) {
      navigate("/dashboard");
      return;
    }
  }, []);


  const [formData, setFormData] = useState({
    staff_email: "",
    staff_password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.staff_email || !formData.staff_password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${BASE_URL}backend`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.status) {
        localStorage.setItem("admin", JSON.stringify(response.data.staff));

        window.location.href = "/dashboard";
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error("Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-bg-circles d-none d-lg-block">
        <span className="admin-login-circle1"></span>
        <span className="admin-login-circle2"></span>
        <span className="admin-login-circle3"></span>
        <span className="admin-login-circle4"></span>
      </div>

      <div className="admin-login-box">
        <img src={logo} alt="Logo" className="admin-login-logo" />

        <p className="admin-login-subtitle">Secure access to the Admin Dashboard.</p>

        <form onSubmit={handleSubmit}>
          <div className="admin-login-input-box">
            <label>Email</label>
            <input
              type="email"
              name="staff_email"
              value={formData.staff_email}
              onChange={handleChange}
            />
          </div>

          <div className="admin-login-input-box">
            <label>Password</label>
            <input
              type="password"
              name="staff_password"
              value={formData.staff_password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="admin-login-spinner"></span>
                Logging In...
              </>
            ) : (
              "SIGN IN"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
