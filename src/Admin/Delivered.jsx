import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";

function Delivered() {
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Remark Modal
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState("");

  // ==========================================
  // GET ONLY STAGE 16 ORDERS
  // ==========================================
  useEffect(() => {
    getDeliveredData();
  }, []);

  const getDeliveredData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        stage15Response,
        stage16Response,
      ] = await Promise.all([

        axios.get(
          `${BASE_URL}supplier/getdatawhere/tbl_orders/order_stage/15`
        ),
        axios.get(
          `${BASE_URL}supplier/getdatawhere/tbl_orders/order_stage/16`
        ),
      ]);


      const stage15Data = stage15Response.data?.status
        ? stage15Response.data?.data || []
        : [];

      const stage16Data = stage16Response.data?.status
        ? stage16Response.data?.data || []
        : [];

      const allDispatches = [
        ...stage15Data,
        ...stage16Data,
      ];

      setDispatches(allDispatches);
    } catch (err) {
      console.error("Delivered Fetch Error:", err);

      setError("Failed to fetch delivered orders.");
      toast.error("Failed to load delivered orders!");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // OPEN REMARK MODAL
  // ==========================================
  const openRemarkModal = (remark) => {
    setSelectedRemark(remark || "No remark available.");
    setShowRemarkModal(true);
  };

  // ==========================================
  // CLOSE REMARK MODAL
  // ==========================================
  const closeRemarkModal = () => {
    setShowRemarkModal(false);
    setSelectedRemark("");
  };

  // ==========================================
  // DOCUMENT BUTTON
  // ==========================================
  const DocumentButton = ({ label, file }) => {
    if (!file) return null;

    return (
      <>
        <a
          href={`${BASE_URL}public/Uploads/${file}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm text-danger"
          style={{ boxShadow: "none", border: "none",transform: "none", outline: "none"}}

        >
          
          <i className="bi bi-box-arrow-up-right me-1 query-icon"></i>
          {label}
        </a>
      </>
    );
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
                className="bi bi-truck text-danger"
                aria-hidden="true"
              ></i>
            </span>

            <div>
              <p className="eyebrow mb-1 text-danger">
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
                  <th>Documents</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody className="activity-date-time">

                {/* LOADING */}
                {loading && (
                  <tr>
                    <td
                      colSpan="4"
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
                      colSpan="4"
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
                        colSpan="4"
                        className="text-center py-4"
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

                      {/* =====================================
                          ORDER
                      ===================================== */}
                      <td style={{ minWidth: "150px" }}>
                        <span className="fw-semibold">
                          {item.order_code || item.order_id}
                        </span>
                      </td>



                      <td>
                        <div className="row g-1">

                          {/* QUOTATION */}
                          <div className="col-md-3">
                            {item.order_quotation ? (
                              <DocumentButton
                                label="Quotation"
                                file={item.order_quotation}
                              />
                            ) : (
                              <span className="text-muted small">
                                No Document
                              </span>
                            )}
                          </div>

                          {/* DESIGN */}
                          <div className="col-md-3">
                            {item.order_design ? (
                              <DocumentButton
                                label="Design"
                                file={item.order_design}
                              />
                            ) : (
                              <span className="text-muted small">
                                No Document
                              </span>
                            )}
                          </div>

                          {/* QUALITY */}
                          <div className="col-md-3">
                            {item.order_quality_repo ? (
                              <DocumentButton
                                label="Quality"
                                file={item.order_quality_repo}
                              />
                            ) : (
                              <span className="text-muted small">
                                No Document
                              </span>
                            )}
                          </div>

                          {/* DISPATCH */}
                          <div className="col-md-3">
                            {item.dispatch_file ? (
                              <DocumentButton
                                label="Dispatch File"
                                file={item.dispatch_file}
                              />
                            ) : (
                              <span className="text-muted small">
                                No Dispatch File
                              </span>
                            )}
                          </div>

                          {/* IN TRANSIT */}
                          <div className="col-md-3 ">
                            {item.in_transit ? (
                              <DocumentButton
                                label="In Transit"
                                file={item.in_transit}
                              />
                            ) : (
                              <span className="text-muted small">
                                No In Transit File
                              </span>
                            )}
                          </div>

                          {/* DELIVERY */}
                          <div className="col-md-3">
                            {item.delivery_proof ? (
                              <DocumentButton
                                label="Delivery"
                                file={item.delivery_proof}
                              />
                            ) : (
                              <span className="text-muted small">
                                No Delivery Proof
                              </span>
                            )}
                          </div>

                        </div>
                      </td>

                

                      {/* =====================================
                          STATUS
                      ===================================== */}
                      <td>
                        <span className="badge bg-success">
                          Delivered
                        </span>
                      </td>

                    </tr>
                  ))}

              </tbody>
            </table>

          </div>
        </section>

      </div>

      {/* ==================================================
          REMARK MODAL
      ================================================== */}
      {showRemarkModal && (
        <>
          {/* BACKDROP */}
          <div
            className="modal-backdrop fade show"
            onClick={closeRemarkModal}
          ></div>

          {/* MODAL */}
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered modal-sm">
              <div className="modal-content">

                {/* HEADER */}
                <div className="modal-header">

                  <h5 className="modal-title">
                    <i className="bi bi-chat-left-text me-2 text-primary"></i>
                    Order Remark
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeRemarkModal}
                  ></button>

                </div>

                {/* BODY */}
                <div className="modal-body">

                  <div
                    className="p-3 bg-light rounded"
                    style={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word"
                    }}
                  >
                    {selectedRemark}
                  </div>

                </div>

                {/* FOOTER */}
                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={closeRemarkModal}
                  >
                    Close
                  </button>

                </div>

              </div>
            </div>
          </div>
        </>
      )}

    </>
  );
}

export default Delivered;