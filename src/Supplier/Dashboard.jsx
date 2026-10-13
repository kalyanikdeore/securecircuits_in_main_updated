import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";

function Dashboard() {
  const supplier = JSON.parse(localStorage.getItem("supplier"));
  const menuAccess = supplier?.supp_menu || [];
  const SuppId = supplier?.supp_id;
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const [menus, setMenus] = useState([]);
  const [counts, setCounts] = useState({
    orders: 0,
    quotations: 0,
    dispatches: 0,
  });

  useEffect(() => {
    if (!supplier) {
      navigate("/user-auth/login");
      return;
    }

    getMenus();
    getCounts();
  }, []);

  const getMenus = async () => {
    try {
      const response = await axios.get(`${BASE_URL}supplier/getdata/tbl_menus`);

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
      const res = await axios.get(
        `${BASE_URL}supplier/getSupplierOrders/${SuppId}`
      );

      const orders = res.data.data || [];

      const supplierOrders = orders.filter((item) => {
        if (!item.order_transfer_supplier) return false;

        return item.order_transfer_supplier
          .split(",")
          .map((id) => id.trim())
          .includes(String(SuppId));
      });

      setCounts({
        orders: supplierOrders.length,
        quotations: 0,
        dispatches: 0,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getCardCount = (route) => {
    switch (route) {

      case "orders":
        return counts.orders;
      default:
        return 0;
    }
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      <div className="page-heading">
        <div className="page-heading-copy">
          <span className="page-icon">
            <i className="bi bi-speedometer2 text-primary"></i>
          </span>

          <div>
            <p className="eyebrow mb-1 text-primary">Overview</p>
            <h1 className="h3 mb-1">Dashboard</h1>
          </div>
        </div>
      </div>

      <section className="row g-3 mt-1">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
            <div className="col-12 col-sm-6 col-xl-3" key={index}>
              <article className="metric-card metric-primary skeleton">
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

              if (Number(supplier?.supp_role) === 1) {
                return true;
              }

              return menuAccess.includes(String(menu.menu_id));
            })
            .sort((a, b) => Number(a.menu_order) - Number(b.menu_order))
            .map((menu) => (
              <div className="col-12 col-sm-6 col-xl-3" key={menu.menu_id}>
                <Link
                  to={`/user-auth/${menu.menu_routes}`}
                  style={{ textDecoration: "none" }}
                >
                  <article className="metric-card metric-primary">
                    <div className="metric-top">
                      <span className="metric-label">{menu.menu_name}</span>

                      <span className="metric-icon text-primary">
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
