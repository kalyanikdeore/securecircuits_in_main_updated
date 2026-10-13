import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";

import logoLight from "../../public/assets/images/logo-light.png";
import logoDark from "../../public/assets/images/logo-dark.png";

import logoTextLight from "../../public/assets/images/dash-text-light.png";
import logoTextDark from "../../public/assets/images/dash-text-dark.png";

function Sidebar() {
  const admin = JSON.parse(localStorage.getItem("admin"));

  const menuAccess = admin?.staff_menu || [];
  const isAdmin = admin?.staff_role == 1;

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [counts, setCounts] = useState({
    customers: 0,
    staff: 0,
    orders: 0,
    quotations: 0,
    approved: 0,
    dispatches: 0,
    delivered: 0,
    suppliers: 0,
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
    getMenus();
    getMenus();
    getCounts();
  }, []);

  const getCounts = async () => {
    setLoading(true);

    try {
      const [
        customerRes,
        staffRes,
        orderRes,
        supplierRes,
        quotationRes,
        approved8Res,
        approved9Res,
        approved10Res,
        approved11Res,
        approved12Res,
      ] = await Promise.all([
        axios.get(`${BASE_URL}admin/getCountData/tbl_customers`),

        axios.get(`${BASE_URL}admin/getCountData/tbl_staff`),

        axios.get(`${BASE_URL}admin/getCountData/tbl_orders`),

        axios.get(`${BASE_URL}admin/getCountData/tbl_suppliers`),

        axios.get(
          `${BASE_URL}admin/getCountDataWhere/tbl_orders/order_stage/6`
        ),

        // APPROVED - STAGE 8
        axios.get(
          `${BASE_URL}admin/getCountDataWhere/tbl_orders/order_stage/8`
        ),

        // APPROVED - STAGE 9
        axios.get(
          `${BASE_URL}admin/getCountDataWhere/tbl_orders/order_stage/9`
        ),

        // APPROVED - STAGE 10
        axios.get(
          `${BASE_URL}admin/getCountDataWhere/tbl_orders/order_stage/10`
        ),

        // APPROVED - STAGE 11
        axios.get(
          `${BASE_URL}admin/getCountDataWhere/tbl_orders/order_stage/11`
        ),

        // APPROVED - STAGE 12
        axios.get(
          `${BASE_URL}admin/getCountDataWhere/tbl_orders/order_stage/12`
        ),
      ]);

      // =========================
      // APPROVED TOTAL COUNT
      // STAGE 8 + 9 + 10 + 11 + 12
      // =========================

      const approvedCount =
        Number(approved8Res?.data?.count || 0) +
        Number(approved9Res?.data?.count || 0) +
        Number(approved10Res?.data?.count || 0) +
        Number(approved11Res?.data?.count || 0) +
        Number(approved12Res?.data?.count || 0);

      console.log("Stage 8 Count:", approved8Res?.data?.count);
      console.log("Stage 9 Count:", approved9Res?.data?.count);
      console.log("Stage 10 Count:", approved10Res?.data?.count);
      console.log("Stage 11 Count:", approved11Res?.data?.count);
      console.log("Stage 12 Count:", approved12Res?.data?.count);
      console.log("Approved Total Count:", approvedCount);

      setCounts({
        customers: customerRes?.data?.count || 0,
        staff: staffRes?.data?.count || 0,
        orders: orderRes?.data?.count || 0,
        suppliers: supplierRes?.data?.count || 0,
        quotations: quotationRes?.data?.count || 0,

        // Stage 8 + 9 + 10 + 11 + 12
        approved: approvedCount,

        dispatches: 0,
        delivered: 0,
      });

    } catch (error) {
      console.log("Count Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCardCount = (route) => {
    switch (route) {
      case "customers":
        return counts.customers;
      case "staff":
        return counts.staff;
      case "orders":
        return counts.orders;
      case "suppliers":
        return counts.suppliers;
      case "quotations":
        return counts.quotations;
      case "approved":
        return counts.approved;
      // case "dispatches":
      //   return counts.dispatches;
      // case "delivered":
      //   return counts.delivered;

      default:
        return 0;
    }
  };

  const getMenus = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${BASE_URL}admin/getdata/tbl_menus`);

      if (response.data.status) {
        setMenus(response.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
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
        <div className="sidebar-header">
          <Link className="brand-mark" to="/dashboard">
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
                         <button
    type="button"
    className="mobile-sidebar-close"
    onClick={() => {
      document.body.classList.remove("mobile-sidebar-open");
    }}
  >
    <i className="bi bi-x-lg"></i>
  </button>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div className="sidebar-skeleton" key={index}>
                <div className="sidebar-skeleton-icon"></div>
                <div className="sidebar-skeleton-text"></div>
              </div>
            ))
          ) : (
            menus
              .filter((menu) => {
                if (menu.menu_status != 1) return false;

                // Admin (staff_role = 1) -> menu_id 11 hide
                if (isAdmin) {
                  return Number(menu.menu_id) !== 11;
                }

                // Staff -> only assigned menus
                return menuAccess.includes(String(menu.menu_id));
              })
              .sort((a, b) => Number(a.menu_order) - Number(b.menu_order))
              .map((menu) => (
                // <NavLink
                //   key={menu.menu_id}
                //   to={`/${menu.menu_routes}`}
                //   className={({ isActive }) =>
                //     isActive ? "nav-link active" : "nav-link"
                //   }
                // >
                 <NavLink
  key={menu.menu_id}
  to={`/${menu.menu_routes}`}
  onClick={() => {
    document.body.classList.remove("mobile-sidebar-open");
  }}
  className={({ isActive }) =>
    isActive ? "nav-link active" : "nav-link"
  }
>
                  <span className="nav-icon">
                    <i className={menu.menu_icon}></i>
                  </span>

                  <span className="nav-text">{menu.menu_name}</span>

                  {menu.menu_routes !== "dashboard" && menu.menu_routes !== "setting" && (
                    <span className="ms-auto badge rounded-pill bg-danger">
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
