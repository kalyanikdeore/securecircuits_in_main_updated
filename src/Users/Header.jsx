import "../Users/Home.css";
import isoCertificate from "../../public/assets/images/iso-certificate.jpeg";
import dsqCertificate from "../../public/assets/images/dsq-certificate.jpeg";
import msmeCertificate from "../../public/assets/images/msme-certificate.png";

import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import FloatingContact from "../Users/FloatingContact";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";
import { Link, useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import * as Icons from "lucide-react";
// import { Offcanvas } from "bootstrap";


export default function Header() {
    const customer = JSON.parse(localStorage.getItem("customer"));

    const [certificate, setCertificate] = useState("");
    const [showCertificate, setShowCertificate] = useState(false);
    const [info, setInfo] = useState({});
    const [serviceOpen, setServiceOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: false,
        });

        getInformation();
    }, []);

    const location = useLocation();

    const hideFloating =
        location.pathname === "/order-now";

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


    // const closeMobileMenu = () => {
    //     const offcanvasElement = document.getElementById("mobileMenu");

    //     if (offcanvasElement) {
    //         const bsOffcanvas =
    //             Offcanvas.getInstance(offcanvasElement) ||
    //             new Offcanvas(offcanvasElement);

    //         bsOffcanvas.hide();

    //         setTimeout(() => {
    //             document.body.classList.remove("offcanvas-backdrop");
    //             document.body.style.overflow = "";
    //             document.body.style.paddingRight = "";

    //             document    
    //                 .querySelectorAll(".offcanvas-backdrop")
    //                 .forEach((el) => el.remove());
    //         }, 300);
    //     }
    // };


    const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setServiceOpen(false);
};
    return (
        <>
            <section className="top-strip d-none d-lg-block">
                <div className="container-fluid ps-5 pe-5">
                    <div
                        className="d-flex flex-column flex-sm-row justify-content-between align-items-center"
                    >
                        <span data-aos="fade-right" data-aos-delay="100"
                        >Powering Innovation with Precision PCBs.</span
                        >

                        <span data-aos="fade-right" data-aos-delay="100"
                        >24/7 Quick Response Support.</span>

                        <div className="social-icons">
                            <a href={info?.info_facebook} data-aos="fade-down" data-aos-delay="100"
                            ><i className="fab fa-facebook-f"></i
                            ></a>
                            <a href={info?.info_instagram} data-aos="fade-down" data-aos-delay="150"
                            ><i className="fab fa-instagram"></i
                            ></a>
                            <a href={info?.info_linkedin} data-aos="fade-down" data-aos-delay="200"
                            ><i className="fab fa-linkedin-in"></i
                            ></a>
                            <a href={`https://wa.me/91${info?.info_whatsapp}?text=Hello%20I%20am%20enquiring%20from%20your%20website.`}
                                data-aos="fade-down" data-aos-delay="250"
                            ><i className="fab fa-whatsapp"></i
                            ></a>
                        </div>
                    </div>
                </div>
            </section>

            <section className="contact-header">
                <div className="container-fluid">

                    {/* Logo */}
                    <div className="row">
                        <div className="col-12 col-lg-3 col-xl-2">
                            <Link to="/">
                                <img src="assets/images/home-logo.png" className="logo-img" alt="Logo" />
                            </Link>
                        </div>

                        {/* Desktop Contact */}
                        <div className="col-lg-5 col-xl-6 d-none d-lg-block">
                            <div className="contact-info">

                                <a href={`tel:+91${info?.info_mobile}`} style={{ textDecoration: "none" }}>
                                    <div className="contact-item me-5">
                                        <Icons.Phone size={30} className="i" />

                                        <div className="contact-text">
                                            <h6>Call Now</h6>
                                            <span>+91 {info?.info_mobile}</span>
                                        </div>
                                    </div>
                                </a>

                                <a href={`mailto:${info?.info_email}`} style={{ textDecoration: "none" }}>
                                    <div className="contact-item">
                                        <Icons.Mail size={30} className="i" />
                                        <div className="contact-text">
                                            <h6>Mail Us Enquiry</h6>
                                            <span>{info?.info_email}</span>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <div className="col-12 col-lg-4 col-xl-4 d-none d-lg-flex justify-content-end">
                            <div className="certificates-icon">

                                <div className="certificate-item">
                                    <img
                                        src="assets/images/iso.png"
                                        className="certificates"
                                        onClick={() => {
                                            setCertificate(isoCertificate);
                                            setShowCertificate(true);
                                        }}
                                        data-bs-toggle="modal"
                                        data-bs-target="#certificateModal"
                                    />
                                </div>

                                <div className="certificate-item">
                                    <img
                                        src="assets/images/msme.png"
                                        className="certificates"
                                        onClick={() => {
                                            setCertificate(msmeCertificate);
                                            setShowCertificate(true);
                                        }}
                                        data-bs-toggle="modal"
                                        data-bs-target="#certificateModal"
                                    />
                                </div>

                                <div className="certificate-item">
                                    <img
                                        src="assets/images/dsq.png"
                                        className="certificates"
                                        onClick={() => {
                                            setCertificate(dsqCertificate);
                                            setShowCertificate(true);
                                        }}
                                        data-bs-toggle="modal"
                                        data-bs-target="#certificateModal"
                                    />
                                </div>

                                <div className="certificate-item">
                                    <img
                                        src="assets/images/rohs.png"
                                        className="certificates"
                                    />
                                </div>

                            </div>
                        </div>


                        <div className="row d-flex d-lg-none align-items-center mt-2">
                            <div className="col-6">
                                <div className="contact-info">
                                    <div className="contact-item me-3">
                                        <a href={info?.info_mobile}>
                                            <Icons.Phone size={20} className="i" />
                                        </a>
                                    </div>

                                    <div className="contact-item">
                                        <a href={info?.info_email}>
                                            <Icons.Mail size={20} className="i" />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="col-6 d-block">
                                <div className="certificates-icon">
                                    <img
                                        src="assets/images/iso.png"
                                        className="certificates"
                                        onClick={() => {
                                            setCertificate(isoCertificate);
                                            setShowCertificate(true);
                                        }}
                                        data-bs-toggle="modal"
                                        data-bs-target="#certificateModal"
                                    />

                                    <img
                                        src="assets/images/msme.png"
                                        className="certificates"
                                        onClick={() => {
                                            setCertificate(msmeCertificate);
                                            setShowCertificate(true);
                                        }}
                                        data-bs-toggle="modal"
                                        data-bs-target="#certificateModal"
                                    />

                                    <img
                                        src="assets/images/dsq.png"
                                        className="certificates"
                                        onClick={() => {
                                            setCertificate(dsqCertificate);
                                            setShowCertificate(true);
                                        }}
                                        data-bs-toggle="modal"
                                        data-bs-target="#certificateModal"
                                    />

                                    <img
                                        src="assets/images/rohs.png"
                                        className="certificates"
                                        onClick={() => {
                                            setCertificate(dsqCertificate);
                                            setShowCertificate(true);
                                        }}
                                        data-bs-toggle="modal"
                                        data-bs-target="#certificateModal"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="nav-section">
                <div className="container-fluid">
                    <nav
                        className="navbar navbar-expand-lg pcb-navbar"
                        style={{
                            width: "100%",
                            maxWidth: customer ? "800px" : "800px"
                        }}
                    >

                        {/* Mobile Logo */}
                        <a href="#home" className="mobile-logo">
                            <img src="assets/images/home-logo.png" alt="Logo" />
                        </a>

                        {/* <button
                            className="navbar-toggler border-0 shadow-none ms-auto nav-menu-icon"
                            type="button"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#mobileMenu"
                        >
                            <Icons.Logs size={28} />
                        </button> */}
                        <button
    className="navbar-toggler border-0 shadow-none ms-auto nav-menu-icon"
    type="button"
    onClick={() => setMobileMenuOpen(true)}
>
    <Icons.Logs size={28} />
</button>

                        <div className="collapse navbar-collapse justify-content-center d-none d-lg-flex">
                            <ul className="navbar-nav">
                                <li className="nav-item" data-aos="fade-left" data-aos-delay="100">
                                    <NavLink
                                        to="/"
                                        end
                                        className={({ isActive }) =>
                                            isActive ? "nav-link active-menu" : "nav-link"
                                        }
                                    >
                                        Home
                                    </NavLink>
                                </li>

                                <li className="nav-item" data-aos="fade-left" data-aos-delay="150">
                                    <NavLink end
                                        className={({ isActive }) =>
                                            isActive ? "nav-link active-menu" : "nav-link"
                                        } to="/about">About Us</NavLink>
                                </li>
                                <li
                                    className="nav-item dropdown"
                                    data-aos="fade-left"
                                    data-aos-delay="200"
                                >
                                    <a
                                        className="nav-link dropdown-toggle"
                                        href="#"
                                        id="servicesDropdown"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        Services
                                    </a>

                                    <ul className="dropdown-menu">
                                        <li>
                                            <Link className="dropdown-item" to="/services/pcb-supplier">
                                                PCB Supplier
                                            </Link>
                                        </li>

                                        <li>
                                            <Link className="dropdown-item" to="/services/pcb-cam-services">
                                                PCB CAM Services
                                            </Link>
                                        </li>

                                        <li>
                                            <Link className="dropdown-item" to="/services/pcb-layout-and-design">
                                                PCB Layout & Design
                                            </Link>
                                        </li>

                                    </ul>
                                </li>
                                <li className="nav-item" data-aos="fade-left" data-aos-delay="300">
                                    <NavLink end
                                        className={({ isActive }) =>
                                            isActive ? "nav-link active-menu" : "nav-link"
                                        } to="/why-choose">Why Us?</NavLink>
                                </li>
                                <li className="nav-item" data-aos="fade-left" data-aos-delay="350">
                                    <NavLink end
                                        className={({ isActive }) =>
                                            isActive ? "nav-link active-menu" : "nav-link"
                                        } to="/contact">Contact Us</NavLink>
                                </li>

                                <li className="nav-item" data-aos="fade-left" data-aos-delay="400">
                                    {customer && (
                                        <NavLink
                                            to="/customer/profile"
                                            end
                                            className={({ isActive }) =>
                                                isActive ? "nav-link active-menu" : "nav-link"
                                            }
                                        >
                                            Profile
                                        </NavLink>
                                    )}
                                </li>
                                <li className="nav-item" data-aos="fade-left" data-aos-delay="400">
                                    <NavLink
                                        to="/order-now"
                                        end
                                        className={({ isActive }) =>
                                            isActive ? "nav-link order-now-blink" : "nav-link order-now-blink"
                                        }
                                    >
                                        Order Now
                                    </NavLink>

                                </li>
                                {!customer && (
                                    <li
                                        className="nav-item"
                                        data-aos="fade-left"
                                        data-aos-delay="450"
                                    >
                                        <NavLink
                                            end
                                            className={({ isActive }) =>
                                                isActive ? "nav-link active-menu" : "nav-link"
                                            }
                                            to="/login"
                                        >
                                            Login
                                        </NavLink>
                                    </li>
                                )}

                                <li className="nav-item" data-aos="fade-left" data-aos-delay="500">
                                    <NavLink end
                                        className={({ isActive }) =>
                                            isActive ? "nav-link active-menu" : "nav-link"
                                        } to="/cart"><i class="fa-solid fa-cart-shopping fs-4"></i></NavLink>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </div >
            </section >

            {/* <div className="offcanvas offcanvas-start mobile-offcanvas" tabIndex="-1" id="mobileMenu"> */}
            <div
    className={`offcanvas offcanvas-start mobile-offcanvas ${
        mobileMenuOpen ? "show" : ""
    }`}
    tabIndex="-1"
    id="mobileMenu"
    style={{
        visibility: mobileMenuOpen ? "visible" : "hidden"
    }}
>
                <div className="offcanvas-header" style={{ backgroundColor: "red" }}>
                    <img src="assets/images/nav-logo.png" width="100" alt="Logo" />

                    {/* <button
                        type="button"
                        className="btn-close text-light"
                        data-bs-dismiss="offcanvas"
                        aria-label="Close"
                    ></button> */}
                    <button
    type="button"
    className="btn-close"
    onClick={closeMobileMenu}
    aria-label="Close"
></button>
                </div>

                <div className="offcanvas-body">
                    <ul className="mobile-menu">
                        <li >
                            <Link to="/" onClick={closeMobileMenu}>Home</Link>
                        </li>
                        <li>
                            <Link to="/about" onClick={closeMobileMenu}>About Us</Link>
                        </li>
                        <li>
                            <div
                                className="mobile-title d-flex justify-content-between align-items-center"
                                onClick={() => setServiceOpen(!serviceOpen)}
                                style={{ cursor: "pointer" }}
                            >
                                <span>Services</span>
                                <span>{serviceOpen ? "−" : "+"}</span>
                            </div>
                                        
                            <ul className={`mobile-submenu ${serviceOpen ? "show" : ""}`}>
                                <li>
                                    <Link to="/services/pcb-supplier" onClick={closeMobileMenu}>
                                        PCB Supplier
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/services/pcb-cam-services" onClick={closeMobileMenu}>
                                        PCB CAM Services
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/services/pcb-layout-and-design" onClick={closeMobileMenu}>
                                        PCB Layout & Design
                                    </Link>
                                </li>

                            </ul>
                        </li>
                        <li >
                            <Link to="/why-choose" onClick={closeMobileMenu}>Why Us</Link>
                        </li>
                        <li >
                            <Link to="/contact" onClick={closeMobileMenu}>Contact Us</Link>
                        </li>
                        <li>
                            {customer ? (
                                <Link to="/customer/profile" onClick={closeMobileMenu}>Profile</Link>
                            ) : (
                                <Link to="/order-now" onClick={closeMobileMenu}>Order Now</Link>
                            )}
                        </li>
                        {!customer && (
                            <li>
                                <Link to="/login" onClick={closeMobileMenu}>Login Now</Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            <div
                className="modal fade certificate-popup"
                id="certificateModal"
                tabIndex="-1"
            >
                <div className="modal-dialog modal-dialog-centered modal-xl certificate-popup-dialog">
                    <div className="modal-content certificate-popup-content">

                        <button
                            type="button"
                            className="certificate-close"
                            data-bs-dismiss="modal"
                            onClick={() => setShowCertificate(false)}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>

                        <div className="certificate-popup-body">
                            <img
                                src={certificate}
                                alt="Certificate"
                                className="certificate-popup-image"
                            />
                        </div>

                    </div>
                </div>
            </div>


            {!showCertificate && !hideFloating && <FloatingContact />}

        </>
    );
};