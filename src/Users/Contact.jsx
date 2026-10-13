import "../Users/Contact.css";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import AOS from "aos";
import "aos/dist/aos.css";
import SEO from "../../Seo";
import { seoConfig } from "../Config/seoConfig";
import { Link } from "react-router-dom";

const validationSchema = Yup.object({
    full_name: Yup.string().required("Full Name is required"),
    company_name: Yup.string().required("Company Name is required"),
    email: Yup.string()
        .email("Invalid Email")
        .required("Email is required"),
    mobile: Yup.string()
        .matches(/^[6-9]\d{9}$/, "Enter Valid Mobile Number")
        .required("Mobile Number is required"),
    service: Yup.string().required("Please Select Service"),
    message: Yup.string().required("Message is required"),
    captcha: Yup.string().required("Enter Captcha")
});

const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    let captcha = "";
    for (let i = 0; i < 6; i++) {
        captcha += chars[Math.floor(Math.random() * chars.length)];
    }
    return captcha;
}

export default function Contact() {

    const [info, setInfo] = useState({});
    const [loading, setLoading] = useState(false);
    const [captchaCode, setCaptchaCode] = useState("");
    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: false,
        });

        getInformation();
        setCaptchaCode(generateCaptcha());
    }, []);

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

    const formik = useFormik({
        initialValues: {
            full_name: "",
            company_name: "",
            email: "",
            mobile: "",
            service: "",
            message: "",
            captcha: ""
        },

        validationSchema,

        onSubmit: async (values, { resetForm }) => {
            if (values.captcha !== captchaCode) {
                toast.error("Invalid Captcha");
                setCaptchaCode(generateCaptcha());
                return;
            }

            const data = {
                cont_company_name: values.company_name,
                cont_person_name: values.full_name,
                cont_email: values.email,
                cont_mobile: values.mobile,
                cont_subject: values.service,
                cont_message: values.message,
                cont_status: 1,
                cont_created_at: new Date()
                    .toISOString()
                    .slice(0, 19)
                    .replace("T", " "),

                cont_updated_at: "",
                cont_updated_by: 0
            };

            try {

                setLoading(true);
                const res = await axios.post(
                    `${BASE_URL}customer/insert/tbl_contact`,
                    data
                );

                if (res.data.status) {
                    toast.success(res.data.message);
                    resetForm();
                    setCaptchaCode(generateCaptcha());
                } else {
                    toast.error(res.data.message);
                }

            } catch (err) {
                toast.error("Something went wrong.");
            } finally {
                setLoading(false);
            }
        }
    });

    const refreshCaptcha = () => {
        setCaptchaCode(generateCaptcha());
    };

    return (
        <>
            <SEO
                title={seoConfig.user_contact.title}
                description={seoConfig.user_contact.description}
            />
            <section className="contact-hero">
                <div className="contact-overlay">
                    <div className="container">
                        <div className="contact-content">

                            <h1>
                                CONTACT US
                            </h1>

                            <p>
                                Have a question or need a quote? Secure Circuit is here to help. Contact our team for expert guidance on PCB design, fabrication, assembly, CAM services, and complete PCB solutions.
                            </p>

                            <div className="contact-features">

                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <i className="fa-solid fa-headset"></i>
                                    </div>
                                    <span>Quick Response</span>
                                </div>

                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <i className="fa-solid fa-bolt"></i>
                                    </div>
                                    <span>Fast Quotation</span>
                                </div>

                                <div className="feature-item">
                                    <div className="feature-icon">
                                        <i class="fa-solid fa-shield"></i>
                                    </div>
                                    <span>Quality Assurance</span>
                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            </section>

            <section className="contact-section bg-light py-5">
                <div className="container">
                    <div className="row g-5 align-items-start">

                        {/* Left Side */}
                        <div className="col-lg-5">
                            <div className="contact-info-box">

                                <h2>Have Any Questions?</h2>
                                <div className="title-line"></div>

                                <p>
                                    Our team is ready to assist you with PCB manufacturing,
                                    CAM engineering, prototype development, and production
                                    requirements.
                                </p>

                                <div className="info-item">
                                    <div className="info-icon">
                                        <i className="fa-solid fa-location-dot"></i>
                                    </div>

                                    <div>
                                        <h5>Office Address</h5>
                                        <span>
                                            {info?.info_location}
                                        </span>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="info-icon">
                                        <i className="fa-regular fa-envelope"></i>
                                    </div>

                                    <div>
                                        <h5>Email Address</h5>
                                        <span>{info?.info_email}</span>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="info-icon">
                                        <i className="fa-solid fa-phone"></i>
                                    </div>

                                    <div>
                                        <h5>Phone Number</h5>
                                        <span>+91 {info?.info_mobile}</span>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="info-icon">
                                        <i className="fa-regular fa-clock"></i>
                                    </div>

                                    <div>
                                        <h5>Working Hours</h5>
                                        <span>
                                            Monday - Saturday <br />
                                            10:00 AM - 7:00 PM
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Right Side */}

                        <div className="col-lg-7">
                            <div className="contact-form-box text-center">
                                <h2>Contact With Us</h2>
                                <div className="title-line"></div>
                                <form onSubmit={formik.handleSubmit}>
                                    <div className="row">
                                        {/* Full Name */}
                                        <div className="col-md-6 mb-3">
                                            <div className="input-box">
                                                <i className="fa-regular fa-user"></i>
                                                <input
                                                    type="text"
                                                    name="full_name"
                                                    placeholder="Full Name"
                                                    value={formik.values.full_name}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                />
                                                {
                                                    formik.touched.full_name &&
                                                    formik.errors.full_name && (
                                                        <small className="text-danger">
                                                            {formik.errors.full_name}
                                                        </small>
                                                    )
                                                }
                                            </div>
                                        </div>


                                        {/* Company */}
                                        <div className="col-md-6 mb-3">
                                            <div
                                                className="input-box"
                                            >
                                                <i className="fa-solid fa-building"></i>
                                                <input
                                                    type="text"
                                                    name="company_name"
                                                    placeholder="Company Name"
                                                    value={formik.values.company_name}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                />
                                                {
                                                    formik.touched.company_name &&
                                                    formik.errors.company_name && (
                                                        <small className="text-danger">
                                                            {formik.errors.company_name}
                                                        </small>
                                                    )
                                                }
                                            </div>
                                        </div>


                                        {/* Email */}
                                        <div className="col-md-6 mb-3">
                                            <div
                                                className="input-box"
                                            >
                                                <i className="fa-regular fa-envelope"></i>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    placeholder="Email Address"
                                                    value={formik.values.email}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                />
                                                {
                                                    formik.touched.email &&
                                                    formik.errors.email && (
                                                        <small className="text-danger">
                                                            {formik.errors.email}
                                                        </small>
                                                    )
                                                }
                                            </div>
                                        </div>


                                        {/* Mobile */}

                                        <div className="col-md-6 mb-3">
                                            <div
                                                className="input-box"
                                            >
                                                <i className="fa-solid fa-phone"></i>
                                                <input
                                                    type="text"
                                                    name="mobile"
                                                    placeholder="Phone Number"
                                                    maxLength={10}
                                                    value={formik.values.mobile}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, "");
                                                        formik.setFieldValue("mobile", value);
                                                    }}
                                                    onBlur={formik.handleBlur}
                                                />
                                                {
                                                    formik.touched.mobile &&
                                                    formik.errors.mobile && (
                                                        <small className="text-danger">
                                                            {formik.errors.mobile}
                                                        </small>
                                                    )
                                                }
                                            </div>
                                        </div>


                                        {/* Service */}

                                        <div className="col-12 mb-3">
                                            <div
                                                className="input-box"
                                            >
                                                <i className="fa-solid fa-layer-group"></i>
                                                <select
                                                    name="service"
                                                    value={formik.values.service}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                >
                                                    <option value="">
                                                        Select Service
                                                    </option>
                                                    <option value="PCB Design">
                                                        PCB Design
                                                    </option>
                                                    <option value="PCB Prototype">
                                                        PCB Prototype
                                                    </option>
                                                    <option value="PCB Fabrication">
                                                        PCB Fabrication
                                                    </option>
                                                </select>
                                                {
                                                    formik.touched.service &&
                                                    formik.errors.service && (
                                                        <small className="text-danger">
                                                            {formik.errors.service}
                                                        </small>
                                                    )
                                                }

                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div className="col-12 mb-3">
                                            <div
                                                className="input-box"
                                            >
                                                <i className="fa-solid fa-pen"></i>
                                                <textarea
                                                    rows="4"
                                                    name="message"
                                                    placeholder="Project Requirement / Message"
                                                    value={formik.values.message}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                ></textarea>
                                                {
                                                    formik.touched.message &&
                                                    formik.errors.message && (
                                                        <small className="text-danger ">
                                                            {formik.errors.message}
                                                        </small>
                                                    )
                                                }
                                            </div>
                                        </div>


                                        {/* Captcha */}

                                        <div className="col-md-6 mb-3">
                                            <div className="captcha-ui">
                                                <div className="captcha-text">
                                                    {captchaCode}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="captcha-refresh-btn"
                                                    onClick={refreshCaptcha}
                                                >
                                                    <i className="fa-solid fa-rotate-right"></i>
                                                </button>
                                            </div>
                                        </div>


                                        {/* Captcha Input */}

                                        <div className="col-md-6 mb-4">
                                            <div
                                                className="input-box"
                                            >
                                                <i className="fa-solid fa-shield"></i>
                                                <input
                                                    type="text"
                                                    name="captcha"
                                                    placeholder="Enter CAPTCHA"
                                                    value={formik.values.captcha}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                />
                                                {
                                                    formik.touched.captcha &&
                                                    formik.errors.captcha && (
                                                        <small className="text-danger">
                                                            {formik.errors.captcha}
                                                        </small>
                                                    )
                                                }
                                            </div>
                                        </div>

                                        {/* Submit */}

                                        <div className="col-12 text-center">
                                            <button
                                                type="submit"
                                                className="submit-btn"
                                                disabled={loading}
                                            >
                                                {
                                                    loading
                                                        ? "Submitting..."
                                                        : "Submit Inquiry"
                                                }
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= MAP SECTION ================= */}

            <section className="contact-map-section">
                <div className="container-fluid p-0">

                    <iframe
                        title="Secure Circuits Location"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(
                            info?.info_location
                        )}&output=embed`}
                        width="100%"
                        height="500"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>

                </div>
            </section >

            {/* ================= CTA SECTION ================= */}

            < section className="contact-cta-section" >
                <div className="container">
                    <div className="row align-items-center">

                        <div className="col-lg-7">
                            <div className="cta-content">
                                <h2>Ready To Start Your PCB Project?</h2>

                                <p>
                                    Partner with Secure Circuits for reliable PCB manufacturing,
                                    expert engineering support, and on-time delivery.
                                    From prototype development to bulk production,
                                    we ensure quality, precision, and timely service
                                    for every project.
                                </p>
                            </div>
                        </div>

                        <div className="col-lg-5 text-lg-end text-center mt-4 mt-lg-0">

                            <Link to="/" className="cta-btn">
                                Ready A Quote Today
                                <i className="fa-solid fa-circle-arrow-right"></i>
                            </Link>

                        </div>

                    </div>
                </div>
            </section >

        </>
    );
};