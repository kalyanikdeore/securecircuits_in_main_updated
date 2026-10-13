import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import logo from "../../public/assets/images/secure-circuit-logo.png";
import toast from "react-hot-toast";

function Login() {
  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();
  const supplier = JSON.parse(localStorage.getItem("supplier"));

  useEffect(() => {

    if (supplier) {
      navigate("/user-auth/dashboard");
      return;
    }

  }, []);

  const [formData, setFormData] = useState({
    supp_email: "",
    supp_password: "",
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

    if (!formData.supp_email || !formData.supp_password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${BASE_URL}supplier/login`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.status) {
        localStorage.setItem("supplier", JSON.stringify(response.data.supplier));

        window.location.href = "/user-auth/dashboard";
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error("Login Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!formData.supp_email) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${BASE_URL}supplier/forgot-password`,
        {
          supp_email: formData.supp_email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status) {
        toast.success(response.data.message);
        setShowForgot(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper-blue">
      <div className="admin-login-bg-circles-blue d-none d-lg-block">
        <span className="admin-login-circle1-blue"></span>
        <span className="admin-login-circle2-blue"></span>
        <span className="admin-login-circle3-blue"></span>
        <span className="admin-login-circle4-blue"></span>
      </div>

      <div className="admin-login-box-blue">
        <img src={logo} alt="Logo" className="admin-login-logo-blue" />

        <p className="admin-login-subtitle-blue">Sign in to your supplier account.</p>

        <div className="login-form-container">
          <form
            onSubmit={handleSubmit}
            className={`login-form ${showForgot ? "hide-form" : "show-form"}`}
          >
            <div className="admin-login-input-box-blue">
              <label>Email</label>
              <input
                type="email"
                name="supp_email"
                value={formData.supp_email}
                onChange={handleChange}
              />
            </div>

            <div className="admin-login-input-box-blue">
              <label>Password</label>
              <input
                type="password"
                name="supp_password"
                value={formData.supp_password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="admin-login-btn-blue"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="admin-login-spinner-blue"></span>
                  Logging In...
                </>
              ) : (
                "SIGN IN"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                className="admin-login-forgot-btn text-primary"
                onClick={() => setShowForgot(true)}
              >
                Forgot Password?
              </button>
            </div>
          </form>

          {/* FORGOT PASSWORD */}

          <form
            onSubmit={handleForgotPassword}
            className={`forgot-form ${showForgot ? "show-form" : "hide-form"}`}
          >
            <div className="admin-login-input-box-blue">
              <label>Email</label>
              <input
                type="email"
                value={formData.cust_email}
                onChange={handleChange}
                name="supp_email"
              />
            </div>

            <button
              type="submit"
              className="admin-login-btn-blue"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="admin-login-spinner-blue"></span>
                  Sending...
                </>
              ) : (
                "SEND RESET LINK"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                className="admin-login-forgot-btn text-primary"
                onClick={() => setShowForgot(false)}
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
