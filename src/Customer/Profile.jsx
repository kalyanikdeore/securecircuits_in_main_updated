import defaultProfile from "../../public/assets/images/defaultProfile.jpeg";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";

function Profile() {
  const navigate = useNavigate();

  const getCustomerFromStorage = () => {
    try {
      return JSON.parse(localStorage.getItem("customer")) || {};
    } catch (error) {
      console.error("Invalid customer data:", error);
      return {};
    }
  };

  const customer = getCustomerFromStorage();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] =
    useState(false);

  const [pageLoading, setPageLoading] = useState(true);

  const [showProfileConfirmModal, setShowProfileConfirmModal] =
    useState(false);

  const [profile, setProfile] = useState({
    cust_contact_person: "",
    cust_email: "",
    cust_mobile: "",
    cust_company_name: "",
    cust_gstno: "",
    cust_billing_address: "",
    cust_shipping_address: "",
    cust_image: "",
    cust_profile_update: 0,
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [testimonialData, setTestimonialData] = useState({
    test_id: "",
    test_rating: 0,
    test_text: "",
  });

  /* =========================================================
     CUSTOMER LOGIN CHECK
  ========================================================= */

  useEffect(() => {
    const savedCustomer = localStorage.getItem("customer");

    if (!savedCustomer) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const customerData = JSON.parse(savedCustomer);

      if (!customerData?.cust_id) {
        localStorage.removeItem("customer");
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Invalid customer data:", error);

      localStorage.removeItem("customer");

      navigate("/login", { replace: true });
    }
  }, [navigate]);

  /* =========================================================
     PASSWORD CHANGE
  ========================================================= */

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  /* =========================================================
     GET PROFILE
  ========================================================= */

  useEffect(() => {
    if (customer?.cust_id) {
      getProfile();
    }
  }, [customer?.cust_id]);

  const getProfile = async () => {
    if (!customer?.cust_id) return;

    setPageLoading(true);

    try {
      const res = await axios.get(
        `${BASE_URL}customer/getdatawhere/tbl_customers/cust_id/${customer.cust_id}`
      );

      if (res.data.status && res.data.data?.length > 0) {
        const profileData = res.data.data[0];

        setProfile({
          cust_contact_person:
            profileData.cust_contact_person || "",

          cust_email: profileData.cust_email || "",

          cust_mobile: profileData.cust_mobile || "",

          cust_company_name:
            profileData.cust_company_name || "",

          cust_gstno: profileData.cust_gstno || "",

          cust_billing_address:
            profileData.cust_billing_address || "",

          cust_shipping_address:
            profileData.cust_shipping_address || "",

          cust_image: profileData.cust_image || "",

          cust_profile_update:
            Number(profileData.cust_profile_update) || 0,
        });

        /*
          Keep localStorage synchronized with database
          especially cust_profile_update.
        */

        const updatedCustomer = {
          ...customer,
          ...profileData,
        };

        localStorage.setItem(
          "customer",
          JSON.stringify(updatedCustomer)
        );
      }
    } catch (err) {
      console.error(err);

      toast.error("Failed to load profile data");
    } finally {
      setPageLoading(false);
    }
  };

  /* =========================================================
     HANDLE PROFILE INPUT
  ========================================================= */

  const handleChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /* =========================================================
     PROFILE SUBMIT
  ========================================================= */

  const updateProfile = (e) => {
    e.preventDefault();

    /*
      Company Name mandatory
    */

    if (!profile.cust_company_name?.trim()) {
      toast.error("Company Name is required");
      return;
    }

    /*
      Billing Address mandatory
    */

    if (!profile.cust_billing_address?.trim()) {
      toast.error("Billing Address is required");
      return;
    }

    /*
      Shipping Address mandatory
    */

    if (!profile.cust_shipping_address?.trim()) {
      toast.error("Shipping Address is required");
      return;
    }

    /*
      First profile completion

      Show confirmation modal before saving.
    */

    if (Number(profile.cust_profile_update) !== 1) {
      setShowProfileConfirmModal(true);
      return;
    }

    /*
      Profile already completed

      Normal update.
    */

    saveProfile();
  };

  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const saveProfile = async () => {
    if (!customer?.cust_id) {
      toast.error("Customer session not found");
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);

    try {
      const isFirstProfileUpdate =
        Number(profile.cust_profile_update) !== 1;

      const updateData = {
        cust_contact_person:
          profile.cust_contact_person || "",

        cust_email: profile.cust_email || "",

        cust_mobile: profile.cust_mobile || "",

        /*
          Company Name

          First time it is saved.
          After that frontend disables it.
        */
        cust_company_name:
          profile.cust_company_name?.trim() || "",

        cust_gstno:
          profile.cust_gstno?.trim() || "",

        cust_billing_address:
          profile.cust_billing_address?.trim() || "",

        cust_shipping_address:
          profile.cust_shipping_address?.trim() || "",

        cust_image: profile.cust_image || "",

        /*
          First successful profile completion
          changes value from 0 -> 1.
        */
        cust_profile_update: isFirstProfileUpdate
          ? 1
          : Number(profile.cust_profile_update),
      };

      const res = await axios.post(
        `${BASE_URL}customer/updatedata/tbl_customers/cust_id/${customer.cust_id}`,
        updateData
      );

      if (res.data.status) {
        /*
          Update React state
        */

        setProfile((prev) => ({
          ...prev,
          ...updateData,
        }));

        /*
          Update localStorage
        */

        const updatedCustomer = {
          ...customer,
          ...updateData,
        };

        localStorage.setItem(
          "customer",
          JSON.stringify(updatedCustomer)
        );

        /*
          Success message
        */

        toast.success(
          isFirstProfileUpdate
            ? "Profile completed successfully!"
            : res.data.message ||
            "Profile updated successfully"
        );

        /*
          First profile completion:
          redirect customer to dashboard.
        */

        if (isFirstProfileUpdate) {
          setTimeout(() => {
            navigate("/customer/dashboard", {
              replace: true,
            });
          }, 500);
        }
      } else {
        toast.error(
          res.data.message || "Profile update failed"
        );
      }
    } catch (err) {
      console.error("Profile update error:", err);

      toast.error(
        err?.response?.data?.message ||
        "Profile update failed"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     CONFIRM FIRST PROFILE UPDATE
  ========================================================= */

  const confirmProfileUpdate = () => {
    setShowProfileConfirmModal(false);

    saveProfile();
  };

  /* =========================================================
     PROFILE IMAGE UPLOAD
  ========================================================= */

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    /*
      Optional frontend validation
    */

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Only PNG, JPG, JPEG and WEBP images are allowed"
      );

      e.target.value = "";
      return;
    }

    const formData = new FormData();

    formData.append("cust_image", file);

    setUploading(true);
    setUploadProgress(0);

    try {
      const upload = await axios.post(
        `${BASE_URL}customer/fileupload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },

          onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) return;

            const percent = Math.round(
              (progressEvent.loaded * 100) /
              progressEvent.total
            );

            setUploadProgress(percent);
          },
        }
      );

      if (upload.data.status) {
        const uploadedFileName =
          upload.data.files?.cust_image;

        if (!uploadedFileName) {
          toast.error("Uploaded image name not received");
          return;
        }

        /*
          Update profile state
        */

        setProfile((prev) => ({
          ...prev,
          cust_image: uploadedFileName,
        }));

        /*
          Update localStorage
        */

        const updatedCustomer = {
          ...customer,
          cust_image: uploadedFileName,
        };

        localStorage.setItem(
          "customer",
          JSON.stringify(updatedCustomer)
        );

        toast.success(
          "Profile image uploaded successfully!"
        );
      } else {
        toast.error(
          upload.data.message ||
          "Image upload failed"
        );
      }
    } catch (err) {
      console.error(err);

      toast.error("Image upload failed");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 700);
    }
  };

  /* =========================================================
     CHANGE PASSWORD
  ========================================================= */

  const changePassword = async () => {
    if (
      !passwordData.current_password ||
      !passwordData.new_password ||
      !passwordData.confirm_password
    ) {
      return toast.error("All fields are required");
    }

    if (
      passwordData.new_password !==
      passwordData.confirm_password
    ) {
      return toast.error(
        "New Password and Confirm Password do not match"
      );
    }

    try {
      const res = await axios.post(
        `${BASE_URL}customer/changepassword`,
        {
          cust_id: customer.cust_id,
          current_password:
            passwordData.current_password,
          new_password:
            passwordData.new_password,
        }
      );

      if (res.data.status) {
        toast.success(res.data.message);

        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });

        setShowModal(false);
      } else {
        toast.error(
          res.data.message || "Password change failed"
        );
      }
    } catch (err) {
      console.error(err);

      toast.error("Password change failed");
    }
  };

  /* =========================================================
     TESTIMONIAL
  ========================================================= */

  const handleRating = (rating) => {
    setTestimonialData((prev) => ({
      ...prev,
      test_rating: rating,
    }));
  };

  const handleTestimonialChange = (e) => {
    setTestimonialData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getTestimonial = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}customer/gettestimonial/${customer.cust_id}`
      );

      if (res.data.status && res.data.data) {
        setTestimonialData({
          test_id: res.data.data.test_id,
          test_rating: Number(
            res.data.data.test_rating
          ),
          test_text: res.data.data.test_text || "",
        });
      } else {
        setTestimonialData({
          test_id: "",
          test_rating: 0,
          test_text: "",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveTestimonial = async () => {
    if (testimonialData.test_rating === 0) {
      return toast.error("Please select rating");
    }

    if (!testimonialData.test_text.trim()) {
      return toast.error("Please enter testimonial");
    }

    try {
      const res = await axios.post(
        `${BASE_URL}customer/savetestimonial`,
        {
          test_cust_id: customer.cust_id,
          test_rating:
            testimonialData.test_rating,
          test_text:
            testimonialData.test_text.trim(),
        }
      );

      if (res.data.status) {
        toast.success(res.data.message);

        setShowTestimonialModal(false);

        getTestimonial();
      } else {
        toast.error(
          res.data.message ||
          "Unable to save testimonial"
        );
      }
    } catch (err) {
      console.error(err);

      toast.error("Something went wrong");
    }
  };

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <>
      <div className="container-fluid px-3 px-lg-4 py-4">

        {/* =====================================================
            PAGE HEADING
        ===================================================== */}

        <div className="page-heading">

          <div className="page-heading-copy">

            <span className="page-icon">

              <i
                className="bi bi-person-badge text-success"
                aria-hidden="true"
              ></i>

            </span>

            <div>

              <p className="eyebrow mb-1 text-success">
                Account
              </p>

              <h1 className="h3 mb-1">
                Profile
              </h1>

            </div>

          </div>

        </div>


        {/* =====================================================
            PROFILE SECTION
        ===================================================== */}

        <section className="row g-3">

          {pageLoading ? (

            <>
              {/* =================================================
                  LEFT SKELETON
              ================================================= */}

              <div className="col-12 col-xl-4">

                <div className="panel h-100 text-center profile-card p-4">

                  <div className="profile-skeleton profile-avatar"></div>

                  <div className="profile-skeleton profile-title"></div>

                  <div className="mt-4">

                    <div className="profile-skeleton profile-text"></div>

                    <div className="profile-skeleton profile-text"></div>

                    <div className="profile-skeleton profile-text"></div>

                    <div className="profile-skeleton profile-text"></div>

                  </div>

                </div>

              </div>


              {/* =================================================
                  RIGHT SKELETON
              ================================================= */}

              <div className="col-12 col-xl-8">

                <div className="panel p-4">

                  <div className="row g-3">

                    <div className="col-md-1">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-md-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div
                      className="col-md-6 d-flex justify-content-end align-items-end"
                      style={{ minHeight: "10px" }}
                    >
                      <div className="profile-skeleton profile-input-button"></div>
                    </div>

                    <div className="col-md-4 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-md-4 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-md-4 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-md-4 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-md-4 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div
                      className="col-md-4 d-flex justify-content-center align-items-center mt-5"
                      style={{ minHeight: "10px" }}
                    >
                      <div className="profile-skeleton profile-input-file"></div>
                    </div>

                    <div className="col-md-6 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-md-6 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-12 d-flex justify-content-center mt-4">
                      <div className="profile-skeleton profile-button"></div>
                    </div>

                  </div>

                </div>

              </div>
            </>

          ) : (

            <>
              {/* =================================================
                  LEFT PROFILE CARD
              ================================================= */}

              <div className="col-12 col-xl-4">

                <div className="panel h-100 text-center profile-card">

                  <img
                    className="avatar-img avatar-xl profile-photo mt-2 d-block mx-auto"
                    src={
                      profile.cust_image
                        ? `${BASE_URL}public/Uploads/${profile.cust_image}`
                        : defaultProfile
                    }
                    alt={
                      profile.cust_contact_person ||
                      "User Profile"
                    }
                  />

                  <h2 className="h5 mt-3 mb-1 fw-bold">
                    {profile.cust_contact_person}
                  </h2>

                  <div className="info-list mt-4 text-start">

                    <div>

                      <span>
                        Email
                      </span>

                      <strong>
                        {profile.cust_email?.slice(
                          0,
                          20
                        )}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Mobile
                      </span>

                      <strong>
                        +91 {profile.cust_mobile}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Company
                      </span>

                      <strong>
                        {profile.cust_company_name
                          ? profile.cust_company_name.slice(
                            0,
                            15
                          )
                          : "-"}
                      </strong>

                    </div>


                    <button
                      className="btn btn-outline-success mt-3 w-100"
                      type="button"
                      onClick={() =>
                        setShowModal(true)
                      }
                    >
                      Change Password
                    </button>

                  </div>

                </div>

              </div>


              {/* =================================================
                  RIGHT PROFILE FORM
              ================================================= */}

              <div className="col-12 col-xl-8">

                <form
                  onSubmit={updateProfile}
                  className="panel needs-validation"
                  noValidate
                >

                  <div className="panel-header d-flex justify-content-between align-items-center mb-3">

                    <div>

                      <h2 className="h5 mb-1 section-title">

                        <i
                          className="bi bi-person-gear text-success me-2"
                          aria-hidden="true"
                        ></i>

                        <span>
                          Profile Settings
                        </span>

                      </h2>

                      <p className="text-muted mb-0">
                        Update your account profile and contact details.
                      </p>

                    </div>


                    <button
                      className="btn btn-outline-success"
                      type="button"
                      onClick={() => {
                        getTestimonial();
                        setShowTestimonialModal(true);
                      }}
                    >
                      Testimonial
                    </button>

                  </div>


                  <div className="row g-3">

                    {/* =================================================
                        FULL NAME
                    ================================================= */}

                    <div className="col-md-4">

                      <label
                        className="form-label"
                        htmlFor="profileName"
                      >
                        Fullname
                      </label>

                      <input
                        className="model-add-edit-input"
                        id="profileName"
                        placeholder="Full Name"
                        type="text"
                        name="cust_contact_person"
                        value={
                          profile.cust_contact_person || ""
                        }
                        readOnly
                        disabled
                      />

                    </div>


                    {/* =================================================
                        EMAIL
                    ================================================= */}

                    <div className="col-md-4">

                      <label
                        className="form-label"
                        htmlFor="profileEmail"
                      >
                        Email
                      </label>

                      <input
                        className="model-add-edit-input"
                        id="profileEmail"
                        type="email"
                        placeholder="Email"
                        name="cust_email"
                        value={
                          profile.cust_email || ""
                        }
                        readOnly
                        disabled
                      />

                    </div>


                    {/* =================================================
                        MOBILE
                    ================================================= */}

                    <div className="col-md-4">

                      <label
                        className="form-label"
                        htmlFor="profileMobile"
                      >
                        Mobile
                      </label>

                      <input
                        className="model-add-edit-input"
                        id="profileMobile"
                        type="tel"
                        placeholder="Mobile"
                        name="cust_mobile"
                        maxLength={10}
                        value={
                          profile.cust_mobile || ""
                        }
                        readOnly
                        disabled
                      />

                    </div>


                    {/* =================================================
                        COMPANY NAME
                        ONE TIME ONLY
                    ================================================= */}

                    <div className="col-md-4">

                      <label
                        className="form-label"
                        htmlFor="profileCompany"
                      >
                        Company Name{" "}
                        <span className="text-danger">*</span>
                      </label>

                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                        }}
                      >

                        <input
                          className="model-add-edit-input"
                          id="profileCompany"
                          type="text"
                          placeholder="Enter Company Name"
                          name="cust_company_name"
                          value={profile.cust_company_name || ""}
                          onChange={handleChange}
                          disabled={Number(profile.cust_profile_update) === 1}
                          required
                          style={{
                            paddingRight:
                              Number(profile.cust_profile_update) === 1
                                ? "45px"
                                : undefined,
                          }}
                        />

                        {/* Lock Icon */}
                        {Number(profile.cust_profile_update) === 1 && (
                          <i
                            className="fas fa-lock"
                            title="Company Name cannot be changed"
                            style={{
                              position: "absolute",
                              right: "15px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: "#e70909",
                              fontSize: "15px",
                              pointerEvents: "none",
                            }}
                          ></i>
                        )}

                      </div>
                    </div>


                    {/* =================================================
                        GST
                    ================================================= */}

                    <div className="col-md-4">

                      <label
                        className="form-label"
                        htmlFor="profileGST"
                      >
                        GST No
                      </label>

                      <input
                        className="model-add-edit-input"
                        id="profileGST"
                        type="text"
                        placeholder="GST Number"
                        name="cust_gstno"
                        value={
                          profile.cust_gstno || ""
                        }
                        onChange={handleChange}
                      />

                    </div>


                    {/* =================================================
                        PROFILE IMAGE
                    ================================================= */}

                    <div className="col-md-4 text-center pt-2">

                      <input
                        type="file"
                        className="d-none"
                        id="profileImage"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={uploadImage}
                      />

                      <label
                        htmlFor="profileImage"
                        className="btn btn-outline-success btn-sm rounded-pill mt-4 px-3 py-2 cursor-pointer"
                      >

                        <i className="fas fa-image me-2"></i>

                        Choose Profile Image

                      </label>


                      {uploading && (

                        <div className="profile-upload-progress mt-3">

                          <div className="profile-upload-progress-bar">

                            <div
                              className="profile-upload-progress-fill"
                              style={{
                                width: `${uploadProgress}%`,
                              }}
                            ></div>

                          </div>

                          <small className="fw-semibold">
                            Uploading...{" "}
                            {uploadProgress}%
                          </small>

                        </div>

                      )}

                    </div>


                    {/* =================================================
                        BILLING ADDRESS
                    ================================================= */}

                    <div className="col-md-6">

                      <label
                        className="form-label"
                        htmlFor="profileBilling"
                      >
                        Billing Address{" "}

                        <span className="text-danger">
                          *
                        </span>

                      </label>

                      <textarea
                        className="model-add-edit-input"
                        id="profileBilling"
                        rows={3}
                        name="cust_billing_address"
                        placeholder="Enter Billing Address"
                        value={
                          profile.cust_billing_address ||
                          ""
                        }
                        onChange={handleChange}
                        required
                      ></textarea>

                    </div>


                    {/* =================================================
                        SHIPPING ADDRESS
                    ================================================= */}

                    <div className="col-md-6">

                      <label
                        className="form-label"
                        htmlFor="profileShipping"
                      >
                        Shipping Address{" "}

                        <span className="text-danger">
                          *
                        </span>

                      </label>

                      <textarea
                        className="model-add-edit-input"
                        id="profileShipping"
                        rows={3}
                        name="cust_shipping_address"
                        placeholder="Enter Shipping Address"
                        value={
                          profile.cust_shipping_address ||
                          ""
                        }
                        onChange={handleChange}
                        required
                      ></textarea>

                    </div>

                  </div>


                  {/* =================================================
                      UPDATE BUTTON
                  ================================================= */}

                  <div className="d-flex justify-content-center mt-4">

                    <button
                      className="btn btn-outline-success"
                      type="submit"
                      disabled={loading}
                    >

                      {loading
                        ? "Updating..."
                        : "Update Profile"}

                    </button>

                  </div>

                </form>

              </div>
            </>
          )}

        </section>

      </div>


      {/* =========================================================
          CHANGE PASSWORD MODAL
      ========================================================= */}

      {showModal && (

        <div className="model-add-edit-modal-overlay">

          <div className="model-add-edit-modal-dialog model-size-sm">

            <div className="model-add-edit-modal-content">

              <div className="model-add-edit-modal-header-success">

                <h5 className="model-add-edit-modal-title">
                  Change Password
                </h5>

                <button
                  type="button"
                  className="model-add-edit-modal-close"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  ✕
                </button>

              </div>


              <div className="model-add-edit-modal-body">

                <div className="row g-3">

                  <div className="col-md-12">

                    <label className="form-label">
                      Current Password
                    </label>

                    <input
                      type="password"
                      className="model-add-edit-input"
                      placeholder="Current Password"
                      name="current_password"
                      value={
                        passwordData.current_password
                      }
                      onChange={
                        handlePasswordChange
                      }
                    />

                  </div>


                  <div className="col-md-12">

                    <label className="form-label">
                      New Password
                    </label>

                    <input
                      type="password"
                      className="model-add-edit-input"
                      placeholder="New Password"
                      name="new_password"
                      value={
                        passwordData.new_password
                      }
                      onChange={
                        handlePasswordChange
                      }
                    />

                  </div>


                  <div className="col-md-12">

                    <label className="form-label">
                      Confirm Password
                    </label>

                    <input
                      type="password"
                      className="model-add-edit-input"
                      placeholder="Confirm Password"
                      name="confirm_password"
                      value={
                        passwordData.confirm_password
                      }
                      onChange={
                        handlePasswordChange
                      }
                    />

                  </div>


                  <div className="model-add-edit-modal-footer d-flex justify-content-between mt-3">

                    <button
                      className="model-add-edit-btn model-add-edit-btn-cancel"
                      type="button"
                      onClick={() =>
                        setShowModal(false)
                      }
                    >
                      Close
                    </button>


                    <button
                      type="button"
                      className="model-add-edit-btn model-add-edit-btn-save-success"
                      onClick={changePassword}
                    >
                      Change
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =========================================================
          TESTIMONIAL MODAL
      ========================================================= */}

      {showTestimonialModal && (

        <div className="model-add-edit-modal-overlay">

          <div className="model-add-edit-modal-dialog model-size-sm">

            <div className="model-add-edit-modal-content">

              <div className="model-add-edit-modal-header-success">

                <h5 className="model-add-edit-modal-title">

                  {testimonialData.test_id
                    ? "Update Testimonial"
                    : "Add Testimonial"}

                </h5>


                <button
                  type="button"
                  className="model-add-edit-modal-close"
                  onClick={() =>
                    setShowTestimonialModal(false)
                  }
                >
                  ✕
                </button>

              </div>


              <div className="model-add-edit-modal-body">

                <div className="row">

                  <div className="mb-3 text-center">

                    <label className="form-label fw-semibold">
                      Rating
                    </label>


                    <div className="fs-2">

                      {[1, 2, 3, 4, 5].map(
                        (star) => (

                          <span
                            key={star}
                            onClick={() =>
                              handleRating(star)
                            }
                            style={{
                              cursor: "pointer",

                              color:
                                star <=
                                  testimonialData.test_rating
                                  ? "#ffc107"
                                  : "#d3d3d3",

                              margin: "0 5px",
                            }}
                          >
                            ★
                          </span>

                        )
                      )}

                    </div>

                  </div>


                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Description
                    </label>

                    <textarea
                      rows={5}
                      className="model-add-edit-textarea"
                      placeholder="Write your testimonial..."
                      name="test_text"
                      value={
                        testimonialData.test_text
                      }
                      onChange={
                        handleTestimonialChange
                      }
                    />

                  </div>


                  <div className="model-add-edit-modal-footer d-flex justify-content-between">

                    <button
                      type="button"
                      className="model-add-edit-btn model-add-edit-btn-cancel"
                      onClick={() => {
                        setShowTestimonialModal(
                          false
                        );

                        setTestimonialData({
                          test_id: "",
                          test_rating: 0,
                          test_text: "",
                        });
                      }}
                    >
                      Close
                    </button>


                    <button
                      type="button"
                      className="model-add-edit-btn model-add-edit-btn-save-success"
                      onClick={saveTestimonial}
                    >
                      {testimonialData.test_id
                        ? "Update"
                        : "Save"}
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =========================================================
          FIRST PROFILE COMPLETION CONFIRMATION MODAL
      ========================================================= */}

      {showProfileConfirmModal && (

        <div className="model-add-edit-modal-overlay">

          <div
            className="model-add-edit-modal-dialog"
            style={{ maxWidth: "420px" }}
          >

            <div className="model-add-edit-modal-content">

              <div className="model-add-edit-modal-header-success">

                <h5 className="model-add-edit-modal-title">
                  Confirm Company Name
                </h5>


                <button
                  type="button"
                  className="model-add-edit-modal-close"
                  onClick={() =>
                    setShowProfileConfirmModal(false)
                  }
                >
                  ✕
                </button>

              </div>


              <div className="model-add-edit-modal-body text-center">

                <i
                  className="fas fa-exclamation-triangle text-warning mb-3"
                  style={{ fontSize: "45px" }}
                ></i>


                <p className="mb-2">
                  Please confirm your company name:
                </p>


                <h5 className="fw-bold text-success mb-3">
                  {profile.cust_company_name}
                </h5>


                <p className="text-muted small">
                  Once confirmed, the company name
                  cannot be changed again. Please
                  make sure it is correct before
                  continuing.
                </p>


                <div className="d-flex justify-content-between gap-3 mt-4">

                  <button
                    type="button"
                    className="model-add-edit-btn model-add-edit-btn-cancel flex-fill"
                    onClick={() =>
                      setShowProfileConfirmModal(false)
                    }
                  >
                    Edit
                  </button>


                  <button
                    type="button"
                    className="model-add-edit-btn model-add-edit-btn-save-success flex-fill"
                    onClick={confirmProfileUpdate}
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : "Yes, Confirm"}
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </>
  );
}

export default Profile;