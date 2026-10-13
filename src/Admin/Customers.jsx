import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";
import Delete from "../Config/Delete";
import * as Yup from "yup";
import { useFormik } from "formik";
import TableLoader from "../Config/TableLoader";
import * as bootstrap from "bootstrap";

function Customers() {
  const [custData, setCustData] = useState([]);
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
  }, [custData]);

  const custSchema = Yup.object({
    cust_company_name: Yup.string().required("Company Name is required"),

    cust_contact_person: Yup.string().required("Contact Person is required"),

    cust_email: Yup.string()
      .email("Invalid Email")
      .required("Email is required"),

    cust_mobile: Yup.string()
      .matches(/^[0-9]{10}$/, "Mobile Number must be 10 digits")
      .required("Mobile Number is required"),

    cust_gstno: Yup.string().nullable(),

    cust_billing_address: Yup.string().required("Billing Address is required"),

    cust_shipping_address: Yup.string().required(
      "Shipping Address is required",
    ),

    cust_password: Yup.string().when([], {
      is: () => !editId,
      then: () =>
        Yup.string()
          .required("Password is required")
          .min(6, "Password must be at least 6 characters"),
      otherwise: () => Yup.string(),
    }),
  });

  useEffect(() => {
    getCustData();
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

    formik.setFieldValue("cust_password", password);
  };

  const formik = useFormik({
    initialValues: {
      cust_company_name: "",
      cust_contact_person: "",
      cust_email: "",
      cust_mobile: "",
      cust_password: "",
      cust_gstno: "",
      cust_billing_address: "",
      cust_shipping_address: "",
    },

    validationSchema: custSchema,

    onSubmit: async (values) => {
      saveCust(values);
    },
  });

  // Customer All Data Get Function
  const getCustData = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${BASE_URL}admin/getdata/tbl_customers`,
      );

      if (response.data.status) {
        setCustData(response.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Delete Function
  const confirmDelete = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}admin/deletedata/tbl_customers/cust_id/${deleteId}`,
      );

      if (response.data.status) {
        toast.success("Successfully Deleted");

        setShowDelete(false);
        setDeleteId(null);

        getCustData();
      }
    } catch (error) {
      toast.error("Delete Failed");
    }
  };

  // Customer Insert/Save function
  const saveCust = async (values) => {
    try {
      let response;

      const payload = {
        cust_company_name: values.cust_company_name,
        cust_contact_person: values.cust_contact_person,
        cust_email: values.cust_email,
        cust_mobile: values.cust_mobile,
        cust_gstno: values.cust_gstno,
        cust_billing_address: values.cust_billing_address,
        cust_shipping_address: values.cust_shipping_address,
        cust_menu: '1,4,5,7,11',
        cust_status: "1",
      };

      if (editId) {
        response = await axios.post(
          `${BASE_URL}admin/updatedata/tbl_customers/cust_id/${editId}`,
          payload,
        );
      } else {
        payload.cust_password = values.cust_password;

        response = await axios.post(
          `${BASE_URL}admin/insert/tbl_customers`,
          payload,
        );
      }

      if (response.data.status) {
        toast.success(response.data.message);

        resetForm();
        getCustData();

      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  // Customer Edit Function
  const editCust = async (custId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}admin/getdatawhere/tbl_customers/cust_id/${custId}`,
      );

      if (response.data.status) {
        const cust = response.data.data[0];

        formik.setValues({
          cust_company_name: cust.cust_company_name || "",
          cust_contact_person: cust.cust_contact_person || "",
          cust_email: cust.cust_email || "",
          cust_mobile: cust.cust_mobile || "",
          cust_password: "",
          cust_gstno: cust.cust_gstno || "",
          cust_billing_address: cust.cust_billing_address || "",
          cust_shipping_address: cust.cust_shipping_address || "",
        });

        setEditId(custId);
        setShowModal(true);
      }
    } catch (error) {
      toast.error("Failed to load customer data");
    }
  };

  // Status Change Function
  const changeStatus = async (custId, status) => {
    try {
      const response = await axios.post(
        `${BASE_URL}admin/updatedata/tbl_customers/cust_id/${custId}`,
        {
          cust_status: status,
        },
      );

      if (response.data.status) {
        toast.success("Status Updated");

        getCustData();
      }
    } catch (error) {
      toast.error("Status Update Failed");
    }
  };

  // Customer Add/Edit Form Reset Function
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
              <h1 className="h3 mb-1">Customers</h1>
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
                  <th>Customer Detail</th>
                  <th>Company Detail</th>
                  <th>Image</th>
                  <th>Activity Detail</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableLoader rows={6} columns={4} />
                ) : custData.length > 0 ? (
                  custData.map((cust) => (
                    <tr key={cust.cust_id}>
                      <td>
                        <div className="dropdown">
                          <span className="fw-semibold">Name:</span>{" "}
                          <button
                            className="btn btn-link text-decoration-none fw-semibold p-0 dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            {cust.cust_contact_person}
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => editCust(cust.cust_id)}
                              >
                                <i className="bi bi-pencil-square me-2"></i>
                                Edit
                              </button>
                            </li>

                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => {
                                  setDeleteId(cust.cust_id);
                                  setShowDelete(true);
                                }}
                              >
                                <i className="bi bi-trash me-2"></i>
                                Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                        <span className="fw-semibold">Code:</span>{" "}
                        <b>{cust.cust_code}</b>
                        <div className="d-flex align-items-center">
                          <span className="fw-semibold me-2">Email:</span>
                          <span>{cust.cust_email}</span>
                        </div>
                        <span className="fw-semibold">Phone:</span>{" "}
                        {cust.cust_mobile}
                        <br />
                      </td>

                      <td>
                        <span className="fw-semibold">Company:</span>{" "}
                        {cust.cust_company_name ? (
                          cust.cust_company_name
                        ) : (
                          <span
                            className="text-danger fw-semibold"
                            style={{ fontSize: "14px" }}
                          >
                            N/A
                          </span>
                        )}
                        <br />
                        <span className="fw-semibold">Gst No:</span>{" "}
                        {cust.cust_gstno ? (
                          cust.cust_gstno
                        ) : (
                          <span
                            className="text-danger fw-semibold"
                            style={{ fontSize: "14px" }}
                          >
                            N/A
                          </span>
                        )}{" "}
                        <br />

                        <span className="fw-semibold">Address:</span>{" "}
                        <span
                          className="text-dark fw-bold"
                          style={{ cursor: "pointer", fontSize: "14px" }}
                          data-bs-toggle="popover"
                          data-bs-trigger="hover"
                          data-bs-html="true"
                          data-bs-placement="right"
                          data-bs-title="Address Details"
                          data-bs-content={`
                           <b>Billing Address:</b> ${cust.cust_billing_address || "N/A"} <br/>
                           <b>Shipping Address:</b>  ${cust.cust_shipping_address || "N/A"} <br/>
                            `}
                        >
                          {cust.cust_billing_address?.length > 15
                            ? `${cust.cust_billing_address.slice(0, 15)}...`
                            : cust.cust_billing_address || "N/A"}
                        </span>
                      </td>

                      <td className="text-center">
                        {cust.cust_image ? (
                          <img
                            src={`${BASE_URL}public/Uploads/${cust.cust_image}`}
                            alt={cust.cust_contact_person}
                            width="70"
                            height="70"
                            className="border rounded"
                          />
                        ) : (
                          <span
                            className="text-danger fw-semibold"
                            style={{ fontSize: "12px" }}
                          >
                            Not Uploaded
                          </span>
                        )}
                      </td>

                      <td className="text-statr">
                        <span className="fw-semibold">Created At:</span>{" "}
                        {cust.cust_created_at} <br />{" "}
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-semibold">Status:</span>

                          {admin.staff_role == 1 ? (
                            <select
                              className={`form-select form-select-sm w-auto ${cust.cust_status == 1
                                ? "border-success text-success"
                                : "border-danger text-danger"
                                }`}
                              value={cust.cust_status}
                              onChange={(e) => changeStatus(cust.cust_id, e.target.value)}
                            >
                              <option value="1">🟢 Active</option>
                              <option value="0">🔴 Inactive</option>
                            </select>
                          ) : (
                            <span
                              className={`badge ${cust.cust_status == 1 ? "bg-success" : "bg-danger"
                                }`}
                            >
                              {cust.cust_status == 1 ? "Active" : "Inactive"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-danger">
                      No Cust Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showModal && (
        <div className="model-add-edit-modal-overlay">
          <div className="model-add-edit-modal-dialog model-size-">
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header">
                <h5 className="model-add-edit-modal-title">
                  {editId ? "Edit Customer" : "Add Customer"}
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
                    style={{ marginBottom: "-5px" }}
                  >
                    Basic Infomation
                  </h5>

                  <div className="col-md-6">
                    <label className="model-add-edit-label">Name</label>
                    <input
                      type="text"
                      name="cust_contact_person"
                      placeholder="Enter Name"
                      className={`model-add-edit-input ${formik.touched.cust_contact_person &&
                        formik.errors.cust_contact_person
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.cust_contact_person}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />

                    <div className="invalid-feedback">
                      {formik.errors.cust_contact_person}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="model-add-edit-label">Email</label>
                    <input
                      type="email"
                      name="cust_email"
                      placeholder="Enter Emsil"
                      className={`model-add-edit-input ${formik.touched.cust_email && formik.errors.cust_email
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.cust_email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />

                    <div className="invalid-feedback">
                      {formik.errors.cust_email}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="model-add-edit-label">Mobile</label>
                    <input
                      type="text"
                      name="cust_mobile"
                      placeholder="Enter Mobile"
                      maxLength="10"
                      className={`model-add-edit-input ${formik.touched.cust_mobile && formik.errors.cust_mobile
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.cust_mobile}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />

                    <div className="invalid-feedback">
                      {formik.errors.cust_mobile}
                    </div>
                  </div>

                  {!editId && (
                    <div className="col-md-6">
                      <label className="model-add-edit-label">Password</label>
                      <div className="d-flex gap-2">
                        <input
                          type="password"
                          name="cust_password"
                          placeholder="Password Auto Generate"
                          className={`model-add-edit-input ${formik.touched.cust_password && formik.errors.cust_password
                            ? "is-invalid"
                            : ""
                            }`}
                          value={formik.values.cust_password}
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

                      <div className="invalid-feedback d-block">
                        {formik.errors.cust_password}
                      </div>
                    </div>
                  )}

                  <hr />
                  <h5
                    className="text-mute fw-semibold text-center"
                    style={{ marginBottom: "-5px", marginTop: "-5px" }}
                  >
                    Company Infomation
                  </h5>
                  <div className="col-md-6">
                    <label className="model-add-edit-label">Company Name</label>
                    <input
                      type="text"
                      name="cust_company_name"
                      placeholder="Enter Company Name"
                      className={`model-add-edit-input ${formik.touched.cust_company_name &&
                        formik.errors.cust_company_name
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.cust_company_name}
                      onChange={formik.handleChange}
                    />
                    <div className="invalid-feedback">
                      {formik.errors.cust_company_name}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="model-add-edit-label">GST No</label>
                    <input
                      type="text"
                      name="cust_gstno"
                      placeholder="Enter GST No"
                      className={`model-add-edit-input ${formik.touched.cust_gstno && formik.errors.cust_gstno
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.cust_gstno}
                      onChange={formik.handleChange}
                    />
                    <div className="invalid-feedback">
                      {formik.errors.cust_gstno}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="model-add-edit-label">
                      Billing Address
                    </label>
                    <textarea
                      name="cust_billing_address"
                      className={`model-add-edit-input ${formik.touched.cust_billing_address &&
                        formik.errors.cust_billing_address
                        ? "is-invalid"
                        : ""
                        }`}
                      placeholder="Enter Billing Address"
                      value={formik.values.cust_billing_address}
                      onChange={formik.handleChange}
                    />
                    <div className="invalid-feedback">
                      {formik.errors.cust_billing_address}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="model-add-edit-label">
                      Shipping Address
                    </label>
                    <textarea
                      name="cust_shipping_address"
                      className={`model-add-edit-input ${formik.touched.cust_shipping_address &&
                        formik.errors.cust_shipping_address
                        ? "is-invalid"
                        : ""
                        }`}
                      placeholder="Enter Shipping Address"
                      value={formik.values.cust_shipping_address}
                      onChange={formik.handleChange}
                    />
                    <div className="invalid-feedback">
                      {formik.errors.cust_shipping_address}
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

export default Customers;
