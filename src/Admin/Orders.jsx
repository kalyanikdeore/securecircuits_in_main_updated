import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";
import Delete from "../Config/Delete";
import React, { useEffect, useRef, useState } from "react";
import TableLoader from "../Config/TableLoader";
import * as bootstrap from "bootstrap";
import StageDrawer from "./StageDrawer";
import GlobalSearchInput from "../Config/GlobalSearchInput";
import { UseGlobalSearch } from "../Config/UseGlobalSearch";
import * as Yup from "yup";
import { useFormik } from "formik";

function Orders() {
  const admin = JSON.parse(localStorage.getItem("admin"));
  const adminrole = admin?.staff_role;

  const [orderData, setorderData] = useState([]);
  const { searchTerm, setSearchTerm, filteredData } = UseGlobalSearch(orderData);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [customerData, setCustomerData] = useState([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMessageId, setEditMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const [showStageDrawer, setShowStageDrawer] = useState(false);


  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeOrder, setCompleteOrder] = useState(null);
  const [completeLoading, setCompleteLoading] = useState(false);

  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [cartDetails, setCartDetails] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const [quotations, setQuotations] = useState([]);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [quotationLoading, setQuotationLoading] = useState(false);

  // Quote States
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState("");
  const [supplierQuoteStatus, setSupplierQuoteStatus] = useState({});




  // Formik validation for Order Quotation Update
  const formik = useFormik({
    initialValues: {
      order_quotation: "",
      order_remark: "",
      order_quote_supplier: "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      order_quotation: Yup.string().required("Quotation file is required"),
      order_remark: Yup.string().required("Remark is required"),
      order_quote_supplier: Yup.string().required("Supplier is required"),
    }),
    onSubmit: async (values) => {
      try {
        const payload = {
          order_id: selectedOrder?.order_id,
          order_quotation: values.order_quotation,
          order_remark: values.order_remark,
          order_quote_supplier: values.order_quote_supplier,
          order_stage: "6",
        };

        const res = await axios.post(
          `${BASE_URL}admin/updatedata/tbl_orders/order_id/${selectedOrder?.order_id}`,
          payload
        );

        if (res.data.status) {
          toast.success("Quote Sent successfully!");
          resetForm();
          getorderData();
        } else {
          toast.error(res.data.message || "Failed to update quote");
        }
      } catch (error) {
        console.error("Quote Submission Error:", error);
        toast.error("Something went wrong!");
      }
    },
  });

  const handleOpenQuoteModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
    formik.setValues({
      order_quotation: order.order_quotation || "",
      order_remark: order.order_remark || "",
      order_quote_supplier: order.order_quote_supplier || "",
    });
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploadProgress(0);

    try {
      const res = await axios.post(`${BASE_URL}admin/fileupload`, formData, {
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
        formik.setFieldValue("order_quotation", fileName);
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
    setUploadProgress(0);
  };
  const checkSupplierQuotes = async (orders) => {
    try {
      const quoteStatus = {};

      await Promise.all(
        orders.map(async (order) => {
          try {
            const res = await axios.get(
              `${BASE_URL}admin/getdatawhere/tbl_supplier_quotes/sq_order_id/${order.order_id}`
            );

            if (res.data.status && res.data.data) {
              const data = Array.isArray(res.data.data)
                ? res.data.data
                : [res.data.data];

              const validQuotes = data.filter(
                (quote) => quote.sq_quote
              );

              quoteStatus[order.order_id] = validQuotes.length > 0;
            } else {
              quoteStatus[order.order_id] = false;
            }
          } catch (error) {
            quoteStatus[order.order_id] = false;
          }
        })
      );

      setSupplierQuoteStatus(quoteStatus);
    } catch (error) {
      console.log("Supplier Quote Status Error:", error);
    }
  };

  const fetchCartDetails = async (cartId) => {
    setDetailLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}admin/getdatawhere/tbl_cart/cart_id/${cartId}`
      );

      if (response.data.status) {
        setCartDetails(
          Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data]
        );
      } else {
        setCartDetails([]);
      }
    } catch (error) {
      console.log("Cart data fetch error:", error);
      setCartDetails([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleExpandRow = (order) => {
    if (expandedOrderId === order.order_id) {
      setExpandedOrderId(null);
      setCartDetails([]);
    } else {
      setExpandedOrderId(order.order_id);

      const cartId = order.order_cart_id || order.cart_id;

      if (cartId) {
        fetchCartDetails(cartId);
      } else {
        setCartDetails([order]);
      }
    }
  };

  useEffect(() => {
    const popoverTriggerList = document.querySelectorAll(
      '[data-bs-toggle="popover"]'
    );

    popoverTriggerList.forEach((el) => {
      bootstrap.Popover.getOrCreateInstance(el);
    });
  }, [orderData]);

  const getSupplierData = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}admin/getdata/tbl_suppliers`
      );

      if (response.data.status) {
        setSupplierData(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getorderData();
    getSupplierData();
    getCustomerData();
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

  const getMessages = async (orderId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}admin/getdatawhere/tbl_query/que_order_id/${orderId}`
      );

      if (res.data.status) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const sendMessage = async () => {
    if (!editMessageId) {
      toast.error("Please select a message to edit.");
      return;
    }

    if (message.trim() === "" && !selectedFile && !attachmentPreview) {
      toast.error("Message or attachment is required.");
      return;
    }

    try {
      setUploadingAttachment(true);

      let attachmentName = attachmentPreview;

      // ==========================================
      // NEW FILE UPLOAD
      // ==========================================
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await axios.post(
          `${BASE_URL}admin/fileupload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (!uploadRes.data.status || !uploadRes.data.files) {
          toast.error(uploadRes.data.message || "File upload failed");
          return;
        }

        attachmentName = Object.values(uploadRes.data.files)[0];
      }

      // ==========================================
      // UPDATE QUERY
      // ==========================================
      const res = await axios.post(
        `${BASE_URL}admin/updatedata/tbl_query/que_id/${editMessageId}`,
        {
          que_edit_message: message.trim(),

          // Keep old attachment if new file not selected
          que_attachment: attachmentName || "",
        }
      );

      if (res.data.status) {
        toast.success("Message Updated Successfully");

        setEditMessageId(null);
        setMessage("");
        setSelectedFile(null);
        setAttachmentPreview("");

        const fileInput = document.getElementById("admin-query-file-upload");

        if (fileInput) {
          fileInput.value = "";
        }

        await getMessages(selectedOrder.order_id);
      } else {
        toast.error(res.data.message || "Update Failed");
      }
    } catch (err) {
      console.error("Update Message Error:", err);
      toast.error("Update Failed");
    } finally {
      setUploadingAttachment(false);
    }
  };
  // const changeStatus = async (id, status) => {
  //   try {
  //     const res = await axios.post(
  //       `${BASE_URL}admin/updatedata/tbl_query/que_id/${id}`,
  //       {
  //         que_status: status,
  //       }
  //     );

  //     if (res.data.status) {
  //       toast.success("Status Updated");
  //       getMessages(selectedOrder.order_id);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const editMessage = (msg) => {
  //   setEditMessageId(msg.que_id);
  //   setMessage(msg.que_edit_message || msg.que_message);
  // };

  const changeStatus = async (id, status) => {
    try {
      const payload = {
        que_status: status,
      };

      // Forward to Customer
      if (Number(status) === 1) {
        payload.que_cust_read = 0;
      }

      // Inforward
      if (Number(status) === 0) {
        payload.que_cust_read = 1;
      }

      const res = await axios.post(
        `${BASE_URL}admin/updatedata/tbl_query/que_id/${id}`,
        payload
      );

      if (res.data.status) {
        toast.success(
          Number(status) === 1
            ? "Message Forwarded to Customer"
            : "Message Inforwarded"
        );

        await getMessages(selectedOrder.order_id);
        await getorderData();
      } else {
        toast.error(res.data.message || "Status Update Failed");
      }
    } catch (error) {
      console.error("Change Status Error:", error);
      toast.error("Status Update Failed");
    }
  };

  const editMessage = (msg) => {
    setEditMessageId(msg.que_id);

    // Message text
    setMessage(msg.que_edit_message || msg.que_message || "");

    // Existing attachment
    if (msg.que_attachment) {
      setAttachmentPreview(msg.que_attachment);
    } else {
      setAttachmentPreview(null);
    }

    setSelectedFile(null);
  };
  const handleQueryFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5 MB");
      e.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG and PDF files are allowed");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);

    // New file selected → old attachment preview remove
    setAttachmentPreview(null);
  };

  const getCustomerData = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}admin/getdata/tbl_customers`
      );

      if (response.data.status) {
        setCustomerData(response.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // const getorderData = async () => {
  //   setLoading(true);

  //   try {
  //     const response = await axios.get(`${BASE_URL}admin/getAdminOrders`);

  //     if (response.data.status) {
  //       setorderData(response.data.data);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const getorderData = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${BASE_URL}admin/getAdminOrders`
      );

      if (response.data.status) {
        const orders = response.data.data;

        setorderData(orders);

        // Check supplier quotation status
        checkSupplierQuotes(orders);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const markAdminRead = async (orderId) => {
    try {
      await axios.post(`${BASE_URL}admin/markAdminRead`, {
        order_id: orderId,
      });

      getorderData();
    } catch (error) {
      console.log(error);
    }
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}admin/deletedata/tbl_orders/order_id/${deleteId}`
      );

      if (response.data.status) {
        toast.success("Successfully Deleted");

        setShowDelete(false);
        setDeleteId(null);

        getorderData();
      }
    } catch (error) {
      toast.error("Delete Failed");
    }
  };

  const handleSupplierSelect = (id) => {
    if (selectedSuppliers.includes(id)) {
      setSelectedSuppliers(selectedSuppliers.filter((item) => item !== id));
    } else {
      setSelectedSuppliers([...selectedSuppliers, id]);
    }
  };

  const saveSuppliers = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}admin/updatedata/tbl_orders/order_id/${selectedOrderId}`,
        {
          order_transfer_supplier: selectedSuppliers.join(","),
          order_stage: "3",
        }
      );

      if (response.data.status) {
        toast.success("Suppliers Assigned Successfully");

        setShowSupplierModal(false);
        setSelectedSuppliers([]);

        getorderData();
      }
    } catch (error) {
      toast.error("Failed");
    }
  };

  const handleCompleteOrder = async () => {
    if (!completeOrder?.order_id) return;

    try {
      setCompleteLoading(true);

      const response = await axios.post(
        `${BASE_URL}admin/updatedata/tbl_orders/order_id/${completeOrder.order_id}`,
        {
          order_stage: "16",
        }
      );

      if (response.data.status) {
        toast.success("Order Completed Successfully");

        setShowCompleteModal(false);
        setCompleteOrder(null);

        await getorderData();
      } else {
        toast.error(response.data.message || "Failed to complete order");
      }
    } catch (error) {
      console.error("Complete Order Error:", error);
      toast.error("Something went wrong");
    } finally {
      setCompleteLoading(false);
    }
  };


  const getQuotations = async (order) => {
    console.log("SELECTED ORDER:", order);
    console.log("ORDER ID:", order.order_id);

    setSelectedOrder(order);
    setShowQuotationModal(true);
    setQuotationLoading(true);

    try {
      const url = `${BASE_URL}admin/getdatawhere/tbl_supplier_quotes/sq_order_id/${order.order_id}`;

      console.log("QUOTATION API URL:", url);

      const res = await axios.get(url);

      console.log("QUOTATION API RESPONSE:", res.data);
      console.log("QUOTATION DATA:", res.data?.data);

      if (res.data.status && res.data.data) {
        const data = Array.isArray(res.data.data)
          ? res.data.data
          : [res.data.data];

        console.log("FINAL QUOTATIONS:", data);

        setQuotations(data);
      } else {
        console.log("NO QUOTATION FOUND");
        setQuotations([]);
      }
    } catch (err) {
      console.log("Quotation Fetch Error:", err);
      toast.error("Failed to fetch quotations");
      setQuotations([]);
    } finally {
      setQuotationLoading(false);
    }
  };
  return (
    <>
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-people" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">All</p>
              <h1 className="h3 mb-1">Orders</h1>
            </div>
          </div>
        </div>

        <section className="panel">
          <div className="row mb-3">
            <div className="col-md-3"></div>
            <div className="col-md-3"></div>
            <div className="col-md-4"></div>
            <div className="col-md-2">
              <GlobalSearchInput
                value={searchTerm}
                onChange={(text) => setSearchTerm(text)}
                placeholder="Search Orders . . . . ."
              />
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
                  <th>Customer Detail</th>
                  {["1", "2", "3"].includes(adminrole) && <th>Stage</th>}
                  <th>Activity</th>
                </tr>
              </thead>
              <tbody className="activity-date-time">
                {loading ? (
                  <TableLoader rows={6} columns={4} />
                ) : orderData.length > 0 ? (
                  filteredData.map((order) => {
                    const isExpanded = expandedOrderId === order.order_id;

                    return (
                      <React.Fragment key={order.order_id}>
                        <tr>
                          <td className="text-center">
                            <div className="d-flex align-items-center justify-content-center flex-nowrap gap-1">
                              {String(order.order_stage) <= 8 && (
                                <a href="#"
                                  className="btn btn-sm text-danger"style={{
                                      boxShadow: "none",
                                      border: "none",
                                      
                                       transform: "none",
                                      outline: "none"
                                    }}
                                  onClick={() => {
                                    setSelectedOrderId(order.order_id);
                                    setSelectedSuppliers(
                                      order.order_transfer_supplier
                                        ? order.order_transfer_supplier
                                          .split(",")
                                          .map(Number)
                                        : []
                                    );
                                    setShowSupplierModal(true);
                                  }}
                                >
                                  <i className="bi bi-building me-1 query-icon"></i>
                                  RFQ
                                </a>
                              )}

                              {String(order.order_stage) >= 8 && String(order.order_stage) <= 11 && (
                                < div className="position-relative d-inline-block">
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
                                      className="btn btn-sm text-danger"
                                      style={{ boxShadow: "none",transform: "none", border: "none",   outline: "none"}}

                                      onClick={() => {
                                        setSelectedOrder(order);
                                        setShowQueryModal(true);
                                        getMessages(order.order_id);
                                        markAdminRead(order.order_id);
                                      }}
                                      disabled={Number(order.order_stage) <= 7}
                                    >
                                      <i className="fa-regular fa-circle-question query-icon"></i>
                                      Query
                                    </button>


                                    {parseInt(order.unread_count) > 0 && (
                                      <span
                                        className="position-absolute rounded-circle bg-danger"
                                        style={{
                                          width: "12px",
                                          height: "12px",
                                          right: "-2px",
                                          top: "-2px",
                                          zIndex: 9999,
                                        }}
                                      />
                                    )}
                                  </span>
                                </div>
                              )}


                              {String(order.order_stage) === "4" && (
                                <a href="#"
                                  className="btn btn-sm text-danger  "
                                  style={{ boxShadow: "none",transform: "none",   border: "none", outline: "none"}}

                                  onClick={() => handleOpenQuoteModal(order)}
                                >
                                  <i className={`fa-solid ${order.order_quotation ? "fa-pen-to-square query-icon  " : "fa-upload query-icon"} me-1`}></i>
                                  {order.order_quotation ? "Edit Quote" : "Upload Quote"}
                                </a>
                              )}

                              {String(order.order_stage) === "12" && (
                                <a
                                  className="btn btn-sm text-danger"
                                  href={`${BASE_URL}public/Uploads/${order.order_quality_repo}`}
                                 style={{ boxShadow: "none",transform: "none",   border: "none", outline: "none"}}

                                >
                                  Quality Report
                                </a>
                              )}
                              {String(order.order_stage) === "15" && (
                                <button
                                  type="button"
                                  className="btn btn-sm text-danger"
                                   style={{ boxShadow: "none",transform: "none",   border: "none", outline: "none"}}

                                  onClick={() => {
                                    setCompleteOrder(order);
                                    setShowCompleteModal(true);
                                    
                                  }}
                                >
                                  <i className="fa-solid fa-check-circle me-1 quer-icon"></i>
                                  Complate Order
                                </button>
                              )}


                              {String(order.order_stage) === "16" && (
                                <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2 py-1">
                                  <i className="fa-solid fa-check-circle me-1"></i>
                                  Order Completed
                                </span>
                              )}
                            </div>
                          </td>

                          <td>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <div className="dropdown">
                                <span className="fw-semibold">Order No:</span>{" "}
                                <button
                                  className="btn text-decoration-none fw-semibold p-0 dropdown-toggle border-0"
                                  type="button"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  <b style={{ fontSize: "16px" }}>{order.order_code}</b>
                                </button>
                                <ul className="dropdown-menu">
                                  <li>
                                    <button
                                      className="dropdown-item text-danger"
                                      onClick={() => {
                                        setDeleteId(order.order_id);
                                        setShowDelete(true);
                                      }}
                                    >
                                      <i className="bi bi-trash me-2"></i>
                                      Delete
                                    </button>
                                  </li>
                                </ul>
                              </div>

                              <button
                                className={`btn btn-sm rounded-circle ${isExpanded ? "btn-danger" : "btn-outline-danger"
                                  }`}
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  padding: "0",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                                onClick={() => toggleExpandRow(order)}
                                title={isExpanded ? "Close Details" : "View Products"}
                              >
                                <i
                                  className={`bi ${isExpanded ? "bi-dash-lg" : "bi-plus-lg"
                                    }`}
                                  style={{ fontSize: "12px" }}
                                ></i>
                              </button>
                            </div>

                            <div>
                              <span className="fw-semibold">Customer ID:</span>{" "}
                              <span
                                className="text-primary fw-bold"
                                style={{ cursor: "pointer", fontSize: "16px" }}
                                data-bs-toggle="popover"
                                data-bs-trigger="hover"
                                data-bs-html="true"
                                data-bs-placement="right"
                                data-bs-title="Customer Details"
                                data-bs-content={`
                                    <b>Name:</b> ${order.cust_contact_person || "N/A"} <br/>
                                    <b>Company:</b> ${order.cust_company_name || "N/A"} <br/>
                                    <b>Email:</b> ${order.cust_email || "N/A"} <br/>
                                    <b>Phone:</b> ${order.cust_mobile || "N/A"} <br/>
                                  `}
                              >
                                {order.cust_code}
                              </span>
                            </div>

                            <span className="fw-semibold">Supplier Quote:</span>{" "}

                            {supplierQuoteStatus[order.order_id] ? (
                              <span
                                className="text-success fw-bold"
                                style={{
                                  cursor: "pointer",
                                  fontSize: "16px",
                                }}
                                onClick={() => getQuotations(order)}
                              >
                                View Quote
                              </span>
                            ) : (
                              <span
                                className="text-danger fw-bold"
                                style={{ fontSize: "16px" }}
                              >
                                No Quote
                              </span>
                            )}



                            <br />


                            <span className="fw-semibold">Customer  Quote:</span>{" "}
                            {order.order_quotation ? (
                              <a
                                href={`${BASE_URL}public/Uploads/${order.order_quotation}`}
                                className="text-primary fw-bold text-decoration-none"
                                style={{ cursor: "pointer", fontSize: "16px" }}
                                target="_blank"
                              >
                                View Quote
                              </a>
                            ) : (
                              <span className="text-danger fw-bold">No Quote</span>
                            )}

                          </td>

                          {["1", "2", "3"].includes(adminrole) && (
                            <td className="text-center">
                              <button
                                className="btn text-danger btn-sm"style={{
                                      boxShadow: "none",
                                      border: "none",
                                    
                                      outline: "none",
                                      transform: "none",
                                    }}
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowStageDrawer(true);
                                }}
                              >
                                <i className="fas fa-route me-2 query-icon"></i>
                                Tracking
                              </button>
                            </td>
                          )}

                          <td className="text-start ">
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

                        {/* Expandable Order Details Row */}
                        {
                          isExpanded && (
                            <tr>
                              <td
                                colSpan={["1", "2", "3"].includes(adminrole) ? 4 : 3}
                                className="bg-light p-2"
                              >
                                <div
                                  className="custom-expanded-scroll"
                                  style={{
                                    width: "972px",
                                    overflowX: "auto",
                                    overflowY: "hidden",
                                    whiteSpace: "nowrap",
                                    cursor: "grab",
                                    scrollbarWidth: "none",
                                    msOverflowStyle: "none",
                                    userSelect: "none",
                                    WebkitUserSelect: "none",
                                    MozUserSelect: "none",
                                    msUserSelect: "none",
                                  }}
                                  onMouseDown={(e) => {
                                    const slider = e.currentTarget;
                                    let isDown = true;
                                    let startX = e.pageX - slider.offsetLeft;
                                    let scrollLeft = slider.scrollLeft;

                                    slider.style.cursor = "grabbing";

                                    const onMouseMove = (e) => {
                                      if (!isDown) return;
                                      e.preventDefault();
                                      const x = e.pageX - slider.offsetLeft;
                                      const walk = (x - startX) * 2;
                                      slider.scrollLeft = scrollLeft - walk;
                                    };

                                    const onMouseUp = () => {
                                      isDown = false;
                                      slider.style.cursor = "grab";
                                      window.removeEventListener("mousemove", onMouseMove);
                                      window.removeEventListener("mouseup", onMouseUp);
                                    };

                                    window.addEventListener("mousemove", onMouseMove);
                                    window.addEventListener("mouseup", onMouseUp);
                                  }}
                                >
                                  <style>
                                    {`
                                      .custom-expanded-scroll::-webkit-scrollbar {
                                        display: none;
                                      }
                                    `}
                                  </style>

                                  {detailLoading ? (
                                    <div className="text-center py-3">
                                      <div
                                        className="spinner-border spinner-border-sm text-primary me-2"
                                        role="status"
                                      ></div>
                                      <span>Loading details...</span>
                                    </div>
                                  ) : cartDetails.length > 0 ? (
                                    <table
                                      className="table table-sm table-bordered table-hover bg-white mb-0 text-center align-middle shadow-sm"
                                      style={{
                                        fontSize: "12px",
                                        width: "max-content",
                                        tableLayout: "auto",
                                      }}
                                    >
                                      <tbody>
                                        {cartDetails.map((item, index) => (
                                          <tr key={index}>
                                            <td style={{ whiteSpace: "nowrap", padding: "8px 12px" }}>
                                              <div style={{ fontSize: "11px", color: "#6c757d", fontWeight: "bold" }}>Part Name</div>
                                              <div>{item.gerber_original_name || "N/A"}</div>
                                            </td>

                                            <td style={{ whiteSpace: "nowrap", padding: "8px 12px" }}>
                                              <div style={{ fontSize: "11px", color: "#6c757d", fontWeight: "bold" }}>Base Material</div>
                                              <div>{item.cart_base_material || "N/A"}</div>
                                            </td>

                                            <td style={{ whiteSpace: "nowrap", padding: "8px 12px" }}>
                                              <div style={{ fontSize: "11px", color: "#6c757d", fontWeight: "bold" }}>Layer</div>
                                              <div>{item.cart_pcb_layer || "N/A"}</div>
                                            </td>

                                            <td style={{ whiteSpace: "nowrap", padding: "8px 12px" }}>
                                              <div style={{ fontSize: "11px", color: "#6c757d", fontWeight: "bold" }}>Width x Height</div>
                                              <div>
                                                {item.cart_pcb_width && item.cart_pcb_height
                                                  ? `${item.cart_pcb_width} x ${item.cart_pcb_height}`
                                                  : "N/A"}
                                              </div>
                                            </td>

                                            <td style={{ whiteSpace: "nowrap", padding: "8px 12px" }}>
                                              <div style={{ fontSize: "11px", color: "#6c757d", fontWeight: "bold" }}>Qty</div>
                                              <div>{item.cart_selected_qty || "N/A"}</div>
                                            </td>

                                            <td className="text-start" style={{ whiteSpace: "nowrap", padding: "8px 12px" }}>
                                              <div style={{ fontSize: "11px", color: "#6c757d", fontWeight: "bold" }}>Product Type</div>
                                              <div className="fw-semibold">{item.cart_product_type || "N/A"}</div>
                                            </td>

                                            <td style={{ whiteSpace: "nowrap", padding: "8px 12px" }}>
                                              <div style={{ fontSize: "11px", color: "#6c757d", fontWeight: "bold" }}>Thickness</div>
                                              <div>{item.cart_pcb_thickness || "N/A"}</div>
                                            </td>

                                            <td style={{ whiteSpace: "nowrap", padding: "8px 12px" }}>
                                              <div style={{ fontSize: "11px", color: "#6c757d", fontWeight: "bold" }}>Color</div>
                                              <div>{item.cart_pcb_color || "N/A"}</div>
                                            </td>

                                            <td style={{ whiteSpace: "nowrap", padding: "8px 12px" }}>
                                              <div style={{ fontSize: "11px", color: "#6c757d", fontWeight: "bold" }}>Silkscreen</div>
                                              <div>{item.cart_silkscreen || "N/A"}</div>
                                            </td>

                                            <td style={{ whiteSpace: "nowrap", padding: "8px 12px" }}>
                                              <div style={{ fontSize: "11px", color: "#6c757d", fontWeight: "bold" }}>Material Type</div>
                                              <div>{item.cart_material_type || "N/A"}</div>
                                            </td>

                                            <td style={{ whiteSpace: "nowrap", padding: "8px 12px" }}>
                                              <div style={{ fontSize: "11px", color: "#6c757d", fontWeight: "bold" }}>Surface Finish</div>
                                              <div>{item.cart_surface_finish || "N/A"}</div>
                                            </td>

                                            <td style={{ whiteSpace: "nowrap", padding: "8px 12px" }}>
                                              <div style={{ fontSize: "11px", color: "#6c757d", fontWeight: "bold" }}>Outer Copper</div>
                                              <div>{item.cart_outer_copper_weight || "N/A"}</div>
                                            </td>

                                            <td style={{ whiteSpace: "nowrap", padding: "8px 12px" }}>
                                              <div style={{ fontSize: "11px", color: "#6c757d", fontWeight: "bold" }}>Via Covering</div>
                                              <div>{item.cart_via_covering || "N/A"}</div>
                                            </td>

                                            <td style={{ whiteSpace: "nowrap", padding: "8px 12px" }}>
                                              <div style={{ fontSize: "11px", color: "#6c757d", fontWeight: "bold" }}>Min Via Hole</div>
                                              <div>{item.cart_min_via_hole || "N/A"}</div>
                                            </td>

                                            <td style={{ whiteSpace: "nowrap", padding: "8px 12px" }}>
                                              <div style={{ fontSize: "11px", color: "#6c757d", fontWeight: "bold" }}>Electrical Test</div>
                                              <div>{item.cart_electrical_test || "N/A"}</div>
                                            </td>

                                            <td className="text-start" style={{ whiteSpace: "nowrap", padding: "8px 12px" }}>
                                              <div style={{ fontSize: "11px", color: "#6c757d", fontWeight: "bold" }}>Remark</div>
                                              <div>{item.cart_pcb_remark || "N/A"}</div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ) : (
                                    <div className="text-center py-2 text-danger">
                                      No details found for this cart ID.
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        }
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-danger">
                      No order Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section >
      </div >

      <Delete
        show={showDelete}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDelete(false);
          setDeleteId(null);
        }}
      />

      {/* Supplier Modal Selection */}
      {
        showSupplierModal && (
          <div className="model-add-edit-modal-overlay">
            <div
              className="model-add-edit-modal-dialog"
              style={{ maxWidth: "500px" }}
            >
              <div className="model-add-edit-modal-content">
                <div className="model-add-edit-modal-header">
                  <h5 className="model-add-edit-modal-title">
                    <i className="bi bi-building me-2"></i>
                    Select Suppliers
                  </h5>

                  <button
                    type="button"
                    className="model-add-edit-modal-close"
                    onClick={() => setShowSupplierModal(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="d-flex flex-wrap gap-2 p-3">
                  {supplierData.map((supplier) => (
                    <div
                      key={supplier.supp_id}
                      className={`supplier-tag ${selectedSuppliers.includes(Number(supplier.supp_id))
                        ? "active"
                        : ""
                        }`}
                      onClick={() =>
                        handleSupplierSelect(Number(supplier.supp_id))
                      }
                    >
                      <div>
                        <strong>{supplier.supp_company_name}</strong>
                        <small>{supplier.supp_contact_person}</small>
                      </div>

                      {selectedSuppliers.includes(
                        Number(supplier.supp_id)
                      ) && (
                          <i className="bi bi-check-circle-fill text-success"></i>
                        )}
                    </div>
                  ))}
                </div>
                <div className="model-add-edit-modal-footer d-flex justify-content-between">
                  <span className="fw-semibold">
                    Selected: {selectedSuppliers.length}
                  </span>

                  <button
                    className="btn btn-outline-danger"
                    onClick={saveSuppliers}
                  >
                    Assigned
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Query Modal */}
      {
        showQueryModal && (
          <div className="model-add-edit-modal-overlay">
            <div className="model-add-edit-modal-dialog model-size-md">
              <div className="model-add-edit-modal-content">
                <div className="model-add-edit-modal-header">
                  <h5 className="model-add-edit-modal-title">
                    Query - Order ID- {selectedOrder?.order_code}
                  </h5>

                  <button
                    type="button"
                    className="model-add-edit-modal-close"
                    onClick={() => {
                      setShowQueryModal(false);
                      setMessage("");
                      setEditMessageId(null);
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div className="model-add-edit-modal-body p-0">
                  <div className="chat-container">
                    {messages.length === 0 ? (
                      <div className="empty-chat-container">
                        <div className="empty-chat-icon-wrapper">
                          <i className="fa-solid fa-comments-nolock fa-lock"></i>
                        </div>

                        <h6 className="empty-chat-title">No Active Query</h6>

                        <p className="empty-chat-description">
                          No query has been received from the{" "}
                          <strong>Secure Circuit team</strong> for this order yet.
                        </p>

                        <span className="empty-chat-status-badge">
                          <i className="fa-solid fa-circle-info me-1"></i>{" "}
                          Messaging will unlock once the team reaches out.
                        </span>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.que_id}
                          className={`chat-message ${msg.que_send === "customer" ? "right" : "left"
                            }`}
                        >
                          <div
                            className={`chat-bubble ${msg.que_send === "customer" ? "sent" : "received"
                              }`}
                          >
                            <div className="chat-menu">
                              <button
                                className="chat-menu-btn"
                                data-bs-toggle="dropdown"
                              >
                                <i className="fa-solid fa-ellipsis-vertical"></i>
                              </button>


                              <ul className="dropdown-menu">
                                {(msg.que_send === "customer" || msg.que_send === "supplier") && (
                                  <li>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => editMessage(msg)}
                                    >
                                      <i className="fa-solid fa-pen me-2"></i>
                                      Edit
                                    </button>
                                  </li>
                                )}

                                {msg.que_status === 0 ? (
                                  <li>
                                    <button
                                      className="dropdown-item text-success"
                                      onClick={() =>
                                        changeStatus(msg.que_id, 1)
                                      }
                                    >
                                      <i className="fa-solid fa-eye me-2"></i>
                                      Forward
                                    </button>
                                  </li>
                                ) : (
                                  <li>
                                    <button
                                      className="dropdown-item text-danger"
                                      onClick={() =>
                                        changeStatus(msg.que_id, 0)
                                      }
                                    >
                                      <i className="fa-solid fa-eye-slash me-2"></i>
                                      Inforward
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </div>


                            <div className="chat-message-content">

                              {/* ================= MESSAGE ================= */}
                              {(msg.que_edit_message || msg.que_message) && (
                                <div className="chat-message-text">
                                  {msg.que_edit_message || msg.que_message}
                                </div>
                              )}

                              {/* ================= ATTACHMENT ================= */}
                              {msg.que_attachment && (() => {
                                const attachment = msg.que_attachment;

                                const attachmentUrl =
                                  `${BASE_URL}public/Uploads/${attachment}`;

                                const isImage =
                                  /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment);

                                const isPdf =
                                  /\.pdf$/i.test(attachment);

                                if (isImage) {
                                  return (
                                    <div className="chat-attachment-image">
                                      <a
                                        href={attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <img
                                          src={attachmentUrl}
                                          alt="Query Attachment"
                                          className="chat-image-preview"
                                        />
                                      </a>
                                    </div>
                                  );
                                }

                                if (isPdf) {
                                  return (
                                    <a
                                      href={attachmentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="chat-pdf-attachment"
                                    >
                                      <div className="chat-pdf-icon">
                                        <i className="fa-solid fa-file-pdf"></i>
                                      </div>

                                      <div className="chat-pdf-details">
                                        <span className="chat-pdf-title">
                                          PDF Attachment
                                        </span>

                                        <span className="chat-pdf-name">
                                          {attachment}
                                        </span>
                                      </div>

                                      <i className="fa-solid fa-download chat-pdf-download"></i>
                                    </a>
                                  );
                                }

                                return (
                                  <a
                                    href={attachmentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="chat-file-attachment"
                                  >
                                    <i className="fa-solid fa-paperclip"></i>
                                    {attachment}
                                  </a>
                                );
                              })()}

                              {/* ================= STATUS ================= */}
                              <div className="chat-message-meta">

                                {msg.que_edit_message && (
                                  <small className="chat-edited-label">
                                    Edited
                                  </small>
                                )}

                                <small
                                  className={
                                    msg.que_status === 1
                                      ? "chat-forward-label"
                                      : "chat-inforward-label"
                                  }
                                >
                                  {msg.que_status === 1
                                    ? "Forward"
                                    : "Inforward"}
                                </small>

                              </div>

                            </div>

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
                      ))
                    )}

                    <div ref={messagesEndRef}></div>
                  </div>


                  <div className="chat-footer">

                    {/* Existing / New Attachment */}
                    {(attachmentPreview || selectedFile) && (
                      <div className="chat-edit-attachment">

                        <div className="chat-edit-attachment-icon">
                          {selectedFile?.type?.startsWith("image/") ? (
                            <i className="fa-solid fa-image"></i>
                          ) : (
                            <i className="fa-solid fa-file-pdf"></i>
                          )}
                        </div>

                        <div className="chat-edit-attachment-info">

                          <span className="chat-edit-attachment-label">
                            {selectedFile ? "New Attachment" : "Current Attachment"}
                          </span>

                          <span className="chat-edit-attachment-name">
                            {selectedFile
                              ? selectedFile.name
                              : attachmentPreview}
                          </span>

                        </div>

                        {/* Remove attachment */}
                        <button
                          type="button"
                          className="chat-edit-attachment-remove"
                          onClick={() => {
                            setSelectedFile(null);
                            setAttachmentPreview(null);
                          }}
                          title="Remove attachment"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>

                      </div>
                    )}

                    {/* File Upload */}
                    {/* <label
                        htmlFor="query-file-upload"
                        className="chat-attach-btn"
                        title="Change Attachment"
                      >
                        <i className="fa-solid fa-paperclip"></i>
                      </label>

                      <input
                        id="query-file-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,application/pdf"
                        style={{ display: "none" }}
                        onChange={handleQueryFileChange}
                      /> */}

                    {/* Edit Message */}
                    <input
                      type="text"
                      className="chat-input"
                      disabled={editMessageId === null}
                      placeholder={
                        editMessageId
                          ? "Edit message..."
                          : "Click 'Edit' on a message..."
                      }
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />

                    {/* Save */}
                    <button
                      type="button"
                      className="chat-send-btn"
                      onClick={sendMessage}
                      disabled={editMessageId === null}
                      title="Save Changes"
                    >
                      <i className="fa-solid fa-floppy-disk"></i>
                    </button>

                  </div>

                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Uploaded File Preview Modal */}
      {
        showDocumentModal && (
          <div className="model-add-edit-modal-overlay">
            <div
              className="model-add-edit-modal-dialog"
              style={{ maxWidth: "900px" }}
            >
              <div className="model-add-edit-modal-content">
                <div className="model-add-edit-modal-header">
                  <h5 className="text-white">Uploaded Document</h5>

                  <button
                    className="model-add-edit-modal-close"
                    onClick={() => setShowDocumentModal(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="model-add-edit-modal-body text-center">
                  <iframe
                    src={`${BASE_URL}public/Uploads/${selectedDocument}`}
                    width="100%"
                    height="500px"
                    title="Document Preview"
                    style={{
                      border: "none",
                      borderRadius: "10px",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* View Quotation Modal */}
      {
        showQuotationModal && (
          <div className="model-add-edit-modal-overlay">
            <div
              className="model-add-edit-modal-dialog"
              style={{ maxWidth: "800px" }}
            >
              <div className="model-add-edit-modal-content">
                <div className="model-add-edit-modal-header">
                  <h5 className="model-add-edit-modal-title">
                    <i className="bi bi-file-earmark-text me-2"></i>
                    Quotations Details - Order No: {selectedOrder?.order_code}
                  </h5>

                  <button
                    type="button"
                    className="model-add-edit-modal-close"
                    onClick={() => {
                      setShowQuotationModal(false);
                      setQuotations([]);
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div className="model-add-edit-modal-body p-3">
                  {quotationLoading ? (
                    <div className="text-center py-4">
                      <div
                        className="spinner-border text-danger"
                        role="status"
                      ></div>
                      <p className="mt-2 mb-0">Fetching Quotations...</p>
                    </div>
                  ) : quotations.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-bordered table-striped align-middle text-center mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Supplier ID / Name</th>
                            <th>Quotation</th>
                            <th>Remark / Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quotations.map((quote, index) => (
                            <tr key={quote.sq_id}>
                              <td className="text-start">
                                <span className="fw-semibold">Supplier Code:</span>{" "} {quote.supp_code || "N/A"} <br />
                                <span className="fw-semibold">Supplier Person:</span>{" "}{quote.supp_contact_person || "N/A"} <br />
                                <span className="fw-semibold">Company Name:</span>{" "} {quote.supp_company_name || "N/A"}
                              </td>
                              <td>
                                <a
                                  href={`${BASE_URL}public/Uploads/${quote.sq_quote}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm text-danger"
                                            style={{ boxShadow: "none", border: "none",transform: "none", outline: "none"}}

                                >
                                  View Quotation
                                </a>
                              </td>
                              <td style={{ width: "300px" }}>{quote.sq_remark || "No Remarks"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-danger fw-bold">
                      <i className="bi bi-exclamation-circle fs-3 d-block mb-2"></i>
                      No Quotations Found For This Order.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Complete Order Confirmation Modal */}
      {
        showCompleteModal && (
          <div className="model-add-edit-modal-overlay">
            <div
              className="model-add-edit-modal-dialog"
              style={{ maxWidth: "400px" }}
            >
              <div className="model-add-edit-modal-content">

                <div className="model-add-edit-modal-header">
                  <h5 className="model-add-edit-modal-title">
                    <i className="fa-solid fa-circle-check me-2"></i>
                    Complete Order
                  </h5>

                  <button
                    type="button"
                    className="model-add-edit-modal-close"
                    onClick={() => {
                      setShowCompleteModal(false);
                      setCompleteOrder(null);
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div className="model-add-edit-modal-body text-center p-4">

                  <div className="mb-3">
                    <i
                      className="fa-solid fa-circle-question text-danger"
                      style={{ fontSize: "45px" }}
                    ></i>
                  </div>

                  <h6 className="fw-bold mb-2">
                    Complete this order?
                  </h6>

                  <p className="text-muted mb-1">
                    Are you sure you want to complete this order?
                  </p>

                  <p className="fw-semibold mb-0">
                    Order No:{" "}
                    <span className="text-danger">
                      {completeOrder?.order_code}
                    </span>
                  </p>

                </div>

                <div className="model-add-edit-modal-footer d-flex justify-content-between gap-2">

                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    disabled={completeLoading}
                    onClick={() => {
                      setShowCompleteModal(false);
                      setCompleteOrder(null);
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    disabled={completeLoading}
                    onClick={handleCompleteOrder}
                  >
                    {completeLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          role="status"
                        ></span>
                        Completing...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-check me-1"></i>
                        Confirm
                      </>
                    )}
                  </button>

                </div>

              </div>
            </div>
          </div>
        )
      }

      {/* Upload Quote Modal */}
      {
        showModal && (
          <div className="model-add-edit-modal-overlay">
            <div className="model-add-edit-modal-dialog model-size-sm">
              <div className="model-add-edit-modal-content">
                <div className="model-add-edit-modal-header">
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

                <form onSubmit={formik.handleSubmit}>
                  <div className="model-add-edit-modal-body">
                    <div className="row g-3">


                      <div className="col-md-12">
                        <label className="order-form-label mt-3">
                          Quote Supplier <span className="text-danger">*</span>
                        </label>

                        <select
                          name="order_quote_supplier"
                          className={`form-select ${formik.touched.order_quote_supplier && formik.errors.order_quote_supplier
                            ? "is-invalid"
                            : ""
                            }`}
                          value={formik.values.order_quote_supplier}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        >
                          <option value="">Select Supplier</option>

                          {supplierData
                            .filter((supplier) => Number(supplier.supp_status) === 1)
                            .map((supplier) => (
                              <option
                                key={supplier.supp_id}
                                value={supplier.supp_id}
                              >
                                {supplier.supp_contact_person} - {supplier.supp_company_name}
                              </option>
                            ))}
                        </select>

                        {formik.touched.order_quote_supplier &&
                          formik.errors.order_quote_supplier && (
                            <div className="invalid-feedback d-block">
                              {formik.errors.order_quote_supplier}
                            </div>
                          )}
                      </div>


                      <div className="col-md-12">
                        <div className="simple-file-box">
                          <label className="simple-file-label">
                            Upload Quotation (.pdf) <span className="text-danger">*</span>
                          </label>

                          <div className="d-flex align-items-center gap-2">
                            {/* File Input */}
                            <div
                              className={`simple-input-container flex-grow-1 ${formik.touched.order_quotation && formik.errors.order_quotation
                                ? "is-invalid-border"
                                : ""
                                }`}
                            >
                              <input
                                type="file"
                                id="order_quotation"
                                name="order_quotation"
                                className="simple-file-input"
                                accept=".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed"
                                onChange={(e) => {
                                  formik.setFieldTouched("order_quotation", true);
                                  uploadImage(e);
                                }}
                              />
                            </div>

                            {/* View Quote Button */}
                            {formik.values.order_quotation && (
                              <a
                                href={`${BASE_URL}public/Uploads/${formik.values.order_quotation}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-danger text-nowrap"
                              >
                                <i className="fa-solid fa-eye me-1"></i>
                                View Quote
                              </a>
                            )}
                          </div>

                          {formik.touched.order_quotation &&
                            formik.errors.order_quotation && (
                              <div className="simple-error-text">
                                {formik.errors.order_quotation}
                              </div>
                            )}

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
                          name="order_remark"
                          placeholder="Enter requirement or remark..."
                          className={`order-textarea ${formik.touched.order_remark && formik.errors.order_remark
                            ? "is-invalid"
                            : ""
                            }`}
                          value={formik.values.order_remark}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />

                        <div className="invalid-feedback d-block">
                          {formik.touched.order_remark && formik.errors.order_remark}
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
                          className="model-add-edit-btn model-add-edit-btn-save"
                          disabled={uploading}
                        >
                          {uploading ? "Uploading..." : "Save Quote"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )
      }

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