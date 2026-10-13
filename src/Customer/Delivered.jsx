import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";

function Delivered() {
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // ==========================================
  // GET STAGE 13, 14, 15 ORDERS
  // ==========================================
  useEffect(() => {
    getDispatchData();
  }, []);

  const getDispatchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Only completed deliveries (Stage 15)
      const response = await axios.get(
        `${BASE_URL}customer/getdatawhere/tbl_orders/order_stage/15`
      );

      const deliveredData = response.data?.status
        ? response.data?.data || []
        : [];

      setDispatches(deliveredData);
    } catch (err) {
      console.error("Dispatch Fetch Error:", err);

      setError("Failed to fetch dispatch data.");
      toast.error("Failed to load dispatch data!");
    } finally {
      setLoading(false);
    }
  };


  // ==========================================
  // STATUS
  // ==========================================
  const getStatus = (stage) => {
    switch (String(stage)) {
      case "13":
        return (
          <span className="badge bg-warning text-dark">
            Dispatched
          </span>
        );

      case "14":
        return (
          <span className="badge bg-info text-dark">
            In Transit
          </span>
        );

      case "15":
        return (
          <span className="badge bg-success">
            Delivered
          </span>
        );

      default:
        return (
          <span className="badge bg-secondary">
            Unknown
          </span>
        );
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      <div className="container-fluid px-3 px-lg-4 py-4">

        {/* PAGE HEADING */}
        <div className="page-heading mb-4">
          <div className="page-heading-copy">

            <span className="page-icon">
              <i
                className="bi bi-truck text-success"
                aria-hidden="true"
              ></i>
            </span>

            <div>
              <p className="eyebrow mb-1 text-success">
                All
              </p>

              <h1 className="h3 mb-1">
                Delivered
              </h1>
            </div>

          </div>
        </div>

        {/* TABLE */}
        <section className="panel">
          <div className="table-responsive">

            <table
              className="table align-middle mb-0"
              id="ordersTable"
            >

              {/* TABLE HEADER */}
              <thead>
                <tr className="text-center">
                  <th>Order</th>
                  <th>Document</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody className="activity-date-time">

                {/* LOADING */}
                {loading && (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center py-4"
                    >
                      <div className="spinner-border spinner-border-sm me-2"></div>
                      Loading...
                    </td>
                  </tr>
                )}

                {/* ERROR */}
                {!loading && error && (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center text-danger py-4"
                    >
                      {error}
                    </td>
                  </tr>
                )}

                {/* EMPTY */}
                {!loading &&
                  !error &&
                  dispatches.length === 0 && (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center py-4 fs-6 text-danger fw-bold"
                      >
                        No delivered orders found.
                      </td>
                    </tr>
                  )}

                {/* DATA */}
                {!loading &&
                  !error &&
                  dispatches.length > 0 &&
                  dispatches.map((item, index) => (
                    <tr
                      key={item.order_id || index}
                      className="text-center"
                    >
                      {/* ORDER */}
                      <td>
                        <span className="fw-semibold">
                          {item.order_code ||
                            item.order_id}
                        </span>
                      </td>

                      {/* DOCUMENT */}
                      <td>

                        <div className="d-flex align-items-center justify-content-center flex-nowrap gap-1">

                          {/* DELIVERY PROOF */}
                          {item.delivery_proof &&
                            Number(item.order_stage) >= 15 ? (
                            <div>
                              <a
                                href={`${BASE_URL}public/Uploads/${item.delivery_proof}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm text-success"
                                style={{ boxShadow: "none", border: "none",transform: "none", outline: "none", }}

                              >
                                <i className="bi bi-eye me-1 query-icon"></i>
                                Delivery Proof
                              </a>
                            </div>
                          ) : (
                            Number(item.order_stage) >= 15 && (
                              <span className="text-muted small">
                                No Delivery Proof
                              </span>
                            )
                          )}

                        </div>

                      </td>

                      {/* STATUS */}
                      <td>
                        {getStatus(item.order_stage)}
                      </td>

                    </tr>
                  ))}

              </tbody>
            </table>

          </div>
        </section>

      </div>

    </>
  );
}

export default Delivered;