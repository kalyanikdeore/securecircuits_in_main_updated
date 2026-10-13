import axios from "axios";
import { Link, NavLink } from "react-router-dom";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";
import Delete from "../Config/Delete";
import * as Yup from "yup";
import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import "./style.css"

function Saved() {
    const [saveData, setsaveData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUndoModal, setShowUndoModal] = useState(false);
    const [removedQuote, setRemovedQuote] = useState(null);

    const customer = JSON.parse(localStorage.getItem("customer"));
    const CustId = customer?.cust_id;


    useEffect(() => {
        getsaveData();
    }, []);


    // Save All Data Get Function
    const getsaveData = async () => {

        setLoading(true);

        try {
            const response = await axios.get(`${BASE_URL}admin/getdatawhere/tbl_save_quote/save_cust_id/${CustId}`);

            if (response.data.status) {

                const activeQuotes = response.data.data.filter(
                    item => Number(item.save_status) === 1
                );

                setsaveData(activeQuotes);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };


    const unsaveQuote = async (id) => {
        try {

            const response = await axios.post(
                `${BASE_URL}customer/updatedata/tbl_save_quote/save_id/${id}`,
                {
                    save_status: 0
                }
            );

            if (response.data.status) {

                // Removed Quote ID Store
                setRemovedQuote(id);

                // Card UI madhun remove kara
                setsaveData((prev) =>
                    prev.filter((item) => item.save_id !== id)
                );

                // Popup Open
                setShowUndoModal(true);

            }

        } catch (error) {
            toast.error("Something Went Wrong");
        }
    };

    const undoQuote = async () => {

        try {

            const response = await axios.post(
                `${BASE_URL}customer/updatedata/tbl_save_quote/save_id/${removedQuote}`,
                {
                    save_status: 1
                }
            );

            if (response.data.status) {

                toast.success("Quote Restored");

                setShowUndoModal(false);

                getsaveData();
            }

        } catch (error) {

            toast.error("Something Went Wrong");

        }

    };


    const saveQuote = async (id) => {
        try {
            const response = await axios.post(
                `${BASE_URL}customer/updatedata/tbl_save_quote/save_id/${id}`,
                {
                    save_status: 1
                }
            );

            if (response.data.status) {
                toast.success("Quote Saved From Removed");
                getsaveData();
            }

        } catch (error) {
            toast.error("Something Went Wrong");
        }
    };

    return (
        <>
            <div className="container-fluid px-3 px-lg-4 py-4">
                <div className="page-heading">
                    <div className="page-heading-copy">
                        <span className="page-icon">
                            <i className="bi bi-people text-success" aria-hidden="true"></i>
                        </span>
                        <div>
                            <p className="eyebrow mb-1 text-success">All</p>
                            <h1 className="h3 mb-1">Saved Cart</h1>
                        </div>
                    </div>
                </div>

                <section className="panel">
                    <div className="panel-header d-flex flex-wrap align-items-center justify-content-end gap-2">
                        <Link to="/order-now"
                            className="btn btn-outline-success"
                            type="button"
                        >
                            <i className="bi bi-plus"></i> New Card{" "}
                        </Link>
                    </div>
                    <div className="sc-save-wrapper">
                        {loading ? (
                            <div className="row g-4">
                                {[...Array(8)].map((_, index) => (
                                    <div className="col-lg-3 col-md-6" key={index}>
                                        <div className="sc-save-card">
                                            <div className="sc-loader-top">
                                                <div className="sc-loader-circle sc-shimmer"></div>
                                                <div className="sc-loader-btn sc-shimmer"></div>
                                            </div>

                                            <div className="sc-loader-title sc-shimmer"></div>

                                            {[1, 2, 3].map((i) => (
                                                <div className="sc-loader-row" key={i}>
                                                    <div className="sc-loader-left sc-shimmer"></div>
                                                    <div className="sc-loader-right sc-shimmer"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : saveData.length > 0 ? (
                            <div className="row g-4">
                                {saveData.map((save) => (
                                    <div className="col-lg-3 col-md-6" key={save.save_id}>
                                        <div
                                            className={`sc-save-card ${save.save_status === "0" ? "sc-save-card-disabled" : ""
                                                }`}
                                        >
                                            <div className="sc-save-top">

                                                <div
                                                    className="sc-save-icon"
                                                    onClick={() => {
                                                        if (save.save_status === "1" && save.save_quote_pdf) {
                                                            window.open(
                                                                `${BASE_URL}public/Uploads/${save.save_quote_pdf}`,
                                                                "_blank"
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <i className="bi bi-file-earmark-pdf-fill"></i>
                                                </div>

                                                {save.save_status === "1" ? (
                                                    <button
                                                        className="sc-save-unsave-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            unsaveQuote(save.save_id);
                                                        }}
                                                    >
                                                        <i className="bi bi-bookmark-x-fill me-1"></i>
                                                        Unsave
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="sc-save-save-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            saveQuote(save.save_id);
                                                        }}
                                                    >
                                                        <i className="bi bi-bookmark-check-fill me-1"></i>
                                                        Save
                                                    </button>
                                                )}

                                            </div>

                                            <div className="sc-save-body">

                                                <h5 className="sc-save-title">
                                                    {save.save_quote_name}
                                                </h5>

                                                <div className="sc-save-info">
                                                    <span>Quote PDF</span>
                                                    <strong>
                                                        {save.save_quote_pdf ? "Available" : "N/A"}
                                                    </strong>
                                                </div>

                                                <div className="sc-save-info">
                                                    <span>Created Date</span>
                                                    <strong>{save.save_created_date}</strong>
                                                </div>

                                                <div className="sc-save-info">
                                                    <span>Created Time</span>
                                                    <strong>
                                                        {new Date(
                                                            `1970-01-01T${save.save_created_time}`
                                                        ).toLocaleTimeString("en-IN", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                            hour12: true,
                                                        })}
                                                    </strong>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-danger fw-semibold py-5">
                                No Saved Quotes Found
                            </div>
                        )}
                    </div>
                </section>
            </div>


            {
                showUndoModal && (

                    <div className="model-add-edit-modal-overlay">

                        <div className="model-add-edit-modal-dialog model-size-sm">

                            <div className="model-add-edit-modal-content">

                                <div className="model-add-edit-modal-header">

                                    <h5 className="model-add-edit-modal-title">
                                        Quote Removed
                                    </h5>

                                </div>

                                <div className="model-add-edit-modal-body text-center">

                                    <i
                                        className="bi bi-bookmark-x-fill"
                                        style={{
                                            fontSize: "60px",
                                            color: "#f59e0b"
                                        }}
                                    ></i>

                                    <h5 className="mt-3">
                                        Quote Removed Successfully
                                    </h5>

                                    <p className="text-muted mb-0">
                                        This quote has been removed from your saved quotes.
                                    </p>

                                </div>

                                <div className="model-add-edit-modal-footer d-flex justify-content-between">

                                    <button
                                        className="model-add-edit-btn model-add-edit-btn-cancel"
                                        onClick={() => {

                                            setShowUndoModal(false);

                                        }}
                                    >
                                        Close
                                    </button>

                                    <button
                                        className="model-add-edit-btn model-add-edit-btn-save"
                                        onClick={undoQuote}
                                    >
                                        Undo
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                )
            }
        </>
    );
}

export default Saved;
