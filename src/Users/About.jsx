import "../Users/About.css";
import SEO from "../../Seo";
import { seoConfig } from "../Config/seoConfig";

export default function About() {

    return (
        <>
            <SEO
                title={seoConfig.user_about.title}
                description={seoConfig.user_about.description}
            />
            <section className="contact-hero">
                <div className="contact-overlay">
                    <div className="container">
                        <div className="contact-content">

                            <h1>
                                ABOUT US
                            </h1>

                            <p>We are a trusted PCB manufacturing company specializing in high-quality PCB fabrication, assembly, and prototyping. With advanced technology, skilled professionals, and a commitment to excellence, we deliver reliable and cost-effective solutions for industries worldwide.
                            </p>

                        </div>
                    </div>
                </div>
            </section>
            <section className="about-section bg-light py-5">
                <div className="container">
                    <div className="row align-items-center">

                        {/* Left Content */}
                        <div className="col-lg-7 mb-4 mb-lg-0">
                            <span className="about-tag">ABOUT US</span>

                            <h2 className="about-title">
                                Powering Innovation <br />
                                Through Precision
                            </h2>

                            <p className="about-text">
                                Secure Circuits is a leading Printed Circuit Board (PCB)
                                manufacturing company with over 20 years of industry expertise.
                                We specialize in Single-Sided, Double-Sided, Multilayer, HDI,
                                and Metal Core PCBs, delivering high-quality solutions for a
                                wide range of industries.
                            </p>

                            <p className="about-text">
                                From prototype development to mass production, we provide reliable
                                PCB manufacturing and CAM engineering services tailored to customer
                                requirements. Our commitment to quality, innovation, and timely
                                delivery has made us a trusted partner for businesses across India
                                and beyond.
                            </p>

                            <div className="about-features">

                                <div className="about-feature-item">
                                    <div className="about-feature-icon">
                                        <i className="fa-solid fa-microchip"></i>
                                    </div>
                                    <span>High Quality PCBs</span>
                                </div>

                                <div className="about-feature-item">
                                    <div className="about-feature-icon">
                                        <i className="fa-solid fa-truck-fast"></i>
                                    </div>
                                    <span>On-Time Delivery</span>
                                </div>

                                <div className="about-feature-item">
                                    <div className="about-feature-icon">
                                        <i className="fa-solid fa-users-gear"></i>
                                    </div>
                                    <span>Expert Engineering Team</span>
                                </div>

                                <div className="about-feature-item">
                                    <div className="about-feature-icon">
                                        <i className="fa-solid fa-user-check"></i>
                                    </div>
                                    <span>Customer-Focused Approach</span>
                                </div>

                            </div>
                        </div>

                        {/* Right Image */}
                        <div className="col-lg-5 text-center">
                            <img
                                src="assets/images/about.png"
                                alt="About"
                                className="img-fluid about-img"
                            />
                        </div>

                    </div>
                </div>
            </section>

            <section className="experience-section">
                <div className="container">
                    <div className="experience-card">
                        <div className="row align-items-center">

                            {/* Left */}
                            <div className="col-lg-6 text-center">
                                <img
                                    src="assets/images/about20.png"
                                    alt="20 Years"
                                    className="experience-img"
                                />
                            </div>

                            {/* Right */}
                            <div className="col-lg-6">
                                <h2 className="experience-title">
                                    20+ Years Experience And Growing...
                                </h2>

                                <p>
                                    For more than two decades, Secure Circuits has been delivering
                                    world-class PCB manufacturing solutions. Our journey is built on
                                    innovation, precision engineering, and customer satisfaction.
                                </p>

                                <p>
                                    We continuously invest in advanced manufacturing technologies and
                                    quality systems to ensure every PCB meets international standards.
                                    Today, we proudly serve customers across Automotive,
                                    Telecommunications, Industrial Automation, Medical Electronics,
                                    Defence, Energy, and Consumer Electronics sectors.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            <section className="who-we-are-section bg-light">
                <div className="container ">
                    <div className="row align-items-center">

                        {/* Left Image */}
                        <div className="col-lg-6 mb-4 mb-lg-0">
                            <div className="who-image-box">

                                <img
                                    src="assets/images/about-pcb-partner.png"
                                    alt="Company"
                                    className="who-image img-fluid"
                                />

                                <div className="who-counter">

                                    <div className="counter-box">
                                        <i className="fa-solid fa-shield-halved"></i>

                                        <div>
                                            <h3>20+</h3>
                                            <p>Years of Experience</p>
                                        </div>
                                    </div>

                                    <div className="counter-box">
                                        <i className="fa-solid fa-users"></i>

                                        <div>
                                            <h3>500+</h3>
                                            <p>Happy Clients</p>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </div>

                        {/* Right Content */}

                        <div className="col-lg-6">

                            <h5 className="who-tag">
                                WHO WE ARE
                            </h5>

                            <h2 className="who-title">
                                Your Trusted PCB
                                Partner
                            </h2>

                            <p>
                                We are the supplier of Single-Sided, Double-Sided, Multilayer,
                                HDI, and Metal Core PCBs serving industries such as
                                telecommunications, healthcare, defense, automotive, lighting,
                                energy, and industrial electronics.
                            </p>

                            <p>
                                Secure Circuits is dedicated to delivering high-quality Printed
                                Circuit Boards and CAM engineering services to the electronics
                                industry. We provide reliable solutions that help customers
                                achieve faster, more efficient, and cost-effective product
                                development.
                            </p>

                            <p>
                                As a professional PCB manufacturer, we specialize in quick-turn
                                prototypes, low-to-medium volume production, and custom PCB
                                solutions.
                            </p>

                        </div>

                    </div>
                </div>
            </section>

            <section className="mission-section">
                <div className="container">

                    <div className="text-center mission-heading">

                        <h2>OUR MISSION AND VISION</h2>

                        <div className="heading-line"></div>

                        <p>
                            Empowering Innovation Through Reliable, Efficient PCB Solutions,
                            And Revolutionizing Electronic Manufacturing For A Sustainable Future.
                        </p>

                    </div>

                    <div className="row justify-content-center g-4 mt-4">

                        {/* Mission */}

                        <div className="col-lg-5 col-md-6">

                            <div className="mission-card">

                                <div className="mission-top">

                                    <div className="mission-icon">
                                        <i className="fa-solid fa-bullseye"></i>
                                    </div>

                                    <h3>OUR MISSION</h3>

                                </div>

                                <p>
                                    To manufacture high-quality Printed Circuit Boards with precision,
                                    competitive pricing, and reliable delivery while providing
                                    exceptional customer service that exceeds expectations.
                                </p>

                            </div>

                        </div>

                        {/* Vision */}

                        <div className="col-lg-5 col-md-6">

                            <div className="mission-card">

                                <div className="mission-top">

                                    <div className="mission-icon">
                                        <i className="fa-solid fa-medal"></i>
                                    </div>

                                    <h3>OUR VISION</h3>

                                </div>

                                <p>
                                    To become India's most trusted PCB manufacturing partner by
                                    delivering innovative, sustainable, and technologically advanced
                                    PCB solutions for global industries.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>
            </section>

            <section className="core-values-section bg-light">
                <div className="container">

                    <div className="text-center value-heading">
                        <h2>OUR CORE VALUES</h2>
                        <div className="value-line"></div>
                    </div>

                    <div className="row g-4 mt-4">

                        {/* Quality First */}
                        <div className="col-lg-4 col-md-6">
                            <div className="value-card">
                                <div className="value-icon">
                                    <i className="fa-solid fa-award"></i>
                                </div>

                                <h3>Quality First</h3>

                                <p>
                                    Every PCB is manufactured under strict quality control
                                    processes to ensure reliability and performance.
                                </p>
                            </div>
                        </div>

                        {/* Customer Commitment */}
                        <div className="col-lg-4 col-md-6">
                            <div className="value-card">
                                <div className="value-icon">
                                    <i className="fa-solid fa-handshake"></i>
                                </div>

                                <h3>Customer Commitment</h3>

                                <p>
                                    We focus on understanding customer requirements and
                                    delivering solutions that create long-term value.
                                </p>
                            </div>
                        </div>

                        {/* Integrity */}
                        <div className="col-lg-4 col-md-6">
                            <div className="value-card">
                                <div className="value-icon">
                                    <i className="fa-solid fa-shield-halved"></i>
                                </div>

                                <h3>Integrity</h3>

                                <p>
                                    We maintain transparency, honesty, and professionalism
                                    in every project and partnership.
                                </p>
                            </div>
                        </div>

                        {/* Continuous Improvement */}
                        <div className="col-lg-4 col-md-6">
                            <div className="value-card">
                                <div className="value-icon">
                                    <i className="fa-solid fa-gear"></i>
                                </div>

                                <h3>Continuous Improvement</h3>

                                <p>
                                    We constantly improve our processes, technologies,
                                    and services to stay ahead in the industry.
                                </p>
                            </div>
                        </div>

                        {/* Innovation */}
                        <div className="col-lg-4 col-md-6">
                            <div className="value-card">
                                <div className="value-icon">
                                    <i className="fa-solid fa-lightbulb"></i>
                                </div>

                                <h3>Innovation</h3>

                                <p>
                                    We embrace modern manufacturing technologies and
                                    engineering excellence to deliver better solutions.
                                </p>
                            </div>
                        </div>

                        {/* Teamwork */}
                        <div className="col-lg-4 col-md-6">
                            <div className="value-card">
                                <div className="value-icon">
                                    <i className="fa-solid fa-users"></i>
                                </div>

                                <h3>Teamwork</h3>

                                <p>
                                    Our skilled professionals work together to achieve
                                    operational excellence and customer success.
                                </p>
                            </div>
                        </div>

                    </div>

                </div>
            </section>
        </>
    );
};