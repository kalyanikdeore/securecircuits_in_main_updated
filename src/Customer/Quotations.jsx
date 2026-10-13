import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";

function Quotations() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const [selectedRemark, setSelectedRemark] = useState("");
  const [showRemarkModal, setShowRemarkModal] = useState(false);

  const customer = JSON.parse(localStorage.getItem("customer"));
  const CustId = customer?.cust_id;
const [showPurchaseModal, setShowPurchaseModal] = useState(false);
const [purchaseOrderFile, setPurchaseOrderFile] = useState(null);
const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);
const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    getorderData();
  }, []);

  const getorderData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${BASE_URL}customer/checkwhere/tbl_orders`,
        {
          params: {
            order_cust_id: CustId,
            order_stage: "6",
          },
        }
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

  // Approval Modal Functions
  const handleOpenModal = (order) => {
    setSelectedOrderId(order.order_id);
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedOrderId(null);
    setSelectedOrder(null);
    setShowModal(false);
  };

  // Remark Modal Functions
  const handleOpenRemarkModal = (remark) => {
    if (!remark || remark === "N/A") return;

    setSelectedRemark(remark);
    setShowRemarkModal(true);
  };

  const handleCloseRemarkModal = () => {
    setSelectedRemark("");
    setShowRemarkModal(false);
  };

  // const confirmApprove = async () => {
  //   if (!selectedOrderId || !selectedOrder) return;

  //   setIsApproving(true);

  //   try {
  //     const res = await axios.post(
  //       `${BASE_URL}customer/updatedata/tbl_orders/order_id/${selectedOrderId}`,
  //       {
  //         order_stage: "8",
  //       }
  //     );

  //     if (res.data.status) {
  //       toast.success("Quotation Approved Successfully!");
  //       getorderData();
  //       handleCloseModal();
  //     } else {
  //       toast.error("Failed to approve quotation!");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     toast.error("Something went wrong!");
  //   } finally {
  //     setIsApproving(false);
  //   }
  // };

// const confirmApprove = async () => {
//   if (!selectedOrderId || !selectedOrder) {
//     toast.error("Order not selected");
//     return;
//   }

//   if (!purchaseOrderFile) {
//     toast.error("Please select Dispatch Order PDF");
//     return;
//   }

//   const formData = new FormData();
//   formData.append("purchase_order", purchaseOrderFile);

//   setIsApproving(true);

//   try {
//     const uploadResponse = await axios.post(
//       `${BASE_URL}customer/uploadFile/${selectedOrderId}`,
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//         timeout: 60000,
//       }
//     );

//     if (!uploadResponse.data.status) {
//       toast.error(
//         uploadResponse.data.message || "PDF upload failed"
//       );
//       return;
//     }

//     const approveResponse = await axios.post(
//       `${BASE_URL}customer/updatedata/tbl_orders/order_id/${selectedOrderId}`,
//       {
//         order_stage: "8",
//       }
//     );

//     if (approveResponse.data.status) {
//       toast.success("PDF uploaded and quotation approved!");

//       setPurchaseOrderFile(null);
//       setShowModal(false);
//       setSelectedOrderId(null);
//       setSelectedOrder(null);

//       await getorderData();
//     } else {
//       toast.error(
//         "PDF uploaded, but order approval failed"
//       );
//     }
//   } catch (error) {
//     console.error(
//       "Upload/approval error:",
//       error.response?.data || error
//     );

//     toast.error(
//       error.response?.data?.message ||
//       "PDF upload or approval failed"
//     );
//   } finally {
//     setIsApproving(false);
//   }
// };


const confirmApprove = async () => {
  if (!selectedOrderId) {
    toast.error("Please select an order");
    return;
  }

  if (!purchaseOrderFile) {
    toast.error("Please select Purchase Order PDF");
    return;
  }

  const formData = new FormData();
  formData.append("purchase_order", purchaseOrderFile);

  setIsApproving(true);

  try {
    // Step 1: Upload PDF and save filename in database
   const uploadResponse = await axios.post(
  `${BASE_URL}customer/uploadPurchaseOrder/${selectedOrderId}`,
  formData,
  { timeout: 60000 }
);

console.log("Upload response:", uploadResponse.data);

    if (!uploadResponse.data.status) {
      toast.error(
        uploadResponse.data.message || "PDF upload failed"
      );
      return;
    }

    console.log("Saved filename:", uploadResponse.data.file_name);

    // Step 2: Approve order
    const approveResponse = await axios.post(
      `${BASE_URL}customer/updatedata/tbl_orders/order_id/${selectedOrderId}`,
      { order_stage: "8" }
    );

    if (!approveResponse.data.status) {
      toast.error("PDF saved, but quotation approval failed");
      return;
    }

    toast.success("Purchase Order saved and quotation approved!");

    setPurchaseOrderFile(null);
    setSelectedOrderId(null);
    setSelectedOrder(null);
    setShowModal(false);

    await getorderData();

  } catch (error) {
    console.error(
      "Approval error:",
      error.response?.data || error.message
    );

    toast.error(
      error.response?.data?.message ||
      "Purchase Order upload failed"
    );
  } finally {
    setIsApproving(false);
  }
};



const handlePurchaseOrderUpload = async () => {
  const orderId = selectedPurchaseOrder?.order_id;

  if (!orderId) {
    toast.error("Please select an order");
    return;
  }

  if (!purchaseOrderFile) {
    toast.error("Please select Purchase Order PDF");
    return;
  }

  if (
    purchaseOrderFile.type !== "application/pdf" &&
    !purchaseOrderFile.name.toLowerCase().endsWith(".pdf")
  ) {
    toast.error("Please select a PDF file");
    return;
  }

  const formData = new FormData();
  formData.append("purchase_order", purchaseOrderFile);

  setIsUploading(true);

  try {
    const response = await axios.post(
      `${BASE_URL}customer/uploadPurchaseOrder/${orderId}`,
      formData,
      { timeout: 60000 }
    );

    console.log("Upload response:", response.data);

    if (!response.data.status) {
      toast.error(response.data.message || "Upload failed");
      return;
    }

    console.log("Saved order ID:", response.data.order_id);
    console.log("Saved filename:", response.data.file_name);

    toast.success("Purchase Order uploaded and saved!");

    setPurchaseOrderFile(null);
    setSelectedPurchaseOrder(null);
    setShowPurchaseModal(false);

    await getorderData();
  } catch (error) {
    console.error(
      "Purchase Order error:",
      error.response?.data || error.message
    );

    toast.error(
      error.response?.data?.message || "Purchase Order upload failed"
    );
  } finally {
    setIsUploading(false);
  }
};



// const handlePurchaseOrderUpload = async () => {
//   if (!selectedPurchaseOrder?.order_id || !purchaseOrderFile) {
//     toast.error("Please select an order and PDF");
//     return;
//   }

//   const formData = new FormData();
//   formData.append("purchase_order", purchaseOrderFile);

//   setIsUploading(true);

//   try {
//     const response = await axios.post(
//       `${BASE_URL}customer/uploadFile/${selectedPurchaseOrder.order_id}`,
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//         timeout: 60000,
//       }
//     );

//     if (response.data.status) {
//       toast.success("Purchase Order uploaded successfully!");

//       setShowPurchaseModal(false);
//       setPurchaseOrderFile(null);
//       setSelectedPurchaseOrder(null);

//       await getorderData();
//     } else {
//       toast.error(response.data.message || "Upload failed");
//     }
//   } catch (error) {
//     console.error(
//       "Upload error:",
//       error.response?.data || error
//     );

//     toast.error(
//       error.response?.data?.message || "Upload failed"
//     );
//   } finally {
//     setIsUploading(false);
//   }
// };


  return (
    <>
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i
                className="bi bi-file-text text-success"
                aria-hidden="true"
              ></i>
            </span>

            <div>
              <p className="eyebrow mb-1 text-success">All</p>
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
                  <th>Action</th>
                  <th>Order Code</th>
                  <th>Quotation</th>
                  <th>Remark</th>
                  <th>Request Date & Time</th>
                </tr>
              </thead>

              <tbody className="activity-date-time">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="text-center text-danger py-4">
                      {error}
                    </td>
                  </tr>
                ) : quotations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-3 text-danger">
                      No quotations found.
                    </td>
                  </tr>
                ) : (
                  quotations.map((item, index) => (
                    <tr
                      key={item.order_id || index}
                      className="text-center"
                    >
                      <td>
                        <a href="#"
                          className="btn btn-sm text-success"
                          style={{ boxShadow: "none", border: "none", transform: "none",outline: "none",}}

                          onClick={() => handleOpenModal(item)}
                        >
                          Approve
                        </a> 
                         
                      </td>

                      <td className="fw-semibold">
                        {item.order_code || "N/A"}
                      </td>

                      <td>
                        <a
                          href={`${BASE_URL}public/Uploads/${item.order_quotation}`}
                          className="text-success fw-semibold text-decoration-none"
                          style={{
                            cursor: "pointer",
                            fontSize: "15px",
                          }}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Quotation
                        </a>
                      </td>

                      <td>
                        {item.order_remark &&
                          item.order_remark !== "N/A" ? (
                          <button
                            className="btn btn-sm text-success"
                            style={{ boxShadow: "none", border: "none",transform: "none", outline: "none",}}

                            onClick={() =>
                              handleOpenRemarkModal(item.order_remark)
                            }
                          >
                             Remark
                          </button>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>

                      <td>
                        {item.order_request_date}{" "}
                        {item.order_request_time}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>


      {/* Confirmation Modal */}
      {showModal && (
        <div className="model-add-edit-modal-overlay">
          <div
            className="model-add-edit-modal-dialog"
            style={{ maxWidth: "400px" }}
          >
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header-success">
                <h5 className="model-add-edit-modal-title">
                  Confirm Approval
                </h5>

                <button
                  type="button"
                  className="model-add-edit-modal-close"
                  onClick={handleCloseModal}
                  disabled={isApproving}
                >
                  ✕
                </button>
              </div>

              <div className="model-add-edit-modal-body p-3">
                <p className="mb-10">
                  Are you sure you want to <strong>approve</strong> this
                  quotation?
                </p>
                <br />
                 <label className="form-label fw-semibold">
   Upload Purchase Order (.pdf)
  </label>

 <input
  type="file"
  className="form-control"
  accept=".pdf,application/pdf"
  disabled={isApproving}
  onChange={(e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      toast.error("Please select a PDF file");
      e.target.value = "";
      return;
    }

    setPurchaseOrderFile(file);
  }}
/>

  {purchaseOrderFile && (
    <small className="text-success d-block mt-2">
      Selected: {purchaseOrderFile.name}
    </small>
  )}
</div>
            

              <div className="model-add-edit-modal-footer d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCloseModal}
                  disabled={isApproving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={confirmApprove}
                  disabled={isApproving}
                >
                  {isApproving ? "Approving..." : "Yes, Approve"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remark Display Modal */}
      {showRemarkModal && (
        <div className="model-add-edit-modal-overlay">
          <div
            className="model-add-edit-modal-dialog"
            style={{ maxWidth: "450px" }}
          >
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header-success">
                <h5 className="model-add-edit-modal-title">
                  Order Remark
                </h5>

                <button
                  type="button"
                  className="model-add-edit-modal-close"
                  onClick={handleCloseRemarkModal}
                >
                  ✕
                </button>
              </div>

              <div className="model-add-edit-modal-body p-3">
                <p
                  className="mb-0"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {selectedRemark}
                </p>
              </div>

              <div className="model-add-edit-modal-footer text-end">
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
      )}
    </>
  );
}

export default Quotations;