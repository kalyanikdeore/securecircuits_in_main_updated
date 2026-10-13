import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";

function Quotations() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Remark Modal
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState("");

  useEffect(() => {
    getorderData();
  }, []);

  const getorderData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${BASE_URL}admin/getdatawhere/tbl_orders/order_stage/6`
      );

      if (response.data.status) {
        setQuotations(response.data.data);
      } else {
        setQuotations([]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data.");
      toast.error("Failed to load data!");
    } finally {
      setLoading(false);
    }
  };

  // Open Remark Modal
  const handleViewRemark = (remark) => {
    setSelectedRemark(remark || "No remark available.");
    setShowRemarkModal(true);
  };

  // Close Remark Modal
  const handleCloseRemarkModal = () => {
    setShowRemarkModal(false);
    setSelectedRemark("");
  };

  return (
    <>
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-file-text" aria-hidden="true"></i>
            </span>

            <div>
              <p className="eyebrow mb-1">All</p>
              <h1 className="h3 mb-1">Quotations</h1>
            </div>
          </div>
        </div>

        <section className="panel">
          <div className="table-responsive">
            <table
              className="table align-middle mb-0"
              id="ordersTable"
              data-searchable-table
            >
              <thead>
                <tr className="text-center">
                  <th>Order Code</th>
                  <th>Quotation</th>
                  <th>Remark</th>
                  <th>Request Date & Time</th>
                </tr>
              </thead>

              <tbody className="activity-date-time">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center text-danger py-4"
                    >
                      {error}
                    </td>
                  </tr>
                ) : quotations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No quotations found for Stage 6.
                    </td>
                  </tr>
                ) : (
                  quotations.map((item, index) => (
                    <tr
                      key={item.order_id || index}
                      className="text-center"
                    >
                      {/* Order Code */}
                      <td className="fw-bold">
                        {item.order_code || "N/A"}
                      </td>

                      {/* Quotation */}
                      <td>
                        <a
                          href={`${BASE_URL} public / Uploads / ${item.order_quotation} `}
                          className="text-danger fw-bold text-decoration-none"
                          style={{
                            cursor: "pointer",
                            fontSize: "16px",
                            
                          }}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Quotations
                        </a>
                      </td>

                      {/* Remark */}
                      <td>
                        <button
                          type="button"
                          style={{ boxShadow: "none",transform: "none",  border: "none", outline: "none"}}

                          className="btn text-primary btn-sm"
                          
                          onClick={() =>
                            handleViewRemark(item.order_remark)
                          }
                        >
                          <i className="bi bi-eye me-1 query-icon"></i>
                          View Remark
                        </button>
                      </td>

                      {/* Request Date & Time */}
                      <td>
                        {item.order_request_date || "N/A"}{" "}
                        {item.order_request_time || ""}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ================= REMARK MODAL ================= */}
      {showRemarkModal && (
        <>
          <div
            className="modal fade show"
            style={{
              display: "block",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="modal-dialog modal-dialog-centered"
              role="document"
            >
              <div className="modal-content">
                {/* Modal Header */}
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-chat-left-text me-2 text-primary"></i>
                    Remark
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseRemarkModal}
                    aria-label="Close"
                  ></button>
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                  <div
                    className="p-3 rounded"
                    style={{
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #dee2e6",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      minHeight: "80px",
                    }}
                  >
                    {selectedRemark}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseRemarkModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Backdrop */}
          <div
            className="modal-backdrop fade show"
            onClick={handleCloseRemarkModal}
          ></div>
        </>
      )}
    </>
  );
}

export default Quotations;