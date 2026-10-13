import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";
import Delete from "../Config/Delete";
import * as Yup from "yup";
import { useFormik } from "formik";
import TableLoader from "../Config/TableLoader";
import * as bootstrap from "bootstrap";

function Suppliers() {
  const [suppData, setSuppData] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const admin = JSON.parse(localStorage.getItem("admin"));

  useEffect(() => {
    const popoverTriggerList = document.querySelectorAll(
      '[data-bs-toggle="popover"]'
    );

    popoverTriggerList.forEach((el) => {
      bootstrap.Popover.getOrCreateInstance(el);
    });
  }, [suppData]);


  const suppSchema = Yup.object({
    supp_company_name: Yup.string()
      .required("Company Name is required")
      .min(3, "Company Name must be at least 3 characters"),

    supp_contact_person: Yup.string()
      .required("Contact Person is required")
      .min(3, "Contact Person must be at least 3 characters"),

    supp_email: Yup.string()
      .email("Invalid Email")
      .required("Email is required"),

    supp_mobile: Yup.string()
      .required("Mobile Number is required")
      .matches(/^[0-9]{10}$/, "Mobile Number must be 10 digits"),

    supp_password: Yup.string().when([], {
      is: () => !editId,
      then: () =>
        Yup.string()
          .required("Password is required")
          .min(6, "Password must be at least 6 characters"),
      otherwise: () => Yup.string(),
    }),

    supp_gst_number: Yup.string()
      .matches(
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        "Invalid GST Number"
      )
      .nullable(),

    supp_pan_number: Yup.string()
      .matches(
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        "Invalid PAN Number"
      )
      .nullable(),

    supp_type: Yup.string()
      .required("Supplier Type is required"),

    supp_address_line1: Yup.string()
      .required("Address Line 1 is required"),

    supp_address_line2: Yup.string()
      .required("Address Line 2 is required"),

    supp_city: Yup.string()
      .required("City is required"),

    supp_state: Yup.string()
      .required("State is required"),

    supp_country: Yup.string()
      .required("Country is required"),

    supp_postal_code: Yup.string()
      .matches(/^[0-9]{6}$/, "PIN Code must be 6 digits")
      .required("PIN Code is required"),

    supp_website: Yup.string()
      .url("Invalid Website URL")
      .notRequired()
  });

  useEffect(() => {
    getSuppData();
  }, []);

  const generatePassword = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "@#$%&*!?";
    const allChars = upper + lower + numbers + symbols;

    let password = "";

    // Ensure at least one of each
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Remaining characters
    for (let i = password.length; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle password
    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    formik.setFieldValue("supp_password", password);
  };


  const formik = useFormik({
    initialValues: {
      supp_company_name: "",
      supp_contact_person: "",
      supp_email: "",
      supp_phone: "",
      supp_mobile: "",
      supp_password: "",
      supp_gst_number: "",
      supp_pan_number: "",
      supp_type: "",
      supp_address_line1: "",
      supp_address_line2: "",
      supp_city: "",
      supp_state: "",
      supp_country: "India",
      supp_postal_code: "",
      supp_website: "",
      supp_status: "1",
      supp_notes: "",
    },

    validationSchema: suppSchema,

    onSubmit: async (values) => {
      saveSupp(values);
    },
  });

  // supp All Data Get Function
  const getSuppData = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${BASE_URL}admin/getdata/tbl_suppliers`
      );

      if (response.data.status) {
        setSuppData(response.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Status Change Function
  const changeStatus = async (suppId, status) => {
    try {
      const response = await axios.post(
        `${BASE_URL}admin/updatedata/tbl_suppliers/supp_id/${suppId}`,
        {
          supp_status: status,
        },
      );

      if (response.data.status) {
        toast.success("Status Updated");

        getSuppData();
      }
    } catch (error) {
      toast.error("Status Update Failed");
    }
  };

  // Delete Function
  const confirmDelete = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}admin/deletedata/tbl_suppliers/supp_id/${deleteId}`
      );

      if (response.data.status) {
        toast.success("Successfully Deleted");

        setShowDelete(false);
        setDeleteId(null);

        getSuppData();
      }
    } catch (error) {
      toast.error("Delete Failed");
    }
  };

  // Supplier Insert/Save function
  const saveSupp = async (values) => {
    try {
      let response;

      const payload = {
        supp_menu: '1,4,5,6,7',
        supp_company_name: values.supp_company_name,
        supp_contact_person: values.supp_contact_person,
        supp_email: values.supp_email,
        supp_phone: values.supp_phone,
        supp_mobile: values.supp_mobile,
        supp_gst_number: values.supp_gst_number,
        supp_pan_number: values.supp_pan_number,
        supp_type: values.supp_type,
        supp_address_line1: values.supp_address_line1,
        supp_address_line2: values.supp_address_line2,
        supp_city: values.supp_city,
        supp_state: values.supp_state,
        supp_country: values.supp_country,
        supp_postal_code: values.supp_postal_code,
        supp_website: values.supp_website,
        supp_notes: values.supp_notes,
      };

      if (editId) {
        response = await axios.post(
          `${BASE_URL}admin/updatedata/tbl_suppliers/supp_id/${editId}`,
          payload
        );
      } else {
        payload.supp_password = values.supp_password;

        response = await axios.post(
          `${BASE_URL}admin/insert/tbl_suppliers`,
          payload
        );
      }

      if (response.data.status) {
        toast.success(response.data.message);

        resetForm();
        getSuppData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  // Supplier Edit Function
  const editSupp = async (suppId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}admin/getdatawhere/tbl_suppliers/supp_id/${suppId}`
      );

      if (response.data.status) {
        const supp = response.data.data[0];

        formik.setValues({
          supp_company_name: supp.supp_company_name || "",
          supp_contact_person: supp.supp_contact_person || "",
          supp_email: supp.supp_email || "",
          supp_phone: supp.supp_phone || "",
          supp_mobile: supp.supp_mobile || "",
          supp_gst_number: supp.supp_gst_number || "",
          supp_pan_number: supp.supp_pan_number || "",
          supp_type: supp.supp_type || "",
          supp_address_line1: supp.supp_address_line1 || "",
          supp_address_line2: supp.supp_address_line2 || "",
          supp_city: supp.supp_city || "",
          supp_state: supp.supp_state || "",
          supp_country: supp.supp_country || "India",
          supp_postal_code: supp.supp_postal_code || "",
          supp_website: supp.supp_website || "",
          supp_status: supp.supp_status || "1",
          supp_notes: supp.supp_notes || "",
        });

        setEditId(suppId);
        setShowModal(true);
      }
    } catch (error) {
      toast.error("Failed to load supplier data");
    }
  };

  // Supplier Add/Edit Form Reset Function
  const resetForm = () => {
    setEditId(null);
    formik.resetForm();
    setShowModal(false);
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
              <h1 className="h3 mb-1">Suppliers </h1>
            </div>
          </div>
        </div>

        <section className="panel">
          <div className="panel-header d-flex flex-wrap align-items-center justify-content-end gap-2">
            <button
              className="btn btn-outline-danger"
              type="button"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <i className="bi bi-plus"></i> Add{" "}
            </button>
          </div>
          <div className="table-responsive">
            <table
              className="table align-middle mb-0"
              id="ordersTable"
              data-searchable-table
            >
              <thead>
                <tr className="text-center">
                  <th>Supplier Detail</th>
                  <th>Company Detail</th>
                  <th>Activity Detail</th>
                </tr>
              </thead>
              <tbody className="activity-date-time">
                {loading ? (
                  <TableLoader rows={6} columns={3} />
                ) : suppData.length > 0 ? (
                  suppData.map((supp) => (
                    <tr key={supp.supp_id}>
                      <td>
                        <div className="dropdown">
                          <span className="fw-semibold">Name:</span>{" "}
                          <button
                            className="btn btn-link text-decoration-none fw-semibold p-0 dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            {supp.supp_contact_person}
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => editSupp(supp.supp_id)}
                              >
                                <i className="bi bi-pencil-square me-2"></i>
                                Edit
                              </button>
                            </li>

                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => {
                                  setDeleteId(supp.supp_id);
                                  setShowDelete(true);
                                }}
                              >
                                <i className="bi bi-trash me-2"></i>
                                Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                        <span className="fw-semibold">Code:</span> {supp.supp_code}<br />
                        <div className="d-flex align-items-center">
                          <span className="fw-semibold me-2">Email:</span>
                          <span>{supp.supp_email}</span>
                        </div>
                        <span className="fw-semibold">Mobile:</span> {supp.supp_mobile}<br />
                      </td>

                      <td>
                        <span className="fw-semibold">Company:</span>{" "}
                        <span title={supp.supp_company_name}>
                          {supp.supp_company_name?.length > 15
                            ? `${supp.supp_company_name.slice(0, 15)}...`
                            : supp.supp_company_name}
                        </span>
                        <br />
                        <span className="fw-semibold">GST:</span> {supp.supp_gst_number}<br />
                        <span className="fw-semibold">PAN:</span> {supp.supp_pan_number}<br />
                        <span className="fw-semibold">Type:</span> {supp.supp_type}<br />
                        <span className="fw-semibold">Address:</span>{" "}
                        <span
                          className="text-dark fw-semibold"
                          style={{ cursor: "pointer", fontSize: "15px" }}
                          data-bs-toggle="popover"
                          data-bs-trigger="hover"
                          data-bs-html="true"
                          data-bs-placement="right"
                          data-bs-title="Address Details"
                          data-bs-content={`
                           <b>Address:</b> ${supp.supp_address_line1 || ""} ${supp.supp_address_line2 || ""} <br/>
                           <b>City:</b>  ${supp.supp_city || ""} <br/>
                            <b>State:</b>  ${supp.supp_state || ""} <br/>
                            <b>Country:</b>  ${supp.supp_country || ""} <br/>
                            <b>PIN Code:</b>  ${supp.supp_postal_code || ""} 
                            `}
                        >
                          {supp.supp_address_line1?.length > 15
                            ? `${supp.supp_address_line1.slice(0, 15)}...`
                            : supp.supp_address_line1}
                        </span>
                      </td>

                      <td className="text-start">

                        <span className="fw-semibold">Created At:</span>{" "}
                        {supp.supp_created_at} <br />{" "}
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-semibold">Status: </span>
                          {admin.staff_role == 1 ? (
                            <select
                              className={`form-select form-select-sm w-auto ${supp.supp_status == 1
                                ? "border-success text-success"
                                : "border-danger text-danger"
                                }`}
                              value={supp.supp_status}
                              onChange={(e) => changeStatus(supp.supp_id, e.target.value)}
                            >
                              <option value="1">🟢 Active</option>
                              <option value="0">🔴 Inactive</option>
                            </select>
                          ) : (
                            <span
                              className={`badge ${supp.supp_status == 1 ? "bg-success" : "bg-danger"
                                }`}
                            >
                              {supp.supp_status == 1 ? "Active" : "Inactive"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-danger">
                      No Supplier Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section >
      </div >

      {showModal && (
        <div className="model-add-edit-modal-overlay">
          <div className="model-add-edit-modal-dialog model-size-">
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header">
                <h5 className="model-add-edit-modal-title">
                  {editId ? "Edit Supplier" : "Add Supplier"}
                </h5>

                <button
                  type="button"
                  className="model-add-edit-modal-close"
                  onClick={resetForm}
                >
                  ✕
                </button>
              </div>

              <div className="model-add-edit-modal-body">
                <div className="row g-3">
                  <h5
                    className="fw-semibold text-center"
                  >
                    Basic Infomation
                  </h5>

                  <div className="col-md-6">
                    <label className="model-add-edit-label">Fullname</label>
                    <input
                      type="text"
                      name="supp_contact_person"
                      placeholder="Enter Fullname"
                      className={`model-add-edit-input ${formik.touched.supp_contact_person &&
                        formik.errors.supp_contact_person
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.supp_contact_person}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />

                    <div className="invalid-feedback">
                      {formik.errors.supp_contact_person}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="model-add-edit-label">Email</label>
                    <input
                      type="email"
                      name="supp_email"
                      placeholder="Enter Email"
                      className={`model-add-edit-input ${formik.touched.supp_email && formik.errors.supp_email
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.supp_email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />

                    <div className="invalid-feedback">
                      {formik.errors.supp_email}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="model-add-edit-label">Mobile</label>
                    <input
                      type="text"
                      name="supp_mobile"
                      placeholder="Enter Mobile"
                      maxLength="10"
                      className={`model-add-edit-input ${formik.touched.supp_mobile && formik.errors.supp_mobile
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.supp_mobile}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />

                    <div className="invalid-feedback">
                      {formik.errors.supp_mobile}
                    </div>
                  </div>

                  {!editId && (
                    <div className="col-md-6">
                      <label className="model-add-edit-label">Password</label>
                      <div className="d-flex gap-2">
                        <input
                          type="password"
                          name="supp_password"
                          placeholder="Password Auto Generate"
                          className={`model-add-edit-input ${formik.touched.supp_password &&
                            formik.errors.supp_password
                            ? "is-invalid"
                            : ""
                            }`}
                          value={formik.values.supp_password}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          readOnly
                        />
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={generatePassword}
                        >
                          Generate
                        </button>
                      </div>
                      <div className="invalid-feedback">
                        {formik.errors.supp_password}
                      </div>
                    </div>
                  )}

                  <hr />
                  <h5
                    className="text-muted fw-semibold text-center"
                  >
                    Company Infomation
                  </h5>
                  <div className="col-md-6">
                    <label className="model-add-edit-label">Company Name</label>
                    <input
                      type="text"
                      name="supp_company_name"
                      placeholder="Enter Company Name"
                      className={`model-add-edit-input ${formik.touched.supp_company_name &&
                        formik.errors.supp_company_name
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.supp_company_name}
                      onChange={formik.handleChange}
                    />
                    <div className="invalid-feedback">
                      {formik.errors.supp_company_name}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="model-add-edit-label">GST No</label>
                    <input
                      type="text"
                      name="supp_gst_number"
                      placeholder="Enter GST No"
                      className={`model-add-edit-input ${formik.touched.supp_gst_number && formik.errors.supp_gst_number
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.supp_gst_number}
                      onChange={formik.handleChange}
                    />
                    <div className="invalid-feedback">
                      {formik.errors.supp_gst_number}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="model-add-edit-label">Pan No</label>
                    <input
                      type="text"
                      name="supp_pan_number"
                      placeholder="Enter Pan No"
                      className={`model-add-edit-input ${formik.touched.supp_pan_number && formik.errors.supp_pan_number
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.supp_pan_number}
                      onChange={formik.handleChange}
                    />
                    <div className="invalid-feedback">
                      {formik.errors.supp_pan_number}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="model-add-edit-label">Type</label>
                    <input
                      type="text"
                      name="supp_type"
                      placeholder="Enter Supplier Type"
                      className={`model-add-edit-input ${formik.touched.supp_type && formik.errors.supp_type
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.supp_type}
                      onChange={formik.handleChange}
                    />
                    <div className="invalid-feedback">
                      {formik.errors.supp_type}
                    </div>
                  </div>

                  <hr />
                  <h5
                    className="text-muted fw-semibold text-center"
                  >
                    Address Infomation
                  </h5>

                  <div className="col-md-6">
                    <label className="model-add-edit-label">
                      Address Line 1
                    </label>
                    <textarea
                      name="supp_address_line1"
                      className={`model-add-edit-input ${formik.touched.supp_address_line1 &&
                        formik.errors.supp_address_line1
                        ? "is-invalid"
                        : ""
                        }`}
                      placeholder="Enter Address 1"
                      value={formik.values.supp_address_line1}
                      onChange={formik.handleChange}
                    />
                    <div className="invalid-feedback">
                      {formik.errors.supp_address_line1}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="model-add-edit-label">
                      Address Line 2
                    </label>
                    <textarea
                      name="supp_address_line2"
                      className={`model-add-edit-input ${formik.touched.supp_address_line2 &&
                        formik.errors.supp_address_line2
                        ? "is-invalid"
                        : ""
                        }`}
                      placeholder="Enter Address 2"
                      value={formik.values.supp_address_line2}
                      onChange={formik.handleChange}
                    />
                    <div className="invalid-feedback">
                      {formik.errors.supp_address_line2}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="model-add-edit-label">City</label>
                    <input
                      type="text"
                      name="supp_city"
                      placeholder="Enter City"
                      className={`model-add-edit-input ${formik.touched.supp_city && formik.errors.supp_city
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.supp_city}
                      onChange={formik.handleChange}
                    />
                    <div className="invalid-feedback">
                      {formik.errors.supp_city}
                    </div>
                  </div>


                  <div className="col-md-6">
                    <label className="model-add-edit-label">State</label>
                    <input
                      type="text"
                      name="supp_state"
                      placeholder="Enter State"
                      className={`model-add-edit-input ${formik.touched.supp_state && formik.errors.supp_state
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.supp_state}
                      onChange={formik.handleChange}
                    />
                    <div className="invalid-feedback">
                      {formik.errors.supp_state}
                    </div>
                  </div>


                  <div className="col-md-6">
                    <label className="model-add-edit-label">Country</label>
                    <input
                      type="text"
                      name="supp_country"
                      placeholder="Enter Country"
                      className={`model-add-edit-input ${formik.touched.supp_country && formik.errors.supp_country
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.supp_country}
                      onChange={formik.handleChange}
                    />
                    <div className="invalid-feedback">
                      {formik.errors.supp_country}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="model-add-edit-label">Postal Code</label>
                    <input
                      type="text"
                      name="supp_postal_code"
                      placeholder="Enter Postal Code"
                      className={`model-add-edit-input ${formik.touched.supp_postal_code && formik.errors.supp_postal_code
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.supp_postal_code}
                      onChange={formik.handleChange}
                    />
                    <div className="invalid-feedback">
                      {formik.errors.supp_postal_code}
                    </div>
                  </div>

                  <hr />
                  <h5
                    className="text-muted fw-semibold text-center"
                  >
                    Other Infomation
                  </h5>

                  <div className="col-md-6">
                    <label className="model-add-edit-label">Website</label>
                    <input
                      type="text"
                      name="supp_website"
                      placeholder="Enter Website"
                      className={`model-add-edit-input ${formik.touched.supp_website && formik.errors.supp_website
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.supp_website}
                      onChange={formik.handleChange}
                    />
                    <div className="invalid-feedback">
                      {formik.errors.supp_website}
                    </div>
                  </div>


                  {/* <div className="col-md-6">
                    <label className="model-add-edit-label">Status</label>

                    <select
                      name="supp_status"
                      className={`model-add-edit-input ${formik.touched.supp_status &&
                        formik.errors.supp_status
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.supp_status}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <option value="">Select Status</option>
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>

                    <div className="invalid-feedback">
                      {formik.errors.supp_status}
                    </div>
                  </div> */}


                  <div className="col-md-12">
                    <label className="model-add-edit-label">Notes</label>
                    <textarea
                      name="supp_notes"
                      rows="4"
                      className={`model-add-edit-textarea ${formik.touched.supp_notes &&
                        formik.errors.supp_notes
                        ? "is-invalid"
                        : ""
                        }`}
                      placeholder="Enter Supplier Notes"
                      value={formik.values.supp_notes}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <div className="invalid-feedback">
                      {formik.errors.supp_notes}
                    </div>
                  </div>

                </div>
              </div>

              <div className="model-add-edit-modal-footer d-flex justify-content-between">
                <button
                  className="model-add-edit-btn model-add-edit-btn-cancel"
                  onClick={resetForm}
                >
                  Close
                </button>

                <button
                  type="submit"
                  className="model-add-edit-btn model-add-edit-btn-save"
                  onClick={formik.handleSubmit}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Delete
        show={showDelete}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDelete(false);
          setDeleteId(null);
        }}
      />
    </>
  );
}

export default Suppliers;
