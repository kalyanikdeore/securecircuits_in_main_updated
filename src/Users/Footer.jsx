import gstCertificate from "/assets/images/gst-certificate.jpeg";
import "../Users/Home.css";
import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import { Link } from "react-router-dom";


export default function Footer() {
    const [info, setInfo] = useState({});
    const [certificate, setCertificate] = useState("");

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: false,
        });

        getInformation();
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


    return (
        <>
            <footer className="footer-section">
                <div className="footer-overlay">
                    <div className="container">
                        <div className="row gy-4">
                            <div className="col-12 col-md-6 col-lg-3 mb-3">
                                <div className="footer-logo">
                                    <Link to="/">
                                        <img src="assets/images/home-logo.png" alt="Logo" />
                                    </Link>
                                </div>

                                <p className="footer-about">
                                    Secure Circuits is a trusted PCB manufacturing and assembly
                                    partner, delivering high-quality, precision-engineered, and
                                    cost-effective electronic solutions with a commitment to
                                    innovation and customer satisfaction.
                                </p>

                                <div className="footer-social">
                                    <a href={info?.info_facebook}>
                                        <i className="fab fa-facebook-f"></i>
                                    </a>

                                    <a href={info?.info_instagram}>
                                        <i className="fab fa-instagram"></i>
                                    </a>

                                    <a href={info?.info_linkedin}>
                                        <i className="fab fa-linkedin-in"></i>
                                    </a>

                                    <a href={`https://wa.me/91${info?.info_whatsapp}?text=Hello%20I%20am%20enquiring%20from%20your%20website.`} target="_blank"
                                        rel="noreferrer">
                                        <i className="fab fa-whatsapp"></i>
                                    </a>
                                </div>
                            </div>

                            <div className="col-6 col-md-6 col-lg-3 text-start">
                                <h5 className="footer-heading ms-lg-5">QUICK LINKS</h5>

                                <ul className="footer-links ms-lg-5">
                                    <li><Link to="/">Home</Link></li>
                                    <li><Link to="/about">About Us</Link></li>
                                    {/* <li><Link to="">Services</Link></li> */}
                                    <li><Link to="/why-choose">Why Us?</Link></li>
                                    <li><Link to="/contact">Contact Us</Link></li>
                                    <li>
                                        <button
                                            type="button"
                                            className="btn text-light p-0"
                                            data-bs-toggle="modal"
                                            data-bs-target="#gstcertificateModal"
                                        >
                                            GST Certificate
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            <div className="col-6 col-md-6 col-lg-3 text-start">
                                <h5 className="footer-heading">OUR SERVICES</h5>

                                <ul className="footer-links">
                                    <li><Link to="/services/pcb-supplier">PCB Supply</Link></li>
                                    <li><Link to="/services/pcb-layout-and-design">PCB Design</Link></li>
                                    <li><Link to="/services/pcb-cam-services">PCB CAM</Link></li>
                                    <li><Link to="#">Testing</Link></li>
                                    <li> <button
                                        type="button"
                                        className="btn p-0 text-light"
                                        onClick={() =>
                                            window.open('assets/images/company-profile.pdf')
                                        }
                                    >
                                        Company Profile
                                    </button></li>
                                </ul>
                            </div>


                            <div className="col-12 col-md-6 col-lg-3">
                                <h5 className="footer-heading">CONTACT US</h5>

                                <ul className="contact-list">
                                    <a href={`tel:+91${info?.info_mobile}`}>
                                        <li>
                                            <i className="fa-solid fa-phone"></i>
                                            +91 {info?.info_mobile}
                                        </li>
                                    </a>

                                    <a href={`mailto:${info?.info_email}`}>
                                        <li>
                                            <i className="fa-regular fa-envelope"></i>
                                            {info?.info_email}
                                        </li>
                                    </a>

                                    <a
                                        href={`https://www.google.com/maps/search/${encodeURIComponent(info?.info_location || "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <li>
                                            <i className="fa-solid fa-location-dot"></i>
                                            {info?.info_location}
                                        </li>
                                    </a>
                                </ul>

                                <button className="btn btn-outline-light">Delivery Options</button>

                                <div className="delivery-partners">
                                    <img src="assets/images/dtdc.png" alt="Delivery Partners" />
                                    <img src="assets/images/blue-dart.png" alt="Delivery Partners" />
                                    <img src="assets/images/express-delivery.png" alt="Delivery Partners" />
                                    <img src="assets/images/shreemaruti.jpeg" alt="Delivery Partners" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="copyright-section">
                    Secure Circuits © Copyright {new Date().getFullYear()}. All Rights Reserved | Designing By{' '}
                    <a
                        href="https://www.esenceweb.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="desining-by"
                    >
                        Esenceweb IT </a>.
                </div>
            </footer >


            <div
                className="modal fade certificate-popup"
                id="gstcertificateModal"
                tabIndex="-1"
            >
                <div className="modal-dialog modal-dialog-centered modal-xl certificate-popup-dialog">
                    <div className="modal-content certificate-popup-content">

                        <button
                            type="button"
                            className="certificate-close bg-dark text-white mt-3 me-3"
                            data-bs-dismiss="modal"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>

                        <div className="certificate-popup-body">
                            <img
                                src="assets/images/gst-certificate.jpeg"
                                alt="Certificate"
                                className="certificate-popup-image ms-2 me-2"
                            />
                            <img
                                src="assets/images/gst-certificate2.jpeg"
                                alt="Certificate"
                                className="certificate-popup-image ms-2 me-2"
                            />
                            <img
                                src="assets/images/gst-certificate3.jpeg"
                                alt="Certificate"
                                className="certificate-popup-image ms-2 me-2"
                            />
                        </div>

                    </div>
                </div>
            </div>

        </>
    );
};