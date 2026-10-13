import banner from "../../public/assets/images/profile-banner.png";
import defaultProfile from "../../public/assets/images/defaultProfile.jpeg";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";

function Profile() {
  const admin = JSON.parse(localStorage.getItem("admin"));

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);


  const [profile, setProfile] = useState({
    staff_name: "",
    staff_email: "",
    staff_mobile: "",
    staff_image: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    getProfile();

  }, []);

  const getProfile = async () => {
    setPageLoading(true);

    try {
      const res = await axios.get(
        `${BASE_URL}admin/getdatawhere/tbl_staff/staff_id/${admin.staff_id}`
      );

      if (res.data.status) {
        setProfile(res.data.data[0]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const updateData = {
        staff_name: profile.staff_name,
        staff_email: profile.staff_email,
        staff_mobile: profile.staff_mobile,
        staff_image: profile.staff_image,
      };

      const res = await axios.post(
        `${BASE_URL}admin/updatedata/tbl_staff/staff_id/${admin.staff_id}`,
        updateData,
      );

      if (res.data.status) {
        localStorage.setItem(
          "admin",
          JSON.stringify({
            ...admin,
            staff_name: profile.staff_name,
            staff_email: profile.staff_email,
            staff_mobile: profile.staff_mobile,
            staff_image: profile.staff_image,
          }),
        );

        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error("Update failed");
    }

    setLoading(false);
  };

  const uploadImage = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("staff_image", file);

    setUploading(true);
    setUploadProgress(0);

    try {
      const upload = await axios.post(
        `${BASE_URL}admin/fileupload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },

          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );

            setUploadProgress(percent);
          },
        }
      );

      if (upload.data.status) {
        setProfile((prev) => ({
          ...prev,
          staff_image: upload.data.files.staff_image,
        }));

        toast.success("Profile image uploaded");
      }

      setUploadProgress(100);
    } catch (err) {
      console.log(err);
      toast.error("Image upload failed");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 700);
    }
  };

  const changePassword = async () => {
    if (
      !passwordData.current_password ||
      !passwordData.new_password ||
      !passwordData.confirm_password
    ) {
      return toast.error("All fields are required");
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      return toast.error("New Password and Confirm Password do not match");
    }

    try {
      const res = await axios.post(
        `${BASE_URL}admin/changepassword`,
        {
          staff_id: admin.staff_id,
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
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
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Password change failed");
    }
  };

  const resetForm = () => {
    resetForm();
    setShowModal(false);
  };


  return (
    <>
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-person-badge" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">Account</p>
              <h1 className="h3 mb-1">Profile</h1>
            </div>
          </div>
        </div>

        <section className="row g-3">
          {pageLoading ? (
            <>
              <div className="col-12 col-xl-4">
                <div className="panel h-100 text-center profile-card p-4">

                  <div className="profile-skeleton profile-avatar"></div>

                  <div className="profile-skeleton profile-title"></div>

                  <div className="mt-4">
                    <div className="profile-skeleton profile-text"></div>
                    <div className="profile-skeleton profile-text"></div>
                    <div className="profile-skeleton profile-text"></div>
                  </div>

                </div>
              </div>

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

                    <div className="col-md-6 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-md-6 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-md-6 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div
                      className="col-md-6 d-flex justify-content-center align-items-center"
                      style={{ minHeight: "10px" }}
                    >
                      <div className="profile-skeleton profile-input-file"></div>
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
              <div className="col-12 col-xl-4">
                <div className="panel h-100 text-center profile-card">
                  <img
                    className="avatar-img avatar-xl profile-photo mt-2 d-block mx-auto"
                    src={
                      profile.staff_image
                        ? `${BASE_URL}public/Uploads/${profile.staff_image}`
                        : defaultProfile
                    }
                    alt={profile.staff_name}
                  />
                  <h2 className="h5 mt-3 mb-1 fw-bold">{profile.staff_name}</h2>

                  <div className="info-list mt-4 text-start">
                    <div>
                      <span>Email</span>
                      <strong>
                        {profile.staff_email?.slice(0, 20)}
                      </strong>
                    </div>

                    <div>
                      <span>Mobile</span>
                      <strong>+91 {profile.staff_mobile}</strong>
                    </div>
                    <div>
                      <span>Role</span>
                      <strong>{profile.role_name} </strong>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-xl-8">
                <form
                  onSubmit={updateProfile}
                  className="panel needs-validation"
                  noValidate
                >
                  <div className="panel-header">
                    <div>
                      <h2 className="h5 mb-1 section-title">
                        <i className="bi bi-person-gear" aria-hidden="true"></i>
                        <span>Profile Settings</span>
                      </h2>
                      <p className="text-muted mb-0">
                        Update your account profile and contact details.
                      </p>
                    </div>
                    <button
                      className="btn btn-outline-danger"
                      type="button"
                      onClick={() => {
                        setShowModal(true);
                      }}>Change Password</button>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="profileName">
                        Name
                      </label>
                      <input
                        className="model-add-edit-input"
                        id="profileName"
                        type="text"
                        name="staff_name"
                        value={profile.staff_name}
                        onChange={handleChange}
                      ></input>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="profileEmail">
                        Email
                      </label>
                      <input
                        className="model-add-edit-input"
                        type="email"
                        name="staff_email"
                        value={profile.staff_email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="profileMobile">
                        Moble
                      </label>
                      <input
                        className="model-add-edit-input"
                        type="tel"
                        name="staff_mobile"
                        maxLength={10}
                        value={profile.staff_mobile}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 text-center pt-2">
                      <input
                        type="file"
                        className="d-none"
                        id="profileImage"
                        accept="image/*"
                        onChange={uploadImage}
                      />

                      <label
                        htmlFor="profileImage"
                        className="btn btn-danger px-4 py-2 fw-semibold shadow-sm rounded-pill mt-4"
                      >
                        <i className="fas fa-image me-2"></i>
                        Choose Profile Image
                      </label>
                      {uploading && (
                        <div className="profile-upload-progress mt-3">
                          <div className="profile-upload-progress-bar">
                            <div
                              className="profile-upload-progress-fill"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>

                          <small className="fw-semibold text-danger">
                            Uploading... {uploadProgress}%
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="d-flex justify-content-center mt-4">
                    <button
                      className="btn btn-outline-danger"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Profile"}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </section>
      </div >

      {showModal && (
        <div className="model-add-edit-modal-overlay">
          <div className="model-add-edit-modal-dialog model-size-sm">
            <div className="model-add-edit-modal-content">
              <div className="model-add-edit-modal-header">
                <h5 className="model-add-edit-modal-title">
                  Change Password
                </h5>

                <button
                  type="button"
                  className="model-add-edit-modal-close"
                  onClick={() => setShowModal(false)}                >
                  ✕
                </button>
              </div>

              <div className="model-add-edit-modal-body">
                <div className="row g-3">

                  <div className="col-md-12">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="model-add-edit-input"
                      placeholder="Current Password"
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="model-add-edit-input"
                      placeholder="New Pasword"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="model-add-edit-input"
                      placeholder="Confirm Password"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                    />
                  </div>

                  <div className="model-add-edit-modal-footer d-flex justify-content-between">
                    <button
                      className="model-add-edit-btn model-add-edit-btn-cancel"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>

                    <button
                      type="button"
                      className="model-add-edit-btn model-add-edit-btn-save"
                      onClick={changePassword}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
      }
    </>
  );
}

export default Profile;
