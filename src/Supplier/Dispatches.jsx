
import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";

function Dispatches() {
  const [showModal, setShowModal] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);

  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ==========================================
  // OPEN MODAL
  // ==========================================
  const openDispatchModal = (dispatch) => {
    setSelectedDispatch(dispatch);
    setUploadFile(null);
    setUploadProgress(0);
    setShowModal(true);
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================
  const closeDispatchModal = () => {
    if (uploading) return;

    setShowModal(false);
    setSelectedDispatch(null);
    setUploadFile(null);
    setUploadProgress(0);
  };

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
      const [
        stage13Response,
        stage14Response,
        stage15Response,
      ] = await Promise.all([
        axios.get(
          `${BASE_URL}supplier/getdatawhere/tbl_orders/order_stage/13`
        ),
        axios.get(
          `${BASE_URL}supplier/getdatawhere/tbl_orders/order_stage/14`
        ),
        axios.get(
          `${BASE_URL}supplier/getdatawhere/tbl_orders/order_stage/15`
        ),
      ]);

      const stage13Data =
        stage13Response.data?.status
          ? stage13Response.data?.data || []
          : [];

      const stage14Data =
        stage14Response.data?.status
          ? stage14Response.data?.data || []
          : [];

      const stage15Data =
        stage15Response.data?.status
          ? stage15Response.data?.data || []
          : [];

      setDispatches([
        ...stage13Data,
        ...stage14Data,
        ...stage15Data,
      ]);
    } catch (err) {
      console.error("Dispatch Fetch Error:", err);

      setError("Failed to fetch dispatch data.");
      toast.error("Failed to load dispatch data!");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FILE SELECT
  // ==========================================
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setUploadFile(null);
      return;
    }

    // 10 MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      e.target.value = "";
      setUploadFile(null);
      return;
    }

    // Allowed files
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/zip",
      "application/x-zip-compressed",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Only PDF, JPG, JPEG, PNG or ZIP files are allowed"
      );

      e.target.value = "";
      setUploadFile(null);
      return;
    }

    setUploadFile(file);
  };

  // ==========================================
  // UPLOAD IN TRANSIT FILE
  // ==========================================
  const uploadInTransit = async () => {
    if (!selectedDispatch?.order_id) {
      toast.error("Order ID not found");
      return;
    }

    if (!uploadFile) {
      toast.error("Please select a document");
      return;
    }

    // Only Stage 13 can upload In Transit document
    if (String(selectedDispatch.order_stage) !== "13") {
      toast.error(
        "In Transit document can only be uploaded for Stage 13 orders"
      );
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // ==========================================
      // STEP 1 - FILE UPLOAD
      // ==========================================
      const formData = new FormData();

      formData.append("file", uploadFile);

      const uploadResponse = await axios.post(
        `${BASE_URL}supplier/fileupload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) /
                progressEvent.total
              );

              setUploadProgress(percent);
            }
          },
        }
      );

      console.log(
        "File Upload Response:",
        uploadResponse.data
      );

      if (
        !uploadResponse.data?.status ||
        !uploadResponse.data?.files
      ) {
        toast.error(
          uploadResponse.data?.message ||
          "File upload failed"
        );

        return;
      }

      // ==========================================
      // GET FILE NAME
      // ==========================================
      const fileName = Object.values(
        uploadResponse.data.files
      )[0];

      if (!fileName) {
        toast.error(
          "Uploaded file name not received"
        );
        return;
      }

      // ==========================================
      // STEP 2 - UPDATE ORDER
      // ==========================================
      const updateData = {
        order_id: selectedDispatch.order_id,
        in_transit: fileName,
        order_stage: 14,
      };

      console.log(
        "Order Update Data:",
        updateData
      );

      const updateResponse = await axios.post(
        `${BASE_URL}supplier/updatedata/tbl_orders/order_id/${selectedDispatch.order_id} `,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Order Update Response:",
        updateResponse.data
      );

      // ==========================================
      // SUCCESS
      // ==========================================
      if (updateResponse.data?.status) {
        toast.success(
          "In Transit document uploaded successfully"
        );

        closeDispatchModal();

        // Refresh data
        getDispatchData();
      } else {
        toast.error(
          updateResponse.data?.message ||
          "Order update failed"
        );
      }
    } catch (err) {
      console.error(
        "Upload/Order Update Error:",
        err
      );

      console.error(
        "Backend Response:",
        err?.response?.data
      );

      toast.error(
        err?.response?.data?.message ||
        "Something went wrong"
      );
    } finally {
      setUploading(false);
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
                className="bi bi-truck text-primary"
                aria-hidden="true"
              ></i>
            </span>

            <div>
              <p className="eyebrow mb-1 text-primary">
                All
              </p>

              <h1 className="h3 mb-1">
                Dispatches
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
                        No dispatches found.
                      </td>
                    </tr>
                  )}

                {/* DATA */}
                {!loading &&
                  !error &&
                  dispatches.length > 0 &&
                  dispatches.map((item, index) => (
                    <tr
                      key={
                        item.order_id || index
                      }
                      className="text-center"
                    >

                      {/* ACTION */}
                      {/* <td
                        style={{
                          width: "200px",
                          minWidth: "200px",
                          maxWidth: "200px",
                          whiteSpace: "nowrap",
                        }}
                      >

                        {String(item.order_stage) === "13" && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              openDispatchModal(item)
                            }
                          >
                            <i className="bi bi-upload me-1"></i>
                            In Transit Update
                          </button>
                        )}

                        {String(item.order_stage) === "14" && (
                          <span className="text-info fw-semibold">
                            <i className="bi bi-truck me-1"></i>
                            In Transit
                          </span>
                        )}

                        {String(item.order_stage) === "15" && (
                          <span className="text-success fw-semibold">
                            <i className="bi bi-check-circle me-1"></i>
                            Delivered
                          </span>
                        )}

                      </td> */}

                      {/* ORDER */}
                      <td>
                        <b>{item.order_code}</b>
                      </td>

                      {/* DOCUMENTS */}
                      <td
                        className="text-center fw-semibold"
                        style={{
                          width: "300px",
                          minWidth: "300px",
                          maxWidth: "300px",
                          whiteSpace: "nowrap",
                        }}
                      >

                        <div className="d-flex align-items-center justify-content-center flex-nowrap gap-1">

                          {item.dispatch_file && Number(item.order_stage) >= 14 ? (
                            <div>
                              <a
                                href={`${BASE_URL}public/Uploads/${item.dispatch_file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm text-primary"
                                style={{ boxShadow: "none", border: "none",transform: "none", outline: "none",transform: "none",}}

                              >
                                <i className="bi bi-eye me-1"></i>
                               Dispatch File
                              </a>  
                            </div>
                          ) : (
                            <span className="  text-primary px-2 py-1 rounded small" >
                              No Dispatch File
                            </span>
                          )}

                          {/* IN TRANSIT FILE */}
                          {item.in_transit &&
                            Number(item.order_stage) >= 14 && (
                              <a
                                href={`${BASE_URL}public/Uploads/${item.in_transit} `}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm text-primary"
                                style={{ boxShadow: "none", border: "none",transform: "none", outline: "none"}}

                              >
                                <i className="bi bi-eye me-1 query-icon"></i>
                                In Transit
                              </a>
                            )}

                        </div>

                      </td>

                      {/* STATUS */}
                      <td>
                        {getStatus(
                          item.order_stage
                        )}
                      </td>

                    </tr>
                  ))}

              </tbody>

            </table>

          </div>
        </section>

      </div>

      {/* ==========================================
          IN TRANSIT UPLOAD MODAL
      ========================================== */}
      {showModal && (
        <>
          {/* BACKDROP */}
          <div
            className="modal-backdrop fade show"
            onClick={closeDispatchModal}
          ></div>

          {/* MODAL */}
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
          >

            <div className="modal-dialog modal-dialog-centered">

              <div className="modal-content">

                {/* HEADER */}
                <div className="modal-header bg-primary text-white">

                  <div>
                    <h5 className="modal-title mb-1">
                      <i className="bi bi-upload me-2"></i>
                      In Transit Update
                    </h5>

                    {selectedDispatch?.order_id && (
                      <small className="d-block">
                        Order ID:{" "}
                        {selectedDispatch.order_id}
                      </small>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeDispatchModal}
                    disabled={uploading}
                  ></button>

                </div>

                {/* BODY */}
                <div className="modal-body">

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Upload In Transit Document
                      <span className="text-danger">
                        {" "}*
                      </span>
                    </label>

                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.jpg,.jpeg,.png,.zip"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />

                    <div className="form-text">
                      PDF, JPG, JPEG, PNG or ZIP
                      allowed. Maximum 10MB.
                    </div>

                    {uploadFile && (
                      <div className="small text-success mt-2">

                        <i className="bi bi-file-earmark-check me-1"></i>

                        Selected:{" "}
                        {uploadFile.name}

                      </div>
                    )}

                  </div>

                  {/* PROGRESS */}
                  {uploading && (
                    <div className="mt-3">

                      <div className="d-flex justify-content-between mb-1">

                        <small className="text-muted">
                          Uploading...
                        </small>

                        <small className="fw-semibold">
                          {uploadProgress}%
                        </small>

                      </div>

                      <div
                        className="progress"
                        style={{
                          height: "6px",
                        }}
                      >

                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: `${uploadProgress}% `,
                          }}
                        ></div>

                      </div>

                    </div>
                  )}

                </div>

                {/* FOOTER */}
                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeDispatchModal}
                    disabled={uploading}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={uploadInTransit}
                    disabled={
                      uploading ||
                      !uploadFile
                    }
                  >

                    {uploading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                        ></span>

                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-upload me-1"></i>

                        Upload In Transit
                      </>
                    )}

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

export default Dispatches;