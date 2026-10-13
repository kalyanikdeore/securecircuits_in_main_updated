import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";

function Dispatches() {
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [intransitRemark, setIntransitRemark] = useState("");

  // ==========================================
  // MAIN MODAL
  // ==========================================
  const [showModal, setShowModal] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);

  // ==========================================
  // NO DOCUMENT CONFIRM MODAL
  // ==========================================
  const [showNoDocumentModal, setShowNoDocumentModal] =
    useState(false);

  // ==========================================
  // UPLOAD STATES
  // ==========================================
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

      const stage13Data = stage13Response.data?.status
        ? stage13Response.data?.data || []
        : [];

      const stage14Data = stage14Response.data?.status
        ? stage14Response.data?.data || []
        : [];

      const stage15Data = stage15Response.data?.status
        ? stage15Response.data?.data || []
        : [];

      const allDispatches = [
        ...stage13Data,
        ...stage14Data,
        ...stage15Data,
      ];

      setDispatches(allDispatches);
    } catch (err) {
      console.error("Dispatch Fetch Error:", err);

      setError("Failed to fetch dispatch data.");
      toast.error("Failed to load dispatch data!");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // OPEN IN TRANSIT MODAL
  // ==========================================
  const openDeliveryProofModal = (dispatch) => {
    setSelectedDispatch(dispatch);
    setUploadFile(null);
    setUploadProgress(0);
    setShowModal(true);
  };

  // ==========================================
  // CLOSE MAIN MODAL
  // ==========================================
  const closeModal = () => {
    if (uploading) return;

    setShowModal(false);
    setSelectedDispatch(null);
    setUploadFile(null);
    setUploadProgress(0);
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

    // 10 MB LIMIT
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");

      e.target.value = "";
      setUploadFile(null);
      return;
    }

    // ALLOWED FILE TYPES
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
  // CONFIRM IN TRANSIT BUTTON
  // ==========================================
  const uploadDeliveryProof = async () => {
    if (!selectedDispatch?.order_id) {
      toast.error("Order ID not found");
      return;
    }

    // Only Stage 13 can move to Stage 14
    if (String(selectedDispatch.order_stage) !== "13") {
      toast.error(
        "In Transit can only be confirmed for Dispatched orders"
      );
      return;
    }

    // ==========================================
    // NO DOCUMENT
    // SHOW SMALL CONFIRMATION MODAL
    // ==========================================
    if (!uploadFile) {
      setShowNoDocumentModal(true);
      return;
    }

    // Document available -> direct submit
    await submitInTransit();
  };

  // ==========================================
  // CONFIRM WITHOUT DOCUMENT
  // ==========================================
  const confirmWithoutDocument = async () => {
    setShowNoDocumentModal(false);

    await submitInTransit();
  };

  // ==========================================
  // ACTUAL IN TRANSIT SUBMISSION
  // ==========================================
  const submitInTransit = async () => {
    if (!selectedDispatch?.order_id) {
      toast.error("Order ID not found");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let fileName = null;

      // ==========================================
      // STEP 1 - UPLOAD FILE ONLY IF SELECTED
      // ==========================================
      if (uploadFile) {
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
          "In Transit Upload Response:",
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

        fileName = Object.values(
          uploadResponse.data.files
        )[0];

        if (!fileName) {
          toast.error(
            "Uploaded file name not received"
          );

          return;
        }
      }

      // ==========================================
      // STEP 2 - UPDATE ORDER
      // ==========================================
      // const updateData = {
      //   order_id: selectedDispatch.order_id,
      //   order_stage: 14,
      // };

      // if (fileName) {
      //   updateData.in_transit = fileName;
      // }

      // console.log(
      //   "In Transit Update Data:",
      //   updateData
      // );

      // const updateResponse = await axios.post(
      //   `${BASE_URL}supplier/updatedata/tbl_orders/order_id/${selectedDispatch.order_id}`,
      //   updateData,
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //   }
      // );
      
const updateData = {
  order_id: selectedDispatch.order_id,
  order_stage: 14,
  intransit_remark: intransitRemark.trim(),
};

// Add file only when selected
if (fileName) {
  updateData.in_transit = fileName;
}

console.log("In Transit Update Data:", updateData);

const updateResponse = await axios.post(
  `${BASE_URL}supplier/updatedata/tbl_orders/order_id/${selectedDispatch.order_id}`,
  updateData,
  {
    headers: {
      "Content-Type": "application/json",
    },
  }
);


      // ==========================================
      // SUCCESS
      // ==========================================
      if (updateResponse.data?.status) {
        if (uploadFile) {
          toast.success(
            "In Transit document uploaded successfully"
          );
        } else {
          toast.success(
            "Order moved to In Transit without document"
          );
        }

        closeModal();

        getDispatchData();
      } else {
        toast.error(
          updateResponse.data?.message ||
          "Order update failed"
        );
      }
    } catch (err) {
      console.error("In Transit Error:", err);

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
                  <th>Action</th>
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
                        No dispatches found for Stage 13,
                        14 or 15.
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

                      {/* ACTION */}
                      <td>
                        {String(item.order_stage) === "13" && (
                          <button
                            type="button"
                            className="btn btn-sm text-danger"
                            style={{ boxShadow: "none", transform: "none", border: "none", outline: "none"}}

                            onClick={() =>
                              openDeliveryProofModal(item)
                            }
                          >
                            <i className="bi bi-upload me-1 query-icon"></i>
                            In Transit
                          </button>
                        )}
                      </td>

                      {/* ORDER */}
                      <td>
                        <span className="fw-semibold">
                          {item.order_code ||
                            item.order_id}
                        </span>
                      </td>

                      {/* DOCUMENT */}
                      <td
                        style={{
                          width: "400px",
                          minWidth: "400px",
                          maxWidth: "400px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-center flex-nowrap gap-1">

                          {/* DISPATCH FILE */}
                          {item.dispatch_file &&
                            Number(item.order_stage) >= 13 ? (
                            <div>
                              <a
                                href={`${BASE_URL}public/Uploads/${item.dispatch_file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm text-danger"
                                style={{ boxShadow: "none", border: "none",transform: "none",  outline: "none"}}

                              >
                                <i className="bi bi-eye me-1 query-icon"></i>
                                Dispatch File
                              </a>
                            </div>
                          ) : (
                            <span className="border  border-danger text-danger px-2 py-1 rounded small">
                              No Dispatch File
                            </span>
                          )}

                          {/* IN TRANSIT FILE */}
                          {item.in_transit && Number(item.order_stage) >= 14 ? (
                            <div>
                              <a
                                href={`${BASE_URL}public/Uploads/${item.in_transit}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm text-danger"
                                style={{ boxShadow: "none", border: "none",transform: "none", outline: "none"}}

                              >
                                <i className="bi bi-eye me-1 query-icon"></i>
                                In Transit
                              </a>
                            </div>
                          ) : (
                            <span className="  border-danger text-danger px-2 py-1 rounded small">
                              No In Transit File
                            </span>
                          )}
                          {/* DELIVERY PROOF */}
                          {item.delivery_proof &&
                            Number(item.order_stage) >= 15 ? (
                            <div>
                              <a
                                href={`${BASE_URL}public/Uploads/${item.delivery_proof}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm text-success"
                              >
                                <i className="bi bi-eye me-1 query-icon"></i>
                                Delivery Proof
                              </a>
                            </div>
                          ) : (
                            Number(item.order_stage) >= 15 && (
                              <span className="border  border-danger text-danger px-2 py-1 rounded small">
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

      {/* ==========================================
          MAIN IN TRANSIT MODAL
      ========================================== */}
      {showModal && (
        <>
          {/* BACKDROP */}
          <div
            className="modal-backdrop fade show"
            onClick={closeModal}
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
                <div className="modal-header bg-danger text-white">

                  <div>
                    <h5 className="modal-title mb-1">
                      <i className="bi bi-truck me-2"></i>
                      In Transit
                    </h5>

                    {selectedDispatch?.order_id && (
                      <small className="d-block">
                        Order Code:{" "}
                        {selectedDispatch.order_code ||
                          selectedDispatch.order_id}
                      </small>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeModal}
                    disabled={uploading}
                  ></button>

                </div>

                {/* BODY */}
                <div className="modal-body">

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Upload In Transit Document
                      <span className="text-muted ms-2">
                        (Optional)
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

                    {/* SELECTED FILE */}
                    {uploadFile && (
                      <div className="small text-success mt-2">
                        <i className="bi bi-file-earmark-check me-1"></i>

                        Selected:{" "}
                        {uploadFile.name}
                      </div>
                    )}

                    {/* NO FILE */}
                    {!uploadFile && (
                      <div className="small text-muted mt-2">
                        <i className="bi bi-info-circle me-1"></i>

                        Document is optional.
                      </div>
                    )}

                  </div>

                  {/* UPLOAD PROGRESS */}
                  {uploading && uploadFile && (
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
                            width: `${uploadProgress}%`,
                          }}
                        ></div>
                      </div>

                    </div>
                  )}
                  
{/* IN TRANSIT REMARK */}
<div className="mt-3">
  <label className="form-label fw-semibold">
    In Transit Remark
  </label>

  <textarea
    className="form-control"
    rows="3"
    placeholder="Enter in transit remark"
    value={intransitRemark}
    onChange={(e) => setIntransitRemark(e.target.value)}
    disabled={uploading}
  />
</div>


                </div>

                {/* FOOTER */}
                <div className="modal-footer justify-content-between">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                    disabled={uploading}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={uploadDeliveryProof}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                        ></span>

                        {uploadFile
                          ? "Uploading..."
                          : "Submitting..."}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle me-1"></i>
                        Confirm In Transit
                      </>
                    )}
                  </button>

                </div>

              </div>
            </div>
          </div>
        </>
      )}

      {/* ==========================================
          SMALL NO DOCUMENT CONFIRM MODAL
      ========================================== */}
      {showNoDocumentModal && (
        <>
          {/* SMALL MODAL BACKDROP */}
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1055 }}
          ></div>

          {/* SMALL MODAL */}
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ zIndex: 1060 }}
          >
            <div className="modal-dialog modal-dialog-centered modal-sm">

              <div className="modal-content">

                {/* HEADER */}
                <div className="modal-header py-2">

                  <h6 className="modal-title fw-semibold mb-0">
                    Confirm Submission
                  </h6>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() =>
                      setShowNoDocumentModal(false)
                    }
                    disabled={uploading}
                  ></button>

                </div>

                {/* BODY */}
                <div className="modal-body text-center py-3">

                  <i className="bi bi-exclamation-circle text-warning fs-2"></i>

                  <p className="mb-0 mt-2 small">
                    No In Transit document has been
                    uploaded.
                  </p>

                  <p className="mb-0 mt-1 small text-muted">
                    Do you want to continue without
                    document?
                  </p>

                </div>

                {/* FOOTER */}
                <div className="modal-footer py-2 justify-content-center">

                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() =>
                      setShowNoDocumentModal(false)
                    }
                    disabled={uploading}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={confirmWithoutDocument}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2 me-1"></i>
                        Yes, Submit
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