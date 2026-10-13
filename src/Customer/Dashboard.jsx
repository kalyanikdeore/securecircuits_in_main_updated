import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";

function Dashboard() {
  const customer = JSON.parse(localStorage.getItem("customer"));
  const menuAccess = customer?.cust_menu || [];
  const CustId = customer?.cust_id;
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const [menus, setMenus] = useState([]);
  const [counts, setCounts] = useState({
    orders: 0,
    quotations: 0,
    dispatches: 0,
  });

  useEffect(() => {
    if (!customer) {
      navigate("/customer/login");
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
      console.error("Error fetching counts:", error);
    } finally {
      setLoading(false);
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
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon">
            <i className="bi bi-speedometer2 text-success"></i>
          </span>

          <div>
            <p className="eyebrow mb-1 text-success">Overview</p>
            <h1 className="h3 mb-1">Dashboard</h1>
          </div>
        </div>
      </div>

      <section className="row g-3 mt-1">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
            <div className="col-12 col-sm-6 col-xl-3" key={index}>
              <article className="metric-card metric-success skeleton">
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

              if (Number(customer?.cust_role) === 1) {
                return true;
              }

              return menuAccess.includes(String(menu.menu_id));
            })
            .sort((a, b) => Number(a.menu_order) - Number(b.menu_order))
            .map((menu) => (
              <div className="col-12 col-sm-6 col-xl-3" key={menu.menu_id}>
                <Link
                  to={`/customer/${menu.menu_routes}`}
                  style={{ textDecoration: "none" }}
                >
                  <article className="metric-card metric-success">
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
