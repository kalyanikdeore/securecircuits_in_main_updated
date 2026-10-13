import "../Users/Home.css";
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import SEO from "../../Seo";
import { seoConfig } from "../Config/seoConfig";
import isoCertificate from "../../public/assets/images/iso-certificate.jpeg";
import dsqCertificate from "../../public/assets/images/dsq-certificate.jpeg";
import msmeCertificate from "../../public/assets/images/msme-certificate.png";

export default function Home() {

  const [certificate, setCertificate] = useState("");
  const [showCertificate, setShowCertificate] = useState(false);
  const [info, setInfo] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [testiData, setTestiData] = useState([]);


  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
    });

    getInformation();
    getTestiData();
  }, []);

  const getTestiData = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}customer/getdata/tbl_testimonials`,
      );

      if (response.data.status) {
        setTestiData(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getInformation = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}customer/getdatawhere/tbl_information/info_id/1`,
      );

      if (res.data.status) {
        setInfo(res.data.data[0]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const validationSchema = Yup.object({

    cust_contact_person: Yup.string()
      .required("Contact Person is required")
      .min(3, "Minimum 3 characters")
      .max(50, "Maximum 50 characters"),

    cust_email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),

    cust_mobile: Yup.string()
      .matches(/^[6-9]\d{9}$/, "Enter valid 10 digit mobile number")
      .required("Mobile Number is required"),
    order_uploaded_requirement: Yup.string()
      .required("Please upload your requirement")
    ,
    order_requirement_text: Yup.string()
      .required("Requirement is required")
      .min(10, "Minimum 10 characters")

  });

  const formik = useFormik({
    initialValues: {
      cust_contact_person: "",
      cust_email: "",
      cust_mobile: "",
      cust_status: "1",
      order_uploaded_requirement: null,
      order_requirement_text: "",
    },

    validationSchema,

    validateOnChange: false,
    validateOnBlur: false,

    onSubmit: async (values, { resetForm }) => {
      await saveQuotation(values, resetForm);
    },
  });

  const saveQuotation = async (values, resetForm) => {
    try {

      const payload = {
        cust_contact_person: values.cust_contact_person,
        cust_email: values.cust_email,
        cust_mobile: values.cust_mobile,
        cust_status: '1',
        cust_menu: '1,4,5,7',
        order_uploaded_requirement: values.order_uploaded_requirement,
        order_requirement_text: values.order_requirement_text,
      };

      const response = await axios.post(
        `${BASE_URL}customer/insert/tbl_customers`,
        payload
      );

      if (response.data.status) {
        toast.success('Your quotation request has been submitted successfully.');
        resetForm();
      } else {
        toast.error(response.data.message);
      }

    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };


  return (
    <>
      <SEO
        title={seoConfig.user_home.title}
        description={seoConfig.user_home.description}
      />

      <section className="hero-section" id="home">
        <div className="overlay"></div>

        <div className="container-fluid position-relative">
          <div className="row align-items-center px-lg-5 px-3">
            <div className="col-12 col-lg-7 text-center text-lg-start hero-content">
              <p className="sub-title" data-aos="fade-down" data-aos-delay="100">
                Precision PCBs. Reliable Performance. Delivered On Time.
              </p>

              <h1 data-aos="fade-right" data-aos-delay="200" className="fs-1">
                India's Trusted PCB Manufacturer for Prototype & Bulk Production.
              </h1>

              <p className="hero-text" data-aos="fade-right" data-aos-delay="150">
                Secure Circuits is a trusted PCB manufacturing company delivering high-quality Printed Circuit Boards, PCB prototyping, multilayer PCBs services for startups, businesses, and enterprises. We combine precision engineering, advanced manufacturing, competitive pricing, and fast turnaround to help businesses bring innovative electronic products to market.
              </p>

              <div className="hero-stats">
  <div className="hero-stat">
                  <div className="hero-icon">
                    <Icons.BadgeCheck  size={30} strokeWidth={1} />
                  </div>

                  <div>
                    <h3>20+</h3>
                    <p>Years of Experience</p>
                  </div>
                </div>  

                <div className="hero-stat">
                  <div className="hero-icon">
                    <Icons.Users size={42} strokeWidth={1} />
                  </div>

                  <div>
                    <h3>500+</h3>
                    <p>Satisfied Customers</p>
                  </div>
                </div>

                {/* <div className="hero-stat">
                  <div className="hero-icon">
                    <Icons.BadgeCheck size={42} strokeWidth={1} />
                  </div>

                  <div>
                    <h3>10+</h3>
                    <p>Years Experience</p>
                  </div>
                </div> */}

                <div className="hero-stat">
                  <div className="hero-icon">
                    <Icons.Cpu size={42} strokeWidth={1} />
                  </div>

                  <div>
                    <h3>1M+</h3>
                    <p>PCBs Delivered</p>
                  </div>
                </div>

                <div className="hero-stat">
                  <div className="hero-icon">
                    <Icons.Truck size={42} strokeWidth={1} />
                  </div>

                  <div>
                    <h3>99%</h3>
                    <p>On-Time Delivery</p>
                  </div>
                </div>
                   <div className="hero-stat quick-response-stat">
                  <div className="hero-icon">
                    <Icons.Headphones  size={30} strokeWidth={1} />
                  </div>

                  <div>
                    <h3>24/7</h3>
                    <p>Quick Response Support</p>
                  </div>
                </div>

              </div>

              <Link
                className="contact-btn"
                to="/order-now"
                style={{ textDecoration: "none" }}
              >
                Get Instant Quote  <Icons.ArrowRight size={18} strokeWidth={3} />
              </Link>
            </div>

            {/* <div
              className="col-12 col-lg-5 d-flex justify-content-center"
              data-aos="fade-left"
              data-aos-delay="300"
            >
              <div className="quote-form">
                <h5>Request For Quote</h5>
                <form onSubmit={formik.handleSubmit}>

                  <div className="input-group-custom">
                    <input
                      type="text"
                      name="cust_contact_person"
                      placeholder="Full Name"
                      value={formik.values.cust_contact_person}
                      onChange={(e) => {
                        formik.handleChange(e);

                        if (formik.submitCount > 0) {
                          formik.validateField("cust_contact_person");
                        }
                      }}
                      className={
                        formik.submitCount > 0 && formik.errors.cust_contact_person
                          ? "input-error"
                          : ""
                      }
                    />

                    {formik.submitCount > 0 && formik.errors.cust_contact_person && (
                      <Icons.CircleX className="error-icon" />
                    )}
                  </div>

                  <div className="input-group-custom">
                    <input
                      type="email"
                      name="cust_email"
                      placeholder="Email"
                      value={formik.values.cust_email}
                      onChange={(e) => {
                        formik.handleChange(e);

                        if (formik.submitCount > 0) {
                          formik.validateField("cust_email");
                        }
                      }}
                      className={
                        formik.submitCount > 0 && formik.errors.cust_email
                          ? "input-error"
                          : ""
                      }
                    />

                    {formik.submitCount > 0 && formik.errors.cust_email && (
                      <Icons.CircleX className="error-icon" />
                    )}
                  </div>

                  <div className="input-group-custom">
                    <input
                      type="text"
                      name="cust_mobile"
                      placeholder="Mobile Number"
                      value={formik.values.cust_mobile}
                      onChange={(e) => {
                        formik.handleChange(e);

                        if (formik.submitCount > 0) {
                          formik.validateField("cust_mobile");
                        }
                      }}
                      className={
                        formik.submitCount > 0 && formik.errors.cust_mobile
                          ? "input-error"
                          : ""
                      }
                    />

                    {formik.submitCount > 0 && formik.errors.cust_mobile && (
                      <Icons.CircleX className="error-icon" />
                    )}
                  </div>

                  <div className="input-group-custom">
                    <div className="custom-file-upload">
                      <label
                        htmlFor="fileUpload"
                        className={`upload-label ${formik.submitCount > 0 &&
                          formik.errors.order_uploaded_requirement
                          ? "input-error"
                          : ""
                          }`}
                      >
                        <span>
                          {formik.values.order_uploaded_requirement
                            ? formik.values.order_uploaded_requirement
                            : "Upload Gerber File"}
                        </span>

                        <Icons.Paperclip size={20} />
                      </label>

                      <input
                        id="fileUpload"
                        type="file"
                        accept=".pdf,.zip"
                        onChange={async (e) => {
                          const file = e.currentTarget.files[0];

                          const allowedTypes = [
                            "application/pdf",
                            "application/zip",
                            "application/x-zip-compressed",
                          ];

                          if (!allowedTypes.includes(file.type)) {
                            toast.error("Only PDF and ZIP files are allowed");
                            return;
                          }

                          if (file.size > 10 * 1024 * 1024) {
                            toast.error("Maximum file size is 10 MB");
                            return;
                          }

                          if (!file) return;

                          try {
                            const formData = new FormData();
                            formData.append("order_uploaded_requirement", file);

                            setUploading(true);
                            setUploadProgress(0);

                            const uploadResponse = await axios.post(
                              `${BASE_URL}customer/fileupload`,
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

                            setUploadProgress(100);

                            if (uploadResponse.data.status) {

                              formik.setFieldValue(
                                "order_uploaded_requirement",
                                uploadResponse.data.files.order_uploaded_requirement
                              );

                              toast.success("File uploaded successfully");
                            }

                            setTimeout(() => {
                              setUploading(false);
                              setUploadProgress(0);
                            }, 700);
                          } catch (err) {
                            console.log(err);
                            setUploading(false);
                            setUploadProgress(0);
                            toast.error("File upload failed");
                          }

                          if (formik.submitCount > 0) {
                            formik.validateField("order_uploaded_requirement");
                          }
                        }}
                      />
                      {uploading && (
                        <div className="home-upload-progress mt-2">
                          <div className="home-upload-progress-bar">
                            <div
                              className="home-upload-progress-fill"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>

                          <small className="fw-semibold">
                            Uploading... {uploadProgress}%
                          </small>
                        </div>
                      )}
                    </div>

                    {formik.submitCount > 0 &&
                      formik.errors.order_uploaded_requirement && (
                        <Icons.CircleX className="error-icon" />
                      )}
                  </div>



                  <div className="input-group-custom">
                    <textarea
                      name="order_requirement_text"
                      placeholder="Requirement"
                      rows={3}
                      value={formik.values.order_requirement_text}
                      onChange={(e) => {
                        formik.handleChange(e);

                        if (formik.submitCount > 0) {
                          formik.validateField("order_requirement_text");
                        }
                      }}
                      className={
                        formik.submitCount > 0 && formik.errors.order_requirement_text
                          ? "input-error"
                          : ""
                      }
                    />

                    {formik.submitCount > 0 && formik.errors.order_requirement_text && (
                      <Icons.CircleX className="error-icon" />
                    )}
                  </div>

                  <button type="submit">Submit Request</button>
                </form>
              </div>
            </div> */}
          </div>
        </div>
      </section>


      <section className="about-section py-5 bg-light" id="about-us">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="about-title" data-aos="fade-right" data-aos-delay="150">
              ABOUT US
            </h2>
            <div
              className="title-line"
              data-aos="fade-left"
              data-aos-delay="100"
            ></div>
          </div>

          <div className="row align-items-center g-4">
            <div
              className="col-12 col-lg-6"
              data-aos="fade-right"
              data-aos-delay="150"
            >
              <div className="about-image">
                <img src="assets/images/about.png" alt="About PCB" />
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <h3 className="about-heading" data-aos="zoom-in" data-aos-delay="150">
                20+ Years of Excellence in PCB Manufacturing
              </h3>

              <p className="about-text" data-aos="zoom-in" data-aos-delay="200">
                Secure Circuits is a leading PCB manufacturing company with over
                20 years of industry experience. We specialize in Single-Sided,
                Double-Sided, and Multilayer Printed Circuit Boards, delivering
                consistent quality, precision, and on-time service.
              </p>

              <p className="about-text" data-aos="zoom-in" data-aos-delay="250">
                Our advanced manufacturing process follows strict quality
                standards to ensure reliable performance for industrial,
                commercial, and electronic applications.
              </p>

              <Link
                to="/about"
                className="about-btn"
                data-aos="fade-left"
                data-aos-delay="250"
              >
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>

        <div className="counter-section ms-lg-5 me-lg-5 counter-mg">
          <div className="container">
            <div className="row text-center">
              <div
                className="col-6 col-lg-3 col-md-6"
                data-aos="fade-right"
                data-aos-delay="250"
              >
                <div className="home-counter-box">
                  <Icons.ShieldCheck size={60} strokeWidth={1} className="i" />
                  <div>
                    <h4>10+</h4>
                    <p>Years of Experience</p>
                  </div>
                </div>
              </div>

              <div
                className="col-6 col-lg-3 col-md-6"
                data-aos="fade-right"
                data-aos-delay="150"
              >
                <div className="home-counter-box">
                  <Icons.PersonStanding size={60} strokeWidth={1} className="i" />
                  <div>
                    <h4>500+</h4>
                    <p>Satisfied Customers</p>
                  </div>
                </div>
              </div>

              <div
                className="col-6 col-lg-3 col-md-6"
                data-aos="fade-left"
                data-aos-delay="150"
              >
                <div className="home-counter-box">
                  <Icons.Box size={60} strokeWidth={1} className="i" />
                  <div>
                    <h4>1 M+</h4>
                    <p>PCBs Delivered</p>
                  </div>
                </div>
              </div>

              <div
                className="col-6 col-lg-3 col-md-6"
                data-aos="fade-left"
                data-aos-delay="250"
              >
                <div className="home-counter-box">
                  <Icons.Van size={60} strokeWidth={1} className="i" />
                  <div>
                    <h4>98%</h4>
                    <p>On-Time Delivery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="services-section py-2" id="services">
        <div className="container-fluid mt-5 mb-5">
          <div className="text-center mb-5">
            <h2 className="section-title" data-aos="fade-right" data-aos-delay="100">
              OUR SERVICES
            </h2>
            <div
              className="title-line"
              data-aos="fade-left"
              data-aos-delay="100"
            ></div>

            <p
              className="section-subtitle mt-3"
              data-aos="zoom-in"
              data-aos-delay="200"
            >
              From PCB Design to Manufacturing, CAM Engineering and Secure Circuits Delivers reliable, high-quality solutions with precision, speed, and competitive pricing.
            </p>
          </div>

          <div className="row g-4">
            <div
              className="col-12 col-sm-6 col-lg-3"
              data-aos="fade-right"
              data-aos-delay="300"
            >
              <div className="service-card">

                <div className="service-img">
                  <img src="assets/images/pcb-fabrication.png" alt="" />
                </div>

                <div className="service-content">

                  <div className="service-icon">
                    <Icons.Cpu size={30} className="i" />
                  </div>

                  <h4>PCB FABRICATION</h4>

                  <ul>

                    <li>
                      <i className="fa-solid fa-circle-check"></i>
                      Single, Double & Multi-Layer PCB
                    </li>

                    <li>
                      <i className="fa-solid fa-circle-check"></i>
                      High Precision Manufacturing
                    </li>

                    <li>
                      <i className="fa-solid fa-circle-check"></i>
                      100% Quality Tested
                    </li>

                    <li>
                      <i className="fa-solid fa-circle-check"></i>
                      Fast & On-Time Delivery
                    </li>

                  </ul>

                </div>

              </div>
            </div>

            <div
              className="col-12 col-sm-6 col-lg-3"
              data-aos="fade-right"
              data-aos-delay="100"
            >
              <div className="service-card">

                <div className="service-img">
                  <img src="assets/images/pcb-prototype.png" alt="" />
                </div>

                <div className="service-content">

                  <div className="service-icon">
                    <Icons.FlaskConical size={30} className="i" />
                  </div>

                  <h4>PCB PROTOTYPE</h4>

                  <ul>
                    <li><i className="fa-solid fa-circle-check"></i>Rapid Prototype Development</li>
                    <li><i className="fa-solid fa-circle-check"></i>1-Day, 3-Day & 5-Day Delivery</li>
                    <li><i className="fa-solid fa-circle-check"></i>Perfect for Testing & Validation</li>
                    <li><i className="fa-solid fa-circle-check"></i>Production-Ready Quality</li>
                  </ul>

                </div>

              </div>
            </div>

            <div
              className="col-12 col-sm-6 col-lg-3"
              data-aos="fade-left"
              data-aos-delay="100"
            >
              <div className="service-card">

                <div className="service-img">
                  <img src="assets/images/valume-manufacturing.png" alt="" />
                </div>

                <div className="service-content">

                  <div className="service-icon">
                    <Icons.Factory size={30} className="i" />
                  </div>

                  <h4> MANUFACTURING</h4>

                  <ul>
                    <li><i className="fa-solid fa-circle-check"></i>Consistent Mass Production</li>
                    <li><i className="fa-solid fa-circle-check"></i>Automated Manufacturing </li>
                    <li><i className="fa-solid fa-circle-check"></i>Cost-Effective Bulk Solutions</li>
                    <li><i className="fa-solid fa-circle-check"></i>Reliable On-Time Delivery</li>
                  </ul>

                </div>

              </div>
            </div>

            <div
              className="col-12 col-sm-6 col-lg-3"
              data-aos="fade-left"
              data-aos-delay="300"
            >
              <div className="service-card">

                <div className="service-img">
                  <img src="assets/images/pcb-design.png" alt="" />
                </div>

                <div className="service-content">

                  <div className="service-icon">
                    <Icons.PencilRuler size={30} className="i" />

                  </div>

                  <h4>PCB DESIGN</h4>

                  <ul>
                    <li><i className="fa-solid fa-circle-check"></i>Professional PCB Layout Design</li>
                    <li><i className="fa-solid fa-circle-check"></i>Optimized Circuit Performance</li>
                    <li><i className="fa-solid fa-circle-check"></i>DFM & Manufacturing Support</li>
                    <li><i className="fa-solid fa-circle-check"></i>Expert Engineering Assistance</li>
                  </ul>

                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="why-choose-section py-5 bg-light" id="why-choose-us">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="why-title" data-aos="fade-right" data-aos-delay="150">
              WHY CHOOSE US
            </h2>
            <div className="why-line" data-aos="fade-left" data-aos-delay="100"></div>
          </div>

          <div className="row g-3">
            <div
              className="col-12 col-sm-6 col-lg-3"
              data-aos="fade-left"
              data-aos-delay="100"
            >
              <div className="feature-card">
                <div className="wc-feature-icon">
                  <Icons.Trophy size={80} strokeWidth={1} className="i" />
                </div>

                <div>
                  <h5>20+ Years Experience</h5>
                  <p>Over two decades of expertise in PCB manufacturing.</p>
                </div>
              </div>
            </div>

            <div
              className="col-12 col-sm-6 col-lg-3"
              data-aos="fade-left"
              data-aos-delay="200"
            >
              <div className="feature-card">
                <div className="wc-feature-icon">
                  <Icons.Zap size={80} strokeWidth={1} className="i" />
                </div>

                <div>
                  <h5>Quick Turn PCB</h5>
                  <p>Prototype delivery available in 1 Day, 3 Days & 5 Days.</p>
                </div>
              </div>
            </div>

            <div
              className="col-12 col-sm-6 col-lg-3"
              data-aos="fade-left"
              data-aos-delay="300"
            >
              <div className="feature-card">
                <div className="wc-feature-icon">
                  <Icons.CircleCheckBig size={80} strokeWidth={1} className="i" />
                </div>

                <div>
                  <h5>Quality Assurance</h5>
                  <p>100% Electrical Testing and strict quality inspection.</p>
                </div>
              </div>
            </div>

            <div
              className="col-12 col-sm-6 col-lg-3"
              data-aos="fade-left"
              data-aos-delay="400"
            >
              <div className="feature-card">
                <div className="wc-feature-icon">
                  <Icons.TruckElectric size={80} strokeWidth={1} className="i" />
                </div>

                <div>
                  <h5>On-Time Delivery</h5>
                  <p>Committed delivery schedules for every order.</p>
                </div>
              </div>
            </div>

            <div
              className="col-12 col-sm-6 col-lg-3"
              data-aos="fade-left"
              data-aos-delay="500"
            >
              <div className="feature-card">
                <div className="wc-feature-icon">
                  <Icons.DollarSign size={80} strokeWidth={1} className="i" />
                </div>

                <div>
                  <h5>Competitive Pricing</h5>
                  <p>Best value without compromising quality.</p>
                </div>
              </div>
            </div>

            <div
              className="col-12 col-sm-6 col-lg-3"
              data-aos="fade-left"
              data-aos-delay="600"
            >
              <div className="feature-card">
                <div className="wc-feature-icon">
                  <Icons.Headphones size={80} strokeWidth={1} className="i" />
                </div>

                <div>
                  <h5>Technical Support</h5>
                  <p>
                    Experienced engineering team for design and manufacturing
                    support.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="col-12 col-sm-6 col-lg-3"
              data-aos="fade-left"
              data-aos-delay="700"
            >
              <div className="feature-card">
                <div className="wc-feature-icon">
                  <Icons.Factory size={80} strokeWidth={1} className="i" />
                </div>

                <div>
                  <h5>Bulk Production</h5>
                  <p>
                    Capability to handle both prototype and volume production.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="col-12 col-sm-6 col-lg-3"
              data-aos="fade-left"
              data-aos-delay="800"
            >
              <div className="feature-card">
                <div className="wc-feature-icon">
                  <Icons.Handshake size={80} strokeWidth={1} className="i" />
                </div>

                <div>
                  <h5>Customer Satisfaction</h5>
                  <p>Trusted by leading OEMs and industrial manufacturers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="manufacturing-process-section">
        <div className="container">

          <div className="text-center mb-5">
            <h2 className="process-title" data-aos="fade-right" data-aos-delay="100">
              PCB MANUFACTURING PROCESS
            </h2>
          </div>

          <div className="process-wrapper">

            {/* 1 */}
            <div className="process-item" data-aos="fade-right" data-aos-delay="50">
              <div className="process-icon">
                <Icons.FileUp size={50} strokeWidth={1} className="i" />
              </div>

              <h6>Gerber File</h6>
              <p>Received</p>
            </div>

            <div className="process-arrow" data-aos="fade-right" data-aos-delay="100"></div>

            {/* 2 */}
            <div className="process-item" data-aos="fade-right" data-aos-delay="150">
              <div className="process-icon">
                <Icons.BadgeCheck size={50} strokeWidth={1} className="i" />
              </div>

              <h6>Engineering</h6>
              <p>Review</p>
            </div>

            <div className="process-arrow" data-aos="fade-right" data-aos-delay="200"></div>

            {/* 3 */}
            <div className="process-item" data-aos="fade-right" data-aos-delay="250">
              <div className="process-icon">
                <Icons.Cpu size={50} strokeWidth={1} className="i" />
              </div>

              <h6>PCB</h6>
              <p>Manufacturing</p>
            </div>

            <div className="process-arrow" data-aos="fade-right" data-aos-delay="300"></div>

            {/* 4 */}
            <div className="process-item" data-aos="fade-right" data-aos-delay="350">
              <div className="process-icon">
                <Icons.Search size={50} strokeWidth={1} className="i" />
              </div>

              <h6>Quality</h6>
              <p>Testing</p>
            </div>

            <div className="process-arrow" data-aos="fade-right" data-aos-delay="400"></div>

            {/* 5 */}
            <div className="process-item" data-aos="fade-right" data-aos-delay="450">
              <div className="process-icon">
                <Icons.Package size={50} strokeWidth={1} className="i" />

              </div>

              <h6>Packing</h6>
            </div>

            <div className="process-arrow" data-aos="fade-right" data-aos-delay="500"></div>

            {/* 6 */}
            <div className="process-item" data-aos="fade-right" data-aos-delay="550">
              <div className="process-icon">
                <Icons.Truck size={50} strokeWidth={1} className="i" />

              </div>

              <h6>Dispatch</h6>
              <p>On-Time</p>
            </div>

          </div>

        </div>
      </section>

      <section className="kay-fc-section">
        <div className="container-fluid px-0">
          <div className="kay-fc-wrapper">
            <div className="kay-fc-item">
              <div className="kay-fc-icon">
                <i className="fa-solid fa-microchip"></i>
              </div>

              <div className="kay-fc-text">
                <h6>Advanced Technology</h6>
                <span>& Modern Machinery</span>
              </div>
            </div>

            <div className="kay-fc-item">
              <div className="kay-fc-icon">
                <i className="fa-solid fa-circle-check"></i>
              </div>

              <div className="kay-fc-text">
                <h6>Strict Quality Control</h6>
                <span>At Every Stage</span>
              </div>
            </div>

            <div className="kay-fc-item">
              <div className="kay-fc-icon">
                <i className="fa-solid fa-clock"></i>
              </div>

              <div className="kay-fc-text">
                <h6>Quick Turnaround</h6>
                <span>Time</span>
              </div>
            </div>

            <div className="kay-fc-item">
              <div className="kay-fc-icon">
                <i className="fa-solid fa-indian-rupee-sign"></i>
              </div>

              <div className="kay-fc-text">
                <h6>Competitive Pricing</h6>
                <span>Without Compromise</span>
              </div>
            </div>

            <div className="kay-fc-item kay-fc-last">
              <div className="kay-fc-icon">
                <i className="fa-solid fa-headset"></i>
              </div>

              <div className="kay-fc-text">
                <h6>Dedicated Support</h6>
                <span>24 / 7</span>
              </div>
            </div>

          </div>

        </div>

      </section>

      <section className="industries-section bg-light py-5 " id="industries">
        <div className="container ">
          <div className="text-center mb-4">
            <h2 className="industry-title" data-aos="fade-right" data-aos-delay="100">
              INDUSTRIES WE SERVE
            </h2>

            <div
              className="industry-line"
              data-aos="fade-left"
              data-aos-delay="100"
            ></div>
          </div>
        </div>

        <div className="industry-bg">
          <div className="container">
            <div className="row g-4">
              <div
                className="col-6 col-md-6 col-lg-3"
                data-aos="fade-right"
                data-aos-delay="200"
              >
                <div className="industry-card">
                  <Icons.Car size={60} strokeWidth={1} className="i" />
                  <h5>AUTOMOTIVE</h5>
                </div>
              </div>

              <div
                className="col-6 col-md-6 col-lg-3"
                data-aos="fade-right"
                data-aos-delay="100"
              >
                <div className="industry-card">
                  <Icons.Smartphone size={60} strokeWidth={1} className="i" />
                  <h5>CONSUMER ELECTRONICS</h5>
                </div>
              </div>

              <div
                className="col-6 col-md-6 col-lg-3"
                data-aos="fade-left"
                data-aos-delay="100"
              >
                <div className="industry-card">
                  <Icons.Zap size={60} strokeWidth={1} className="i" />
                  <h5>POWER ELECTRONIC</h5>
                </div>
              </div>

              <div
                className="col-6 col-md-6 col-lg-3"
                data-aos="fade-left"
                data-aos-delay="200"
              >
                <div className="industry-card">
                  <Icons.Factory size={60} strokeWidth={1} className="i" />
                  <h5>INDUSTRIAL AUTOMATION</h5>
                </div>
              </div>

              <div
                className="col-6 col-md-6 col-lg-3"
                data-aos="fade-right"
                data-aos-delay="200"
              >
                <div className="industry-card">
                  <Icons.TrainFront size={60} strokeWidth={1} className="i" />
                  <h5>RAILWAY</h5>
                </div>
              </div>

              <div
                className="col-6 col-md-6 col-lg-3"
                data-aos="fade-right"
                data-aos-delay="100"
              >
                <div className="industry-card">
                  <Icons.Radio size={60} strokeWidth={1} className="i" />
                  <h5>COMMUNICATION EQUIPMENT</h5>
                </div>
              </div>

              <div
                className="col-6 col-md-6 col-lg-3"
                data-aos="fade-left"
                data-aos-delay="100"
              >
                <div className="industry-card">
                  <Icons.Landmark size={60} strokeWidth={1} className="i" />
                  <h5>GOVERNMENT PROJECTS</h5>
                </div>
              </div>

              <div
                className="col-6 col-md-6 col-lg-3"
                data-aos="fade-left"
                data-aos-delay="200"
              >
                <div className="industry-card">
                  <Icons.PlugZap size={60} strokeWidth={1} className="i" />
                  <h5>INVERTER & UPS</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="clients-section py-5">
        <div className="container">
          <div className="text-center mb-4">
            <h2 className="clients-title" data-aos="fade-right" data-aos-delay="150">
              TRUSTED BY LEADING BRANDS
            </h2>

            <div
              className="clients-line"
              data-aos="fade-left"
              data-aos-delay="100"
            ></div>
          </div>

          <div className="row g-3 justify-content-center">
            <div
              className="col-6 col-md-4 col-lg"
              data-aos="fade-right"
              data-aos-delay="300"
            >
              <div className="client-card">
                <img src="assets/images/dixon.jpg" alt="Dixon" />
              </div>
            </div>

            <div
              className="col-6 col-md-4 col-lg"
              data-aos="fade-right"
              data-aos-delay="200"
            >
              <div className="client-card">
                <img src="assets/images/livguard.jpg" alt="Livguard" />
              </div>
            </div>

            <div
              className="col-6 col-md-4 col-lg"
              data-aos="fade-right"
              data-aos-delay="100"
            >
              <div className="client-card">
                <img src="assets/images/nucleonix.jpg" alt="Nucleonix" />
              </div>
            </div>

            <div
              className="col-6 col-md-4 col-lg"
              data-aos="zoom-in"
              data-aos-delay="100"
            >
              <div className="client-card">
                <img src="assets/images/mli.png" alt="Mahalaxmi " />
              </div>
            </div>

            <div
              className="col-6 col-md-4 col-lg"
              data-aos="fade-left"
              data-aos-delay="200"
            >
              <div className="client-card">
                <img src="assets/images/su-kam.jpg" alt="Su-Kam" />
              </div>
            </div>

            <div
              className="col-6 col-md-4 col-lg"
              data-aos="fade-left"
              data-aos-delay="300"
            >
              <div className="client-card">
                <img src="assets/images/luminous.jpg" alt="Luminous" />
              </div>
            </div>

            <div
              className="col-6 col-md-4 col-lg"
              data-aos="fade-left"
              data-aos-delay="400"
            >
              <div className="client-card">
                <img src="assets/images/v-guard.png" alt="V-guard" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="gallery-section py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="gallery-title" data-aos="fade-right" data-aos-delay="150">
              OUR GALLERY
            </h2>

            <div
              className="gallery-line"
              data-aos="fade-left"
              data-aos-delay="100"
            ></div>
          </div>

          <div className="row g-4 justify-content-center">
            <div
              className="col-12 col-md-6 col-lg-4"
              data-aos="zoom-in"
              data-aos-delay="100"
            >
              <div className="gallery-card">
                <img src="assets/images/gallery1.jpg" alt="Gallery Image" />
              </div>
            </div>

            <div
              className="col-12 col-md-6 col-lg-4"
              data-aos="zoom-in"
              data-aos-delay="200"
            >
              <div className="gallery-card">
                <img src="assets/images/gallery2.jpg" alt="Gallery Image" />
              </div>
            </div>

            <div
              className="col-12 col-md-6 col-lg-4"
              data-aos="zoom-in"
              data-aos-delay="300"
            >
              <div className="gallery-card">
                <img src="assets/images/gallery3.jpg" alt="Gallery Image" />
              </div>
            </div>
          </div>

          <div className="text-center mt-5">
            <a href="#" className="gallery-btn"> View Gallery </a>
          </div>
        </div>
      </section>

      <section className="testimonial-section py-5">
        <div className="container">
          <div className="text-center">
            <h2
              className="testimonial-title"
              data-aos="fade-right"
              data-aos-delay="150"
            >
              TESTIMONIALS
            </h2>

            <div
              className="testimonial-line"
              data-aos="fade-left"
              data-aos-delay="100"
            ></div>

            <h3
              className="testimonial-subtitle"
              data-aos="zoom-in"
              data-aos-delay="100"
            >
              What Our Client Saying?
            </h3>
          </div>


          <div
            id="testimonialSlider"
            className="carousel slide"
            data-bs-ride="carousel"
          >
            <div className="carousel-inner">
              {testiData.map((testi, index) => (
                <div
                  key={testi.test_id}
                  className={`carousel-item ${index === 0 ? "active" : ""}`}
                >
                  <div className="testimonial-content">

                    {/* <img
                      src={
                        testi.cust_image
                          ? `${BASE_URL}public/Uploads/${testi.cust_image}`
                          : "assets/images/logo-light.png"
                      }
                      className="client-image"
                      alt={testi.cust_contact_person}
                    /> */}

                    <h4>{testi.cust_contact_person}</h4>

                    <div className="rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className={
                            star <= testi.test_rating
                              ? "fa-solid fa-star"
                              : "fa-regular fa-star"
                          }
                        ></i>
                      ))}
                    </div>

                    <p>{testi.test_text}</p>

                  </div>
                </div>
              ))}
            </div>

            {testiData.length > 1 && (
              <>
                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target="#testimonialSlider"
                  data-bs-slide="prev"
                >
                  <span className="custom-arrow">
                    <i className="fa-solid fa-chevron-left"></i>
                  </span>
                </button>

                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target="#testimonialSlider"
                  data-bs-slide="next"
                >
                  <span className="custom-arrow">
                    <i className="fa-solid fa-chevron-right"></i>
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

    </>
  );
};
