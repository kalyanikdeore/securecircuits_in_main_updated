import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import defaultProfile from "../../public/assets/images/defaultProfile.jpeg";
import { Link } from "react-router-dom";
import { BASE_URL } from "../Config/Base-url";

function Header() {
  const [cust, setCustomer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const customerData = localStorage.getItem("customer");

    if (!customerData) {
      navigate("/customer/login");
      return;
    }

    if (customerData && customerData !== "undefined") {
      setCustomer(JSON.parse(customerData));
    }

    // Always keep Light Mode
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.setAttribute("data-bs-theme", "light");
    localStorage.setItem("theme", "light");
  }, []);

  // const handleLogout = () => {
  //   localStorage.removeItem("customer");
  //   navigate("/");
  // };
    const handleLogout = () => {
    localStorage.removeItem("customer");
    navigate("/");
  };

  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";

    setTheme(newTheme);

    document.documentElement.setAttribute("data-theme", newTheme);
    document.documentElement.setAttribute("data-bs-theme", newTheme);

    localStorage.setItem("theme", newTheme);

    window.dispatchEvent(new Event("themeChanged"));
  };

  return (
    <>
      <nav className="navbar admin-navbar navbar-expand bg-white">
        <div className="container-fluid px-3 px-lg-4">

                       <button
  className="sidebar-toggle"
  type="button"
  onClick={() => {
    if (window.innerWidth <= 991) {
      document.body.classList.toggle("mobile-sidebar-open");
    } else {
      document.body.classList.toggle("sidebar-mini");
    }
  }}
>
  <i className="bi bi-list"></i>
</button>
          <div className="navbar-actions ms-auto">
 <button
              className="icon-button theme-toggle"
              type="button"
              onClick={toggleTheme}
            >
              <i
                className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon-stars"
                  }`}
              ></i>
            </button>
            {/* Notifications */}
            <div className="dropdown">
              <button
                className="icon-button"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                aria-label="Notifications"
              >
                <span className="notification-dot"></span>
                <i className="bi bi-bell" aria-hidden="true"></i>
              </button>

              <div className="dropdown-menu dropdown-menu-end notification-menu">
                <div className="dropdown-header fw-bold text-body">
                  Notifications
                </div>

                <a className="dropdown-item" href="users.html">
                  <span className="notification-title">
                    New user registered
                  </span>
                  <span className="notification-time">
                    4 minutes ago
                  </span>
                </a>

                <a className="dropdown-item" href="charts.html">
                  <span className="notification-title">
                    Revenue target reached
                  </span>
                  <span className="notification-time">
                    32 minutes ago
                  </span>
                </a>

                <a className="dropdown-item" href="settings.html">
                  <span className="notification-title">
                    Security review completed
                  </span>
                  <span className="notification-time">
                    1 hour ago
                  </span>
                </a>
              </div>
            </div>

            {/* Customer Profile */}
            <div className="dropdown">
              <button
                className="profile-button dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <img
                  className="avatar-img avatar-sm"
                  src={
                    cust?.cust_image
                      ? `${BASE_URL}public/Uploads/${cust.cust_image}`
                      : defaultProfile
                  }
                  alt={cust?.cust_contact_person || "Customer"}
                />

                <div className="d-flex flex-column text-center ms-2">
                  <span className="profile-name d-none d-sm-inline">
                    {cust?.cust_contact_person
                      ? cust.cust_contact_person
                        .trim()
                        .split(" ")[0]
                        .charAt(0)
                        .toUpperCase() +
                      cust.cust_contact_person
                        .trim()
                        .split(" ")[0]
                        .slice(1)
                        .toLowerCase()
                      : "User"}
                  </span>

                  <span
                    style={{
                      fontSize: "13px",
                      marginTop: "-5px",
                    }}
                  >
                    {cust?.role_name ? cust.role_name : "Customer"}
                  </span>
                </div>
              </button>

              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link
                    className="dropdown-item"
                    to="/customer/profile"
                  >
                    Profile
                  </Link>
                </li>

                <li>
                  <hr className="dropdown-divider" />
                </li>

                <li>
                  <button
                    className="dropdown-item"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </nav>
    </>
  );
}

export default Header;