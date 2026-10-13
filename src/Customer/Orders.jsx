import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";
import Delete from "../Config/Delete";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useNavigate, Link } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import TableLoader from "../Config/TableLoader";
import Select from "react-select";
import StageDrawer from "./StageDrawer";
import GlobalSearchInput from "../Config/GlobalSearchInput";
import { UseGlobalSearch } from "../Config/UseGlobalSearch";

function Orders() {
  const [orderData, setorderData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { searchTerm, setSearchTerm, filteredData } = UseGlobalSearch(orderData);

  // Query Modal States
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [saveList, setSaveList] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showPdf, setShowPdf] = useState(false);
  const [showStageDrawer, setShowStageDrawer] = useState(false);

  // DESIGN APPROVAL STATES
  const [showDesignApproveModal, setShowDesignApproveModal] = useState(false);
  const [approvingDesign, setApprovingDesign] = useState(false);

  // DELIVERY STATES
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showNoDeliveryDocumentModal, setShowNoDeliveryDocumentModal] = useState(false);
  const [deliveryFile, setDeliveryFile] = useState(null);
  const [deliveryUploading, setDeliveryUploading] = useState(false);
  const [deliveryUploadProgress, setDeliveryUploadProgress] = useState(0);

  // Cart Details Modal States
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  const customer = JSON.parse(localStorage.getItem("customer"));
  const CustId = customer?.cust_id;

  const custSchema = Yup.object({
    order_uploaded_requirement: Yup.string()
      .required("Please upload PDF or ZIP file"),

    order_requirement_text: Yup.string()
      .trim()
      .required("Requirement is required")
      .min(10, "Requirement must be at least 10 characters")
      .max(1000, "Requirement cannot exceed 1000 characters"),
  });

  useEffect(() => {
    getorderData();
  }, []);

  const getSavequote = async () => {
    try {
      const res = await axios.get(`${BASE_URL}customer/getdatawhere/tbl_save_quote/save_cust_id/${CustId}`);

      if (res.data.status) {
        const activeQuotes = res.data.data.filter(
          item => Number(item.save_status) === 1
        );
        setSaveList(activeQuotes);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Auto-scroll for messages in Query Modal
  useEffect(() => {
    if (showQueryModal) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    }
  }, [messages, showQueryModal]);

  // Check if supplier has sent at least one active message
  const isSupplierResponded = messages.some(
    (msg) => msg.que_send === "supplier" && msg.que_status == 1
  );

  // Messages API Call With Loading
  const getMessages = async (orderId) => {
    setMessagesLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}customer/getdatawhere/tbl_query/que_order_id/${orderId}`
      );

      if (res.data.status) {
        setMessages(res.data.data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async () => {
    if (message.trim() === "" || !isSupplierResponded) return;

    try {
      await axios.post(
        `${BASE_URL}customer/insert/tbl_query`,
        {
          que_order_id: selectedOrder.order_id,
          que_cust_id: CustId,
          que_supp_id: selectedOrder.order_transfer_supplier,
          que_send: "customer",
          que_message: message,
          que_cust_read: 1,
          que_supp_read: 0,
        }
      );

      setMessage("");
      getMessages(selectedOrder.order_id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    }
  };

  const markCustomerRead = async (orderId) => {
    try {
      await axios.post(
        `${BASE_URL}customer/markCustomerRead`,
        {
          order_id: orderId
        }
      );
      getorderData();
    } catch (err) {
      console.log(err);
    }
  };

  const formik = useFormik({
    initialValues: {
      order_uploaded_requirement: "",
      order_requirement_text: "",
    },

    validationSchema: custSchema,

    onSubmit: async (values) => {
      if (uploading) {
        toast.error("Please wait until file upload completes.");
        return;
      }
      saveOrder(values);
    },
  });


  // DESIGN APPROVE -> ORDER STAGE 11
  const approveDesign = async () => {
    if (!selectedOrder?.order_id) {
      toast.error("Order not found");
      return;
    }

    setApprovingDesign(true);

    try {
      const response = await axios.post(
        `${BASE_URL}supplier/updatedata/tbl_orders/order_id/${selectedOrder.order_id}`,
        {
          order_stage: 11,
        }
      );

      if (response.data.status) {
        toast.success(
          "Design approved successfully. Order moved to Production."
        );

        // Close modal
        setShowDesignApproveModal(false);

        // Update current selected order
        setSelectedOrder((prev) =>
          prev
            ? {
              ...prev,
              order_stage: 11,
            }
            : prev
        );

        // Refresh order list
        await getorderData();
      } else {
        toast.error(
          response.data.message || "Failed to approve design"
        );
      }
    } catch (error) {
      console.error("Design approval error:", error);

      toast.error(
        error?.response?.data?.message ||
        "Something went wrong while approving design"
      );
    } finally {
      setApprovingDesign(false);
    }
  };


  // ==========================================
  // DELIVERY - OPEN MODAL
  // ==========================================
  const openDeliveryModal = (order) => {
    if (String(order?.order_stage) !== "14") {
      toast.error("Delivery can only be confirmed for In Transit orders");
      return;
    }

    setSelectedOrder(order);
    setDeliveryFile(null);
    setDeliveryUploadProgress(0);
    setShowNoDeliveryDocumentModal(false);
    setShowDeliveryModal(true);
  };

  const closeDeliveryModal = () => {
    if (deliveryUploading) return;

    setShowDeliveryModal(false);
    setShowNoDeliveryDocumentModal(false);
    setDeliveryFile(null);
    setDeliveryUploadProgress(0);
  };

  const handleDeliveryFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setDeliveryFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      e.target.value = "";
      setDeliveryFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/zip",
      "application/x-zip-compressed",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF, JPG, JPEG, PNG or ZIP files are allowed");
      e.target.value = "";
      setDeliveryFile(null);
      return;
    }

    setDeliveryFile(file);
  };

  const submitDelivery = async () => {
    if (!selectedOrder?.order_id) {
      toast.error("Order ID not found");
      return;
    }

    if (String(selectedOrder.order_stage) !== "14") {
      toast.error("Delivery can only be confirmed for In Transit orders");
      return;
    }

    if (!deliveryFile) {
      setShowNoDeliveryDocumentModal(true);
      return;
    }

    await uploadDeliveryAndUpdateStage();
  };

  const confirmDeliveryWithoutDocument = async () => {
    setShowNoDeliveryDocumentModal(false);
    await uploadDeliveryAndUpdateStage();
  };

  const uploadDeliveryAndUpdateStage = async () => {
    if (!selectedOrder?.order_id) {
      toast.error("Order ID not found");
      return;
    }

    setDeliveryUploading(true);
    setDeliveryUploadProgress(0);

    try {
      let fileName = null;

      if (deliveryFile) {
        const formData = new FormData();
        formData.append("file", deliveryFile);

        const uploadResponse = await axios.post(
          `${BASE_URL}customer/fileupload`,
          formData,
          {
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percent = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setDeliveryUploadProgress(percent);
              }
            },
          }
        );

        if (!uploadResponse.data?.status || !uploadResponse.data?.files) {
          toast.error(
            uploadResponse.data?.message || "File upload failed"
          );
          return;
        }

        fileName = Object.values(uploadResponse.data.files)[0];

        if (!fileName) {
          toast.error("Uploaded file name not received");
          return;
        }
      }

      const updateData = {
        order_id: selectedOrder.order_id,
        order_stage: 15,
      };

      if (fileName) {
        updateData.delivery_proof = fileName;
      }

      const updateResponse = await axios.post(
        `${BASE_URL}customer/updatedata/tbl_orders/order_id/${selectedOrder.order_id}`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (updateResponse.data?.status) {
        toast.success(
          deliveryFile
            ? "Delivery proof uploaded and order delivered successfully"
            : "Order delivered without delivery proof"
        );

        closeDeliveryModal();
        await getorderData();
      } else {
        toast.error(
          updateResponse.data?.message || "Order update failed"
        );
      }
    } catch (error) {
      console.error("Delivery Error:", error);
      toast.error(
        error?.response?.data?.message ||
        "Something went wrong while confirming delivery"
      );
    } finally {
      setDeliveryUploading(false);
    }
  };

  // Order All Data Get Function
  const getorderData = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${BASE_URL}customer/getCustomerOrders/${CustId}`
      );

      if (response.data.status) {
        setorderData(response.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Order Click -> Fetch Cart Items and Show Modal
  const handleOrderClick = async (order) => {
    setSelectedOrder(order);
    setShowCartModal(true);
    setCartLoading(true);

    try {
      const cartIds = order.order_cart_id;

      if (cartIds) {
        const res = await axios.post(`${BASE_URL}customer/getCartDetails`, {
          cart_ids: cartIds
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

  // Order Insert/Save function
  const saveOrder = async (values) => {
    try {
      const payload = {
        order_cust_id: CustId,
        order_uploaded_requirement: values.order_uploaded_requirement,
        order_requirement_text: values.order_requirement_text,
      };

      const response = await axios.post(
        `${BASE_URL}customer/insert/tbl_orders`,
        payload
      );

      if (response.data.status) {
        toast.success(response.data.message);
        resetForm();
        getorderData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  // Order Add/Edit Form Reset Function
  const resetForm = () => {
    formik.resetForm();
    setSelectedQuote(null);
    setUploadProgress(0);
    setUploading(false);
    setShowModal(false);
  };

  return (
    <>
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-people text-success" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1 text-success">All</p>
              <h1 className="h3 mb-1">Orders</h1>
            </div>
          </div>
        </div>


        <section className="panel">
          <div className="row mb-3">
            <div className="col-md-3">
              {/* <input type="text" className="filter-input" placeholder="Search orders..." /> */}
            </div>
            <div className="col-md-3">
              {/* <input type="text" className="filter-input" placeholder="Search orders..." /> */}
            </div>
            <div className="col-md-1">
              {/* <input type="text" className="filter-input" placeholder="Search orders..." /> */}
            </div>
            <div className="col-md-3 text-end">
              {/* <GlobalSearchInput
                value={searchTerm}
                onChange={(text) => setSearchTerm(text)}
                placeholder="Search Orders . . . . ."
              /> */}
            </div>
            <div className="col-md-2 text-center">
              <Link to="/cart" className="btn btn-outline-success">
                <i className="bi bi-plus"></i> Add{" "}
              </Link>
            </div>
          </div>

          <div className="table-responsive">
            <table
              className="table align-middle mb-0"
              id="ordersTable"
              data-searchable-table
            >
              <thead>
                <tr className="text-center">
                  <th>Action</th>
                  <th>Order Detail</th>
                  <th>Stage</th>
                  <th>Activity</th>
                </tr>
              </thead>
              <tbody className="activity-date-time">
                {loading ? (
                  <TableLoader rows={6} columns={5} />
                ) : orderData.length > 0 ? (
                  filteredData.map((order) => (
                    <tr key={order.order_id}>
                      <td className="text-center fw-semibold" style={{
                        width: "200px",
                        minWidth: "300px",
                        maxWidth: "300px",
                        whiteSpace: "nowrap",
                      }}>
                        <div className="d-flex align-items-center justify-content-center flex-nowrap gap-1">

                          {/* QUERY */}
                          <div className="position-relative">
                            <a href="#"
                              className="btn btn-sm text-primary"style={{
                              boxShadow: "none",
                              border: "none",
                              outline: "none",
                              transform: "none",
                              
                         
                            }}

                              onClick={() => {
                                setSelectedOrder(order);
                                setShowQueryModal(true);
                                markCustomerRead(order.order_id);
                                getMessages(order.order_id);
                              }}
                              disabled={Number(order.order_stage) <= 7}
                            >
                              <i className="fa-regular fa-circle-question query-icon"></i> Query
                            </a>

                            

                            {parseInt(order.unread_count) > 0 && (
                              <span
                                className="position-absolute rounded-circle bg-primary"
                                style={{
                                  width: "12px",
                                  height: "12px",
                                  right: "-2px",
                                  top: "-2px",
                                  zIndex: 9999,
                                }}
                              />
                            )}
                          </div>
                          {/* DELIVER - ONLY IN TRANSIT / STAGE 14 */}
                          {String(order.order_stage) === "14" && (
                            <a href="#"
                              type="button"
                              className="btn text-success btn-sm"style={{ boxShadow: "none",
                             transform: "none", border: "none", outline: "none"}}
                              onClick={() => openDeliveryModal(order)}
                            >
                              <i className="fa-solid fa-truck-fast me-1 query-icon"></i>
                              Deliver
                            </a>
                          )}


                          {/* DESIGN DROPDOWN */}
                          {String(order.order_stage) >= 9 && String(order.order_stage) <= 10 && (
                            <div className="dropdown">
                              <button
                                type="button"
                                className="btn text-success btn-sm dropdown-toggle"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                style={{ boxShadow: "none",
                            transform: "none", border: "none", outline: "none"}}
                              >
                                <i className="fa-solid fa-palette me-1 query-icon"></i>
                                Design
                              </button>

                              <ul className="dropdown-menu dropdown-menu-end shadow-sm">

                                {/* VIEW DESIGN */}
                                {order.order_design &&
                                  String(order.order_design).trim() !== "" ? (
                                  <li>
                                    <a
                                      href={`${BASE_URL}public/Uploads/${order.order_design}`}
                                      className="dropdown-item"
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      <i className="fa-solid fa-eye me-2 text-primary query-icon"></i>
                                      View Design
                                    </a>
                                  </li>
                                ) : (
                                  <li>
                                    <button
                                      type="button"
                                      className="dropdown-item text-muted"
                                      disabled
                                    >
                                      <i className="fa-solid fa-eye-slash me-2 query-icon "></i>
                                      Design Not Available
                                    </button>
                                  </li>
                                )}

                                {/* DESIGN APPROVE */}
                                <li>
                                  <button
                                    type="button"
                                    className="dropdown-item"
                                    disabled={
                                      !order.order_design ||
                                      String(order.order_design).trim() === "" ||
                                      Number(order.order_stage) >= 11
                                    }
                                    onClick={() => {
                                      setSelectedOrder(order);
                                      setShowDesignApproveModal(true);
                                    }}
                                  >
                                    <i
                                      className={`fa-solid fa-circle-check me-2 ${Number(order.order_stage) >= 11
                                        ? "text-muted"
                                        : "text-success"
                                        }`}
                                    ></i>

                                    {Number(order.order_stage) >= 11
                                      ? "Design Approved"
                                      : "Design Approve"}
                                  </button>
                                </li>

                              </ul>
                            </div>
                          )}

                        </div>
                      </td>
                      <td className="text-center">
                        <b
                          style={{
                            fontSize: "14px",
                            cursor: "pointer",
                            color: "#198754",
                           
                          }}
                          onClick={() => handleOrderClick(order)}
                          title="Click to view Order Details"
                        >
                          {order.order_code}
                        </b>
                        <br />
                      </td>

                      <td className="text-center">
                       <a
                              href="#"
                              className="btn btn-sm text-success" style={{ boxShadow: "none",transform: "none",transform: "none", transform: "none", border: "none", outline: "none",
                             }}

                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedOrder(order);
                                setShowStageDrawer(true);
                              }}
                            >
                              <i className="fas fa-route me-2 query-icon"></i>
                              Tracking
                            </a>
                      </td>

                      <td className="text-start">
                        <span className="fw-semibold">Created Date:</span>{" "}
                        {order.order_request_date} <br />{" "}
                        <span className="fw-semibold">Created Time:</span>{" "}
                        {new Date(`1970-01-01T${order.order_request_time}`).toLocaleTimeString(
                          "en-IN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}
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

      {/* Cart Modal */}
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
                        <th>Basic Information</th>
                        <th>PCB Specifications</th>
                        <th>High Specs & Options</th>
                        <th>Gerber Preview</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item, index) => (
                        <React.Fragment key={item.cart_id || index}>
                          <tr>
                            <td colSpan={4} className="text-center py-2">
                              <h4>Order Number: {selectedOrder?.order_code}</h4>
                            </td>
                          </tr>
                          <tr>
                            {/* Basic Info */}
                            <td>
                              <div className="sc-tbl-row"><strong>Base Material:</strong> {item.cart_base_material || "N/A"}</div>
                              <div className="sc-tbl-row"><strong>Layers:</strong> {item.cart_pcb_layer || "N/A"} Layer(s)</div>
                              <div className="sc-tbl-row">
                                <strong>Dimensions:</strong>{" "}
                                {item.cart_pcb_width && item.cart_pcb_height
                                  ? `${item.cart_pcb_width} × ${item.cart_pcb_height} mm`
                                  : "N/A"}
                              </div>
                              <div className="sc-tbl-row">
                                <strong>Qty:</strong> <span className="badge bg-success">{item.cart_selected_qty || 0} Pcs</span>
                              </div>
                              <div className="sc-tbl-row"><strong>Product Type:</strong> {item.cart_product_type || "N/A"}</div>
                            </td>

                            {/* Specifications */}
                            <td>
                              <div className="sc-tbl-row"><strong>Diff Design:</strong> {item.cart_different_design || "1"}</div>
                              <div className="sc-tbl-row"><strong>Format:</strong> {item.cart_delivery_format || "N/A"}</div>
                              <div className="sc-tbl-row"><strong>Thickness:</strong> {item.cart_pcb_thickness || "N/A"} mm</div>
                              <div className="sc-tbl-row"><strong>Color:</strong> {item.cart_pcb_color || "N/A"}</div>
                              <div className="sc-tbl-row"><strong>Silkscreen:</strong> {item.cart_silkscreen || "N/A"}</div>
                              <div className="sc-tbl-row"><strong>Material:</strong> {item.cart_material_type || "N/A"}</div>
                              <div className="sc-tbl-row"><strong>Surface Finish:</strong> {item.cart_surface_finish || "N/A"}</div>
                            </td>

                            {/* High Specs */}
                            <td>
                              <div className="sc-tbl-row"><strong>Outer Copper:</strong> {item.cart_outer_copper_weight || "N/A"}</div>
                              <div className="sc-tbl-row"><strong>Via Covering:</strong> {item.cart_via_covering || "N/A"}</div>
                              <div className="sc-tbl-row"><strong>Via Plating:</strong> {item.cart_via_plating || "Not Specified"}</div>
                              <div className="sc-tbl-row"><strong>Min Via Hole:</strong> {item.cart_min_via_hole || "N/A"}</div>
                              <div className="sc-tbl-row"><strong>Outline Tol:</strong> {item.cart_outline_tolerance || "N/A"}</div>
                              <div className="sc-tbl-row"><strong>Confirm File:</strong> {item.cart_confirm_production_file || "No"}</div>
                              <div className="sc-tbl-row"><strong>Mark on PCB:</strong> {item.cart_mark_on_pcb || "N/A"}</div>
                              <div className="sc-tbl-row"><strong>Electrical Test:</strong> {item.cart_electrical_test || "N/A"}</div>
                            </td>

                            {/* Gerber Preview */}
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
                                {!item.cart_gerber_top_img && !item.cart_gerber_bottom_img && (
                                  <span className="text-muted small">No Image</span>
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

      {/* Query Chat Modal */}
      {showQueryModal && (
        <div className="model-add-edit-modal-overlay">
          <div className="model-add-edit-modal-dialog model-size-md">
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header-success">
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

                {/* Chat Area */}
                <div className="chat-container">
                  {messagesLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-success" role="status"></div>
                      <p className="mt-2 text-muted">Loading messages...</p>
                    </div>
                  ) : (() => {
                    const filteredMessages = messages.filter(
                      (msg) =>
                        msg.que_send === "customer" ||
                        (msg.que_send === "supplier" && msg.que_status == 1)
                    );

                    if (filteredMessages.length === 0) {
                      return (
                        <div className="empty-chat-container">
                          <div className="empty-chat-icon-wrapper">
                            <i className="fa-solid fa-comments-nolock fa-lock"></i>
                          </div>

                          <h6 className="empty-chat-title">No Active Query</h6>

                          <p className="empty-chat-description">
                            No query has been received from the <strong>Secure Circuit team</strong> for this order yet.
                          </p>

                          <span className="empty-chat-status-badge">
                            <i className="fa-solid fa-circle-info me-1"></i> Messaging will unlock once the team reaches out.
                          </span>
                        </div>
                      );
                    }

                    return filteredMessages.map((msg) => (
                      <div
                        key={msg.que_id}
                        className={`chat-message ${msg.que_send === "customer" ? "right" : "left"}`}
                      >
                        <div
                          className={`chat-bubble ${msg.que_send === "customer" ? "sent" : "received"}`}
                        >
                          {msg.que_send === "supplier"
                            ? (msg.que_edit_message || msg.que_message)
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
                    ));
                  })()}

                  <div ref={messagesEndRef}></div>
                </div>

                <div className="chat-footer">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder={
                      isSupplierResponded
                        ? "Type a message..."
                        : "Waiting for Secure Circuit team to send a query..."
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={!isSupplierResponded || messagesLoading}
                  />

                  <button
                    className="chat-send-btn"
                    onClick={sendMessage}
                    disabled={!isSupplierResponded || messagesLoading}
                    title={!isSupplierResponded ? "Messaging is locked until team responds" : "Send message"}
                  >
                    <i className={`fa-solid ${isSupplierResponded ? "fa-paper-plane" : "fa-lock"}`}></i>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* DESIGN APPROVAL CONFIRMATION MODAL */}
      {showDesignApproveModal && (
        <div
          className="model-add-edit-modal-overlay"
          onClick={() => {
            if (!approvingDesign) {
              setShowDesignApproveModal(false);
            }
          }}
        >
          <div
            className="model-add-edit-modal-dialog"
            style={{ maxWidth: "420px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="model-add-edit-modal-content">

              {/* HEADER */}
              <div className="model-add-edit-modal-header-success">

                <h5 className="model-add-edit-modal-title">
                  Design Approval
                </h5>

                <button
                  type="button"
                  className="model-add-edit-modal-close"
                  disabled={approvingDesign}
                  onClick={() => {
                    setShowDesignApproveModal(false);
                  }}
                >
                  ✕
                </button>

              </div>

              {/* BODY */}
              <div className="model-add-edit-modal-body text-center p-4">

                <div className="mb-3">
                  <i
                    className="fa-solid fa-circle-check text-success"
                    style={{
                      fontSize: "50px",
                    }}
                  ></i>
                </div>

                <h5 className="mb-2">
                  Approve Design?
                </h5>

                <p className="text-muted mb-2">
                  Are you sure you want to approve this design?
                </p>

                <p className="small text-muted mb-3">
                  After design approval, this order will move to
                  <strong> Production</strong>.
                </p>

              </div>

              {/* FOOTER */}
              <div className="d-flex justify-content-between justify-content-end gap-2 p-3 border-top">

                {/* CANCEL */}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={approvingDesign}
                  onClick={() => {
                    setShowDesignApproveModal(false);
                  }}
                >
                  Cancel
                </button>

                {/* CONFIRM */}
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  disabled={approvingDesign}
                  onClick={approveDesign}
                >
                  {approvingDesign ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>

                      Approving...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check me-1"></i>
                      Confirm Approve
                    </>
                  )}
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          DELIVERY PROOF MODAL
      ========================================== */}
      {showDeliveryModal && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={closeDeliveryModal}
          ></div>

          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">

                <div className="modal-header bg-success text-white">
                  <div>
                    <h5 className="modal-title mb-1">
                      <i className="bi bi-check2-circle me-2"></i>
                      Delivery
                    </h5>
                    {selectedOrder?.order_id && (
                      <small className="d-block">
                        Order Code:{" "}
                        {selectedOrder.order_code || selectedOrder.order_id}
                      </small>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeDeliveryModal}
                    disabled={deliveryUploading}
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Upload Delivery Proof
                      <span className="text-muted ms-2">(Optional)</span>
                    </label>

                    <input
                      type="file"
                      className="form-control"
                      accept=".pdf,.jpg,.jpeg,.png,.zip"
                      onChange={handleDeliveryFileChange}
                      disabled={deliveryUploading}
                    />

                    <div className="form-text">
                      PDF, JPG, JPEG, PNG or ZIP allowed. Maximum 10MB.
                    </div>

                    {deliveryFile && (
                      <div className="small text-success mt-2">
                        <i className="bi bi-file-earmark-check me-1"></i>
                        Selected: {deliveryFile.name}
                      </div>
                    )}

                    {!deliveryFile && (
                      <div className="small text-muted mt-2">
                        <i className="bi bi-info-circle me-1"></i>
                        Document is optional.
                      </div>
                    )}
                  </div>

                  {deliveryUploading && deliveryFile && (
                    <div className="mt-3">
                      <div className="d-flex justify-content-between mb-1">
                        <small className="text-muted">Uploading...</small>
                        <small className="fw-semibold">
                          {deliveryUploadProgress}%
                        </small>
                      </div>

                      <div className="progress" style={{ height: "6px" }}>
                        <div
                          className="progress-bar bg-success"
                          role="progressbar"
                          style={{ width: `${deliveryUploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeDeliveryModal}
                    disabled={deliveryUploading}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className="btn btn-success "
                    onClick={submitDelivery}
                    disabled={deliveryUploading}
                  >
                    {deliveryUploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1"></span>
                        {deliveryFile ? "Uploading..." : "Submitting..."}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle me-1"></i>
                        Confirm Delivery
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
      {showNoDeliveryDocumentModal && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1055 }}
          ></div>

          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ zIndex: 1060 }}
          >
            <div className="modal-dialog modal-dialog-centered modal-sm">
              <div className="modal-content">

                <div className="modal-header py-2">
                  <h6 className="modal-title fw-semibold mb-0">
                    Confirm Delivery
                  </h6>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowNoDeliveryDocumentModal(false)}
                    disabled={deliveryUploading}
                  ></button>
                </div>

                <div className="modal-body text-center py-3">
                  <i className="bi bi-exclamation-circle text-warning fs-2"></i>

                  <p className="mb-0 mt-2 small">
                    No Delivery Proof document has been uploaded.
                  </p>

                  <p className="mb-0 mt-1 small text-muted">
                    Do you want to continue without document?
                  </p>
                </div>

                <div className="modal-footer py-2 justify-content-center ">
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setShowNoDeliveryDocumentModal(false)}
                    disabled={deliveryUploading}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-success"
                    onClick={confirmDeliveryWithoutDocument}
                    disabled={deliveryUploading}
                  >
                    {deliveryUploading ? (
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