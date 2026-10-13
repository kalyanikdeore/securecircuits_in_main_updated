import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";

function Dashboard() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const menuAccess = admin?.staff_menu || [];
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const [menus, setMenus] = useState([]);
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
    if (!admin) {
      navigate("/backend");
      return;
    }

    getMenus();
    getCounts();
  }, []);

  const getMenus = async () => {
    try {
      const response = await axios.get(`${BASE_URL}admin/getdata/tbl_menus`);

      if (response.data.status) {
        setMenus(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCounts = async () => {
    setLoading(true);

    try {
      const [
        customerRes,
        staffRes,
        orderRes,
        supplierRes,
        quotationRes,
        approvedRes
      ] = await Promise.all([
        axios.get(`${BASE_URL}admin/getCountData/tbl_customers`),
        axios.get(`${BASE_URL}admin/getCountData/tbl_staff`),
        axios.get(`${BASE_URL}admin/getCountData/tbl_orders`),
        axios.get(`${BASE_URL}admin/getCountData/tbl_suppliers`),
        axios.get(`${BASE_URL}admin/getCountDataWhere/tbl_orders/order_stage/6`), 
        axios.get(`${BASE_URL}admin/getCountDataWhere/tbl_orders/order_stage/8`), 

      ]);

      setCounts({
        customers: customerRes?.data?.count || 0,
        staff: staffRes?.data?.count || 0,
        orders: orderRes?.data?.count || 0,
        suppliers: supplierRes?.data?.count || 0,
        quotations: quotationRes?.data?.count || 0,
        approved: approvedRes?.data?.count || 0,
      });
    } catch (error) {
      console.log(error);
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

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon">
            <i className="bi bi-speedometer2"></i>
          </span>

          <div>
            <p className="eyebrow mb-1">Overview</p>
            <h1 className="h3 mb-1">Dashboard</h1>
          </div>
        </div>
      </div>

      <section className="row g-3 mt-1">
        {loading
          ? Array.from({ length: 8 }).map((_, index) => (
            <div className="col-12 col-sm-6 col-xl-3" key={index}>
              <article className="metric-card metric-danger skeleton">
                <div className="metric-top">
                  <div className="skeleton-line"></div>

                  <div className="skeleton-circle"></div>
                </div>

                <div className="skeleton-number"></div>
              </article>
            </div>
          ))
          : menus
            .filter((menu) => {
              if (menu.menu_status != 1) return false;

              // Dashboard card hide
              if (menu.menu_routes === "dashboard") return false;

              // Settings card hide
              if (menu.menu_routes === "setting") return false;

              // Saved Quote card hide
              if (menu.menu_routes === "saved-cart") return false;

              if (Number(admin?.staff_role) === 1) {
                return true;
              }

              return menuAccess.includes(String(menu.menu_id));
            })
            .sort((a, b) => Number(a.menu_order) - Number(b.menu_order))
            .map((menu) => (
              <div className="col-12 col-sm-6 col-xl-3" key={menu.menu_id}>
                <Link
                  to={`/${menu.menu_routes}`}
                  style={{ textDecoration: "none" }}
                >
                  <article className="metric-card metric-danger">
                    <div className="metric-top">
                      <span className="metric-label">{menu.menu_name}</span>

                      <span className="metric-icon">
                        <i className={menu.menu_icon}></i>
                      </span>
                    </div>

                    <div className="metric-value">
                      {getCardCount(menu.menu_routes)}
                    </div>
                  </article>
                </Link>
              </div>
            ))}
      </section>
    </div>
  );
}

export default Dashboard;
