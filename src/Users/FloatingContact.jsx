import "../Users/FloatingContact.css";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import { useEffect, useState } from "react";


export default function FloatingContact () {

    const [info, setInfo] = useState({});

    useEffect(() => {
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
            {/* Phone */}
            <div className="phone-contact">
                <a href={`tel:+91${info?.info_mobile}`} className="floating-item phone">
                    <span className="floating-text">
                        +91 {info?.info_mobile}
                    </span>

                    <span className="floating-icon">
                        <i className="fa-solid fa-phone"></i>
                    </span>
                </a>
            </div>

            {/* WhatsApp */}
            <div className="whatsapp-contact">
                <a
                    href={`https://wa.me/91${info?.info_whatsapp}?text=Hello%20I%20am%20enquiring%20from%20your%20website.`}
                    className="floating-item whatsapp"
                    target="_blank"
                    rel="noreferrer"
                >
                    <span className="floating-text">
                        Chat on WhatsApp
                    </span>

                    <span className="floating-icon">
                        <i className="fa-brands fa-whatsapp"></i>
                    </span>
                </a>
            </div>
        </>
    );
};
