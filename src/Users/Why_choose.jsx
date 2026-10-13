import "../Users/Why_choose.css"
import * as Icons from "lucide-react";
import SEO from "../../Seo";
import { seoConfig } from "../Config/seoConfig";

export default function Why_choose() {

    return (
        <>
            <SEO
                title={seoConfig.user_why_choose.title}
                description={seoConfig.user_why_choose.description}
            />
            {/* ================= WHY CHOOSE US ================= */}
            <section className="contact-hero">
                <div className="contact-overlay">
                    <div className="container">
                        <div className="contact-content">

                            <h1>
                                WHY CHOOSE US
                            </h1>

                            <p>
                                We deliver high-quality PCB manufacturing solutions with precision, reliability, competitive pricing, and on-time delivery to support your projects from prototype to production.
                            </p>

                        </div>
                    </div>
                </div>
            </section>
            <section className="why-choose-section">
                <div className="container">

                    <div className="row g-4">

                        <div className="col-lg-3 col-md-6">
                            <div className="why-card">
                                <Icons.Trophy size={80} className="i" />
                                <div>
                                    <h4>20+ Years Experience</h4>
                                    <p>
                                        Over two decades of expertise in PCB manufacturing.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <div className="why-card">
                                <Icons.Zap size={80} className="i" />
                                <div>
                                    <h4>Quick Turn PCB</h4>
                                    <p>
                                        Prototype delivery available in 1 Day, 3 Days & 5 Days.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <div className="why-card">
                                <Icons.CircleCheckBig size={80} className="i" />
                                <div>
                                    <h4>Quality Assurance</h4>
                                    <p>
                                        100% Electrical Testing and strict quality inspection.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <div className="why-card">
                                <Icons.TruckElectric size={80} className="i" />
                                <div>
                                    <h4>On-Time Delivery</h4>
                                    <p>
                                        Committed delivery schedules for every order.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <div className="why-card">
                                <Icons.DollarSign size={80} className="i" />
                                <div>
                                    <h4>Competitive Pricing</h4>
                                    <p>
                                        Best value without compromising quality.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <div className="why-card">
                                <Icons.Headphones size={80} className="i" />
                                <div>
                                    <h4>Technical Support</h4>
                                    <p>
                                        Experienced engineering team for design and manufacturing support.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <div className="why-card">
                                <i className="fa-solid fa-boxes-stacked i"></i>
                                <div>
                                    <h4>Bulk Production</h4>
                                    <p>
                                        Capability to handle both prototype and volume production.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-3 col-md-6">
                            <div className="why-card">
                                <Icons.Handshake size={80} className="i" />
                                <div>
                                    <h4>Customer Satisfaction</h4>
                                    <p>
                                        Trusted by leading OEMs and industrial manufacturers.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </section>
        </>
    );
};
