import React, { useState, useEffect } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export const getOrSetCookieToken = async () => {
    let token = localStorage.getItem("pcb_cart_cookie_token");

    if (!token) {
        try {
            const fp = await FingerprintJS.load();
            const result = await fp.get();

            token = "COOKIE_SESS_" + result.visitorId;
            localStorage.setItem("pcb_cart_cookie_token", token);
        } catch (error) {
            console.error("Fingerprint generation failed:", error);
            token = "COOKIE_SESS_" + Date.now();
            localStorage.setItem("pcb_cart_cookie_token", token);
        }
    }
    return token;
};

export default function CookieBanner() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        
        const isAccepted = localStorage.getItem("cookiesAccepted");
        if (!isAccepted) {
            setShowBanner(true);
        }
    }, []);

    const handleAccept = async () => {
        await getOrSetCookieToken();
        localStorage.setItem("cookiesAccepted", "true");
        setShowBanner(false);
        window.dispatchEvent(new Event("cookieAccepted"));
    };

    if (!showBanner) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.banner}>
                <div style={styles.header}>
                    <h4 style={styles.title}>Cookie Consent</h4>
                </div>
                <p style={styles.text}>
                    We use cookies to save your PCB quotation configurations and ensure seamless cart management. Please accept to proceed.
                </p>
                <button onClick={handleAccept} style={styles.button}>
                    Accept & Continue
                </button>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        zIndex: 99999,
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-end",
        pointerEvents: "auto",
    },
    banner: {
        position: "fixed",
        bottom: "20px",
        left: "20px",
        width: "340px",
        backgroundColor: "#ffffff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        fontFamily: "Arial, sans-serif",
        border: "1px solid #e2e8f0",
    },
    header: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "8px",
    },
    cookieIcon: {
        fontSize: "20px",
    },
    title: {
        margin: 0,
        color: "#0f172a",
        fontSize: "18px",
        fontWeight: "bold",
    },
    text: {
        fontSize: "13px",
        color: "#475569",
        marginBottom: "16px",
        lineHeight: "1.5",
    },
    button: {
        backgroundColor: "#d71920",
        color: "#ffffff",
        border: "none",
        padding: "10px 18px",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
        width: "100%",
    },
};