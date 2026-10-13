import axios from "axios";
import React, { useEffect, useState } from "react";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";

function Setting() {

  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    getInformation();
  }, []);

  const formik = useFormik({
    initialValues: {
      info_email: "",
      info_mobile: "",
      info_location: "",
      info_facebook: "",
      info_instagram: "",
      info_linkedin: "",
      info_whatsapp: "",
      info_youtube: "",
    },

    enableReinitialize: true,

    onSubmit: async (values) => {
      try {
        const response = await axios.post(
          `${BASE_URL}admin/updatedata/tbl_information/info_id/1`,
          values,
        );

        if (response.data.status) {
          toast.success(response.data.message);
        }
      } catch (error) {
        toast.error("Update Failed");
      }
    },
  });

  const getInformation = async () => {

    setPageLoading(true);


    try {
      const response = await axios.get(
        `${BASE_URL}admin/getdatawhere/tbl_information/info_id/1`,
      );

      if (response.data.status) {
        formik.setValues(response.data.data[0]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setPageLoading(false);
    }
  };

  return (
    <>
      <div className="container-fluid px-3 px-lg-4 py-4">
        <section className="row g-3">
          {pageLoading ? (
            <>
              <div className="col-12 col-xl-12">
                <div className="panel p-4">
                  <div className="row g-3">

                    <div className="col-md-1">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div
                      className="col-md-11 d-flex justify-content-start align-items-start"
                      style={{ minHeight: "10px" }}
                    >
                      <div className="profile-skeleton profile-input-button"></div>
                    </div>

                    <div className="col-md-3 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-md-3 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-md-6 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-md-3 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-md-3 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-md-3 mt-5">
                      <div className="profile-skeleton profile-input"></div>
                    </div>

                    <div className="col-md-3 mt-5">
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
              <div className="col-12 ">
                <form
                  className="panel needs-validation"
                  noValidate
                  onSubmit={formik.handleSubmit}
                >
                  <div className="page-heading">
                    <div className="page-heading-copy">
                      <span className="page-icon">
                        <i className="bi bi-info-circle" aria-hidden="true"></i>
                      </span>
                      <div>
                        <p className="eyebrow mb-1">Site</p>
                        <h1 className="h3 mb-1">Information</h1>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 mt-3">
                    <div className="col-md-3">
                      <label className="form-label" htmlFor="profileEmail">
                        Email
                      </label>
                      <input
                        type="email"
                        name="info_email"
                        placeholder="Enter Email"
                        className="model-add-edit-input"
                        value={formik.values.info_email}
                        onChange={formik.handleChange}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label" htmlFor="profileMobile">
                        Moble
                      </label>
                      <input
                        type="text"
                        name="info_mobile"
                        placeholder="Enter Mobile"
                        className="model-add-edit-input"
                        value={formik.values.info_mobile}
                        onChange={formik.handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="profileMobile">
                        Location
                      </label>
                      <textarea
                        name="info_location"
                        className="model-add-edit-input"
                        placeholder="Enter Location"
                        value={formik.values.info_location}
                        onChange={formik.handleChange}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Facebook</label>
                      <input
                        className="model-add-edit-input"
                        placeholder="Enter Facebook"
                        name="info_facebook"
                        type="text"
                        value={formik.values.info_facebook}
                        onChange={formik.handleChange}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Instagram</label>
                      <input
                        className="model-add-edit-input"
                        placeholder="Enter Instagram"
                        name="info_instagram"
                        type="text"
                        value={formik.values.info_instagram}
                        onChange={formik.handleChange}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Linkedin</label>
                      <input
                        className="model-add-edit-input"
                        placeholder="Enter Linkedin"
                        name="info_linkedin"
                        type="text"
                        value={formik.values.info_linkedin}
                        onChange={formik.handleChange}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Whatsapp</label>
                      <input
                        className="model-add-edit-input"
                        placeholder="Enter Whatsapp"
                        name="info_whatsapp"
                        type="text"
                        value={formik.values.info_whatsapp}
                        onChange={formik.handleChange}
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-center mt-4">
                    <button className="btn btn-outline-danger" type="submit">
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}

export default Setting;
