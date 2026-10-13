import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import CookieBanner, { getOrSetCookieToken } from "../Users/CookieBanner";
import "../Users/Cart.css";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Delete from "../Config/Delete";

export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCookieAccepted, setIsCookieAccepted] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const navigate = useNavigate();
    const [stickyState, setStickyState] = useState("normal");
    const heroRef = useRef(null);
    const footerRef = useRef(null);

    // Edit State
    const [editingId, setEditingId] = useState(null);
    const [tempQty, setTempQty] = useState("");
    const [updating, setUpdating] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Order Modal State (Only Details & Confirm Button)
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const qtyOptions = [5, 10, 15, 20, 25, 30, 50, 100, 200, 500];

    useEffect(() => {
        const checkAndFetch = () => {
            const isAccepted = localStorage.getItem("cookiesAccepted");
            if (isAccepted === "true") {
                setIsCookieAccepted(true);
                fetchCartDataByCookie();
            } else {
                setIsCookieAccepted(false);
                setLoading(false);
            }
        };

        checkAndFetch();

        const handleCookieAcceptEvent = () => {
            setIsCookieAccepted(true);
            fetchCartDataByCookie();
        };

        window.addEventListener("cookieAccepted", handleCookieAcceptEvent);

        return () => {
            window.removeEventListener("cookieAccepted", handleCookieAcceptEvent);
        };
    }, []);

    const fetchCartDataByCookie = async () => {
        setLoading(true);
        try {
            const tokenResult = await getOrSetCookieToken();

            const cookieToken = typeof tokenResult === "string"
                ? tokenResult
                : (tokenResult?.visitorId || String(tokenResult || ""));

            if (!cookieToken) {
                setLoading(false);
                return;
            }

            const response = await axios.get(
                `${BASE_URL}customer/getdatawhere/tbl_cart/cart_cookie_token/${cookieToken}`
            );

            if (response.data.status && Array.isArray(response.data.data)) {
                // FAKT cart_view == 1 aslele items filter kara
                const activeCartItems = response.data.data.filter(
                    (item) => Number(item.cart_view) === 1
                );
                setCartItems(activeCartItems);
            } else {
                setCartItems([]);
            }
        } catch (error) {
            console.error("Error fetching cart data:", error);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (window.innerWidth < 992) return;

        const handleScroll = () => {
            if (!heroRef.current || !footerRef.current) return;
            const heroBottom = heroRef.current.getBoundingClientRect().bottom;
            const footerTop = footerRef.current.getBoundingClientRect().top;

            if (heroBottom > 0) {
                setStickyState("normal");
            } else if (footerTop <= window.innerHeight) {
                setStickyState("bottom");
            } else {
                setStickyState("fixed");
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSelectItem = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    };

    const handleSelectAll = () => {
        if (selectedItems.length === cartItems.length) {
            setSelectedItems([]);
        } else {
            const allIds = cartItems.map((item) => item.cart_id);
            setSelectedItems(allIds);
        }
    };

    const handleStartEdit = (cartId, currentQty) => {
        setEditingId(cartId);
        setTempQty(currentQty);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setTempQty("");
    };

    const handleSaveQty = async (cartId) => {
        if (!tempQty || tempQty <= 4) {
            toast.error("PCB quantity must be 5 or greater.");
            return;
        }

        try {
            setUpdating(true);
            const response = await axios.post(
                `${BASE_URL}customer/updatedata/tbl_cart/cart_id/${cartId}`,
                { cart_selected_qty: tempQty }
            );

            if (response.data && response.data.status) {
                setCartItems((prevItems) =>
                    prevItems.map((item) =>
                        item.cart_id === cartId ? { ...item, cart_selected_qty: tempQty } : item
                    )
                );
                toast.success("PCB quantity updated successfully.");
                setEditingId(null);
            } else {
                toast.error(response.data.message || "Failed to update quantity.");
            }
        } catch (error) {
            console.error("Error updating PCB Qty:", error);
            toast.error("Server error! Could not update PCB quantity.");
        } finally {
            setUpdating(false);
        }
    };

    const selectedCartObjects = cartItems.filter((item) =>
        selectedItems.includes(item.cart_id)
    );

    const totalSelectedQty = selectedCartObjects.reduce(
        (sum, item) => sum + Number(item.cart_selected_qty || 0), 0
    );

    const calculateEstimatedPrice = () => {
        return selectedCartObjects.reduce((acc, item) => {
            const basePrice = Number(item.cart_price || item.price || 0);
            return acc + (basePrice * Number(item.cart_selected_qty || 1));
        }, 0);
    };

    const createOrder = async (customerId, cartIdsString) => {
        try {
            setIsPlacingOrder(true);
            const payload = {
                order_cust_id: customerId,
                order_cart_id: cartIdsString,
                order_stage: 2
            };

            const response = await axios.post(
                `${BASE_URL}customer/insertmultiple/tbl_orders`,
                payload
            );

            if (response.data && response.data.status) {
                toast.success("Order placed successfully!");
                setShowOrderModal(false);
                navigate("/customer/orders");
            } else {
                toast.error(response.data.message || "Failed to create order.");
            }
        } catch (error) {
            console.error("Error inserting order:", error);
            toast.error("Server error while placing order.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const handleProceedToOrder = () => {
        if (selectedItems.length === 0) {
            toast.error("Please select at least one PCB item to proceed.");
            return;
        }

        const customerData = JSON.parse(localStorage.getItem("customer"));
        if (!customerData) {
            const cartIdsString = selectedItems.join(",");
            localStorage.setItem("pending_order_cart_ids", cartIdsString);
            toast.error("Please login or signup to place your order.");
            navigate("/login", { state: { selectedItems: selectedCartObjects } });
            return;
        }

        setShowOrderModal(true);
    };

    const handleConfirmFinalOrder = async () => {
        const cartIdsString = selectedItems.join(",");
        const customerData = JSON.parse(localStorage.getItem("customer"));
        const customerId = customerData?.cust_id;

        await createOrder(customerId, cartIdsString);
    };

    const confirmDelete = async () => {
        try {
            setShowDelete(false);
            setLoading(true);

            // 1. Pahile check kara ki tya cart_id chi order kadi banleli ahe ka
            const checkOrderResponse = await axios.get(
                `${BASE_URL}customer/getdatawhere/tbl_orders/order_cart_id/${deleteId}`
            );

            // Jar orders response madhe data bhetla (mhanje order banli ahe)
            const isOrderCreated =
                checkOrderResponse.data &&
                checkOrderResponse.data.status &&
                checkOrderResponse.data.data &&
                checkOrderResponse.data.data.length > 0;

            let response;

            if (isOrderCreated) {
                // CASE A: Order BANLELI AHE -> cart_view = 0 Update kara (Soft Delete)
                response = await axios.post(
                    `${BASE_URL}customer/updatedata/tbl_cart/cart_id/${deleteId}`,
                    { cart_view: 0 }
                );
            } else {
                // CASE B: Order BANLELI NAHIYE -> Permanent Delete kara (Hard Delete)
                response = await axios.get(
                    `${BASE_URL}customer/deletedata/tbl_cart/cart_id/${deleteId}`
                );
            }

            if (response.data && response.data.status) {
                toast.success("Item removed from cart successfully.");

                // Cart state madhun item kadhun taka
                setCartItems((prevItems) => prevItems.filter((item) => item.cart_id !== deleteId));
                setSelectedItems((prevSelected) => prevSelected.filter((id) => id !== deleteId));
                setDeleteId(null);
            } else {
                toast.error(response.data.message || "Failed to process request.");
            }
        } catch (error) {
            console.error("Delete process error:", error);
            toast.error("Error occurred while deleting item.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="pcb-cart-status-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
                <div className="pcb-loader-card text-center">
                    <div className="pcb-loader-spinner-wrapper mb-3">
                        <div className="spinner-border text-danger" role="status" style={{ width: "3rem", height: "3rem" }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                    <h3 className="pcb-loader-title">Loading PCB Cart...</h3>
                    <p className="pcb-loader-subtitle text-muted">Fetching saved configurations...</p>
                </div>
            </div>
        );
    }

    if (!isCookieAccepted) {
        return (
            <>
                <CookieBanner />
                <div className="pcb-cart-status-wrapper d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
                    <div className="pcb-loader-card text-center">
                        <div className="pcb-loader-spinner-wrapper mb-3">
                            <div className="spinner-border text-danger" role="status" style={{ width: "3rem", height: "3rem" }}>
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        <h3 className="pcb-loader-title">Loading PCB Cart...</h3>
                        <p className="pcb-loader-subtitle text-muted">Fetching saved configurations...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!cartItems || cartItems.length === 0) {
        return (
            <>
                <CookieBanner />
                <div className="pcb-cart-status-wrapper">
                    <div className="pcb-empty-card">
                        <div className="pcb-empty-icon-box">
                            <svg className="pcb-empty-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                            <span className="pcb-empty-badge">0 Items</span>
                        </div>
                        <h2 className="pcb-empty-title">YOUR PCB CART IS EMPTY</h2>
                        <p className="pcb-empty-text">No active PCB configurations found for your session.</p>
                        <div className="pcb-empty-action-group">
                            <Link to="/order-now" className="pcb-btn-primary">
                                + Create New PCB Order
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <CookieBanner />
            <section className="contact-hero" ref={heroRef}>
                <div className="contact-overlay">
                    <div className="container">
                        <div className="contact-content">
                            <h1>SAVED CART ITEMS ({cartItems.length})</h1>
                            <p>Saved PCB Configuration Details</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="pcb-cart-container">
                <div className="pcb-table-container">
                    <table className="pcb-custom-table">
                        <thead>
                            <tr>
                                <th style={{ width: "5%", textAlign: "center" }}>
                                    <input
                                        type="checkbox"
                                        className="pcb-checkbox"
                                        checked={cartItems.length > 0 && selectedItems.length === cartItems.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th style={{ width: "30%" }}>Basic Information</th>
                                <th style={{ width: "32%" }}>PCB Specifications</th>
                                <th style={{ width: "33%" }}>High Specifications Options</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.map((cartData) => {
                                const itemId = cartData.cart_id;
                                const isSelected = selectedItems.includes(itemId);
                                const isEditingThisItem = editingId === itemId;

                                return (
                                    <tr key={itemId} className={isSelected ? "pcb-row-selected" : ""}>
                                        <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                                            <input
                                                type="checkbox"
                                                className="pcb-checkbox"
                                                checked={isSelected}
                                                onChange={() => handleSelectItem(itemId)}
                                            />
                                            <button className="btn btn-outline-danger mt-4" onClick={() => {
                                                setDeleteId(itemId);
                                                setShowDelete(true);
                                            }}><i className="fa-solid fa-trash"></i></button>
                                        </td>

                                        <td>
                                            <div className="pcb-row-item">
                                                <strong>Base Material:</strong> {cartData.cart_base_material}
                                            </div>
                                            <div className="pcb-row-item">
                                                <strong>Layers:</strong> {cartData.cart_pcb_layer} Layer(s)
                                            </div>
                                            <div className="pcb-row-item">
                                                <strong>Dimensions:</strong> {cartData.cart_pcb_width} × {cartData.cart_pcb_height} mm
                                            </div>

                                            <div className="pcb-row-item pcb-qty-edit-wrapper">
                                                <strong>PCB Qty:</strong>{" "}
                                                {isEditingThisItem ? (
                                                    <span className="pcb-qty-inline-edit">
                                                        <input
                                                            type="number"
                                                            list={`qty-options-${cartData.cart_id}`}
                                                            value={tempQty}
                                                            onChange={(e) => setTempQty(e.target.value)}
                                                            className="pcb-qty-combo-input"
                                                            placeholder="Qty..."
                                                            disabled={updating}
                                                            autoFocus
                                                        />
                                                        <datalist id={`qty-options-${cartData.cart_id}`}>
                                                            {qtyOptions.map((qty) => (
                                                                <option key={qty} value={qty}>
                                                                    {qty} Pcs
                                                                </option>
                                                            ))}
                                                        </datalist>

                                                        <button
                                                            onClick={() => handleSaveQty(cartData.cart_id)}
                                                            className="pcb-btn-save-sm"
                                                            disabled={updating}
                                                            title="Save Quantity"
                                                        >
                                                            {updating ? "..." : "✓"}
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="pcb-btn-cancel-sm"
                                                            disabled={updating}
                                                            title="Cancel"
                                                        >
                                                            ✕
                                                        </button>
                                                    </span>
                                                ) : (
                                                    <span className="pcb-qty-display">
                                                        <span className="pcb-qty-badge">{cartData.cart_selected_qty} Pcs</span>
                                                        <button
                                                            className="pcb-edit-icon-btn"
                                                            onClick={() => handleStartEdit(cartData.cart_id, cartData.cart_selected_qty)}
                                                            title="Edit Quantity"
                                                        >
                                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                            </svg>
                                                        </button>
                                                    </span>
                                                )}
                                            </div>

                                            <div className="pcb-row-item">
                                                <strong>Product Type:</strong> {cartData.cart_product_type}
                                            </div>

                                            {cartData.cart_gerber_top_img && (
                                                <div className="pcb-row-item mt-1">
                                                    <strong>Gerber Preview:</strong>
                                                    <div className="d-flex gap-2 mt-1">
                                                        <img
                                                            src={cartData.cart_gerber_top_img}
                                                            alt="Top Layer"
                                                            style={{ width: "80px", height: "auto", border: "1px solid #ccc", borderRadius: "4px" }}
                                                        />
                                                        {cartData.cart_gerber_bottom_img && (
                                                            <img
                                                                src={cartData.cart_gerber_bottom_img}
                                                                alt="Bottom Layer"
                                                                style={{ width: "80px", height: "auto", border: "1px solid #ccc", borderRadius: "4px", transform: "scaleX(-1)" }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </td>

                                        <td>
                                            <div className="pcb-row-item"><strong>Different Design:</strong> {cartData.cart_different_design}</div>
                                            <div className="pcb-row-item"><strong>Delivery Format:</strong> {cartData.cart_delivery_format}</div>
                                            <div className="pcb-row-item"><strong>Thickness:</strong> {cartData.cart_pcb_thickness} mm</div>
                                            <div className="pcb-row-item"><strong>Color:</strong> {cartData.cart_pcb_color}</div>
                                            <div className="pcb-row-item"><strong>Silkscreen:</strong> {cartData.cart_silkscreen}</div>
                                            <div className="pcb-row-item"><strong>Material Type:</strong> {cartData.cart_material_type}</div>
                                            <div className="pcb-row-item"><strong>Surface Finish:</strong> {cartData.cart_surface_finish}</div>
                                        </td>

                                        <td>
                                            <div className="pcb-row-item"><strong>Outer Copper Weight:</strong> {cartData.cart_outer_copper_weight}</div>
                                            <div className="pcb-row-item"><strong>Via Covering:</strong> {cartData.cart_via_covering}</div>
                                            <div className="pcb-row-item"><strong>Via Plating Method:</strong> {cartData.cart_via_plating}</div>
                                            <div className="pcb-row-item"><strong>Min Via Hole:</strong> {cartData.cart_min_via_hole}</div>
                                            <div className="pcb-row-item"><strong>Outline Tolerance:</strong> {cartData.cart_outline_tolerance}</div>
                                            <div className="pcb-row-item"><strong>Confirm Prod. File:</strong> {cartData.cart_confirm_production_file}</div>
                                            <div className="pcb-row-item"><strong>Mark on PCB:</strong> {cartData.cart_mark_on_pcb}</div>
                                            <div className="pcb-row-item"><strong>Electrical Test:</strong> {cartData.cart_electrical_test}</div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="pcb-summary-sidebar">
                    <div className={`pcb-cart-sticky ${stickyState}`}>
                        <div className="pcb-summary-card">
                            <h3 className="pcb-summary-title">ORDER SUMMARY</h3>

                            <div className="pcb-summary-info">
                                <div className="pcb-summary-row">
                                    <span>Selected Items:</span>
                                    <strong>{selectedItems.length} of {cartItems.length}</strong>
                                </div>
                                <div className="pcb-summary-row">
                                    <span>Total PCB Qty:</span>
                                    <strong>{totalSelectedQty} Pcs</strong>
                                </div>

                                {calculateEstimatedPrice() > 0 && (
                                    <div className="pcb-summary-row">
                                        <span>Subtotal:</span>
                                        <strong>₹{calculateEstimatedPrice().toFixed(2)}</strong>
                                    </div>
                                )}
                            </div>

                            <div className="pcb-summary-divider"></div>

                            {selectedItems.length > 0 ? (
                                <div className="pcb-summary-status alert-success">
                                    ✓ Ready for order processing
                                </div>
                            ) : (
                                <div className="pcb-summary-status alert-warning">
                                    ⚠ Please select item(s) to continue
                                </div>
                            )}

                            <button
                                onClick={handleProceedToOrder}
                                disabled={selectedItems.length === 0}
                                className="pcb-btn-proceed"
                            >
                                Proceed to Order ({selectedItems.length})
                            </button>

                            <div className="pcb-summary-footer">
                                <p>🔒 Safe & Secure Order Processing</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Confirmation Details Modal */}
            {showOrderModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: "rgba(0,0,0,0.6)",
                        scrollbarWidth: "none",        // Firefox
                        msOverflowStyle: "none"        // IE/Edge
                    }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content shadow-lg border-0 rounded-3">
                            <div className="modal-header bg-dark text-white border-0 py-3">
                                <h5 className="modal-title fw-bold">
                                    <i className="fa-solid fa-list-check me-2 text-warning"></i> Confirm Order Details
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowOrderModal(false)}
                                    disabled={isPlacingOrder}
                                ></button>
                            </div>
                            <div
                                className="modal-body p-4 hide-scrollbar"
                                style={{
                                    maxHeight: "70vh",
                                    overflowY: "auto",
                                    scrollbarWidth: "none",
                                    msOverflowStyle: "none",
                                }}
                            >
                                <div className="alert alert-info py-2 px-3 small mb-3">
                                    <i className="fa-solid fa-circle-info me-2"></i> Please review your selected PCB items before placing the order.
                                </div>

                                <div className="table-responsive border rounded-3 mb-3">
                                    <table className="table table-hover mb-0 align-middle">
                                        <thead className="table-light small">
                                            <tr>
                                                <th>#</th>
                                                <th>Material & Specifications</th>
                                                <th className="text-center">Dimensions</th>
                                                <th className="text-center">Quantity</th>
                                                {calculateEstimatedPrice() > 0 && <th className="text-end">Price</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedCartObjects.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="fw-bold">{idx + 1}</td>
                                                    <td>
                                                        <div className="fw-bold text-dark">{item.cart_base_material} ({item.cart_pcb_layer} Layer)</div>
                                                        <small className="text-muted">
                                                            Color: {item.cart_pcb_color || "Standard"} | Thickness: {item.cart_pcb_thickness}mm
                                                        </small>
                                                    </td>
                                                    <td className="text-center small">
                                                        {item.cart_pcb_width} × {item.cart_pcb_height} mm
                                                    </td>
                                                    <td className="text-center">
                                                        <span className="badge bg-secondary px-2 py-1">{item.cart_selected_qty} Pcs</span>
                                                    </td>
                                                    {calculateEstimatedPrice() > 0 && (
                                                        <td className="text-end fw-semibold">
                                                            ₹{((Number(item.cart_price || item.price || 0)) * Number(item.cart_selected_qty || 1)).toFixed(2)}
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Summary Total */}
                                <div className="card bg-light border-0 p-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="fw-semibold text-secondary">Total Selected Items:</span>
                                        <span className="fw-bold">{selectedCartObjects.length} Item(s)</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="fw-semibold text-secondary">Total Quantity:</span>
                                        <span className="fw-bold text-primary">{totalSelectedQty} Pcs</span>
                                    </div>
                                    {calculateEstimatedPrice() > 0 && (
                                        <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
                                            <span className="fw-bold text-dark fs-6">Total Estimated Amount:</span>
                                            <span className="fw-bold text-danger fs-5">₹{calculateEstimatedPrice().toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-footer bg-light border-0 py-3 d-flex justify-content-between">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary px-4"
                                    onClick={() => setShowOrderModal(false)}
                                    disabled={isPlacingOrder}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-warning text-dark fw-bold px-4"
                                    onClick={handleConfirmFinalOrder}
                                    disabled={isPlacingOrder}
                                >
                                    {isPlacingOrder ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                            Placing Order...
                                        </>
                                    ) : (
                                        "Confirm & Place Order"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div ref={footerRef}></div>
            <Delete
                show={showDelete}
                onConfirm={confirmDelete}
                onCancel={() => {
                    setShowDelete(false);
                    setDeleteId(null);
                }}
            />
        </>
    );
}