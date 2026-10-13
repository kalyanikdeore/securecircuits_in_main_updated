import React, { useRef, useState, useLayoutEffect, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";

function StageDrawer({ open, onClose, order }) {
    const timelineRef = useRef(null);
    const activeItemRef = useRef(null);
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isMouseDown, setIsMouseDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const rawStageId = Number(order?.order_stage || 0);

    useEffect(() => {
        if (open) {
            setLoading(true);
            axios
                .get(`${BASE_URL}customer/getdatawhere/tbl_stages/stage_for/6`)
                .then((res) => {
                    if (res.data && res.data.status) {
                        const sortedData = (res.data.data || []).sort(
                            (a, b) => Number(a.stag_id) - Number(b.stag_id)
                        );
                        setStages(sortedData);
                    } else {
                        setStages([]);
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Error fetching stages:", err);
                    setStages([]);
                    setLoading(false);
                });
        }
    }, [open]);

    const activeStageObj = stages.find(
        (s) => Number(s.stag_id) >= rawStageId
    );

    const effectiveStageId = activeStageObj
        ? Number(activeStageObj.stag_id)
        : (stages.length > 0 ? Number(stages[stages.length - 1].stag_id) : 0);

    const activeIndex = rawStageId === 16
        ? stages.length
        : stages.findIndex((s) => Number(s.stag_id) === effectiveStageId);

    const [completedWidth, setCompletedWidth] = useState(0);
    const [activeWidth, setActiveWidth] = useState(0);

    useLayoutEffect(() => {
        if (open && timelineRef.current && stages.length > 0) {
            const items = timelineRef.current.querySelectorAll(".timeline-item");

            if (items.length > 0) {
                const targetIdx = rawStageId === 16 ? items.length - 1 : activeIndex;
                const activeItem = items[targetIdx < 0 ? 0 : targetIdx];
                const lastCompletedItem = rawStageId === 16 ? items[items.length - 1] : items[activeIndex - 1];

                if (activeItem) {
                    const actCenter = rawStageId === 16
                        ? activeItem.offsetLeft + activeItem.offsetWidth
                        : activeItem.offsetLeft + activeItem.offsetWidth / 2;
                    setActiveWidth(Math.max(0, actCenter -98));

                    activeItem.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "center",
                    });
                }

                if (lastCompletedItem) {
                    const compCenter = lastCompletedItem.offsetLeft + lastCompletedItem.offsetWidth / 2;
                    setCompletedWidth(Math.max(0, compCenter - 65));
                } else {
                    setCompletedWidth(0);
                }
            }
        }
    }, [open, order, stages, effectiveStageId, activeIndex, rawStageId]);

    const handleMouseDown = (e) => {
        setIsMouseDown(true);
        setStartX(e.pageX - timelineRef.current.offsetLeft);
        setScrollLeft(timelineRef.current.scrollLeft);
    };

    const handleMouseLeave = () => setIsMouseDown(false);
    const handleMouseUp = () => setIsMouseDown(false);

    const handleMouseMove = (e) => {
        if (!isMouseDown) return;
        e.preventDefault();
        const x = e.pageX - timelineRef.current.offsetLeft;
        const walk = (x - startX) * 1.8;
        timelineRef.current.scrollLeft = scrollLeft - walk;
    };

    return (
        <>
            <div
                className={`stage-backdrop ${open ? "show" : ""}`}
                onClick={onClose}
            />

            <div className={`stage-drawer ${open ? "open" : ""}`}>
                <div className="stage-header ">
                    <div>
                        <h4>PRODUCT TRACKING</h4>
                        <small>Order #{order?.order_code || "N/A"}</small>
                    </div>

                    <button className="stage-close" onClick={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="stage-body">
                    <div className="stage-summary">
                        <div className="summary-card">
                            <span>Order No</span>
                            <strong>{order?.order_code || "N/A"}</strong>
                        </div>

                        <div className="summary-card">
                            <div className="row">
                                <div className="col-md-6"><span>Order Date</span></div>
                                <div className="col-md-6"><span>Order Time</span></div>
                                <div className="col-md-6">
                                    <strong>{order?.order_request_date || "N/A"}</strong>
                                </div>
                                <div className="col-md-6">
                                    <strong>
                                        {order?.order_request_time
                                            ? new Date(`1970-01-01T${order.order_request_time}`).toLocaleTimeString(
                                                "en-IN",
                                                { hour: "2-digit", minute: "2-digit", hour12: true }
                                            )
                                            : "N/A"}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div className="summary-card">
                            <span>Current Stage</span>
                            <strong className={rawStageId === 16 ? "text-success" : "text-warning"}>
                                {rawStageId === 16
                                    ? "Completed"
                                    : (activeStageObj?.stag_track || order?.current_stage_name || "Pending")}
                            </strong>
                        </div>
                    </div>

                    <div className="timeline-section">
                        {loading ? (
                            <div className="text-center p-4">
                                <div className="spinner-border text-success" role="status"></div>
                                <p className="mt-2 text-muted">Loading Timeline...</p>
                            </div>
                        ) : (
                            <div
                                className="timeline-wrapper"
                                ref={timelineRef}
                                onMouseDown={handleMouseDown}
                                onMouseLeave={handleMouseLeave}
                                onMouseUp={handleMouseUp}
                                onMouseMove={handleMouseMove}
                            >
                                <div className="timeline-line"></div>

                                <div
                                    className="timeline-progress-line"
                                    style={{
                                        width: `${activeWidth}px`,
                                        backgroundColor: rawStageId === 16 ? "#28a745" : undefined, 
                                        "--completed-percent": rawStageId === 16
                                            ? "100%"
                                            : (activeWidth > 0 ? `${(completedWidth / activeWidth) * 100}%` : "0%")
                                    }}
                                ></div>
                                {stages.map((stage, index) => {
                                    const isCurrent = rawStageId !== 16 && activeIndex !== -1 && index === activeIndex;
                                    const isCompleted = rawStageId === 16 || (activeIndex !== -1 && index < activeIndex);

                                    return (
                                        <div
                                            key={stage.stag_id}
                                            className={`timeline-item ${isCurrent ? "active" : isCompleted ? "completed" : ""}`}
                                            ref={isCurrent ? activeItemRef : null}
                                        >
                                            <div className="timeline-circle">
                                                <i className={stage.stage_icon || "fa-solid fa-circle"}></i>
                                            </div>
                                            <h6>{stage.stag_track}</h6>
                                            <small>
                                                {isCurrent
                                                    ? "Active"
                                                    : isCompleted
                                                        ? "Completed"
                                                        : "Pending"}
                                            </small>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default StageDrawer;