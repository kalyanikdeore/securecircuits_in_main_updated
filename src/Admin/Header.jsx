import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import defaultProfile from "../../public/assets/images/defaultProfile.jpeg";
import { Link } from "react-router-dom";
import { BASE_URL } from "../Config/Base-url";
import axios from "axios";

function Header() {
  const [staff, setStaff] = useState(null);
  const navigate = useNavigate();
  const [profile, setProfile] = useState();

  const adminData = localStorage.getItem("admin");
  const admin = adminData ? JSON.parse(adminData) : null;
  const AdminId = admin?.staff_id;

  useEffect(() => {
    if (!adminData) {
      navigate("/backend");
      return;
    }

    if (adminData && adminData !== "undefined") {
      setStaff(JSON.parse(adminData));
    }

    // Always keep Light Mode
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.setAttribute("data-bs-theme", "light");
    localStorage.setItem("theme", "light");

    getProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/backend");
  };

  const getProfile = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}admin/getdatawhere/tbl_staff/staff_id/${AdminId}`
      );

      if (res.data.status) {
        setProfile(res.data.data[0]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <nav className="navbar admin-navbar navbar-expand bg-white">
        <div className="container-fluid px-3 px-lg-4">

          {/* <button
            className="sidebar-toggle"
            type="button"
            onClick={() => {
              document.body.classList.toggle("sidebar-mini");
            }}
          >
            <i className="bi bi-list"></i>
          </button> */}
                  <button
  className="sidebar-toggle"
  type="button"
  onClick={() => {
    if (window.innerWidth <= 991) {
      // Mobile
      document.body.classList.toggle("mobile-sidebar-open");
    } else {
      // Desktop
      document.body.classList.toggle("sidebar-mini");
    }
  }}
>
  <i className="bi bi-list"></i>
</button>

          <div className="navbar-actions ms-auto">

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

            {/* Profile */}
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
                    staff?.staff_image
                      ? `${BASE_URL}public/Uploads/${staff.staff_image}`
                      : defaultProfile
                  }
                  alt={staff?.staff_name || "Profile"}
                />

                <div className="d-flex flex-column text-center ms-2">
                  <span className="profile-name d-none d-sm-inline">
                    {staff?.staff_name?.slice(0, 10)}
                  </span>

                  <span
                    style={{
                      fontSize: "13px",
                      marginTop: "-5px",
                    }}
                  >
                    {profile?.role_name}
                  </span>
                </div>
              </button>

              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to="/profile">
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