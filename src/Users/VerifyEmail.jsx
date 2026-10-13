import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";

function VerifyEmail() {
    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || localStorage.getItem("pending_verify_email") || "";
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (!email) {
            toast.error("No pending verification found.");
            navigate("/login");
            return;
        }

        localStorage.setItem("pending_verify_email", email);

        const interval = setInterval(async () => {
            try {
                const res = await axios.post(`${BASE_URL}customer/checkVerifyStatus`, {
                    cust_email: email,
                });

                if (res.data && res.data.status && res.data.is_verified) {
                    clearInterval(interval);
                    toast.success("Email verified successfully!");

                    localStorage.removeItem("pending_verify_email");

                    localStorage.setItem("customer", JSON.stringify(res.data.customer));

                    navigate("/customer/profile");
                }
            } catch (err) {
                console.error("Verification check error", err);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [email, navigate]);

    // Resend Email Handler
    const handleResendMail = async () => {
        try {
            setResending(true);
            const res = await axios.post(`${BASE_URL}customer/resendVerification`, {
                cust_email: email,
            });

            if (res.data && res.data.status) {
                toast.success("Verification email resent successfully!");
            } else {
                toast.error(res.data.message || "Failed to resend email.");
            }
        } catch (err) {
            toast.error("Network error while resending email.");
        } finally {
            setResending(false);
        }
    };

    return (
        <>
            {/* ----------------- INLINE INTERNAL STYLES ----------------- */}
            <style>{`
        .px-verify-wrapper {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #e6eaf1 0%, #e6eaf1 100%);
          padding: 20px;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .px-verify-card {
          background: rgba(255, 255, 255, 0);
          border-radius: 16px;
          padding: 40px 30px;
          max-width: 440px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          border: 1px solid rgb(255, 255, 255);
          animation: pxFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes pxFadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .px-verify-icon-box {
          width: 72px;
          height: 72px;
          background: rgba(215, 25, 32, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: #d71920;
        }

        .px-mail-icon {
          width: 36px;
          height: 36px;
        }

        .px-verify-title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 12px;
        }

        .px-verify-desc {
          font-size: 15px;
          color: #475569;
          line-height: 1.5;
          margin-bottom: 8px;
        }

        .px-email-highlight {
          color: #d71920;
          font-weight: 600;
          word-break: break-all;
        }

        .px-verify-subtext {
          font-size: 13px;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 25px;
        }

        .px-status-box {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 10px 18px;
          border-radius: 30px;
          margin-bottom: 25px;
        }

        .px-pulse-ring {
          width: 10px;
          height: 10px;
          background-color: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          animation: pxPulse 1.8s infinite;
        }

        @keyframes pxPulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }

        .px-status-text {
          font-size: 13px;
          color: #334155;
          font-weight: 500;
        }

        .px-verify-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .px-resend-btn {
          width: 100%;
          padding: 12px 20px;
          background: #d71920;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .px-resend-btn:hover:not(:disabled) {
          background: #b9151b;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(215, 25, 32, 0.25);
        }

        .px-resend-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .px-back-btn {
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 8px;
          transition: color 0.2s;
        }

        .px-back-btn:hover {
          color: #0f172a;
        }

        .px-btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid #ffffff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: pxSpin 0.6s linear infinite;
        }

        @keyframes pxSpin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

            {/* ----------------- COMPONENT UI ----------------- */}
            <div className="px-verify-wrapper">
                <div className="px-verify-card">
                    {/* Email Icon */}
                    <div className="px-verify-icon-box">
                        <svg
                            className="px-mail-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.8}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                    </div>

                    <h2 className="px-verify-title">Verify Your Email</h2>

                    <p className="px-verify-desc">
                        We sent a verification link to <br />
                        <strong className="px-email-highlight">{email}</strong>
                    </p>

                    <p className="px-verify-subtext">
                        Please check your inbox and click the verification button. This page will automatically update once verified.
                    </p>

                    {/* Status Live Pulse */}
                    <div className="px-status-box">
                        <div className="px-pulse-ring"></div>
                        <span className="px-status-text">Checking status automatically...</span>
                    </div>

                    {/* Resend & Back Actions */}
                    <div className="px-verify-actions">
                        <button
                            type="button"
                            onClick={handleResendMail}
                            disabled={resending}
                            className="px-resend-btn"
                        >
                            {resending ? (
                                <>
                                    <span className="px-btn-spinner"></span> Sending...
                                </>
                            ) : (
                                "Resend Verification Email"
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                localStorage.removeItem("pending_verify_email");
                                navigate("/login");
                            }}
                            className="px-back-btn"
                        >
                            Back to Sign In
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default VerifyEmail;