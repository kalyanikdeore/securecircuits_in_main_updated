import React, { useState, useEffect } from "react";

import axios from "axios";

import { BASE_URL } from "../Config/Base-url";

import toast from "react-hot-toast";



function Approved() {

  const [quotations, setQuotations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

const [dispatchRemark, setDispatchRemark] = useState("");

  // const supplier = JSON.parse(localStorage.getItem("supplier"));
  // const SuppId = supplier?.supp_id;
  


const [SuppId, setSuppId] = useState(null);

useEffect(() => {
  try {
    const supplierData = localStorage.getItem("supplier");

    if (!supplierData) {
      setError("Supplier not found. Please login again.");
      setLoading(false);
      return;
    }

    const supplier = JSON.parse(supplierData);

    if (!supplier?.supp_id) {
      setError("Supplier ID not found. Please login again.");
      setLoading(false);
      return;
    }

    setSuppId(supplier.supp_id);
  } catch (err) {
    console.error("Supplier data error:", err);
    setError("Invalid supplier data. Please login again.");
    setLoading(false);
  }
}, []);
  // =========================================================

  // DESIGN MODAL

  // =========================================================

  const [showDesignModal, setShowDesignModal] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);



  // =========================================================

  // STAGE CONFIRMATION MODAL

  // =========================================================

  const [showStageModal, setShowStageModal] = useState(false);

  const [showWithoutDocumentModal, setShowWithoutDocumentModal] = useState(false);

  const [selectedStage, setSelectedStage] = useState(null);

  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [updatingStage, setUpdatingStage] = useState(false);



  // =========================================================

  // REMARK MODAL

  // =========================================================

  const [showRemarkModal, setShowRemarkModal] = useState(false);

  const [selectedRemark, setSelectedRemark] = useState("");



  // =========================================================

  // FILE

  // =========================================================

  const [selectedFile, setSelectedFile] = useState(null);

  const [saving, setSaving] = useState(false);



  // =========================================================

  // OPEN DESIGN MODAL

  // =========================================================

  const openDesignModal = (order) => {

    setSelectedOrder(order);

    setSelectedFile(null);

    setShowDesignModal(true);

  };



  // =========================================================

  // CLOSE DESIGN MODAL

  // =========================================================

  const closeDesignModal = () => {

    if (saving) return;



    setShowDesignModal(false);

    setSelectedOrder(null);

    setSelectedFile(null);

  };



  // =========================================================

  // OPEN REMARK MODAL

  // =========================================================

  const openRemarkModal = (remark) => {

    setSelectedRemark(remark || "No remark available.");

    setShowRemarkModal(true);

  };



  // =========================================================

  // CLOSE REMARK MODAL

  // =========================================================

  const closeRemarkModal = () => {

    setShowRemarkModal(false);

    setSelectedRemark("");

  };



  // =========================================================

  // GET ORDER DATA

  // =========================================================

  useEffect(() => {

    if (SuppId) {

      getorderData();

    } else {

      setLoading(false);

      setError("Supplier not found.");

    }

  }, [SuppId]);



  const getorderData = async () => {

    setLoading(true);

    setError(null);



    try {

      const [orderResponse, quoteResponse] = await Promise.all([

        axios.get(

          `${BASE_URL}supplier/getdatawhere/tbl_orders/assigned_supplier/${SuppId}`

        ),



        axios.get(

          `${BASE_URL}supplier/getdatawhere/tbl_supplier_quotes/sq_supp_id/${SuppId}`

        ),

      ]);



      console.log("Approved Orders:", orderResponse.data);

      console.log("Supplier Quotes:", quoteResponse.data);



      if (orderResponse.data.status) {

        const orderData = Array.isArray(orderResponse.data.data)

          ? orderResponse.data.data

          : orderResponse.data.data

            ? [orderResponse.data.data]

            : [];



        const quoteData = quoteResponse.data.status

          ? Array.isArray(quoteResponse.data.data)

            ? quoteResponse.data.data

            : quoteResponse.data.data

              ? [quoteResponse.data.data]

              : []

          : [];



        // =====================================================

        // APPROVED PAGE

        //

        // ONLY STAGE 9 TO 12

        //

        // 8 and below = HIDE

        // 9,10,11,12 = SHOW

        // 13 and above = HIDE

        // =====================================================



        const filteredData = orderData

          .filter((item) => {

            const stage = Number(item.order_stage);



            return stage >= 9 && stage <= 12;

          })

          .map((order) => {

            const supplierQuote = quoteData.find(

              (quote) =>

                Number(quote.sq_order_id) === Number(order.order_id)

            );



            return {

              ...order,



              sq_quote: supplierQuote?.sq_quote || "",



              sq_remark: supplierQuote?.sq_remark || "",



              cart_confirm_production_file:

                supplierQuote?.cart_confirm_production_file ||

                order.cart_confirm_production_file ||

                "",
                  assign_purchorder: order.assign_purchorder || "",

            };

          });



        setQuotations(filteredData);

      } else {

        setQuotations([]);

      }

    } catch (err) {

      console.error("Order error:", err);



      setError("Failed to fetch data.");



      toast.error("Failed to load data!");

    } finally {

      setLoading(false);

    }

  };



  // =========================================================

  // FILE CHANGE

  // =========================================================

  const handleFileChange = (e) => {

    const file = e.target.files?.[0];



    if (!file) {

      setSelectedFile(null);

      return;

    }



    const allowedTypes = [

      "application/pdf",

      "image/jpeg",

      "image/png",

      "application/zip",

      "application/x-zip-compressed",

    ];



    const allowedExtensions = [

      ".pdf",

      ".jpg",

      ".jpeg",

      ".png",

      ".zip",

    ];



    const fileName = file.name.toLowerCase();



    const validExtension = allowedExtensions.some((ext) =>

      fileName.endsWith(ext)

    );



    if (!validExtension && !allowedTypes.includes(file.type)) {

      toast.error("Only PDF, JPG, PNG or ZIP files are allowed.");



      e.target.value = "";

      setSelectedFile(null);



      return;

    }



    // 10 MB

    const maxSize = 10 * 1024 * 1024;



    if (file.size > maxSize) {

      toast.error("File size must be less than 10 MB.");



      e.target.value = "";

      setSelectedFile(null);



      return;

    }



    setSelectedFile(file);

  };



  // =========================================================

  // DESIGN UPLOAD

  //

  // ONLY FOR STAGE 9

  // Stage 9 -> Upload Design -> Stage 10

  // =========================================================

  const handleDesignSave = async () => {

    if (!selectedOrder) {

      toast.error("Order not selected.");

      return;

    }



    if (!selectedFile) {

      toast.error("Please upload design.");

      return;

    }



    if (Number(selectedOrder.order_stage) !== 9) {

      toast.error("Design upload is available only at Stage 9.");

      return;

    }



    setSaving(true);



    try {

      const formData = new FormData();



      formData.append("file", selectedFile);



      const uploadResponse = await axios.post(

        `${BASE_URL}supplier/fileupload`,

        formData,

        {

          headers: {

            "Content-Type": "multipart/form-data",

          },

        }

      );



      console.log("Design Upload Response:", uploadResponse.data);



      if (

        !uploadResponse.data.status ||

        !uploadResponse.data.files

      ) {

        toast.error(

          uploadResponse.data.message || "File upload failed."

        );



        return;

      }



      const uploadedFileName = Object.values(

        uploadResponse.data.files

      )[0];



      if (!uploadedFileName) {

        toast.error("Uploaded file name not found.");

        return;

      }



      const response = await axios.post(

        `${BASE_URL}supplier/updatedata/tbl_orders/order_id/${selectedOrder.order_id}`,

        {

          order_design: uploadedFileName,

          order_stage: 10,

        }

      );



      if (response.data.status) {

        toast.success("Design uploaded successfully.");



        closeDesignModal();



        await getorderData();

      } else {

        toast.error(

          response.data.message || "Failed to update order."

        );

      }

    } catch (error) {

      console.error("Design upload error:", error);



      toast.error(

        error?.response?.data?.message ||

        "Failed to upload design."

      );

    } finally {

      setSaving(false);

    }

  };



  // =========================================================

  // STAGE NAME

  // =========================================================

  const getStageName = (stage) => {

    switch (Number(stage)) {

      case 8:

        return "Approved";



      case 9:

        return "Design Approval";



      case 10:

        return "Approval Pending";



      case 11:

        return "Proceed for Production";



      case 12:

        return "Quality Check";



      case 13:

        return "Dispatch";



      default:

        return "Unknown Stage";

    }

  };



  // =========================================================

  // STAGE CHANGE

  // =========================================================

  const handleStageChange = (orderId, newStage) => {

    setSelectedOrderId(orderId);

    setSelectedStage(newStage);

    setSelectedFile(null);



    setShowStageModal(true);

  };



  // =========================================================

  // CONFIRM STAGE CHANGE

  // =========================================================

  const confirmStageChange = async () => {

    if (!selectedOrderId || !selectedStage) {

      return;

    }



    // =====================================================

    // STAGE 12

    // QUALITY CHECK

    //

    // Stage 12 selected

    // -> Upload Quality Report

    // -> Save order_quality_repo

    // -> Stage 12

    // =====================================================



    if (Number(selectedStage) === 12) {

      if (!selectedFile) {

        toast.error("Please upload Quality Check Report.");

        return;

      }



      setUpdatingStage(true);



      try {

        // =================================================

        // UPLOAD QUALITY REPORT

        // =================================================



        const formData = new FormData();



        formData.append("file", selectedFile);



        const uploadResponse = await axios.post(

          `${BASE_URL}supplier/fileupload`,

          formData,

          {

            headers: {

              "Content-Type": "multipart/form-data",

            },

          }

        );



        console.log(

          "Quality Report Upload:",

          uploadResponse.data

        );



        if (

          !uploadResponse.data.status ||

          !uploadResponse.data.files

        ) {

          toast.error(

            uploadResponse.data.message ||

            "Quality report upload failed."

          );



          return;

        }



        const uploadedFileName = Object.values(

          uploadResponse.data.files

        )[0];



        if (!uploadedFileName) {

          toast.error(

            "Uploaded quality report not found."

          );



          return;

        }



        // =================================================

        // SAVE QUALITY REPORT

        // =================================================



        const updateResponse = await axios.post(

          `${BASE_URL}supplier/updatedata/tbl_orders/order_id/${selectedOrderId}`,

          {

            order_quality_repo: uploadedFileName,

            order_stage: 12,

          }

        );



        console.log(

          "Quality Check Update:",

          updateResponse.data

        );



        if (updateResponse.data.status) {

          toast.success(

            "Quality Check completed successfully!"

          );



          setShowStageModal(false);

          setSelectedOrderId(null);

          setSelectedStage(null);

          setSelectedFile(null);



          await getorderData();

        } else {

          toast.error(

            updateResponse.data.message ||

            "Failed to complete Quality Check."

          );

        }

      } catch (error) {

        console.error("Quality Check Error:", error);



        toast.error(

          error?.response?.data?.message ||

          "Failed to upload Quality Check Report."

        );

      } finally {

        setUpdatingStage(false);

      }



      return;

    }



    // =====================================================

    // STAGE 13

    // DISPATCH

    //

    // Stage 13 selected

    // -> Upload Dispatch Document

    // -> Save dispatch_file

    // -> Stage 13

    // =====================================================


    // STAGE 13 - DISPATCH
    if (Number(selectedStage) === 13) {
      setUpdatingStage(true);

      try {
        let uploadedFileName = "";

        // Upload document only if selected
        if (selectedFile) {
          const formData = new FormData();
          formData.append("file", selectedFile);

          const uploadResponse = await axios.post(
            `${BASE_URL}supplier/fileupload`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          if (
            !uploadResponse.data.status ||
            !uploadResponse.data.files
          ) {
            toast.error(
              uploadResponse.data.message ||
              "Dispatch document upload failed."
            );
            return;
          }

          uploadedFileName = Object.values(
            uploadResponse.data.files
          )[0];

          if (!uploadedFileName) {
            toast.error("Uploaded dispatch document not found.");
            return;
          }
        }

        // Save stage, document and remark
        const updateData = {
          order_stage: 13,
          dispatch_remark: dispatchRemark.trim(),
          dispatch_file: uploadedFileName,
        };

        console.log("Dispatch Data:", updateData);

        const updateResponse = await axios.post(
          `${BASE_URL}supplier/updatedata/tbl_orders/order_id/${selectedOrderId}`,
          updateData
        );

        console.log("Dispatch Update Response:", updateResponse.data);

        if (updateResponse.data.status) {
          toast.success("Dispatch details saved successfully!");

          setShowStageModal(false);
          setShowWithoutDocumentModal(false);
          setSelectedOrderId(null);
          setSelectedStage(null);
          setSelectedFile(null);
          setDispatchRemark("");

          await getorderData();
        } else {
          toast.error(
            updateResponse.data.message ||
            "Failed to update dispatch."
          );
        }
      } catch (error) {
        console.error("Dispatch Error:", error);

        toast.error(
          error?.response?.data?.message ||
          "Failed to save dispatch details."
        );
      } finally {
        setUpdatingStage(false);
      }

      return;
    }
 

    // if (Number(selectedStage) === 13) {
    //   if (!selectedFile) {
    //     setShowWithoutDocumentModal(true);
    //     return;
    //   }

    //   setUpdatingStage(true);



    //   try {

    

    //     const formData = new FormData();



    //     formData.append("file", selectedFile);



    //     const uploadResponse = await axios.post(

    //       `${BASE_URL}supplier/fileupload`,

    //       formData,

    //       {

    //         headers: {

    //           "Content-Type": "multipart/form-data",

    //         },

    //       }

    //     );



    //     console.log(

    //       "Dispatch File Upload:",

    //       uploadResponse.data

    //     );



    //     if (

    //       !uploadResponse.data.status ||

    //       !uploadResponse.data.files

    //     ) {

    //       toast.error(

    //         uploadResponse.data.message ||

    //         "Dispatch document upload failed."

    //       );



    //       return;

    //     }

    //     const uploadedFileName = Object.values(

    //       uploadResponse.data.files

    //     )[0];


    //     if (!uploadedFileName) {

    //       toast.error(

    //         "Uploaded dispatch document not found."

    //       );



    //       return;

    //     }



    //     console.log(

    //       "Dispatch File:",

    //       uploadedFileName

    //     );



    //     const updateResponse = await axios.post(

    //       `${BASE_URL}supplier/updatedata/tbl_orders/order_id/${selectedOrderId}`,

    //       {

    //         dispatch_file: uploadedFileName,

    //         order_stage: 13,

    //       }

    //     );



    //     console.log(

    //       "Dispatch Update:",

    //       updateResponse.data

    //     );



    //     if (updateResponse.data.status) {

    //       toast.success(

    //         "Dispatch document uploaded successfully!"

    //       );



    //       setShowStageModal(false);

    //       setSelectedOrderId(null);

    //       setSelectedStage(null);

    //       setSelectedFile(null);



    //       await getorderData();

    //     } else {

    //       toast.error(

    //         updateResponse.data.message ||

    //         "Failed to update dispatch."

    //       );

    //     }

    //   } catch (error) {

    //     console.error("Dispatch Upload Error:", error);



    //     toast.error(

    //       error?.response?.data?.message ||

    //       "Failed to upload dispatch document."

    //     );

    //   } finally {

    //     setUpdatingStage(false);

    //   }



    //   return;

    // }



    // =====================================================

    // NORMAL STAGE CHANGE

    // =====================================================



    setUpdatingStage(true);



    try {

      const response = await axios.post(

        `${BASE_URL}supplier/updatedata/tbl_orders/order_id/${selectedOrderId}`,

        {

          order_stage: selectedStage,

        }

      );



      console.log(

        "Stage update response:",

        response.data

      );



      if (response.data.status) {

        toast.success(

          "Order stage updated successfully!"

        );



        setQuotations((prev) =>

          prev

            .map((item) =>

              Number(item.order_id) ===

                Number(selectedOrderId)

                ? {

                  ...item,

                  order_stage: selectedStage,

                }

                : item

            )

            .filter((item) => {

              const stage = Number(item.order_stage);



              return stage >= 9 && stage <= 12;

            })

        );



        setShowStageModal(false);

        setSelectedOrderId(null);

        setSelectedStage(null);

        setSelectedFile(null);

      } else {

        toast.error(

          response.data.message ||

          "Failed to update order stage."

        );

      }

    } catch (error) {

      console.error(

        "Stage update error:",

        error

      );



      toast.error(

        error?.response?.data?.message ||

        "Failed to update order stage!"

      );

    } finally {

      setUpdatingStage(false);

    }

  };



  // =========================================================

  // CANCEL STAGE CHANGE

  // =========================================================

  const confirmDispatchWithoutDocument = async () => {
    if (!selectedOrderId) return;

    setUpdatingStage(true);

    try {
      const response = await axios.post(
        `${BASE_URL}supplier/updatedata/tbl_orders/order_id/${selectedOrderId}`,
        { order_stage: 13, dispatch_file: "",  dispatch_remark: dispatchRemark.trim(), }
      );

      if (response.data.status) {
        toast.success("Dispatch submitted without document.");
        setShowWithoutDocumentModal(false);
        setShowStageModal(false);
        setSelectedOrderId(null);
        setSelectedStage(null);
              setDispatchRemark("");
        setSelectedFile(null);
        await getorderData();
      } else {
        toast.error(response.data.message || "Failed to submit dispatch.");
      }
    } catch (error) {
      console.error("Dispatch Without Document Error:", error);
      toast.error(error?.response?.data?.message || "Failed to submit dispatch.");
    } finally {
      setUpdatingStage(false);
    }
  };

  // =========================================================
  // CANCEL STAGE CHANGE
  // =========================================================
  const cancelStageChange = () => {

    if (updatingStage) {

      return;

    }



    setShowStageModal(false);
    setShowWithoutDocumentModal(false);

    setSelectedOrderId(null);

    setSelectedStage(null);

    setSelectedFile(null);

  };



  // =========================================================

  // RETURN

  // =========================================================

  return (

    <>

      {/* =====================================================

          PAGE HEADING

      ===================================================== */}



      <div className="container-fluid px-3 px-lg-4 py-4">

        <div className="page-heading">

          <div className="page-heading-copy">

            <span className="page-icon">

              <i

                className="bi bi-file-text text-primary"

                aria-hidden="true"

              ></i>

            </span>



            <div>

              <p className="eyebrow mb-1 text-primary">

                All

              </p>



              <h1 className="h3 mb-1">

                Approved

              </h1>

            </div>

          </div>

        </div>



        {/* =====================================================

            TABLE

        ===================================================== */}



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

                  <th>Quotation</th>

                  <th>Remark</th>

                  <th>Status</th>

                  <th>Request Date & Time</th>

                </tr>

              </thead>



              <tbody className="activity-date-time">

                {loading ? (

                  <tr>

                    <td

                      colSpan="5"

                      className="text-center py-4"

                    >

                      Loading...

                    </td>

                  </tr>

                ) : error ? (

                  <tr>

                    <td

                      colSpan="5"

                      className="text-center text-danger py-4"

                    >

                      {error}

                    </td>

                  </tr>

                ) : quotations.length === 0 ? (

                  <tr>

                    <td

                      colSpan="5"

                      className="text-center py-4"

                    >

                      No Approved found.

                    </td>

                  </tr>

                ) : (

                  quotations.map((item, index) => {

                    const currentStage =

                      Number(item.order_stage);



                    const isProduction =

                      String(

                        item.cart_confirm_production_file

                      ).toLowerCase() === "yes";



                    return (

                      <tr

                        key={

                          item.order_id || index

                        }

                        className="text-center"

                      >

                        {/* =====================================

                            ACTION

                        ===================================== */}



                        <td>

                          {/* DESIGN UPLOAD */}



                          {Number(item.order_stage) === 9 &&

                            (

                              <button

                                type="button"

                                className="btn btn-sm  text-primary"
                                     style={{ boxShadow: "none", border: "none",transform: "none", outline: "none"}}


                                onClick={() => openDesignModal(item)}

                                disabled={Number(currentStage) >= 10}

                              >

                                <i className="bi bi-upload me-1 query-icon"></i>



                                {Number(currentStage) >= 10

                                  ? "Design"

                                  : "Design"}

                              </button>

                            )}


                            

{/* VIEW PURCHASE ORDER PDF */}
{item.assign_purchorder &&
 String(item.assign_purchorder).trim() !== "" &&
 String(item.assign_purchorder).trim() !== "0" &&
 String(item.assign_purchorder).trim().toLowerCase() !== "null" && (
  <a
    href={`${BASE_URL.replace(/\/+$/, "")}/Uploads/${String(item.assign_purchorder).trim()}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-primary fw-bold text-decoration-none d-block mt-2 query-icon"
    style={{
      cursor: "pointer",
      fontSize: "13px",
    }}
  >
    <i className="bi bi-file-earmark-pdf me-1 query-icon"></i>
    View Purchase Order
  </a>
)}



                        </td>



                        {/* =====================================

                            QUOTATION

                        ===================================== */}



                        <td className="text-start">

                          <span className="fw-bold">

                            Order Code:

                          </span>{" "}



                          {item.order_code || "N/A"}



                          <br />



                          <span className="fw-bold">

                            Send Quote:

                          </span>{" "}



                          {item.sq_quote ? (

                            <a

                              href={`${BASE_URL}public/Uploads/${item.sq_quote}`}

                              className="text-primary fw-bold text-decoration-none"

                              target="\_blank"

                              rel="noreferrer"

                            >

                              View Quotation

                            </a>

                          ) : (

                            <span className="text-muted">

                              No Quotation

                            </span>

                          )}

                        </td>



                        {/* =====================================

                            REMARK

                        ===================================== */}



                        <td>

                          <div className="d-flex align-items-center justify-content-center flex-nowrap gap-1">

                            <button

                              type="button"

                              className="btn text-primary btn-sm"
style={{ boxShadow: "none", transform: "none", border: "none", outline: "none"}}

                              onClick={() =>

                                openRemarkModal(

                                  item.sq_remark

                                )

                              }

                            >

                              <i className="bi bi-eye me-1 query-icon"></i>

                              Remark

                            </button>



                            <br />



                            {Number(item.order_stage) >=

                              9 && (

                                <button

                                  type="button"

                                  className="btn text-primary btn-sm"
style={{ boxShadow: "none", border: "none", outline: "none",transform: "none",}}

                                  onClick={() =>

                                    openRemarkModal(

                                      item.assigned_remark

                                    )

                                  }

                                >

                                  <i className="bi bi-eye me-1 query-icon"></i>

                                  Secure Circuit

                                </button>

                              )}



                          </div>

                        </td>



                        {/* =====================================

                            STATUS

                        ===================================== */}



                        <td style={{

                    
                        }}>

                          <select
                          

                            className="stage-dropdown"
                            

                            value={currentStage}

                            onChange={(e) => {

                              const newStage =

                                Number(

                                  e.target.value

                                );



                              if (!newStage) {

                                return;

                              }



                              if (

                                newStage <=

                                currentStage

                              ) {

                                return;

                              }



                              handleStageChange(

                                item.order_id,

                                newStage

                              );

                            }}

                            disabled={

                              currentStage >= 13

                            }

                         

                          >

                            {/* STAGE 9 */}



                            {!isProduction && (

                              <option

                                value="9"

                                disabled={

                                  currentStage >= 9

                                }

                              >

                                Design Approval

                              </option>

                            )}



                            {/* STAGE 10 */}



                            {!isProduction && (

                              <option

                                value="10"

                                disabled={

                                  currentStage >= 9

                                }

                              >

                                Approval Pending

                              </option>

                            )}



                            {/* STAGE 11 */}



                            <option   

                              value="11"

                              disabled={

                                currentStage >= 11 || currentStage === 10

                              }

                            >

                              Proceed for Production

                            </option>



                            {/* STAGE 12 */}



                            <option

                              value="12"

                              disabled={

                                currentStage >= 12 || currentStage === 10

                              }

                            >

                              Quality Check

                            </option>



                            {/* STAGE 13 */}



                            <option

                              value="13"

                              disabled={

                                currentStage >= 13 || currentStage === 10

                              }

                            >

                              Dispatch

                            </option>

                          </select>

                        </td>



                        {/* =====================================

                            DATE

                        ===================================== */}



                        <td>

                          {item.order_request_date}{" "}

                          {item.order_request_time}

                        </td>

                      </tr>

                    );

                  })

                )}

              </tbody>

            </table>

          </div>

        </section>

      </div>



      {/* =====================================================

          REMARK MODAL

      ===================================================== */}



      {showRemarkModal && (

        <>

          <div

            className="modal-backdrop fade show"

            onClick={closeRemarkModal}

          ></div>



          <div

            className="modal fade show d-block"

            tabIndex="-1"

            role="dialog"

            aria-modal="true"

          >

            <div className="modal-dialog modal-dialog-centered">

              <div className="modal-content">



                <div className="modal-header">

                  <h5 className="modal-title">

                    <i className="bi bi-chat-left-text me-2 text-primary"></i>

                    Remark

                  </h5>



                  <button

                    type="button"

                    className="btn-close"

                    onClick={closeRemarkModal}

                  ></button>

                </div>



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



                <div className="modal-footer">

                  <button

                    type="button"

                    className="btn btn-secondary"

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



      {/* =====================================================

          DESIGN UPLOAD MODAL

      ===================================================== */}



      {showDesignModal && selectedOrder && (

        <>

          <div

            className="modal-backdrop fade show"

            onClick={closeDesignModal}

          ></div>



          <div

            className="modal fade show d-block"

            tabIndex="-1"

            role="dialog"

          >

            <div className="modal-dialog modal-dialog-centered">

              <div className="modal-content">



                <div className="design-modal-header">

                  <div>

                    <h4>

                      <i className="bi bi-upload me-2"></i>

                      Upload Design

                    </h4>



                    <div className="staff-name">

                      Order Code:{" "}

                      <strong>

                        {selectedOrder.order_code ||

                          "N/A"}

                      </strong>

                    </div>

                  </div>



                  <button

                    type="button"

                    className="design-modal-close"

                    onClick={closeDesignModal}

                    disabled={saving}

                  >

                    <i className="bi bi-x-lg"></i>

                  </button>

                </div>



                <div className="design-modal-body">

                  <div className="design-form-group">



                    <label>

                      Upload Design{" "}

                      <span>*</span>

                    </label>



                    <input

                      type="file"

                      className="form-control design-form-control"

                      accept=".pdf,.jpg,.jpeg,.png,.zip"

                      onChange={handleFileChange}

                      disabled={

                        Number(

                          selectedOrder.order_stage

                        ) !== 9

                      }

                    />



                    <small>

                      PDF, JPG, PNG or ZIP allowed.

                      Max 10 MB.

                    </small>



                    {selectedFile && (

                      <div className="mt-2 text-success small">

                        <i className="bi bi-check-circle me-1"></i>



                        {selectedFile.name}

                      </div>

                    )}

                  </div>

                </div>



                <div className="design-modal-footer justify-content-between">



                  <button

                    type="button"

                    className="btn design-close-btn"

                    onClick={closeDesignModal}

                    disabled={saving}

                  >

                    Close

                  </button>



                  <button

                    type="button"

                    className="btn design-save-btn "

                    onClick={handleDesignSave}

                    disabled={

                      saving ||

                      !selectedFile ||

                      Number(

                        selectedOrder.order_stage

                      ) !== 9

                    }

                  >

                    {saving ? (

                      <>

                        <span

                          className="spinner-border spinner-border-sm me-1  "

                          role="status"

                          aria-hidden="true"

                        ></span>



                        Uploading...

                      </>

                    ) : (

                      <>

                        <i className="bi bi-upload me-1"></i>

                        Upload Design

                      </>

                    )}

                  </button>



                </div>



              </div>

            </div>

          </div>

        </>

      )}



      {/* =====================================================

          STAGE CONFIRMATION MODAL



          STAGE 12:

          -> Quality Report

          -> order_quality_repo

          -> stage 12



          STAGE 13:

          -> Dispatch Document

          -> dispatch_file

          -> stage 13

      ===================================================== */}



      {showStageModal && (

        <div

          className="modal fade show d-block"

          tabIndex="-1"

          role="dialog"

          aria-modal="true"

          style={{

            backgroundColor: "rgba(0, 0, 0, 0.45)",

          }}

        >

          <div

            className="modal-dialog modal-dialog-centered"

            role="document"

            style={{

              maxWidth: "450px",

            }}

          >

            <div className="modal-content">



              {/* HEADER */}



              <div className="modal-header py-2">

                <h5 className="modal-title">

                  Confirm Stage Change

                </h5>



                <button

                  type="button"

                  className="btn-close"

                  onClick={cancelStageChange}

                  disabled={updatingStage}

                ></button>

              </div>



              {/* BODY */}



              <div className="modal-body">



                <div className="text-center mb-3">



                  <i

                    className={

                      Number(selectedStage) === 12

                        ? "bi bi-clipboard-check text-success"

                        : Number(selectedStage) === 13

                          ? "bi bi-truck text-primary"

                          : "bi bi-exclamation-circle text-warning"

                    }

                    style={{

                      fontSize: "42px",

                    }}

                  ></i>



                  <p className="mt-3 mb-2">

                    Are you sure you want to update

                    the order stage?

                  </p>



                  <div>

                    <span className="fw-bold">

                      {getStageName(selectedStage)}

                    </span>

                  </div>



                </div>



                {/* =========================================

                    STAGE 12 - QUALITY CHECK REPORT

                ========================================= */}



                {Number(selectedStage) === 12 && (

                  <div className="mt-4">



                    <label className="form-label fw-semibold">

                      Upload Quality Check Report{" "}

                      <span className="text-danger">

                        *

                      </span>

                    </label>



                    <input

                      type="file"

                      className="form-control"

                      accept=".pdf,.jpg,.jpeg,.png,.zip"

                      onChange={handleFileChange}

                      disabled={updatingStage}

                    />



                    <small className="text-muted d-block mt-1">

                      PDF, JPG, PNG or ZIP allowed.

                      Max 10 MB.

                    </small>



                    {selectedFile && (

                      <div className="alert alert-success py-2 mt-3 mb-0">

                        <i className="bi bi-check-circle me-2"></i>



                        <strong>

                          {selectedFile.name}

                        </strong>

                      </div>

                    )}



                  </div>

                )}



                {/* =========================================

                    STAGE 13 - DISPATCH DOCUMENT

                ========================================= */}



                {Number(selectedStage) === 13 && (

                  <div className="mt-4">



                    <label className="form-label fw-semibold">

                      Upload Dispatch Document{" "}



                    </label>



                    <input

                      type="file"

                      className="form-control"

                      accept=".pdf,.jpg,.jpeg,.png,.zip"

                      onChange={handleFileChange}

                      disabled={updatingStage}

                    />



                    <small className="text-muted d-block mt-1">
                      Optional — PDF, JPG, PNG or ZIP allowed.
                      Max 10 MB.
                    </small>



                    {selectedFile && (

                      <div className="alert alert-success py-2 mt-3 mb-0">

                        <i className="bi bi-check-circle me-2"></i>



                        <strong>

                          {selectedFile.name}

                        </strong>

                      </div>

                    )}
   {/* DISPATCH REMARK */}
    <div className="mt-3">
      <label className="form-label fw-semibold">
        Dispatch Remark
      </label>

      <textarea
        className="form-control"
        rows="3"
        placeholder="Enter dispatch remark"
        value={dispatchRemark}
        onChange={(e) => setDispatchRemark(e.target.value)}
        disabled={updatingStage}
      />
    </div>


                  </div>

                )}



              </div>



              {/* FOOTER */}



              <div className="modal-footer py-2 justify-content-between">



                <button

                  type="button"

                  className="btn btn-secondary"

                  onClick={cancelStageChange}

                  disabled={updatingStage}

                >

                  Cancel

                </button>



                <button

                  type="button"

                  className="btn btn-primary"

                  onClick={confirmStageChange}

                  disabled={
                    updatingStage ||
                    (Number(selectedStage) === 12 && !selectedFile)
                  }

                >

                  {updatingStage ? (

                    <>

                      <span

                        className="spinner-border spinner-border-sm me-2"

                        role="status"

                      ></span>



                      {Number(selectedStage) === 12 ||

                        Number(selectedStage) === 13

                        ? "Uploading..."

                        : "Updating..."}

                    </>

                  ) : (

                    <>

                      <i className="bi bi-check-lg me-1"></i>

                      Confirm

                    </>

                  )}

                </button>



              </div>



            </div>

          </div>

        </div>

      )}



      {/* DISPATCH WITHOUT DOCUMENT MODAL */}
      {showWithoutDocumentModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "400px" }}>
            <div className="modal-content">
              <div className="modal-header py-2">
                <h5 className="modal-title"><i className="bi bi-exclamation-triangle text-warning me-2"></i>Document Not Uploaded</h5>
                <button type="button" className="btn-close" onClick={() => setShowWithoutDocumentModal(false)} disabled={updatingStage}></button>
              </div>
              <div className="modal-body text-center">
                <i className="bi bi-file-earmark-x text-warning" style={{ fontSize: "45px" }}></i>
                <p className="mt-3 mb-2 fw-semibold">Dispatch document has not been uploaded.</p>
                <p className="text-muted mb-0">Do you want to submit the Dispatch without uploading the document?</p>
              </div>
              <div className="modal-footer justify-content-between py-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowWithoutDocumentModal(false)} disabled={updatingStage}>Cancel</button>
                <button type="button" className="btn btn-warning" onClick={confirmDispatchWithoutDocument} disabled={updatingStage}>
                  {updatingStage ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</>
                  ) : (
                    <><i className="bi bi-check-lg me-1"></i>Submit Without Document</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>

  );

}



export default Approved;