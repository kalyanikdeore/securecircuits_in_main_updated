import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";

import logoLight from "../../public/assets/images/logo-light.png";
import logoDark from "../../public/assets/images/logo-dark.png";

import logoTextLight from "../../public/assets/images/dash-text-light.png";
import logoTextDark from "../../public/assets/images/dash-text-dark.png";

function Sidebar() {
  const supplier = JSON.parse(localStorage.getItem("supplier"));
  const SuppId = supplier?.supp_id;
  const menuAccess = supplier?.supp_menu || [];
  const isSupplier = supplier?.supp_role == 1;

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const [counts, setCounts] = useState({
    orders: 0,
    quotations: 0,
    approved: 0,
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
      const response = await axios.get(`${BASE_URL}supplier/getdata/tbl_menus`);

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
    if (!SuppId) return;

    try {
      const ordersResponse = await axios.get(
        `${BASE_URL}supplier/getSupplierOrders/${SuppId}`
      );

      const orders = ordersResponse.data.data || [];

      const supplierOrders = orders.filter((item) => {
        if (!item.order_transfer_supplier) return false;

        return item.order_transfer_supplier
          .split(",")
          .map((id) => id.trim())
          .includes(String(SuppId));
      });

      const quotationsResponse = await axios.get(
        `${BASE_URL}supplier/getdatawhere/tbl_supplier_quotes/sq_supp_id/${SuppId}`
      );

      const quotationData = quotationsResponse.data.status
        ? Array.isArray(quotationsResponse.data.data)
          ? quotationsResponse.data.data
          : [quotationsResponse.data.data]
        : [];

      const approvedResponse = await axios.get(
        `${BASE_URL}supplier/getdatawhere/tbl_orders/assigned_supplier/${SuppId}`
      );

      const approvedOrders = approvedResponse.data.status
        ? Array.isArray(approvedResponse.data.data)
          ? approvedResponse.data.data
          : [approvedResponse.data.data]
        : [];

      const approvedCount = approvedOrders.filter((item) => {
        const stage = Number(item.order_stage);

        return stage >= 8 && stage <= 12;
      }).length;

      setCounts({
        orders: supplierOrders.length,
        quotations: quotationData.length,
        approved: approvedCount,
        dispatches: 0,
      });
    } catch (error) {
      console.log("Count Fetch Error:", error);
    }
  };

  const getCardCount = (route) => {
    switch (route) {
      case "orders":
        return counts.orders;

      case "quotations":
        return counts.quotations;

      case "approved":
        return counts.approved;

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
  data-sidebar-close
  onClick={() => {
    document.body.classList.remove("mobile-sidebar-open");
  }}
></div>

      {/* <aside
        className="admin-sidebar"
        id="adminSidebar"
        aria-label="Main navigation"
      > */}
                <aside
  className="admin-sidebar"
  id="adminSidebar"
  aria-label="Main navigation"
>
    <button
    type="button"
    className="mobile-sidebar-close"
    onClick={() => {
      document.body.classList.remove("mobile-sidebar-open");
    }}
    aria-label="Close sidebar"
  >
    <i className="bi bi-x-lg"></i>
  </button>
        <div className="sidebar-header">
          <Link className="brand-mark" to="/user-auth/dashboard">
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

              // Admin la sarv menu
              if (isSupplier) return true;

              // Staff la assigned menu
              return menuAccess.includes(String(menu.menu_id));
            })
            .sort((a, b) => Number(a.menu_order) - Number(b.menu_order))
            .map((menu) => (
              // <NavLink
              //   key={menu.menu_id}
              //   to={`/user-auth/${menu.menu_routes}`}
              //   className={({ isActive }) =>
              //     isActive ? "nav-link active-primary" : "nav-link"
              //   }
              // >
               <NavLink
                key={menu.menu_id}
                to={`/user-auth/${menu.menu_routes}`}
                  onClick={() => {
    if (window.innerWidth <= 991) {
      document.body.classList.remove("mobile-sidebar-open");
    }
  }}
                className={({ isActive }) =>
                  isActive ? "nav-link active-primary" : "nav-link"
                }
              >
                <span className="nav-icon text-primary">
                  <i className={menu.menu_icon}></i>
                </span>

                <span className="nav-text">{menu.menu_name}</span>

                {menu.menu_routes !== "dashboard" && (
                  <span className="ms-auto badge rounded-pill bg-primary">
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
