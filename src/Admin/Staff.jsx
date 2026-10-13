import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";
import Delete from "../Config/Delete";
import * as Yup from "yup";
import { useFormik } from "formik";
import TableLoader from "../Config/TableLoader";

function Staff() {
  const [staffData, setStaffData] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const staffSchema = Yup.object({
    staff_name: Yup.string().required("Staff Name is required"),

    staff_email: Yup.string()
      .email("Invalid Email")
      .required("Email is required"),

    staff_mobile: Yup.string()
      .matches(/^[0-9]{10}$/, "Mobile Number must be 10 digits")
      .required("Mobile Number is required"),

    staff_role: Yup.string().required("Role is required"),

    staff_menu: Yup.array().min(1, "Please select at least one menu"),

    staff_password: Yup.string().when([], {
      is: () => !editId,
      then: () =>
        Yup.string()
          .required("Password is required")
          .min(6, "Password must be at least 6 characters"),
      otherwise: () => Yup.string(),
    }),
  });

  useEffect(() => {
    getStaffData();
    getRoles();
    getMenus();
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

    formik.setFieldValue("staff_password", password);
  };


  const formik = useFormik({
    initialValues: {
      staff_name: "",
      staff_email: "",
      staff_mobile: "",
      staff_role: "",
      staff_password: "",
      staff_menu: ["1"],
      staff_status: 1,
    },

    validationSchema: staffSchema,

    onSubmit: async (values) => {
      saveStaff(values);
    },
  });

  // Role All Get Function
  const admin = JSON.parse(localStorage.getItem("admin"));

  const getRoles = async () => {
    try {
      const response = await axios.get(`${BASE_URL}admin/getdata/tbl_role`);

      if (response.data.status) {
        if (admin.staff_role == 1) {
          setRoles(response.data.data);
        } else {
          setRoles(response.data.data.filter((role) => role.role_id != 1));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Menu All Get Function
  const getMenus = async () => {
    try {
      const response = await axios.get(`${BASE_URL}admin/getdata/tbl_menus`);

      if (response.data.status) {
        if (admin.staff_role == 1) {
          setMenus(response.data.data);
        } else {
          setMenus(response.data.data.filter((menus) => menus.menu_id != 10));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Staff All Data Get Function
  const getStaffData = async () => {
    setLoading(true);

    try {
      const response = await axios.get(`${BASE_URL}admin/getdata/tbl_staff`);

      if (response.data.status) {
        if (admin.staff_role == 1) {
          setStaffData(response.data.data);
        } else {
          setStaffData(
            response.data.data.filter((staff) => staff.staff_id != 1)
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Status Change Function
  const changeStatus = async (staffId, status) => {
    try {
      const response = await axios.post(
        `${BASE_URL}admin/updatedata/tbl_staff/staff_id/${staffId}`,
        {
          staff_status: status,
          send_email: true,
        }
      );

      if (response.data.status) {
        toast.success("Status Updated");

        getStaffData();
      }
    } catch (error) {
      toast.error("Status Update Failed");
    }
  };

  // Delete Function
  const confirmDelete = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}admin/deletedata/tbl_staff/staff_id/${deleteId}`,
      );

      if (response.data.status) {
        toast.success("Successfully Deleted");

        setShowDelete(false);
        setDeleteId(null);

        getStaffData();
      }
    } catch (error) {
      toast.error("Delete Failed");
    }
  };

  // Staff Insert/Save function
  const saveStaff = async (values) => {
    try {
      const payload = {
        staff_name: values.staff_name,
        staff_email: values.staff_email,
        staff_mobile: values.staff_mobile,
        staff_role: values.staff_role,
        staff_menu: Array.isArray(values.staff_menu)
          ? values.staff_menu.join(",")
          : values.staff_menu,
        staff_status: values.staff_status,
      };

      if (editId) {
        payload.send_email = true;

        response = await axios.post(
          `${BASE_URL}admin/updatedata/tbl_staff/staff_id/${editId}`,
          payload
        );
      }

      let response;

      // UPDATE
      if (editId) {
        response = await axios.post(
          `${BASE_URL}admin/updatedata/tbl_staff/staff_id/${editId}`,
          payload,
        );
      }
      // INSERT
      else {
        payload.staff_password = values.staff_password;

        response = await axios.post(
          `${BASE_URL}admin/insert/tbl_staff`,
          payload,
        );
      }

      if (response.data.status) {
        toast.success(
          editId ? "Staff Updated Successfully" : "Staff Added Successfully",
        );

        resetForm();
        getStaffData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  // Staff Edit Function
  const editStaff = async (staffId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}admin/getdatawhere/tbl_staff/staff_id/${staffId}`,
      );

      if (response.data.status) {
        const staff = response.data.data[0];

        formik.setValues({
          staff_name: staff.staff_name || "",
          staff_email: staff.staff_email || "",
          staff_mobile: staff.staff_mobile || "",
          staff_role: staff.staff_role || "",
          staff_password: "",
          staff_menu: staff.staff_menu ? staff.staff_menu.split(",") : [],
          staff_status: staff.staff_status || 1,
        });

        setEditId(staffId);
        setShowModal(true);
      }
    } catch (error) {
      toast.error("Failed to load staff data");
    }
  };

  // Staff Add/Edit Form Reset Function
  const resetForm = () => {
    setEditId(null);

    formik.resetForm({
      values: {
        staff_name: "",
        staff_email: "",
        staff_mobile: "",
        staff_role: "",
        staff_password: "",
        staff_menu: ["1"], // Dashboard always selected
        staff_status: 1,
      },
    });

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
              <h1 className="h3 mb-1">Staff</h1>
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
                  <th style={{ maxWidth: "200px" }}>Staff</th>
                  <th>Staff Detail</th>
                  <th>Image</th>
                  <th>Activity Detail</th>
                </tr>
              </thead>
              <tbody className="activity-date-time">
                {loading ? (
                  <TableLoader rows={6} columns={4} />
                ) : staffData.length > 0 ? (
                  staffData.map((staff) => (
                    <tr key={staff.staff_id}>
                      <td>
                        <div className="dropdown">
                          <span className="fw-semibold">Name:</span>{" "}
                          <button
                            className="btn btn-link text-decoration-none fw-semibold p-0 dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            {staff.staff_name}
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => editStaff(staff.staff_id)}
                              >
                                <i className="bi bi-pencil-square me-2"></i>
                                Edit
                              </button>
                            </li>

                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => {
                                  setDeleteId(staff.staff_id);
                                  setShowDelete(true);
                                }}
                              >
                                <i className="bi bi-trash me-2"></i>
                                Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                        <div className="d-flex align-items-center">
                          <span className="fw-semibold me-2">Email:</span>
                          <span>{staff.staff_email}</span>
                        </div>
                        <span className="fw-semibold">Phone:</span>{" "}
                        {staff.staff_mobile}
                      </td>

                      <td style={{ minWidth: "200px" }}>
                        <span className="fw-semibold">Role:</span>{" "}
                        {staff.role_name}
                        <br /> <span className="fw-semibold">Menus:</span>{" "}
                        {staff.menu_names}
                      </td>

                      <td className="text-center">
                        {staff.staff_image ? (
                          <img
                            src={`${BASE_URL}public/Uploads/${staff.staff_image}`}
                            alt={staff.staff_name}
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

                      <td className="text-start">
                        <span className="fw-semibold">Create at:</span>{" "}
                        {staff.staff_created_at}
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-semibold">Status:</span>
                          {admin.staff_role == 1 ? (
                            staff.staff_id == 1 ? (
                              <span
                                className={`badge ${staff.staff_status == 1 ? "bg-success" : "bg-danger"
                                  }`}
                              >
                                {staff.staff_status == 1 ? "Active" : "Inactive"}
                              </span>
                            ) : (
                              <select
                                className={`form-select form-select-sm w-auto ${staff.staff_status == 1
                                  ? "border-success text-success"
                                  : "border-danger text-danger"
                                  }`}
                                value={staff.staff_status}
                                onChange={(e) =>
                                  changeStatus(staff.staff_id, e.target.value)
                                }
                              >
                                <option value="1">🟢 Active</option>
                                <option value="0">🔴 Inactive</option>
                              </select>
                            )
                          ) : (
                            <span
                              className={`badge ${staff.staff_status == 1 ? "bg-success" : "bg-danger"
                                }`}
                            >
                              {staff.staff_status == 1 ? "Active" : "Inactive"}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-danger">
                      No Staff Found
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
          <div className="model-add-edit-modal-dialog model-size-md">
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header">
                <h5 className="model-add-edit-modal-title">
                  {editId ? "Edit Staff" : "Add Staff"}
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
                  <div className="col-md-6">
                    <label className="model-add-edit-label">Name</label>
                    <input
                      type="text"
                      name="staff_name"
                      placeholder="Enter Name"
                      className={`model-add-edit-input ${formik.touched.staff_name && formik.errors.staff_name
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.staff_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <div className="invalid-feedback">
                      {formik.errors.staff_name}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="model-add-edit-label">Email</label>
                    <input
                      type="email"
                      name="staff_email"
                      placeholder="Enter Email"
                      className={`model-add-edit-input ${formik.touched.staff_email && formik.errors.staff_email
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.staff_email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <div className="invalid-feedback">
                      {formik.errors.staff_email}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="model-add-edit-label">Mobile</label>
                    <input
                      type="text"
                      name="staff_mobile"
                      placeholder="Enter Mobile"
                      maxLength="10"
                      className={`model-add-edit-input ${formik.touched.staff_mobile &&
                        formik.errors.staff_mobile
                        ? "is-invalid"
                        : ""
                        }`}
                      value={formik.values.staff_mobile}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <div className="invalid-feedback">
                      {formik.errors.staff_mobile}
                    </div>
                  </div>

                  {!editId && (
                    <div className="col-md-6">
                      <label className="model-add-edit-label">Password</label>
                      <div className="d-flex gap-2">
                        <input
                          type="text"
                          name="staff_password"
                          placeholder="Password Auto Generate"
                          className={`model-add-edit-input ${formik.touched.staff_password &&
                            formik.errors.staff_password
                            ? "is-invalid"
                            : ""
                            }`}
                          value={formik.values.staff_password}
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
                        {formik.errors.staff_password}
                      </div>
                    </div>
                  )}

                  <div className="col-md-6">
                    <label className="model-add-edit-label">Role</label>
                    <select
                      className="model-add-edit-select"
                      value={formik.values.staff_role}
                      name="staff_role"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <option value="">Select Role</option>

                      {roles.map((role) => (
                        <option key={role.role_id} value={role.role_id}>
                          {role.role_name}
                        </option>
                      ))}
                    </select>
                    <div className="invalid-feedback">
                      {formik.errors.staff_role}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="model-add-edit-label">Menus</label>
                    <select
                      className="model-add-edit-select model-add-edit-multi-select"
                      multiple
                      value={formik.values.staff_menu}
                      onChange={(e) => {
                        let selectedMenus = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value,
                        );

                        if (!selectedMenus.includes("1")) {
                          selectedMenus.unshift("1");
                        }

                        formik.setFieldValue("staff_menu", selectedMenus);
                      }}
                    >
                      {menus
                        .sort((a, b) => a.menu_order - b.menu_order)
                        .map((menu) => (
                          <option
                            key={menu.menu_id}
                            value={menu.menu_id}
                            disabled={menu.menu_id == 1}
                          >
                            {menu.menu_name}
                          </option>
                        ))}
                    </select>
                    <div className="invalid-feedback">
                      {formik.errors.staff_menu}
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
                  {editId ? "Update" : "Save"}
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

export default Staff;
