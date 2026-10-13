import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import { BASE_URL } from "../Config/Base-url";
import logo from "../../public/assets/images/secure-circuit-logo.png";
import toast from "react-hot-toast";
import "../Users/Login.css";
import SEO from "../../Seo";
import { seoConfig } from "../Config/seoConfig";

function Login() {
  // Tabs State: 'login' | 'register' | 'forgot'
  const [activeTab, setActiveTab] = useState("login");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // CAPTCHA States & Ref
  const [captchaToken, setCaptchaToken] = useState(null);
  const [isVerifyingCaptcha, setIsVerifyingCaptcha] = useState(false);
  const recaptchaRef = useRef(null);

  // =========================================================
  // AUTO REDIRECTION IF ALREADY LOGGED IN
  // =========================================================
  useEffect(() => {
    const savedCustomer = localStorage.getItem("customer");

    if (!savedCustomer) {
      return;
    }

    try {
      const customerData = JSON.parse(savedCustomer);

      if (!customerData?.cust_id) {
        return;
      }

      // Profile is not completed
      if (Number(customerData.cust_profile_update) === 0) {
        navigate("/customer/profile", {
          replace: true,
        });

        return;
      }

      // Profile is completed
      navigate("/customer/dashboard", {
        replace: true,
      });

    } catch (error) {
      console.error("Invalid customer data:", error);

      localStorage.removeItem("customer");
    }
  }, [navigate]);

  // =========================================================
  // COMBINED FORM STATES
  // =========================================================
  const [formData, setFormData] = useState({
    cust_contact_person: "",
    cust_email: "",
    cust_mobile: "",
    cust_password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================================================
  // HELPER FOR PENDING CART ORDER
  // =========================================================
  const handlePendingOrderInsertion = async (custData) => {
    const pendingCartIds = localStorage.getItem(
      "pending_order_cart_ids"
    );

    const customerId = custData?.cust_id || custData?.id;

    if (pendingCartIds && customerId) {
      try {
        const payload = {
          order_cust_id: customerId,
          order_cart_id: pendingCartIds,
          order_stage: 2,
        };

        const response = await axios.post(
          `${BASE_URL}customer/insertmultiple/tbl_orders`,
          payload
        );

        if (response.data && response.data.status) {
          localStorage.removeItem("pending_order_cart_ids");

          toast.success("Order placed successfully!");
        }
      } catch (error) {
        console.error("Cart insertion error:", error);
      }
    }
  };

  // =========================================================
  // LOGIN
  // =========================================================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.cust_email || !formData.cust_password) {
      toast.error("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${BASE_URL}customer/login`,
        {
          login: formData.cust_email,
          cust_password: formData.cust_password,
        }
      );

      if (res.data.status) {
        const customerData = res.data.customer;

        // Save customer data
        localStorage.setItem(
          "customer",
          JSON.stringify(customerData)
        );

        // Pending cart/order handling
        await handlePendingOrderInsertion(customerData);

        // =====================================================
        // PROFILE COMPLETION CHECK
        // =====================================================

        if (Number(customerData.cust_profile_update) === 0) {
          toast.success("Please complete your profile first.");

          navigate("/customer/profile", {
            replace: true,
          });

          return;
        }

        // =====================================================
        // PROFILE ALREADY COMPLETED
        // =====================================================

        toast.success("Login Successful!");

        navigate("/customer/dashboard", {
          replace: true,
        });

      } else {

        // Email verification check
        if (res.data.is_unverified) {
          toast.error(res.data.message);

          navigate("/verify-email", {
            state: {
              email: res.data.email,
            },
          });

        } else {
          toast.error(
            res.data.message || "Invalid credentials."
          );
        }
      }

    } catch (err) {
      console.error(err);

      toast.error("Server connection failed.");

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CHECKBOX CLICK HANDLE
  // =========================================================
  const handleCheckboxClick = (e) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      setIsVerifyingCaptcha(true);

      setTimeout(() => {
        if (recaptchaRef.current) {
          recaptchaRef.current.execute();
        } else {
          setIsVerifyingCaptcha(false);
        }
      }, 100);

    } else {
      setCaptchaToken(null);

      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    }
  };

  // =========================================================
  // CAPTCHA SUCCESS CALLBACK
  // =========================================================
  const handleCaptchaVerify = (token) => {
    if (token) {
      setCaptchaToken(token);
      setIsVerifyingCaptcha(false);

      toast.success("Verified!");
    } else {
      setIsVerifyingCaptcha(false);
    }
  };

  // =========================================================
  // CAPTCHA ERROR CALLBACK
  // =========================================================
  const handleCaptchaError = () => {
    toast.error("CAPTCHA error. Please try again.");

    setIsVerifyingCaptcha(false);
  };

  // =========================================================
  // CAPTCHA EXPIRED CALLBACK
  // =========================================================
  const handleCaptchaExpired = () => {
    setCaptchaToken(null);
    setIsVerifyingCaptcha(false);
  };

  // =========================================================
  // REGISTER
  // =========================================================
  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !formData.cust_contact_person ||
      !formData.cust_email ||
      !formData.cust_password
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (!captchaToken) {
      toast.error("Please verify that you are not a robot.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${BASE_URL}customer/register`,
        {
          ...formData,
          captcha_token: captchaToken,
        }
      );

      if (res.data.status) {
        toast.success(
          "Account created! Please verify your email."
        );

        navigate("/verify-email", {
          state: {
            email: formData.cust_email,
          },
        });

      } else {
        toast.error(
          res.data.message || "Registration failed."
        );
      }

    } catch (err) {
      console.error(err);

      toast.error("Registration failed.");

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FORGOT PASSWORD
  // =========================================================
  const handleForgot = async (e) => {
    e.preventDefault();

    if (!formData.cust_email) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${BASE_URL}customer/forgot-password`,
        {
          cust_email: formData.cust_email,
        }
      );

      if (res.data.status) {
        toast.success(
          res.data.message || "Reset link sent!"
        );

        setActiveTab("login");

      } else {
        toast.error(
          res.data.message || "Email not registered."
        );
      }

    } catch (err) {
      console.error(err);

      toast.error("Something wrong.");

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
     <SEO
    title={seoConfig.user_login.title}
    description={seoConfig.user_login.description}
  />
      <div className="px-auth-wrapper">

        <div className="px-auth-card">

          {/* Header Branding */}
          <div className="px-auth-brand">

            <p className="px-auth-desc">
              {activeTab === "login" &&
                "Access your account and manage orders"}

              {activeTab === "register" &&
                "Join us to simplify your PCB ordering"}

              {activeTab === "forgot" &&
                "Recover your account credentials"}
            </p>

          </div>

          {/* Top Tab Bar Switcher */}
          <div className="px-tab-bar">

            <button
              type="button"
              className={`px-tab-btn ${activeTab === "login" ? "active" : ""
                }`}
              onClick={() => setActiveTab("login")}
            >
              SIGN IN
            </button>

            <button
              type="button"
              className={`px-tab-btn ${activeTab === "register" ? "active" : ""
                }`}
              onClick={() => setActiveTab("register")}
            >
              REGISTER
            </button>

          </div>

          {/* Dynamic Forms Container */}
          <div
            className="px-form-fade"
            key={activeTab}
          >

            {/* =================================================
                LOGIN FORM
            ================================================= */}

            {activeTab === "login" && (
              <form onSubmit={handleLogin}>

                <div className="px-field-group">

                  <label>
                    EMAIL ID / MOBILE NUMBER
                  </label>

                  <input
                    type="text"
                    name="cust_email"
                    placeholder="name@domain.com / 9876543210"
                    value={formData.cust_email}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="px-field-group">

                  <label>
                    PASSWORD
                  </label>

                  <input
                    type="password"
                    name="cust_password"
                    placeholder="••••••••"
                    value={formData.cust_password}
                    onChange={handleChange}
                    required
                  />

                </div>

                <button
                  type="submit"
                  className="px-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="px-spinner"></span>
                      LOGGING IN...
                    </>
                  ) : (
                    "LOG IN"
                  )}
                </button>

                <div className="text-center">

                  <button
                    type="button"
                    className="px-action-link"
                    onClick={() => setActiveTab("forgot")}
                  >
                    Forgot Password?
                  </button>

                </div>

              </form>
            )}

            {/* =================================================
                REGISTER FORM
            ================================================= */}

            {activeTab === "register" && (
              <form onSubmit={handleRegister}>

                <div className="px-field-group">

                  <label>
                    FULL NAME
                  </label>

                  <input
                    type="text"
                    name="cust_contact_person"
                    placeholder="John Doe"
                    value={formData.cust_contact_person}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="px-field-group">

                  <label>
                    PHONE NUMBER
                  </label>

                  <input
                    type="tel"
                    name="cust_mobile"
                    maxLength="10"
                    minLength="10"
                    placeholder="+91 9876543210"
                    value={formData.cust_mobile}
                    onChange={handleChange}
                  />

                </div>

                <div className="px-field-group">

                  <label>
                    EMAIL
                  </label>

                  <input
                    type="email"
                    name="cust_email"
                    placeholder="name@domain.com"
                    value={formData.cust_email}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="px-field-group">

                  <label>
                    PASSWORD
                  </label>

                  <input
                    type="password"
                    name="cust_password"
                    placeholder="••••••••"
                    value={formData.cust_password}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div
                  className="px-field-group"
                  style={{ marginTop: "15px" }}
                >

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >

                    <label
                      htmlFor="robotCheckbox"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        margin: 0,
                        color: "#d93025",
                        userSelect: "none",
                      }}
                    >

                      {/* Hidden Native Checkbox */}
                      <input
                        type="checkbox"
                        id="robotCheckbox"
                        checked={!!captchaToken}
                        onChange={handleCheckboxClick}
                        disabled={isVerifyingCaptcha}
                        style={{ display: "none" }}
                      />

                      {/* Custom UI Box */}
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #ccc",
                          borderRadius: "3px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow:
                            "0 1px 3px rgba(0,0,0,0.1)",
                          fontSize: "16px",
                          fontWeight: "bold",
                          color: "#25ce03",
                        }}
                      >
                        {!!captchaToken && "✓"}
                      </span>

                      {isVerifyingCaptcha
                        ? "Verifying..."
                        : "I am not a robot"}

                    </label>

                  </div>

                  {/* Hidden Google reCAPTCHA Component */}
                  <div style={{ display: "none" }}>

                    <ReCAPTCHA
                      ref={recaptchaRef}
                      size="invisible"
                      sitekey="6LfZfG0tAAAAAAUZRaOz0hCHN4UF0xabjk9hX-n8"
                      onChange={handleCaptchaVerify}
                      onErrored={handleCaptchaError}
                      onExpired={handleCaptchaExpired}
                    />

                  </div>

                </div>

                <button
                  type="submit"
                  className="px-submit-btn"
                  disabled={
                    loading || isVerifyingCaptcha
                  }
                >
                  {loading ? (
                    <>
                      <span className="px-spinner"></span>
                      CREATING...
                    </>
                  ) : (
                    "CREATE ACCOUNT"
                  )}
                </button>

              </form>
            )}

            {/* =================================================
                FORGOT PASSWORD FORM
            ================================================= */}

            {activeTab === "forgot" && (
              <form onSubmit={handleForgot}>

                <div className="px-field-group">

                  <label>
                    REGISTERED EMAIL
                  </label>

                  <input
                    type="email"
                    name="cust_email"
                    placeholder="name@domain.com"
                    value={formData.cust_email}
                    onChange={handleChange}
                    required
                  />

                </div>

                <button
                  type="submit"
                  className="px-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="px-spinner"></span>
                      SENDING...
                    </>
                  ) : (
                    "SEND RESET LINK"
                  )}
                </button>

                <div className="text-center">

                  <button
                    type="button"
                    className="px-action-link"
                    onClick={() => setActiveTab("login")}
                  >
                    Back to Sign In
                  </button>

                </div>

              </form>
            )}

          </div>

        </div>

      </div>
    </>
  );
}

export default Login;