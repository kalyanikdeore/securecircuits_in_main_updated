import { useParams } from "react-router-dom";
import "../Users/Services.css";
import single from "../../public/assets/images/Single-layer.png"
import double from "../../public/assets/images/double-layers.png"
import multi from "../../public/assets/images/multi-layer.png"
import cam from "../../public/assets/images/cam-service.png"
import layout from "../../public/assets/images/pcm-layout.png"
import assembly from "../../public/assets/images/assembly-services.png"
import SEO from "../../Seo";
import { seoConfig } from "../Config/seoConfig";

export default function Services() {

    const { service } = useParams();

    return (
        <>

            {service === "pcb-supplier" && (
                <>
                    <SEO
                        title={seoConfig.service_pcb_supplier.title}
                        description={seoConfig.service_pcb_supplier.description}
                    />
                    <section className="contact-hero">
                        <div className="contact-overlay">
                            <div className="container">
                                <div className="contact-content">

                                    <h1>
                                        PCB SUPPLIER
                                    </h1>

                                    <p>
                                        Secure Circuit supplies high-quality printed circuit boards for prototypes, small batches, and large-scale production. We deliver precision-manufactured PCBs with consistent quality, competitive pricing, and on-time delivery.
                                    </p>

                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="pcbservice-main-section">

                        <div className="pcbservice-container">

                            <div className="pcbservice-intro">
                                <p>Secure Circuits is a focused, responsive and dependable PCB Manufacturing Services provider specializing in small to medium batch production. Excellent communications and a friendly, approachable trading style are at the core of the company’s ethos.</p>

                                <p>Secure Circuits have a very strong and good relationship in the Indian PCB manufacturing market, which we have achieved by working in the best companies manufacturing Indian PCB. From reputed companies of PCB manufacturing in India, we provide our customers with competitive PCBs at a competitive price as decided by the customers.</p>

                                <p>Secure Circuits are always committed to providing the product at its quality, time and chi pest rate.
                                </p>

                                <b>We tailor our services to meet your exact requirements. Typical service levels are:</b>

                                <ul className="pcbservice-list">
                                    <li>*Get Request for Quotation</li>
                                    <li>*Provide Quotations</li>
                                    <li>*Committed Date of Delivery</li>
                                    <li>*Supply PCB at committed date of delivery.n</li>
                                </ul>

                                <p>We supply and manage different types of PCB as per customer requirements…</p>
                            </div>

                            <h2 className="pcbservice-heading">
                                We are supplier of
                            </h2>

                            <div className="pcbservice-grid">

                                <div className="pcbservice-card">
                                    <div className="row ">
                                        <div className="col-md-6 text-center order-1 order-md-1"><img src={single} alt="" /></div>


                                        <div className=" col-md-6 order-2 order-md-2">
                                            <div className="pcbservice-content text-start">
                                                <h3>Single Layer PCB</h3>
                                                <p><strong>Material :</strong> FFR4, CEM1, FR1, CEM3, METAL CORE</p>
                                                <p><strong>Thickness :</strong> 0.8mm, 1.0mm, 1.2mm, 1.6mm, 2.0mm and 2.4mm</p>
                                                <p><strong>Copper Thickness :</strong> 18-0micon, 35-0micron</p>
                                                <p><strong>Surface Finish :</strong> Lacquer, OSP, HASL, Lead Free HASL and Roller Tinning.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pcbservice-card">

                                    <div className="row">
                                        <div className=" col-md-6 order-2 order-md-1">
                                            <div className="pcbservice-content second-pcmserv text-start">
                                                <h3>Double Layers PCB</h3>
                                                <p><strong>Material :</strong> FR4</p>
                                                <p><strong>Thickness :</strong> 0.8mm, 1.0mm, 1.2mm, 1.6mm, 2.0mm and 2.4mm</p>
                                                <p><strong>Copper Thickness :</strong>  18-18micon, 35-35micron, 70-70micron</p>
                                                <p><strong>Surface Finish :</strong>  HASL, Lead Free HASL and Soft & Hard Gold Finish.</p>
                                                <p><strong>Others :</strong>  Carbon, Peel able Mask, Gold Finger</p>
                                            </div>
                                        </div>
                                        <div className="col-md-6 text-center order-1 order-md-2"><img src={double} alt="" /></div>
                                    </div>

                                </div>

                                <div className="pcbservice-card">

                                    <div className="row">
                                        <div className="col-md-6 text-center"><img src={multi} alt="" /></div>

                                        <div className=" col-md-6">
                                            <div className="pcbservice-content text-start">
                                                <h3>Multi-Layer PCB (up to 8 Layers)</h3>
                                                <p><strong>Material :</strong> FR4</p>
                                                <p><strong>Thickness :</strong> 1.6mm</p>
                                                <p><strong>Copper Thickness :</strong> 18-18micron, 35-35micron, 70-70micron</p>
                                                <p><strong>Surface Finish :</strong> HASL, Lead Free HASL and Soft & Hard Gold Finish</p>
                                                <p><strong>Others :</strong> Carbon, Peel able Mask, Gold Finger</p>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>
                </>
            )}

            {service === "pcb-cam-services" && (
                <>
                    <SEO
                        title={seoConfig.service_pcb_cam_services.title}
                        description={seoConfig.service_pcb_cam_services.description}
                    />
                    <section className="contact-hero">
                        <div className="contact-overlay">
                            <div className="container">
                                <div className="contact-content">

                                    <h1>
                                        PCB CAM SERVICES
                                    </h1>

                                    <p>
                                        Secure Circuit provides expert PCB CAM services to optimize your design files for flawless manufacturing. We verify, refine, and prepare production-ready data to ensure precision, quality, and faster fabrication.
                                    </p>

                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="pcbservice-main-section">
                        <div className="pcbservice-container">
                            <div className="pcbservice-grid">
                                <div className="pcbservice-card">
                                    <div className="row ">
                                        <div className="col-md-6 d-flex justify-content-center align-items-center">
                                            <img src={cam} alt="" className="single-image" />
                                        </div>
                                        <div className=" col-md-6">
                                            <div className="pcbservice-content">
                                                <p>A dedicated team of PCB CAM engineers who will work only for you. They use your own CAM rules, processes and settings. They are lead by a Team Leader you have met face to face.</p>
                                                <p> A stable long-term relationship you can build with confidence into your expansion business plans.</p>
                                                <p>We tailor our services to meet your exact requirements. Typical service levels are:</p>
                                                <ul className="pcbservice-list">
                                                    <li>*PCB Gerber Data analysis</li>
                                                    <li>*Single image preparation</li>
                                                    <li>*Penalization</li>
                                                    <li>*Complete output of all tooling and test data.</li>
                                                </ul>
                                                <p>We have a well-documented CAM procedure.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}

            {service === "pcb-layout-and-design" && (
                <>
                    <SEO
                        title={seoConfig.service_pcb_layout_and_design.title}
                        description={seoConfig.service_pcb_layout_and_design.description}
                    />
                    <section className="contact-hero">
                        <div className="contact-overlay">
                            <div className="container">
                                <div className="contact-content">

                                    <h1>
                                        PCB LAYOUT AND DESIGN
                                    </h1>

                                    <p>
                                        Secure Circuit delivers high-precision PCB layout and design solutions tailored to your product requirements. From concept to manufacturing-ready designs, we ensure optimal performance, signal integrity, and manufacturability.
                                    </p>

                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="pcbservice-main-section">
                        <div className="pcbservice-container">
                            <div className="pcbservice-grid">
                                <div className="pcbservice-card">
                                    <div className="row ">
                                        <div className="col-md-6 d-flex justify-content-center align-items-center">
                                            <img src={layout} alt="" className="single-image" />
                                        </div>


                                        <div className=" col-md-6">
                                            <div className="pcbservice-content">
                                                <p>Printed circuit board (PCB) layout and design services is one of the ways that we help our customers get to market faster as our engineering team has significant real world experience designing PCBs for performance and manufacturability.</p>
                                                <p>Our strong PCB Design team allows us to quickly get customers full Gerber and drawing packages if you require a PCB layout from design schematics you have created.</p>
                                                <p>Have an existing design that needs to be updated, changed, or optimized for cost effective assembly.</p>
                                                <p>Need a new PCB design, from concept (schematics/BOM) to creation (full PCB documentation).</p>
                                                <p>Our team of PCB CAD engineers is available to discuss any project needs that our customer may have as we are fully licensed and utilize industry leading tools.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}

            {service === "pcb-assembly-services" && (
                <>
                    <SEO
                        title={seoConfig.service_pcb_assembly_services.title}
                        description={seoConfig.service_pcb_assembly_services.description}
                    />
                    <section className="contact-hero">
                        <div className="contact-overlay">
                            <div className="container">
                                <div className="contact-content">

                                    <h1>
                                        PCB ASSEMBLY SERVICES
                                    </h1>

                                    <p>
                                        From prototype to mass production, Secure Circuit delivers precision PCB assembly with advanced manufacturing processes, strict quality control, and on-time delivery for every project.
                                    </p>

                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="pcbservice-main-section">
                        <div className="pcbservice-container">
                            <div className="pcbservice-grid">
                                <div className="pcbservice-card">
                                    <div className="row ">
                                        <div className="col-md-6 d-flex justify-content-center align-items-center">
                                            <img src={assembly} alt="" className="single-image" />
                                        </div>


                                        <div className=" col-md-6">
                                            <div className="pcbservice-content">
                                                <p>Secure Circuits offers full and partial Circuit Board Assembly Services. We focus on rigid PCB Assembly. Our quality driven PCB assembly process ensures that your finished project is of the highest quality.</p>
                                                <p>Quote for Circuit Board Assembly (PCBA) Services.</p>
                                                <ul className="pcbservice-list">
                                                    <li>1. PCBs Quote: You can reach us through contact us.</li>
                                                    <li>2. BOM Pricing: Send your BOM (Bill of Materials) through contact us, we will email you the BOM price in 24 hours. BOM must include the quantities, reference designators, and manufacturer name and manufacturer part number.</li>
                                                </ul>
                                                <p>Assembly Types</p>
                                                <ul className="pcbservice-list">
                                                    <li>* Surface mount</li>
                                                    <li>* Thro-hole</li>
                                                    <li>* Mixed technology (SMT & Thru-hole)</li>
                                                    <li>* Single or double sided placement</li>
                                                </ul>
                                                <p>We are ready to provide you with a high-quality, one-stop-shop experience for any and all of your PCB assembly requirements. PCB assembly services by submitting a little basic information on your project. If you need more information about any of our services or processes please go through contact us. We’ll be happy to answer them.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </>
    );
}