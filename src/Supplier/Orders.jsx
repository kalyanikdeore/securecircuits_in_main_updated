import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";
import Delete from "../Config/Delete";
import * as Yup from "yup";
import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import TableLoader from "../Config/TableLoader";
import StageDrawer from "./StageDrawer";

function Orders() {
  const [orderData, setorderData] = useState([]);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [showStageDrawer, setShowStageDrawer] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  // New State for checking existing quote ID
  const [existingQuoteId, setExistingQuoteId] = useState(null);
  const [fetchingQuote, setFetchingQuote] = useState(false);

  const supplier = JSON.parse(localStorage.getItem("supplier"));
  const SuppId = supplier?.supp_id;

  useEffect(() => {
    getorderData();
  }, []);

  useEffect(() => {
    if (showQueryModal) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    }
  }, [messages, showQueryModal]);

  // Formik validation for Quote modal
  const formik = useFormik({
    initialValues: {
      sq_quote: "",
      sq_remark: "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      sq_quote: Yup.string().required("Quote file is required"),
      sq_remark: Yup.string().required("Requirement/Remark is required"),
    }),
    onSubmit: async (values) => {
      try {
        const payload = {
          sq_supp_id: SuppId,
          sq_order_id: selectedOrder?.order_id,
          sq_quote: values.sq_quote,
          sq_remark: values.sq_remark,
        };

        let res;

        if (existingQuoteId) {
          res = await axios.post(
            `${BASE_URL}supplier/updatedata/tbl_supplier_quotes/sq_id/${existingQuoteId}`,
            payload
          );
        } else {
          res = await axios.post(
            `${BASE_URL}supplier/insert/tbl_supplier_quotes`,
            payload
          );
        }

        if (res.data.status) {

          // ============================================
          // UPDATE ORDER STAGE = 4 AFTER QUOTE SAVE
          // ============================================
          if (selectedOrder?.order_id) {
            try {
              const stageRes = await axios.post(
                `${BASE_URL}supplier/updatedata/tbl_orders/order_id/${selectedOrder.order_id}`,
                {
                  order_stage: 4,
                }
              );

              if (!stageRes.data.status) {
                console.error(
                  "Quote saved, but order stage update failed:",
                  stageRes.data.message
                );
              }
            } catch (stageError) {
              console.error(
                "Order stage update error:",
                stageError
              );
            }
          }

          toast.success(
            existingQuoteId
              ? "Quote updated successfully!"
              : "Quote uploaded successfully!"
          );

          resetForm();
          getorderData();

        } else {
          toast.error(
            res.data.message || "Failed to process quote"
          );
        }

      } catch (error) {
        console.error("Quote Submission Error:", error);
        toast.error("Something went wrong!");
      }
    },
  });

  // Check Existing Quote Logic
  const handleOpenQuoteModal = async (order) => {
    setSelectedOrder(order);
    setShowModal(true);
    setFetchingQuote(true);

    try {
      // API call to check existing quote by supp_id & order_id
      const res = await axios.get(
        `${BASE_URL}supplier/getdatawhere/tbl_supplier_quotes/sq_order_id/${order.order_id}`
      );

      if (res.data.status && res.data.data.length > 0) {
        // Find specific quote for current supplier
        const existingData = res.data.data.find(
          (item) => item.sq_supp_id == SuppId
        );

        if (existingData) {
          setExistingQuoteId(existingData.sq_id);
          formik.setValues({
            sq_quote: existingData.sq_quote || "",
            sq_remark: existingData.sq_remark || "",
          });
        } else {
          setExistingQuoteId(null);
          formik.resetForm();
        }
      } else {
        setExistingQuoteId(null);
        formik.resetForm();
      }
    } catch (error) {
      console.error("Error fetching existing quote:", error);
      setExistingQuoteId(null);
    } finally {
      setFetchingQuote(false);
    }
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploadProgress(0);

    try {
      const res = await axios.post(`${BASE_URL}supplier/fileupload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (res.data.status && res.data.files) {
        const fileName = Object.values(res.data.files)[0];
        formik.setFieldValue("sq_quote", fileName);
        toast.success("File uploaded successfully");
      } else {
        toast.error(res.data.message || "File upload failed");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      toast.error("Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    formik.resetForm();
    setShowModal(false);
    setSelectedOrder(null);
    setExistingQuoteId(null);
    setUploadProgress(0);
  };

  const getMessages = async (orderId) => {
    const res = await axios.get(
      `${BASE_URL}supplier/getdatawhere/tbl_query/que_order_id/${orderId}`
    );

    if (res.data.status) {
      setMessages(res.data.data);
    }
  };

  const sendMessage = async () => {
    if (message.trim() === "") return;

    await axios.post(`${BASE_URL}supplier/insert/tbl_query`, {
      que_order_id: selectedOrder.order_id,
      que_cust_id: selectedOrder.order_cust_id,
      que_supp_id: SuppId,
      que_send: "supplier",
      que_message: message,
      que_cust_read: 0,
      que_supp_read: 1,
    });

    setMessage("");
    getMessages(selectedOrder.order_id);
  };

  const markSupplierRead = async (orderId) => {
    try {
      await axios.post(`${BASE_URL}supplier/markSupplierRead`, {
        order_id: orderId,
      });
      getorderData();
    } catch (err) {
      console.log(err);
    }
  };

  const getorderData = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${BASE_URL}supplier/getSupplierOrders/${SuppId}`
      );

      if (response.data.status) {
        const orders = response.data.data || [];

        // Check quote for each order
        const ordersWithQuoteStatus = await Promise.all(
          orders.map(async (order) => {
            try {
              const quoteRes = await axios.get(
                `${BASE_URL}supplier/getdatawhere/tbl_supplier_quotes/sq_order_id/${order.order_id}`
              );

              const supplierQuoteExists =
                quoteRes.data.status &&
                quoteRes.data.data?.some(
                  (quote) => String(quote.sq_supp_id) === String(SuppId)
                );

              return {
                ...order,
                has_supplier_quote: supplierQuoteExists,
              };
            } catch (error) {
              console.error(
                `Quote check failed for order ${order.order_id}`,
                error
              );

              return {
                ...order,
                has_supplier_quote: false,
              };
            }
          })
        );

        setorderData(ordersWithQuoteStatus);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = async (order) => {
    setSelectedOrder(order);
    setShowCartModal(true);
    setCartLoading(true);

    try {
      const cartIds = order.order_cart_id;

      if (cartIds) {
        const res = await axios.post(`${BASE_URL}customer/getCartDetails`, {
          cart_ids: cartIds,
        });

        if (res.data.status) {
          setCartItems(res.data.data);
        } else {
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error("Cart details fetching error:", err);
      toast.error("Failed to load cart details");
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <>
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-people text-primary" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1 text-primary">All</p>
              <h1 className="h3 mb-1">Orders</h1>
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
                  <th>action</th>
                  <th>Order Detail</th>
                  <th>Stag</th>
                  <th>Activity</th>
                </tr>
              </thead>
              <tbody className="activity-date-time">
                {loading ? (
                  <TableLoader rows={6} columns={5} />
                ) : orderData.length > 0 ? (
                  orderData.map((order) => (
                    <tr key={order.order_id}>
                      <td className="text-center" style={{
                        width: "220px",
                        minWidth: "220px",
                        maxWidth: "220px",
                        whiteSpace: "nowrap",
                      }}>
                        <div className="d-flex align-items-center justify-content-center flex-nowrap gap-1">
                          {String(order.order_stage) >= 8 && String(order.order_stage) <= 11 && (
                            <span
                              className="d-inline-block"
                              tabIndex="0"
                              title={
                                Number(order.order_stage) <= 7
                                  ? "Query option is not available until assigned."
                                  : ""
                              }
                            >
                              <button
                                className="btn btn-sm text-primary no-shadow  "
                                
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowQueryModal(true);
                                  getMessages(order.order_id);
                                  markSupplierRead(order.order_id);
                                }}
                                disabled={Number(order.order_stage) <= 7}
                                 style={{
    boxShadow: "none",
    border: "none",
    transform: "none",
    outline: "none",
    pointerEvents: Number(order.order_stage) <= 7 ? "none" : "auto",
  }}
>
                                <i className="fa-regular fa-circle-question query-icon"></i> Query
                              </button>
                            </span>
                          )}

                          {String(order.order_stage) <= 4 && !order.has_supplier_quote && (
                            <button
                              className="btn btn-sm text-primary "
                              onClick={() => handleOpenQuoteModal(order)}
                              style={{ boxShadow: "none", border: "none",transform: "none", outline: "none",}}

                            >
                              <i className="fa-solid fa-upload query-icon"></i> Upload Quote
                            </button>
                          )}

                          {order.order_quality_repo && order.order_stage >= "12" && (
                            <a
                              className="btn btn-sm text-primary ms-2 mt-2"
                              href={`${BASE_URL}public/Uploads/${order.order_quality_repo}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ boxShadow: "none",transform: "none", border: "none", outline: "none",}}

                            >
                              <i className="bi bi-eye me-1 query-icon"></i>
                              Quality
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="text-center">

                        <span className="fw-bold">Order No:</span>{" "}
                        <b
                          style={{
                            fontSize: "14px",
                            cursor: "pointer",
                            color: "#1192b9",
                           
                          }}
                          onClick={() => handleOrderClick(order)}
                          title="Click to view Order Details"
                        >
                          {order.order_code}
                        </b>
                      </td>

                      <td className="text-center">
                        <button
                          className="btn text-primary btn-sm"
                          style={{ boxShadow: "none",transform: "none", border: "none", outline: "none,"}}

                          onClick={() => {
                            setSelectedOrder(order);
                            setShowStageDrawer(true);
                          }}
                        // disabled={Number(order.order_stage) <= 7}
                        // title={
                        //   Number(order.order_stage) <= 7
                        //     ? "Tracking will be available once assigned."
                        //     : "View Tracking"
                        // }
                        // style={{ pointerEvents: "auto" }}
                        >
                          <i className="fas fa-route me-2 query-icon"></i>
                          Tracking
                        </button>
                      </td>

                      <td className="text-start">
                        <span className="fw-semibold">Created Date:</span>{" "}
                        {order.order_request_date} <br />{" "}
                        <span className="fw-semibold">Created Time:</span>{" "}
                        {new Date(
                          `1970-01-01T${order.order_request_time}`
                        ).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-danger fw-semibold">
                      No Order Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Upload/Edit Quote Modal */}
      {showModal && (
        <div className="model-add-edit-modal-overlay">
          <div className="model-add-edit-modal-dialog model-size-sm">
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header-primary">
                <h5 className="model-add-edit-modal-title">
                  {selectedOrder?.order_code}
                </h5>

                <button
                  type="button"
                  className="model-add-edit-modal-close"
                  onClick={resetForm}
                >
                  ✕
                </button>
              </div>

              {fetchingQuote ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-2 text-muted">Checking Quote Details...</p>
                </div>
              ) : (
                <form onSubmit={formik.handleSubmit}>
                  <div className="model-add-edit-modal-body">
                    <div className="row g-3">
                      <div className="col-md-12">
                        <div className="simple-file-box">
                          <label className="simple-file-label">
                            Upload Quotation (.pdf) <span className="text-danger">*</span>
                          </label>

                          <div className="d-flex align-items-center gap-2">
                            {/* File Input */}
                            <div
                              className={`simple-input-container flex-grow-1 ${formik.touched.sq_quote && formik.errors.sq_quote
                                ? "is-invalid-border"
                                : ""
                                }`}
                            >
                              <input
                                type="file"
                                id="sq_quote"
                                name="sq_quote"
                                className="simple-file-input"
                                accept=".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed"
                                onChange={(e) => {
                                  formik.setFieldTouched("sq_quote", true);
                                  uploadImage(e);
                                }}
                              />
                            </div>

                            {/* View Quote Button */}
                            {formik.values.sq_quote && (
                              <a
                                href={`${BASE_URL}public/Uploads/${formik.values.sq_quote}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary text-nowrap"
                              >
                                <i className="fa-solid fa-eye me-1"></i>
                                View Quote
                              </a>
                            )}
                          </div>

                          {/* Error */}
                          {formik.touched.sq_quote && formik.errors.sq_quote && (
                            <div className="simple-error-text">
                              {formik.errors.sq_quote}
                            </div>
                          )}

                          {/* Upload Progress */}
                          {uploading && (
                            <div className="simple-progress-wrapper mt-2">
                              <div className="simple-progress-info mb-1">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                              </div>

                              <div className="simple-progress-bar">
                                <div
                                  className="simple-progress-fill"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-md-12">
                        <label className="order-form-label mt-3">
                          Requirement / Remark <span className="text-danger">*</span>
                        </label>

                        <textarea
                          rows={4}
                          name="sq_remark"
                          placeholder="Enter requirement or remark..."
                          className={`order-textarea ${formik.touched.sq_remark && formik.errors.sq_remark
                            ? "is-invalid"
                            : ""
                            }`}
                          value={formik.values.sq_remark}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />

                        <div className="invalid-feedback d-block">
                          {formik.touched.sq_remark && formik.errors.sq_remark}
                        </div>
                      </div>

                      <div className="model-add-edit-modal-footer d-flex justify-content-between mt-4">
                        <button
                          type="button"
                          className="model-add-edit-btn model-add-edit-btn-cancel"
                          onClick={resetForm}
                        >
                          Close
                        </button>

                        <button
                          type="submit"
                          className="model-add-edit-btn model-add-edit-btn-save-primary"
                          disabled={uploading}
                        >
                          {uploading
                            ? "Uploading..."
                            : existingQuoteId
                              ? "Update Quote"
                              : "Save Quote"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Query Modal */}
      {showQueryModal && (
        <div className="model-add-edit-modal-overlay">
          <div className="model-add-edit-modal-dialog model-size-md">
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header-primary">
                <h5 className="model-add-edit-modal-title">
                  Query - Order ID- {selectedOrder?.order_code}
                </h5>

                <button
                  type="button"
                  className="model-add-edit-modal-close"
                  onClick={() => setShowQueryModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="model-add-edit-modal-body p-0">
                <div className="chat-container">
                  {messages
                    .filter(
                      (msg) =>
                        msg.que_send === "supplier" ||
                        (msg.que_send === "customer" && msg.que_status == 1)
                    )
                    .map((msg) => (
                      <div
                        key={msg.que_id}
                        className={`chat-message ${msg.que_send === "supplier" ? "right" : "left"
                          }`}
                      >
                        <div
                          className={`chat-bubble ${msg.que_send === "supplier" ? "sent" : "received"
                            }`}
                        >
                          {msg.que_send === "customer"
                            ? msg.que_edit_message || msg.que_message
                            : msg.que_message}
                          <span className="chat-time">
                            {new Date(
                              `1970-01-01T${msg.que_created_time}`
                            ).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>
                      </div>
                    ))}

                  <div ref={messagesEndRef}></div>
                </div>

                <div className="chat-footer">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />

                  <button className="chat-send-btn" onClick={sendMessage}>
                    <i className="fa-solid fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Description Modal */}
      {showDescriptionModal && (
        <div className="model-add-edit-modal-overlay">
          <div
            className="model-add-edit-modal-dialog"
            style={{ maxWidth: "400px" }}
          >
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header-primary">
                <h5 className="model-add-edit-modal-title">
                  <i className="bi bi-card-text me-2"></i>
                  Order Description
                </h5>

                <button
                  type="button"
                  className="model-add-edit-modal-close"
                  onClick={() => setShowDescriptionModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="model-add-edit-modal-body">
                <p
                  style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.8",
                    marginBottom: 0,
                  }}
                >
                  {selectedDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Items Modal */}
      {showCartModal && (
        <div
          className="sc-cartmodal-overlay"
          onClick={() => setShowCartModal(false)}
        >
          <div
            className="sc-cartmodal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sc-cartmodal-content">
              {cartLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success" role="status"></div>
                  <p className="mt-2 text-muted">Loading Details...</p>
                </div>
              ) : cartItems.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-bordered table-striped align-middle sc-cart-table m-0">
                    <thead>
                      <tr>
                        <th>Gerber File</th>
                        <th>Basic Information</th>
                        <th>PCB Specifications</th>
                        <th>High Specs & Options</th>
                        <th>Gerber Preview</th>
                      </tr>
                    </thead>
                    <tbody className="activity-date-time">
                      {cartItems.map((item, index) => (
                        <React.Fragment key={item.cart_id || index}>

                          <tr>
                            <td colSpan={5} className="text-center py-2">
                              <h4>Order Number: {selectedOrder?.order_code}</h4>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              {selectedOrder?.order_gerber_file ? (
                                <a
                                  href={`${BASE_URL}api/jlcpcb/download-gerber/${selectedOrder.order_gerber_file}`}
                                  className="btn btn-sm btn-danger"
                                >
                                  <i className="fa-solid fa-download me-1"></i>
                                  {selectedOrder.order_gerber_file}
                                </a>
                              ) : (
                                <span className="text-muted">
                                  No File
                                </span>
                              )}
                            </td>
                            <td>
                              <div className="sc-tbl-row">
                                <strong>Base Material:</strong>{" "}
                                {item.cart_base_material || "N/A"}
                              </div>
                              <div className="sc-tbl-row">
                                <strong>Layers:</strong>{" "}
                                {item.cart_pcb_layer || "N/A"} Layer(s)
                              </div>
                              <div className="sc-tbl-row">
                                <strong>Dimensions:</strong>{" "}
                                {item.cart_pcb_width && item.cart_pcb_height
                                  ? `${item.cart_pcb_width} × ${item.cart_pcb_height} mm`
                                  : "N/A"}
                              </div>
                              <div className="sc-tbl-row">
                                <strong>Qty:</strong>{" "}
                                <span className="badge bg-success">
                                  {item.cart_selected_qty || 0} Pcs
                                </span>
                              </div>
                              <div className="sc-tbl-row">
                                <strong>Product Type:</strong>{" "}
                                {item.cart_product_type || "N/A"}
                              </div>
                            </td>

                            <td>
                              <div className="sc-tbl-row">
                                <strong>Diff Design:</strong>{" "}
                                {item.cart_different_design || "1"}
                              </div>
                              <div className="sc-tbl-row">
                                <strong>Format:</strong>{" "}
                                {item.cart_delivery_format || "N/A"}
                              </div>
                              <div className="sc-tbl-row">
                                <strong>Thickness:</strong>{" "}
                                {item.cart_pcb_thickness || "N/A"} mm
                              </div>
                              <div className="sc-tbl-row">
                                <strong>Color:</strong>{" "}
                                {item.cart_pcb_color || "N/A"}
                              </div>
                              <div className="sc-tbl-row">
                                <strong>Silkscreen:</strong>{" "}
                                {item.cart_silkscreen || "N/A"}
                              </div>
                              <div className="sc-tbl-row">
                                <strong>Material:</strong>{" "}
                                {item.cart_material_type || "N/A"}
                              </div>
                              <div className="sc-tbl-row">
                                <strong>Surface Finish:</strong>{" "}
                                {item.cart_surface_finish || "N/A"}
                              </div>
                            </td>

                            <td>
                              <div className="sc-tbl-row">
                                <strong>Outer Copper:</strong>{" "}
                                {item.cart_outer_copper_weight || "N/A"}
                              </div>
                              <div className="sc-tbl-row">
                                <strong>Via Covering:</strong>{" "}
                                {item.cart_via_covering || "N/A"}
                              </div>
                              <div className="sc-tbl-row">
                                <strong>Via Plating:</strong>{" "}
                                {item.cart_via_plating || "Not Specified"}
                              </div>
                              <div className="sc-tbl-row">
                                <strong>Min Via Hole:</strong>{" "}
                                {item.cart_min_via_hole || "N/A"}
                              </div>
                              <div className="sc-tbl-row">
                                <strong>Outline Tol:</strong>{" "}
                                {item.cart_outline_tolerance || "N/A"}
                              </div>
                              <div className="sc-tbl-row">
                                <strong>Confirm File:</strong>{" "}
                                {item.cart_confirm_production_file || "No"}
                              </div>
                              <div className="sc-tbl-row">
                                <strong>Mark on PCB:</strong>{" "}
                                {item.cart_mark_on_pcb || "N/A"}
                              </div>
                              <div className="sc-tbl-row">
                                <strong>Electrical Test:</strong>{" "}
                                {item.cart_electrical_test || "N/A"}
                              </div>
                            </td>

                            <td className="text-center">
                              <div className="d-flex gap-1 justify-content-center flex-wrap">
                                {item.cart_gerber_top_img && (
                                  <img
                                    src={item.cart_gerber_top_img}
                                    alt="Top Gerber"
                                    className="sc-tbl-gerber-img me-3"
                                    title="Top Gerber"
                                  />
                                )}
                                {item.cart_gerber_bottom_img && (
                                  <img
                                    src={item.cart_gerber_bottom_img}
                                    alt="Bottom Gerber"
                                    className="sc-tbl-gerber-img"
                                    title="Bottom Gerber"
                                  />
                                )}
                                {!item.cart_gerber_top_img &&
                                  !item.cart_gerber_bottom_img && (
                                    <span className="text-muted small">
                                      No Image
                                    </span>
                                  )}
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-danger my-4 fw-semibold p-4">
                  No cart items found for this order.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stage Drawer Component */}
      <StageDrawer
        open={showStageDrawer}
        onClose={() => setShowStageDrawer(false)}
        order={selectedOrder}
      />
    </>
  );
}

export default Orders;