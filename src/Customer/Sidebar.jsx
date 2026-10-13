import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";

import logoLight from "../../public/assets/images/logo-light.png";
import logoDark from "../../public/assets/images/logo-dark.png";

import logoTextLight from "../../public/assets/images/dash-text-light.png";
import logoTextDark from "../../public/assets/images/dash-text-dark.png";

function Sidebar() {
  const customer = JSON.parse(localStorage.getItem("customer"));
  const CustId = customer?.cust_id;
  const menuAccess = customer?.cust_menu || [];

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [counts, setCounts] = useState({
    orders: 0,
    quotations: 0,
    dispatches: 0,
  });

  useEffect(() => {
    const updateTheme = () => {
      setTheme(localStorage.getItem("theme") || "light");
    };

    window.addEventListener("themeChanged", updateTheme);

    return () => {
      window.removeEventListener("themeChanged", updateTheme);
    };
  }, []);

  useEffect(() => {
    getCounts();
    getMenus();
  }, []);

  const getMenus = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${BASE_URL}customer/getdata/tbl_menus`);

      if (response.data.status) {
        setMenus(response.data.data);
      }
    } catch (error) {
      console.log("Menu Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };


  const getCounts = async () => {
    try {
      const [orderRes, quotationRes] = await Promise.all([
        axios.get(
          `${BASE_URL}customer/getCountWhereData/tbl_orders/order_cust_id/${CustId}`
        ),

        axios.get(
          `${BASE_URL}customer/checkwhere/tbl_orders`,
          {
            params: {
              order_cust_id: CustId,
              order_stage: "6"
            }
          }
        ),
      ]);

      setCounts({
        orders: orderRes?.data?.count || 0,
        quotations: quotationRes?.data?.data ? quotationRes.data.data.length : (quotationRes?.data?.count || 0),
        dispatches: 0,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getCardCount = (route) => {
    switch (route) {
      case "orders":
        return counts.orders;

      case "quotations":
        return counts.quotations;

      case "dispatches":
        return counts.dispatches;

      default:
        return 0;
    }
  };


  return (
    <>
      {/* <div className="sidebar-backdrop" data-sidebar-close></div> */}
     <div
  className="sidebar-backdrop"
  onClick={() => {
    document.body.classList.remove("mobile-sidebar-open");
  }}
></div>
       <aside
        className="admin-sidebar"
        id="adminSidebar"
        aria-label="Main navigation"
      >
          {/* Mobile Close Button */}
    <button
    type="button"
    className="mobile-sidebar-close"
    onClick={() => {
      document.body.classList.remove("mobile-sidebar-open");
    }}
  >
    <i className="bi bi-x-lg"></i>
  </button>
        <div className="sidebar-header">
          <Link className="brand-mark" to="/customer/dashboard">
            <span>
              <img
                src={theme === "dark" ? logoDark : logoLight}
                alt="Logo"
                style={{ width: "50px" }}
              />
            </span>

            <span className="brand-copy text-center">
              <img
                src={theme === "dark" ? logoTextDark : logoTextLight}
                alt="Logo Text"
                style={{ width: "70px" }}
              />
            </span>

          </Link>
        </div>

        <nav className="sidebar-nav">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div className="sidebar-skeleton" key={index}>
                <div className="sidebar-skeleton-icon"></div>
                <div className="sidebar-skeleton-text"></div>
                <div className="sidebar-skeleton-count"></div>
              </div>
            ))
          ) : (menus
            .filter((menu) => {
              if (menu.menu_status != 1) return false;

              return menuAccess.includes(String(menu.menu_id));
            })
            .sort((a, b) => Number(a.menu_order) - Number(b.menu_order))
            .map((menu) => (
              // <NavLink
              //   key={menu.menu_id}
              //   to={`/customer/${menu.menu_routes}`}
              //   className={({ isActive }) =>
              //     isActive ? "nav-link active-success" : "nav-link"
              //   }
              // >
               <NavLink
  key={menu.menu_id}
  to={`/customer/${menu.menu_routes}`}
  onClick={() => {
    if (window.innerWidth <= 991) {
      document.body.classList.remove("mobile-sidebar-open");
    }
  }}
  className={({ isActive }) =>
    isActive ? "nav-link active-success" : "nav-link"
  }
>
                <span className="nav-icon text-success">
                  <i className={menu.menu_icon}></i>
                </span>

                <span className="nav-text">{menu.menu_name}</span>

                {menu.menu_routes === "dashboard" ? (
                  <span className="ms-auto dashboard-arrow">
                    <i className="fa-solid fa-chevron-right"></i>
                  </span>
                ) : (
                  <span className="ms-auto badge rounded-pill bg-success">
                    {getCardCount(menu.menu_routes)}
                  </span>
                )}
              </NavLink>
            ))
          )}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
