import "../Users/GerberUpload.css";
import { FaUpload, FaLock, FaFileArchive, FaCheckCircle, FaTrash, FaSpinner } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";
import CookieBanner, { getOrSetCookieToken } from "../Users/CookieBanner";
import { useNavigate } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import html2pdf from "html2pdf.js";
import SEO from "../../Seo";
import { seoConfig } from "../Config/seoConfig";


const qtyList = [
    5, 10, 15, 20, 25, 30, 50,
    75, 100, 125, 150, 200, 250, 300,
    350, 400, 450, 500, 600, 700, 750,
    800, 900, 1000, 1200, 1250, 1400, 1500,
    1600, 1750, 1800, 2000, 2400, 2500, 2800,
    3000, 3500, 4000, 4500, 5000, 5500, 6000,
    6500, 7000, 7500, 8000, 8500, 9000, 9500,
    10000, 11000, 12000, 13000, 14000, 15000, 16000,
    17000, 18000, 19000, 25000, 30000, 40000, 50000,
    60000, 70000
];

export default function GerberUpload() {

    const navigate = useNavigate();
    const heroRef = useRef(null);
    const footerRef = useRef(null);
    const qtyRef = useRef(null);
    const fileInputRef = useRef(null);
    const confirmProductionRef = useRef(null);

    // State for Modal
    const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false);
    const [pdfBlobUrl, setPdfBlobUrl] = useState("");
    const pdfContainerRef = useRef(null);

    // API & File Handling States
    const [gerberId, setGerberId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState("");
    const [gerberToken, setGerberToken] = useState("");

    // Dynamic Specification States (Auto-filled + Editable)
    const [baseMaterial, setBaseMaterial] = useState("FR-4");
    const [pcbLayer, setPcbLayer] = useState(2);
    const [pcbWidth, setPcbWidth] = useState("");
    const [pcbHeight, setPcbHeight] = useState("");
    const [pcbThickness, setPcbThickness] = useState("1.6");
    const [pcbColor, setPcbColor] = useState("Green");
    const [productType, setProductType] = useState("Industrial/Consumer electronics");

    // Specification Section States
    const [differentDesign, setDifferentDesign] = useState("1");
    const [deliveryFormat, setDeliveryFormat] = useState("Single PCB");
    const [materialType, setMaterialType] = useState("FR4 TG135");
    const [surfaceFinish, setSurfaceFinish] = useState("HASL(with lead)");

    // High Spec States
    const [copperWeight, setCopperWeight] = useState("1 oz");
    const [viaCovering, setViaCovering] = useState("Tented");
    const [viaPlating, setViaPlating] = useState("Not Specified");
    const [minViaHole, setMinViaHole] = useState("0.3mm (0.4 / 0.45mm)");
    const [outlineTolerance, setOutlineTolerance] = useState("±0.2mm (Regular)");
    const [confirmFile, setConfirmFile] = useState("");
    const [showConfirmProductionModal, setShowConfirmProductionModal] = useState(false);
    const [confirmFileError, setConfirmFileError] = useState(false);
    const [markOnPcb, setMarkOnPcb] = useState("Remove Mark");
    const [electricalTest, setElectricalTest] = useState("Flying Probe Fully Test");
    const [goldFingers, setGoldFingers] = useState("No");
    const [castellatedHoles, setCastellatedHoles] = useState("No");
    const [edgePlating, setEdgePlating] = useState("No");
    const [blindSlots, setBlindSlots] = useState("No");
    const [ulMarking, setUlMarking] = useState("No");
    const [humidityCard, setHumidityCard] = useState("No");
    const [pcbRemark, setPcbRemark] = useState("");

    // Preview Images
    const [gerberTopImg, setGerberTopImg] = useState("");
    const [gerberBottomImg, setGerberBottomImg] = useState("");

    // UI Interactive States
    const [showQty, setShowQty] = useState(false);
    const [selectedQty, setSelectedQty] = useState(5);
    const [customQty, setCustomQty] = useState("");
    const [stickyState, setStickyState] = useState("normal");
    const [showSaveQuoteModal, setShowSaveQuoteModal] = useState(false);

    // Panels Accordion Toggle States
    const [showSpecifications, setShowSpecifications] = useState(true);
    const [showHighspec, setShowHighspec] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(true);

    // Delivery Format Advanced States
    const [panelJLCPCBX, setPanelJLCPCBX] = useState(2);
    const [panelJLCPCBY, setPanelJLCPCBY] = useState(2);
    const [edgeRail, setEdgeRail] = useState("No");
    const [edgeRailSize, setEdgeRailSize] = useState(5);
    const [showSCModal, setShowSCModal] = useState(false);
    const [panelCols, setPanelCols] = useState(2);
    const [panelRows, setPanelRows] = useState(2);
    const [colSpacing, setColSpacing] = useState(0); // Column Spacing in mm
    const [rowSpacing, setRowSpacing] = useState(0); // Row Spacing in mm

    // Zoom & Drag/Pan States
    const [zoomScale, setZoomScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.25, 10));
    const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.25, 0.5));

    const handleWheelZoom = (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            setZoomScale((prev) => Math.min(prev + 0.1, 10));
        } else {
            setZoomScale((prev) => Math.max(prev - 0.1, 0.5));
        }
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleResetZoomWithPos = () => {
        setZoomScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const [edgeRailOption, setEdgeRailOption] = useState("No rails");
    const [activeModalTab, setActiveModalTab] = useState("outline");
    const [previewSide, setPreviewSide] = useState("top"); // "top" or "bottom"

    const handleDeliveryFormatChange = (value) => {
        setDeliveryFormat(value);
        if (value === "Panel by SC") {
            setShowSCModal(true);
        }
    };

    // Colors List
    const colorOptions = [
        { name: "Green", class: "green" },
        { name: "Purple", class: "purple" },
        { name: "Red", class: "red" },
        { name: "Yellow", class: "yellow" },
        { name: "Blue", class: "blue" },
        { name: "White", class: "white" },
        { name: "Black", class: "black" }
    ];

    const handleBaseMaterialChange = (material) => {
        setBaseMaterial(material);
        if (material === "Aluminum") {
            setPcbColor("White");
        } else if (material === "FR-4") {
            setPcbColor("Green");
        }
    };

    const handleViaPlatingChange = (method) => {
        setViaPlating(method);
        if (method === "Not Specified" && (copperWeight !== "1 oz" && copperWeight !== "2 oz")) {
            setCopperWeight("1 oz");
        }
    };

    const copperWeightOptions = viaPlating === "Not Specified"
        ? ["1 oz", "2 oz"]
        : ["1 oz", "2 oz", "2.5 oz", "3.5 oz", "4.5 oz"];

    const getColoredImageUrl = (originalUrl, selectedColor) => {
        if (!originalUrl) return "";
        try {
            const urlObj = new URL(originalUrl);
            urlObj.searchParams.set("color", selectedColor);
            return urlObj.toString();
        } catch (e) {
            return originalUrl.replace(/color=[^&]+/, `color=${selectedColor}`);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const fetchAndAutoFillSpecs = async (fileToken, retries = 10) => {
        try {
            const res = await axios.post(BASE_URL + "api/jlcpcb/get-gerber-details", {
                fileKey: fileToken
            });

            if (res.data && res.data.code === 200 && res.data.data) {
                const auditData = res.data.data;

                if (auditData.stencilLayer) setPcbLayer(Number(auditData.stencilLayer));

                // ✅ अचूक स्टेट मॅपिंग (Correct State Mapping)
                if (auditData.setWidth) setPcbWidth(String(auditData.setWidth));
                if (auditData.setLength) setPcbHeight(String(auditData.setLength));

                if (auditData.gerberTop) setGerberTopImg(auditData.gerberTop);
                if (auditData.gerberBottom) setGerberBottomImg(auditData.gerberBottom);

                setUploading(false);
                toast.success("Gerber analyzed successfully!");
            }
            else if (res.data && (res.data.code === 2501 || res.data.code === 2) && retries > 0) {
                setTimeout(() => {
                    fetchAndAutoFillSpecs(fileToken, retries - 1);
                }, 3000);
            }
            else {
                setUploading(false);
                toast.error("Gerber parsing took longer than expected. Please select options manually.");
            }
        } catch (err) {
            setUploading(false);
            console.error("Error fetching Gerber specs:", err);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadedFileName(file.name);
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post(
                BASE_URL + "api/jlcpcb/upload-gerber",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            if (response.data && response.data.code === 200) {

                const token = response.data.data;
                const insertedGerberId = response.data.gerber_id;

                setGerberToken(token);
                setGerberId(insertedGerberId);

                setTimeout(() => {
                    fetchAndAutoFillSpecs(token, 10);
                }, 3000);

            } else {

                setUploading(false);

                toast.error(
                    response.data.message ||
                    "Failed to upload file."
                );
            }

        } catch (error) {

            setUploading(false);

            console.error("Upload error:", error);

            toast.error("Error uploading Gerber file.");
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

    useEffect(() => {
        const closeQtyPopup = (e) => {
            if (qtyRef.current && !qtyRef.current.contains(e.target)) {
                setShowQty(false);
            }
        };
        document.addEventListener("mousedown", closeQtyPopup);
        return () => document.removeEventListener("mousedown", closeQtyPopup);
    }, []);

    useEffect(() => {
        const isModalOpen = showPdfPreviewModal || showSaveQuoteModal || showSCModal;

        if (isModalOpen) {
            document.body.style.overflow = "hidden";
            document.documentElement.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        };
    }, [showPdfPreviewModal, showSaveQuoteModal, showSCModal]);


    // const handleSaveQuote = async () => {
    //     if (!uploadedFileName || !gerberToken) {
    //         toast.error("Please upload a Gerber file first before saving to cart!");
    //         return;
    //     }

    //     try {
    //         const tokenResult = await getOrSetCookieToken();

    //         const cookieToken = typeof tokenResult === "string"
    //             ? tokenResult
    //             : (tokenResult?.visitorId || String(tokenResult || ""));

    //         // ✅ Delivery Format ची स्ट्रिंग तयार करा जेणेकरून ती एकाच कॉलममध्ये सेव्ह होईल
    //         let finalDeliveryFormat = deliveryFormat;
    //         if (deliveryFormat === "Panel by SC") {
    //             finalDeliveryFormat = `Panel by SC (${panelCols}x${panelRows}, Col Gap: ${colSpacing}mm, Row Gap: ${rowSpacing}mm)`;
    //         }

    //         const payload = {
    //             cart_cookie_token: String(cookieToken),

    //             cart_base_material: baseMaterial,
    //             cart_pcb_layer: pcbLayer,
    //             cart_pcb_width: pcbWidth || "100",
    //             cart_pcb_height: pcbHeight || "100",
    //             cart_selected_qty: selectedQty,
    //             cart_product_type: productType,

    //             // PCB Specifications
    //             cart_different_design: differentDesign,

    //             // ✅ एकाच कॉलममध्ये (cart_delivery_format) सर्व डिटेल्स सेव्ह होतील
    //             cart_delivery_format: finalDeliveryFormat,

    //             cart_pcb_thickness: pcbThickness,
    //             cart_pcb_color: pcbColor,
    //             cart_silkscreen: pcbColor === "White" ? "Black" : "White",
    //             cart_material_type: materialType,
    //             cart_surface_finish: surfaceFinish,

    //             // High Specifications
    //             cart_outer_copper_weight: copperWeight,
    //             cart_via_covering: viaCovering,
    //             cart_via_plating: viaPlating,
    //             cart_min_via_hole: minViaHole,
    //             cart_outline_tolerance: outlineTolerance,
    //             cart_confirm_production_file: confirmFile,
    //             cart_mark_on_pcb: markOnPcb,
    //             cart_electrical_test: electricalTest,
    //             cart_gold_fingers: goldFingers,
    //             cart_castellated_holes: castellatedHoles,
    //             cart_edge_plating: edgePlating,
    //             cart_blind_slots: blindSlots,
    //             cart_ul_marking: ulMarking,
    //             cart_humidity_card: humidityCard,

    //             // Remark
    //             cart_pcb_remark: pcbRemark,

    //             // Top & Bottom Gerber Images
    //             cart_gerber_top_img: gerberTopImg ? getColoredImageUrl(gerberTopImg, pcbColor) : "",
    //             cart_gerber_bottom_img: gerberBottomImg ? getColoredImageUrl(gerberBottomImg, pcbColor) : ""
    //         };

    //         const response = await axios.post(
    //             `${BASE_URL}customer/insert/tbl_cart`,
    //             payload
    //         );

    //         if (response.data && response.data.status) {
    //             toast.success("PCB Specifications saved to cart!");
    //             setShowSaveQuoteModal(false);

    //             setTimeout(() => {
    //                 navigate("/cart");
    //             }, 1000);
    //         } else {
    //             toast.error(response.data.message || "Failed to save cart.");
    //         }
    //     } catch (error) {
    //         console.error("Save Cart Error:", error);
    //         toast.error("Error saving data to cart.");
    //     }
    // };



    const handleSaveQuote = async () => {


        if (!confirmFile) {

            setConfirmFileError(true);
            confirmProductionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            setTimeout(() => {
                const firstButton =
                    confirmProductionRef.current?.querySelector(
                        ".pcb-highspec-btn"
                    );

                firstButton?.focus();
            }, 400);

            return;
        }

        if (!uploadedFileName || !gerberToken) {
            toast.error("Please upload a Gerber file first before saving to cart!");
            return;
        }

        try {
            const tokenResult = await getOrSetCookieToken();

            const cookieToken = typeof tokenResult === "string"
                ? tokenResult
                : (tokenResult?.visitorId || String(tokenResult || ""));

            let finalDeliveryFormat = deliveryFormat;
            if (deliveryFormat === "Panel by SC") {
                finalDeliveryFormat = `Panel by SC (${panelCols}x${panelRows}, Col Gap: ${colSpacing}mm, Row Gap: ${rowSpacing}mm)`;
            }

            const payload = {
                cart_cookie_token: String(cookieToken),

                // Save the returned gerber_id to cart_gerber_file
                cart_gerber_file: gerberId,

                cart_base_material: baseMaterial,
                cart_pcb_layer: pcbLayer,
                cart_pcb_width: pcbWidth || "100",
                cart_pcb_height: pcbHeight || "100",
                cart_selected_qty: selectedQty,
                cart_product_type: productType,

                // PCB Specifications
                cart_different_design: differentDesign,
                cart_delivery_format: finalDeliveryFormat,
                cart_pcb_thickness: pcbThickness,
                cart_pcb_color: pcbColor,
                cart_silkscreen: pcbColor === "White" ? "Black" : "White",
                cart_material_type: materialType,
                cart_surface_finish: surfaceFinish,

                // High Specifications
                cart_outer_copper_weight: copperWeight,
                cart_via_covering: viaCovering,
                cart_via_plating: viaPlating,
                cart_min_via_hole: minViaHole,
                cart_outline_tolerance: outlineTolerance,
                cart_confirm_production_file: confirmFile,
                cart_mark_on_pcb: markOnPcb,
                cart_electrical_test: electricalTest,
                cart_gold_fingers: goldFingers,
                cart_castellated_holes: castellatedHoles,
                cart_edge_plating: edgePlating,
                cart_blind_slots: blindSlots,
                cart_ul_marking: ulMarking,
                cart_humidity_card: humidityCard,

                // Remark
                cart_pcb_remark: pcbRemark,

                // Top & Bottom Gerber Images
                cart_gerber_top_img: gerberTopImg ? getColoredImageUrl(gerberTopImg, pcbColor) : "",
                cart_gerber_bottom_img: gerberBottomImg ? getColoredImageUrl(gerberBottomImg, pcbColor) : ""
            };

            const response = await axios.post(
                `${BASE_URL}customer/insert/tbl_cart`,
                payload
            );

            if (response.data && response.data.status) {
                toast.success("PCB Specifications saved to cart!");
                setShowSaveQuoteModal(false);

                setTimeout(() => {
                    navigate("/cart");
                }, 1000);
            } else {
                toast.error(response.data.message || "Failed to save cart.");
            }
        } catch (error) {
            console.error("Save Cart Error:", error);
            toast.error("Error saving data to cart.");
        }
    };
    
    return (  
        <>
        <SEO
  title={seoConfig.gerber_upload.title}
  description={seoConfig.gerber_upload.description}
/>



            <CookieBanner />
            {/* HERO SECTION */}
            <section className="contact-hero" ref={heroRef}>
                <div className="contact-overlay">
                    <div className="container">
                        <div className="contact-content">
                            <h1>GET AN INSTANT PCB MANUFACTURING QUOTE</h1>
                            <p>
                                Upload your Gerber files or PCB requirements and receive a fast, accurate quotation from our experienced engineering team.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* MAIN CONTENT SECTION */}
            <div className="row bg-light m-0">
                <div className="col-lg-8 col-md-6 pt-4 ps-lg-4 pb-lg-4 pcb-gerber-content">
                    <div className="pcb-gerber-wrapper">
                        <div className="pcb-gerber-header">
                            <h5 className="pcb-gerber-title">Online PCB Quote</h5>
                        </div>

                        {/* UPLOAD BOX / CARD SECTION */}
                        {!uploadedFileName ? (
                            <div className="pcb-gerber-box">
                                <button
                                    className="pcb-gerber-upload-btn"
                                    onClick={handleButtonClick}
                                    disabled={uploading}
                                >
                                    <FaUpload />
                                    <span>Add Gerber File</span>
                                </button>
                                <input
                                    type="file"
                                    hidden
                                    accept=".zip,.rar"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                                <p className="pcb-gerber-text">
                                    Only accept zip or rar, Max 100 MB,
                                    <span className="pcb-gerber-example"> View example &gt; </span>
                                </p>
                                <div className="pcb-gerber-secure">
                                    <FaLock />
                                    <span>All uploads are secure and confidential.</span>
                                </div>
                            </div>
                        ) : (
                            <div className="pcb-upload-card-wrapper">
                                <div className={`pcb-upload-card ${uploading ? "pcb-uploading-active" : ""}`}>
                                    <div className="pcb-upload-left">
                                        <div className={`pcb-upload-icon ${uploading ? "processing" : ""}`}>
                                            <FaFileArchive />
                                        </div>
                                        <div className="pcb-upload-details">
                                            <h6>{uploadedFileName}</h6>
                                            <div className="pcb-upload-meta">
                                                <span>Gerber File</span>
                                                <span className="pcb-upload-dot"></span>
                                                <span>ZIP/RAR</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pcb-upload-right">
                                        {uploading ? (
                                            <div className="pcb-upload-status uploading-premium">
                                                <FaSpinner className="fa-spin me-2" />
                                                <span>Analyzing Gerber Details...</span>
                                            </div>
                                        ) : (
                                            <div className="pcb-upload-status success">
                                                <FaCheckCircle />
                                                <span>Analysis Success</span>
                                            </div>
                                        )}

                                        <button
                                            className="pcb-upload-remove"
                                            title="Remove File"
                                            disabled={uploading}
                                            onClick={() => {
                                                setUploadedFileName("");
                                                setGerberToken("");
                                                setGerberId(null); // Reset gerber_id
                                                setGerberTopImg("");
                                                setGerberBottomImg("");
                                                setActiveModalTab("outline");
                                                if (fileInputRef.current) fileInputRef.current.value = "";
                                            }}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>

                                {/* Gerber Board Live Preview */}
                                {!uploading && (gerberTopImg || gerberBottomImg) && (
                                    <div className="pcb-gerber-preview-container">
                                        <h6 className="pcb-preview-title">GERBER BOARD PREVIEW ({pcbColor.toUpperCase()})</h6>
                                        <div className="pcb-preview-images-grid">
                                            {gerberTopImg && (
                                                <div className="pcb-preview-item">
                                                    <img
                                                        src={getColoredImageUrl(gerberTopImg, pcbColor)}
                                                        alt="Gerber Top View"
                                                    />
                                                    <span>Top Layer</span>
                                                </div>
                                            )}
                                            {gerberBottomImg && (
                                                <div className="pcb-preview-item" style={{ transform: "scaleX(-1)" }}>
                                                    <img
                                                        src={getColoredImageUrl(gerberBottomImg, pcbColor)}
                                                        alt="Gerber Bottom View"
                                                    />
                                                    <span style={{ transform: "scaleX(-1)" }}>Bottom Layer</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* BASE MATERIAL SPECIFICATIONS */}
                    <div className="pcb-spec-wrapper">
                        {/* Base Material */}
                        <div className="pcb-spec-row">
                            <label className="pcb-spec-label">
                                Base Material
                                <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                            </label>
                            <div className="pcb-spec-options">
                                <button
                                    className={`pcb-material-card ${baseMaterial === "FR-4" ? "active" : ""}`}
                                    onClick={() => handleBaseMaterialChange("FR-4")}
                                >
                                    <img src="assets/images/FR-4.png" alt="FR-4" />
                                    <span>FR-4</span>
                                </button>

                                <button
                                    className={`pcb-material-card ${baseMaterial === "Aluminum" ? "active" : ""}`}
                                    onClick={() => handleBaseMaterialChange("Aluminum")}
                                >
                                    <img src="assets/images/aluminium.png" alt="Aluminum" />
                                    <span>Aluminum</span>
                                </button>
                            </div>
                        </div>

                        {/* Layers */}
                        <div className="pcb-spec-row">
                            <label className="pcb-spec-label">
                                Layers
                                <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                            </label>
                            <div className="pcb-layer-list">
                                {[1, 2, 4, 6, 8, 10].map((num) => (
                                    <button
                                        key={num}
                                        className={`pcb-layer-btn ${pcbLayer === num ? "active" : ""}`}
                                        onClick={() => setPcbLayer(num)}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dimensions */}
                        <div className="pcb-spec-row">
                            <label className="pcb-spec-label">
                                Dimensions
                                <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                            </label>
                            <div className="pcb-dimension-box">

                                {/* Height / Length Field */}
                                <input
                                    type="number"
                                    className="pcb-input-size"
                                    placeholder="Height"
                                    value={pcbHeight || ""}
                                    onChange={(e) => setPcbHeight(e.target.value)}
                                    readOnly={Boolean(gerberToken)}
                                />
                                <span className="pcb-cross">×</span>
                                {/* Width Field */}
                                <input
                                    type="number"
                                    className="pcb-input-size"
                                    placeholder="Width"
                                    value={pcbWidth || ""}
                                    onChange={(e) => setPcbWidth(e.target.value)}
                                    readOnly={Boolean(gerberToken)}
                                />
                                <select className="pcb-unit-select" disabled>
                                    <option>mm</option>
                                </select>
                            </div>
                        </div>

                        {/* PCB Qty */}
                        <div className="pcb-spec-row">
                            <label className="pcb-spec-label">PCB Qty</label>
                            <div className="pcb-qty-wrapper" ref={qtyRef}>
                                <div className="pcb-qty-select" onClick={() => setShowQty(!showQty)}>
                                    <span>{selectedQty}</span>
                                    <i className="fa-solid fa-angle-down"></i>
                                </div>

                                {showQty && (
                                    <div className="pcb-qty-popup">
                                        <div className="pcb-qty-grid">
                                            {qtyList.map((qty) => (
                                                <button
                                                    key={qty}
                                                    className={`pcb-layer-btn ${selectedQty === qty ? "active" : ""}`}
                                                    onClick={() => {
                                                        setSelectedQty(qty);
                                                        setShowQty(false);
                                                    }}
                                                >
                                                    {qty}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="pcb-custom-row">
                                            <input
                                                type="number"
                                                placeholder="Custom Qty"
                                                value={customQty}
                                                onChange={(e) => setCustomQty(e.target.value)}
                                            />
                                            <button
                                                className="pcb-confirm-btn"
                                                onClick={() => {
                                                    if (customQty) {
                                                        setSelectedQty(Number(customQty));
                                                        setShowQty(false);
                                                    }
                                                }}
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Type */}
                        <div className="pcb-spec-row">
                            <label className="pcb-spec-label">
                                Product Type
                                <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                            </label>
                            <div className="pcb-product-list">
                                {["Industrial/Consumer electronics", "Aerospace", "Medical"].map((type) => (
                                    <button
                                        key={type}
                                        className={`pcb-product-btn ${productType === type ? "active" : ""}`}
                                        onClick={() => setProductType(type)}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* PCB SPECIFICATIONS PANEL */}
                    <div className="pcb-specification-section">
                        <div className="pcb-specification-header" onClick={() => setShowSpecifications(!showSpecifications)} style={{ cursor: "pointer" }}>
                            <h5>PCB Specifications</h5>
                            <i className={`fa-solid ${showSpecifications ? "fa-angle-up" : "fa-angle-down"}`}></i>
                        </div>

                        {showSpecifications && (
                            <div className="pcb-specification-body">
                                {/* Different Design */}
                                <div className="pcb-specification-row">
                                    <label className="pcb-specification-label">
                                        Different Design
                                        <i className="fa-regular fa-circle-question pcb-help-icon"></i>
                                    </label>
                                    <div className="pcb-option-group">
                                        {["1", "2", "3", "4", "5", "6", "7"].map((val) => (
                                            <button
                                                key={val}
                                                className={`pcb-option-btn ${differentDesign === val ? "active" : ""}`}
                                                onClick={() => setDifferentDesign(val)}
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Delivery Format */}
                                <div className="pcb-specification-row" style={{ marginBottom: "0" }}>
                                    <label className="pcb-specification-label">
                                        Delivery Format
                                        <i className="fa-regular fa-circle-question pcb-help-icon"></i>
                                    </label>
                                    <div className="pcb-option-group">
                                        {[
                                            { label: "Single PCB", value: "Single PCB" },
                                            { label: "Panel by Customer", value: "Panel by Customer" },
                                            { label: "Panel by Secure Circuit", value: "Panel by SC" }
                                        ].map((fmt) => (
                                            <button
                                                key={fmt.value}
                                                type="button"
                                                className={`pcb-option-btn ${deliveryFormat === fmt.value ? "active" : ""}`}
                                                onClick={() => handleDeliveryFormatChange(fmt.value)}
                                            >
                                                {fmt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {deliveryFormat === "Panel by SC" && (
                                    <div className="pcb-panel-summary-box mt-2 p-2 px-3 bg-light border rounded w-100" style={{ maxWidth: "450px", marginLeft: "220px" }}>
                                        <div className="d-flex align-items-center flex-wrap gap-2">
                                            <div className="d-flex align-items-center gap-2 flex-wrap" style={{ fontSize: "12px" }}>
                                                <span className="fw-semibold text-dark">
                                                    Panel: <strong>{panelCols}×{panelRows}</strong>
                                                </span>
                                                <span className="text-muted">|</span>
                                                <span className="badge bg-secondary-subtle text-secondary border fw-normal" style={{ fontSize: "10px" }}>
                                                    {edgeRailOption}
                                                </span>
                                                <span className="text-muted">|</span>
                                                <span className="text-secondary">
                                                    Size: <strong>{(Number(pcbWidth || 100) * panelCols).toFixed(0)} × {(Number(pcbHeight || 100) * panelRows).toFixed(0)} mm</strong>
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                className="btn btn-xs btn-outline-danger rounded-pill px-2 py-0 ms-5"
                                                style={{ fontSize: "11px", height: "24px", lineHeight: "22px" }}
                                                onClick={() => setShowSCModal(true)}
                                            >
                                                <i className="fa-solid fa-pen-to-square me-1"></i> Edit
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {deliveryFormat === "Panel by Customer" && (
                                    <div className="pcb-panel-details-box mt-1 p-2 bg-light border rounded w-100" style={{ maxWidth: "430px", marginLeft: "220px" }}>
                                        <p className="m-0 text-muted" style={{ fontSize: "12px" }}>
                                            <i className="fa-solid fa-circle-info me-1 text-danger"></i>
                                            Your Gerber file already contains the panelized layout design.
                                        </p>
                                    </div>
                                )}

                                {/* PCB Thickness */}
                                <div className="pcb-specification-row mt-3">
                                    <label className="pcb-specification-label">
                                        PCB Thickness
                                        <i className="fa-regular fa-circle-question pcb-help-icon"></i>
                                    </label>
                                    <div className="pcb-option-group">
                                        {["0.8mm", "1.0mm", "1.2mm", "1.6mm", "2.0mm", "2.4mm", "3.2mm"].map((thick) => (
                                            <button
                                                key={thick}
                                                className={`pcb-option-btn ${pcbThickness === thick.replace("mm", "") ? "active" : ""}`}
                                                onClick={() => setPcbThickness(thick.replace("mm", ""))}
                                            >
                                                {thick}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* PCB Color Section */}
                                <div className="pcb-specification-row">
                                    <label className="pcb-specification-label">
                                        PCB Color
                                        <i className="fa-regular fa-circle-question pcb-help-icon"></i>
                                    </label>
                                    <div className="pcb-option-group">
                                        {(baseMaterial === "Aluminum"
                                            ? colorOptions.filter((item) => item.name === "White" || item.name === "Black")
                                            : colorOptions
                                        ).map((item) => (
                                            <button
                                                key={item.name}
                                                type="button"
                                                className={`pcb-color-btn ${pcbColor === item.name ? "active" : ""}`}
                                                onClick={() => setPcbColor(item.name)}
                                            >
                                                <span className={`pcb-color ${item.class}`}></span>
                                                {item.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Silkscreen Section */}
                                <div className="pcb-specification-row">
                                    <label className="pcb-specification-label">
                                        Silkscreen
                                        <i className="fa-regular fa-circle-question pcb-help-icon"></i>
                                    </label>
                                    <div className="pcb-option-group">
                                        {pcbColor === "White" ? (
                                            <button type="button" className="pcb-color-btn active">
                                                <span className="pcb-color black"></span>Black
                                            </button>
                                        ) : (
                                            <button type="button" className="pcb-color-btn active">
                                                <span className="pcb-color white"></span>White
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Material Type */}
                                <div className="pcb-specification-row">
                                    <label className="pcb-specification-label">
                                        Material Type
                                        <i className="fa-regular fa-circle-question pcb-help-icon"></i>
                                    </label>
                                    <div className="pcb-option-group">
                                        {["FR4 TG135", "KB6164 - TG135", "Nan Ya NP-140F", "S1141 TG140", "S1000H TG155"].map((mat) => (
                                            <button
                                                key={mat}
                                                className={`pcb-option-btn ${materialType === mat ? "active" : ""}`}
                                                onClick={() => setMaterialType(mat)}
                                            >
                                                {mat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Surface Finish */}
                                <div className="pcb-specification-row">
                                    <label className="pcb-specification-label">
                                        Surface Finish
                                        <i className="fa-regular fa-circle-question pcb-help-icon"></i>
                                    </label>
                                    <div className="pcb-option-group">
                                        {["HASL(with lead)", "LeadFree HASL", "ENIG"].map((sf) => (
                                            <button
                                                key={sf}
                                                className={`pcb-option-btn ${surfaceFinish === sf ? "active" : ""}`}
                                                onClick={() => setSurfaceFinish(sf)}
                                            >
                                                {sf}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* HIGH SPECIFICATIONS PANEL */}
                    <div className="pcb-highspec-section">
                        <div className="pcb-highspec-header" onClick={() => setShowHighspec(!showHighspec)} style={{ cursor: "pointer" }}>
                            <h5>High Specifications Options</h5>
                            <i className={`fa-solid ${showHighspec ? "fa-angle-up" : "fa-angle-down"}`}></i>
                        </div>

                        {showHighspec && (
                            <div className="pcb-highspec-body">
                                {/* Outer Copper Weight */}
                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Outer Copper Weight
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>
                                    <div className="pcb-highspec-options">
                                        {copperWeightOptions.map((cw) => (
                                            <button
                                                key={cw}
                                                type="button"
                                                className={`pcb-highspec-btn ${copperWeight === cw ? "active" : ""}`}
                                                onClick={() => setCopperWeight(cw)}
                                            >
                                                {cw}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Via Covering */}
                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Via Covering
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>
                                    <div className="pcb-highspec-options">
                                        {["Tented", "Untented", "Plugged", "Epoxy Filled & Capped"].map((vc) => (
                                            <button
                                                key={vc}
                                                className={`pcb-highspec-btn ${viaCovering === vc ? "active" : ""}`}
                                                onClick={() => setViaCovering(vc)}
                                            >
                                                {vc}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Via Plating Method */}
                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Via Plating Method
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>
                                    <div className="pcb-highspec-options">
                                        {["Not Specified", "Conductive Adhesive"].map((vp) => (
                                            <button
                                                key={vp}
                                                type="button"
                                                className={`pcb-highspec-btn ${viaPlating === vp ? "active" : ""}`}
                                                onClick={() => handleViaPlatingChange(vp)}
                                            >
                                                {vp}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Min Via Hole */}
                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Min via hole size / diameter
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>
                                    <div className="pcb-highspec-options">
                                        {["0.3mm (0.4 / 0.45mm)", "0.25mm (0.35 / 0.4mm)", "0.2mm (0.3 / 0.35mm)", "0.15mm (0.25 / 0.3mm)"].map((mvh) => (
                                            <button
                                                key={mvh}
                                                className={`pcb-highspec-btn ${minViaHole === mvh ? "active" : ""}`}
                                                onClick={() => setMinViaHole(mvh)}
                                            >
                                                {mvh}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Board Outline Tolerance */}
                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Board Outline Tolerance
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>
                                    <div className="pcb-highspec-options">
                                        {["±0.2mm (Regular)", "±0.1mm (Precision)"].map((bot) => (
                                            <button
                                                key={bot}
                                                className={`pcb-highspec-btn ${outlineTolerance === bot ? "active" : ""}`}
                                                onClick={() => setOutlineTolerance(bot)}
                                            >
                                                {bot}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Confirm Production File */}
                                <div
                                    className="pcb-highspec-row"
                                    ref={confirmProductionRef}
                                >
                                    <label className="pcb-highspec-label">
                                        Confirm Production File
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>

                                    <div className="pcb-highspec-options-wrapper">

                                        <div className="pcb-highspec-options">

                                            {/* NO */}
                                            <button
                                                type="button"
                                                className={`pcb-highspec-btn ${confirmFile === "No" ? "active" : ""
                                                    }`}
                                                onClick={() => {
                                                    setConfirmFile("No");
                                                    setConfirmFileError(false);
                                                }}
                                            >
                                                No
                                            </button>

                                            {/* YES */}
                                            <button
                                                type="button"
                                                className={`pcb-highspec-btn ${confirmFile === "Yes" ? "active" : ""
                                                    }`}
                                                onClick={() => {
                                                    setShowConfirmProductionModal(true);
                                                    setConfirmFileError(false);
                                                }}
                                            >
                                                Yes
                                            </button>

                                        </div>

                                        {/* Notice */}
                                        {confirmFile && (
                                            <div className="pcb-notice-label-wrapper">
                                                <span
                                                    className={`pcb-notice-badge ${confirmFile === "Yes"
                                                        ? "badge-warning"
                                                        : "badge-info"
                                                        }`}
                                                >
                                                    <i
                                                        className={`fa-solid ${confirmFile === "Yes"
                                                            ? "fa-circle-info"
                                                            : "fa-circle-check"
                                                            }`}
                                                    ></i>

                                                    {confirmFile === "No"
                                                        ? "Means, Data directly go for Production"
                                                        : "Means, Data need approval before production"}
                                                </span>
                                            </div>
                                        )}

                                        {confirmFileError && (
                                            <div className="confirm-production-error-message">
                                                <i className="fa-solid fa-circle-exclamation"></i>
                                                Please select Yes or No for Confirm Production File.
                                            </div>
                                        )}

                                    </div>
                                </div>

                                {/* Mark on PCB */}
                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Mark on PCB
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>
                                    <div className="pcb-highspec-options">
                                        {["Remove Mark", "2D barcode (Serial Number)"].map((mop) => (
                                            <button
                                                key={mop}
                                                className={`pcb-highspec-btn ${markOnPcb === mop ? "active" : ""}`}
                                                onClick={() => setMarkOnPcb(mop)}
                                            >
                                                {mop}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Electrical Test */}
                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Electrical Test
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>
                                    <div className="pcb-highspec-options">
                                        <button
                                            className={`pcb-highspec-btn ${electricalTest === "Flying Probe Fully Test" ? "active" : ""}`}
                                            onClick={() => setElectricalTest("Flying Probe Fully Test")}
                                        >
                                            Flying Probe Fully Test
                                        </button>
                                    </div>
                                </div>

                                {/* Gold Fingers */}
                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Gold Fingers
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>
                                    <div className="pcb-highspec-options">
                                        {["No", "Yes"].map((gf) => (
                                            <button
                                                key={gf}
                                                className={`pcb-highspec-btn ${goldFingers === gf ? "active" : ""}`}
                                                onClick={() => setGoldFingers(gf)}
                                            >
                                                {gf}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Castellated Holes */}
                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Castellated Holes
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>
                                    <div className="pcb-highspec-options">
                                        {["No", "Yes"].map((ch) => (
                                            <button
                                                key={ch}
                                                className={`pcb-highspec-btn ${castellatedHoles === ch ? "active" : ""}`}
                                                onClick={() => setCastellatedHoles(ch)}
                                            >
                                                {ch}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Edge Plating */}
                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Edge Plating
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>
                                    <div className="pcb-highspec-options">
                                        {["No", "Yes"].map((ep) => (
                                            <button
                                                key={ep}
                                                className={`pcb-highspec-btn ${edgePlating === ep ? "active" : ""}`}
                                                onClick={() => setEdgePlating(ep)}
                                            >
                                                {ep}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Blind Slots */}
                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Blind Slots
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>
                                    <div className="pcb-highspec-options">
                                        {["No", "Yes"].map((bs) => (
                                            <button
                                                key={bs}
                                                className={`pcb-highspec-btn ${blindSlots === bs ? "active" : ""}`}
                                                onClick={() => setBlindSlots(bs)}
                                            >
                                                {bs}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* UL Marking */}
                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        UL Marking
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>
                                    <div className="pcb-highspec-options">
                                        {["No", "Yes (Any Position)", "Yes (Specify Position)"].map((ul) => (
                                            <button
                                                key={ul}
                                                className={`pcb-highspec-btn ${ulMarking === ul ? "active" : ""}`}
                                                onClick={() => setUlMarking(ul)}
                                            >
                                                {ul}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Humidity Indicator Card */}
                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Humidity Indicator Card
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>
                                    <div className="pcb-highspec-options">
                                        {["No", "Yes"].map((hc) => (
                                            <button
                                                key={hc}
                                                className={`pcb-highspec-btn ${humidityCard === hc ? "active" : ""}`}
                                                onClick={() => setHumidityCard(hc)}
                                            >
                                                {hc}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ADVANCED OPTIONS PANEL */}
                    <div className="pcb-advanced-section">
                        <div className="pcb-advanced-header" onClick={() => setShowAdvanced(!showAdvanced)} style={{ cursor: "pointer" }}>
                            <h5>Advanced Options</h5>
                            <i className={`fa-solid ${showAdvanced ? "fa-angle-up" : "fa-angle-down"}`}></i>
                        </div>

                        {showAdvanced && (
                            <div className="pcb-advanced-body">
                                <div className="pcb-advanced-row align-start">
                                    <label className="pcb-advanced-label">
                                        PCB Remark
                                        <i className="fa-solid fa-pencil pcb-advanced-help"></i>
                                    </label>
                                    <div className="pcb-advanced-remark">
                                        <textarea
                                            className="pcb-advanced-textarea"
                                            maxLength="200"
                                            placeholder="Leave a remark for this PCB order if necessary."
                                            value={pcbRemark}
                                            onChange={(e) => setPcbRemark(e.target.value)}
                                        ></textarea>
                                        <span className="pcb-advanced-counter">{200 - pcbRemark.length}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ULTRA-PREMIUM LIVE PCB PREVIEW PANEL (2 OPTIONS PER ROW) */}
                <div className="col-lg-4 col-md-6 pt-lg-4 pe-lg-4">
                    <div className={`pcb-sticky ${stickyState}`}>
                        <div className="pcb-preview-card-v2">

                            {/* Header */}
                            <div className="pcb-preview-header-v2">
                                <div className="pcb-preview-live-tag">
                                    <span className="pcb-preview-pulse-dot"></span>
                                    <h6 className="pcb-preview-title-text">Live PCB Preview</h6>
                                </div>
                                <span className="pcb-preview-realtime-badge">REALTIME</span>
                            </div>

                            {/* Sub-header Bar */}
                            <div className="pcb-preview-subbar-v2">
                                <span className="pcb-preview-subtext-v2">Selected Specifications</span>
                                <i className="fa-solid fa-sliders text-muted" style={{ fontSize: "11px" }}></i>
                            </div>

                            {/* Gerber Image Section (Gerber file upload asel tar) */}
                            {(gerberTopImg || gerberBottomImg) && (
                                <div className="pcb-preview-img-wrapper">
                                    <div className="row g-2 text-center">
                                        {gerberTopImg && (
                                            <div className="col-6">
                                                <div className="pcb-preview-img-box">
                                                    <img
                                                        src={getColoredImageUrl(gerberTopImg, pcbColor)}
                                                        alt="Top Layer"
                                                    />
                                                </div>
                                                <span className="pcb-preview-img-tag">Top Layer</span>
                                            </div>
                                        )}
                                        {gerberBottomImg && (
                                            <div className="col-6">
                                                <div className="pcb-preview-img-box">
                                                    <img
                                                        src={getColoredImageUrl(gerberBottomImg, pcbColor)}
                                                        alt="Bottom Layer"
                                                        style={{ transform: "scaleX(-1)" }}
                                                    />
                                                </div>
                                                <span className="pcb-preview-img-tag">Bottom Layer</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 2 OPTIONS PER ROW - GRID DISPLAY */}
                            <ul className="pcb-preview-grid-v2">
                                <li className="pcb-preview-grid-item">
                                    <span className="pcb-preview-key">Base Material</span>
                                    <span className="pcb-badge-dark">{baseMaterial}</span>
                                </li>

                                <li className="pcb-preview-grid-item">
                                    <span className="pcb-preview-key">Layers</span>
                                    <span className="pcb-preview-val">{pcbLayer} Layer{pcbLayer > 1 ? "s" : ""}</span>
                                </li>

                                <li className="pcb-preview-grid-item">
                                    <span className="pcb-preview-key">Dimensions</span>
                                    <span className="pcb-preview-val">{pcbWidth || 100} × {pcbHeight || 100} mm</span>
                                </li>

                                <li className="pcb-preview-grid-item">
                                    <span className="pcb-preview-key">PCB Quantity</span>
                                    <span className="pcb-badge-blue">{selectedQty} Pcs</span>
                                </li>

                                {/* <li className="pcb-preview-grid-item">
                                    <span className="pcb-preview-key">Delivery Format</span>
                                    <span className="pcb-preview-val">
                                        {deliveryFormat === "Panel by SC"
                                            ? `Panel (${panelCols}×${panelRows})`
                                            : deliveryFormat}
                                    </span>
                                </li>

                                <li className="pcb-preview-grid-item">
                                    <span className="pcb-preview-key">Different Design</span>
                                    <span className="pcb-preview-val">{differentDesign}</span>
                                </li> */}

                                <li className="pcb-preview-grid-item">
                                    <span className="pcb-preview-key">PCB Thickness</span>
                                    <span className="pcb-preview-val">{pcbThickness} mm</span>
                                </li>

                                <li className="pcb-preview-grid-item">
                                    <span className="pcb-preview-key">PCB Color</span>
                                    <span className="pcb-preview-val">
                                        <span
                                            className="pcb-color-dot"
                                            style={{
                                                backgroundColor: pcbColor.toLowerCase() === 'white' ? '#ffffff' : pcbColor.toLowerCase(),
                                                border: pcbColor.toLowerCase() === 'white' ? '1px solid #cbd5e1' : 'none'
                                            }}
                                        ></span>
                                        {pcbColor}
                                    </span>
                                </li>

                                <li className="pcb-preview-grid-item">
                                    <span className="pcb-preview-key">Silkscreen</span>
                                    <span className="pcb-preview-val">
                                        {pcbColor === "White" ? "Black" : "White"}
                                    </span>
                                </li>

                                <li className="pcb-preview-grid-item">
                                    <span className="pcb-preview-key">Surface Finish</span>
                                    <span className="pcb-preview-val">{surfaceFinish}</span>
                                </li>
                            </ul>

                            {/* Save to Card Button */}
                            <div className="pcb-preview-footer-v2">
                                <button
                                    type="button"
                                    className="pcb-preview-btn-v2"
                                    onClick={handleSaveQuote}
                                    disabled={!uploadedFileName || !gerberToken}
                                >
                                    <i className="fa-solid fa-floppy-disk"></i>
                                    <span>Save to Cart</span>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div >

            <div ref={footerRef}></div>

            {/* Confirm Production File Modal */}
            {
                showConfirmProductionModal && (
                    <div className="confirm-production-modal-overlay">
                        <div className="confirm-production-modal">

                            <button
                                type="button"
                                className="confirm-production-close"
                                onClick={() => setShowConfirmProductionModal(false)}
                            >
                                ✕
                            </button>

                            <div className="confirm-production-icon">
                                <i className="fa-solid fa-circle-info"></i>
                            </div>

                            <h5>Confirm Production File</h5>

                            <p>
                                Your Gerber file will <strong>not go directly to production</strong>.
                                Our team will first review the design and other production-related
                                details before manufacturing.
                            </p>

                            <p className="confirm-production-note">
                                You will have an opportunity to review and approve the final
                                production file before production starts.
                            </p>

                            <div className="confirm-production-actions">

                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={() => setShowConfirmProductionModal(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => {
                                        setConfirmFile("Yes");
                                        setConfirmFileError(false);
                                        setShowConfirmProductionModal(false);
                                    }}
                                >
                                    Yes, Require Approval
                                </button>

                            </div>

                        </div>
                    </div>
                )
            }

            {
                showSCModal && (
                    <div className="jlc-panel-modal-overlay">
                        <div className="jlc-panel-modal-container">
                            <button
                                type="button"
                                className="jlc-panel-close-btn"
                                onClick={() => setShowSCModal(false)}
                            >
                                ✕
                            </button>

                            <div className="jlc-panel-modal-body">
                                <div className="jlc-panel-form-section">
                                    <h5 className="jlc-panel-title">Panel by SC (Secure Circuit)</h5>

                                    {/* Size (Single piece) */}
                                    <div className="jlc-form-row">
                                        <label className="jlc-form-label">Size(Single piece)</label>
                                        <div className="jlc-form-inputs">
                                            <div className="jlc-input-group readonly">
                                                <input type="text" value={pcbWidth || 100} readOnly />
                                                <span className="jlc-unit-span">mm</span>
                                            </div>
                                            <span className="fw-bold text-muted">*</span>
                                            <div className="jlc-input-group readonly">
                                                <input type="text" value={pcbHeight || 100} readOnly />
                                                <span className="jlc-unit-span">mm</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Panel Type */}
                                    <div className="jlc-form-row">
                                        <label className="jlc-form-label">Panel Type</label>
                                        <div className="jlc-form-inputs">
                                            <div className="jlc-badge-btn">V-CUT</div>
                                        </div>
                                    </div>

                                    {/* Panel Format (Column / Row) */}
                                    <div className="jlc-form-row">
                                        <label className="jlc-form-label">Panel Format</label>
                                        <div className="jlc-form-inputs">
                                            <div className="w-50">
                                                <small className="text-muted d-block mb-1">Column</small>
                                                <div className="jlc-input-group">
                                                    <input
                                                        type="number"
                                                        value={panelCols}
                                                        onChange={(e) => setPanelCols(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1))}
                                                        onBlur={() => {
                                                            if (!panelCols || panelCols < 1) setPanelCols(1);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-50">
                                                <small className="text-muted d-block mb-1">Row</small>
                                                <div className="jlc-input-group">
                                                    <input
                                                        type="number"
                                                        value={panelRows}
                                                        onChange={(e) => setPanelRows(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1))}
                                                        onBlur={() => {
                                                            if (!panelRows || panelRows < 1) setPanelRows(1);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column Spacing / Row Spacing */}
                                    <div className="jlc-form-row">
                                        <label className="jlc-form-label"></label>
                                        <div className="jlc-form-inputs">
                                            <div className="w-50">
                                                <small className="text-muted d-block mb-1">Column Spacing</small>
                                                <div className="jlc-input-group">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={colSpacing}
                                                        onChange={(e) => setColSpacing(Math.max(0, parseFloat(e.target.value) || 0))}
                                                    />
                                                    <span className="jlc-unit-span">mm</span>
                                                </div>
                                            </div>
                                            <div className="w-50">
                                                <small className="text-muted d-block mb-1">Row Spacing</small>
                                                <div className="jlc-input-group">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={rowSpacing}
                                                        onChange={(e) => setRowSpacing(Math.max(0, parseFloat(e.target.value) || 0))}
                                                    />
                                                    <span className="jlc-unit-span">mm</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>



                                    {/* Calculated Panel Size */}
                                    <div className="jlc-form-row">
                                        <label className="jlc-form-label">Panel size</label>
                                        <div className="jlc-form-inputs">
                                            <div className="jlc-input-group readonly">
                                                <input
                                                    type="text"
                                                    value={(Number(pcbWidth || 100) * panelCols).toFixed(0)}
                                                    readOnly
                                                />
                                                <span className="jlc-unit-span">mm</span>
                                            </div>
                                            <span className="fw-bold text-muted">*</span>
                                            <div className="jlc-input-group readonly">
                                                <input
                                                    type="text"
                                                    value={(Number(pcbHeight || 100) * panelRows).toFixed(0)}
                                                    readOnly
                                                />
                                                <span className="jlc-unit-span">mm</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="jlc-modal-footer">
                                        <button
                                            type="button"
                                            className="jlc-btn-submit"
                                            onClick={() => {
                                                setPanelJLCPCBX(panelCols);
                                                setPanelJLCPCBY(panelRows);
                                                setShowSCModal(false);
                                            }}
                                        >
                                            Submit
                                        </button>
                                        <button
                                            type="button"
                                            className="jlc-btn-cancel"
                                            onClick={() => setShowSCModal(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>

                                <div className="jlc-panel-preview-section">
                                    <div className="jlc-preview-tab-header d-flex bg-dark">
                                        <button
                                            type="button"
                                            className={`jlc-preview-tab border-0 py-2 px-3 fw-bold ${activeModalTab === "outline" ? "bg-danger text-white" : "bg-dark text-white-50"}`}
                                            onClick={() => setActiveModalTab("outline")}
                                            style={{ fontSize: "13px", cursor: "pointer" }}
                                        >
                                            Board Outline
                                        </button>

                                        {(gerberTopImg || gerberBottomImg) && (
                                            <button
                                                type="button"
                                                className={`jlc-preview-tab border-0 py-2 px-3 fw-bold ${activeModalTab === "preview" ? "bg-danger text-white" : "bg-dark text-white-50"}`}
                                                onClick={() => setActiveModalTab("preview")}
                                                style={{ fontSize: "13px", cursor: "pointer" }}
                                            >
                                                2D Preview
                                            </button>
                                        )}
                                    </div>

                                    {/* Canvas Content Area */}
                                    <div className="jlc-canvas-area d-flex align-items-center justify-content-center bg-black p-3 position-relative" style={{ minHeight: "350px" }}>
                                        {/* TAB 1: Board Outline */}
                                        {activeModalTab === "outline" && (
                                            <div
                                                className="jlc-board-outline-grid"
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: `repeat(${panelCols}, 1fr)`,
                                                    gridTemplateRows: `repeat(${panelRows}, 1fr)`,
                                                    columnGap: `${Math.min(20, colSpacing * 2)}px`,
                                                    rowGap: `${Math.min(20, rowSpacing * 2)}px`,
                                                    width: `${Math.min(280, Math.max(120, panelCols * 45))}px`,
                                                    height: `${Math.min(280, Math.max(120, panelRows * 45))}px`,
                                                    border: "1px solid #d32f2f",
                                                    padding: "4px"
                                                }}
                                            >
                                                {Array.from({ length: panelCols * panelRows }).map((_, index) => (
                                                    <div key={index} className="jlc-grid-cell" style={{ border: "1px dashed #d32f2f" }}></div>
                                                ))}
                                            </div>
                                        )}

                                        {activeModalTab === "preview" && (gerberTopImg || gerberBottomImg) && (
                                            <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-between p-2 select-none">
                                                {/* Toolbar Controls */}
                                                <div className="d-flex justify-content-between align-items-center w-100 mb-2 px-2">
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            type="button"
                                                            className={`btn btn-sm ${previewSide === "top" ? "btn-danger" : "btn-outline-light"}`}
                                                            onClick={() => setPreviewSide("top")}
                                                            style={{ fontSize: "11px", padding: "2px 10px" }}
                                                        >
                                                            Top Layer
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={`btn btn-sm ${previewSide === "bottom" ? "btn-danger" : "btn-outline-light"}`}
                                                            onClick={() => setPreviewSide("bottom")}
                                                            style={{ fontSize: "11px", padding: "2px 10px" }}
                                                        >
                                                            Bottom Layer
                                                        </button>
                                                    </div>

                                                    <div className="d-flex gap-1 align-items-center bg-secondary bg-opacity-25 rounded px-2 py-1">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-dark py-0 px-2 text-white border-secondary"
                                                            onClick={handleZoomOut}
                                                            title="Zoom Out"
                                                            style={{ fontSize: "12px", lineHeight: "1.5" }}
                                                        >
                                                            <i className="fa-solid fa-minus"></i>
                                                        </button>

                                                        <span className="text-white-50 px-2 fw-semibold" style={{ fontSize: "11px", minWidth: "45px", textAlign: "center" }}>
                                                            {Math.round(zoomScale * 100)}%
                                                        </span>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-dark py-0 px-2 text-white border-secondary"
                                                            onClick={handleZoomIn}
                                                            title="Zoom In"
                                                            style={{ fontSize: "12px", lineHeight: "1.5" }}
                                                        >
                                                            <i className="fa-solid fa-plus"></i>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-light py-0 px-2 ms-1"
                                                            onClick={handleResetZoomWithPos}
                                                            title="Reset View"
                                                            style={{ fontSize: "11px", lineHeight: "1.5" }}
                                                        >
                                                            Reset
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Dynamic Drag Canvas */}
                                                <div
                                                    className="w-100 d-flex align-items-center justify-content-center p-3 position-relative"
                                                    onWheel={handleWheelZoom}
                                                    onMouseDown={handleMouseDown}
                                                    onMouseMove={handleMouseMove}
                                                    onMouseUp={handleMouseUp}
                                                    onMouseLeave={handleMouseUp}
                                                    style={{
                                                        overflow: "hidden",
                                                        maxHeight: "340px",
                                                        minHeight: "280px",
                                                        backgroundColor: "#080808",
                                                        cursor: isDragging ? "grabbing" : "grab",
                                                        userSelect: "none"
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "grid",
                                                            gridTemplateColumns: `repeat(${panelCols}, 1fr)`,
                                                            gridTemplateRows: `repeat(${panelRows}, 1fr)`,
                                                            columnGap: `${Math.min(15, colSpacing * 1.5)}px`,
                                                            rowGap: `${Math.min(15, rowSpacing * 1.5)}px`,
                                                            padding: "8px",
                                                            backgroundColor: "#050505",
                                                            borderRadius: "4px",
                                                            border: "1px solid #52915a",
                                                            transform: `translate(${position.x}px, ${position.y}px) scale(${zoomScale}) ${previewSide === "bottom" ? "scaleX(-1)" : ""}`,
                                                            transformOrigin: "center center",
                                                            transition: isDragging ? "none" : "transform 0.1s ease-out"
                                                        }}
                                                    >
                                                        {Array.from({ length: panelCols * panelRows }).map((_, index) => (
                                                            <img
                                                                key={index}
                                                                src={getColoredImageUrl(
                                                                    previewSide === "top" ? gerberTopImg : gerberBottomImg,
                                                                    pcbColor
                                                                )}
                                                                alt={`PCB Panel ${previewSide} ${index + 1}`}
                                                                draggable="false"
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit: "contain",
                                                                    display: "block",
                                                                    pointerEvents: "none"
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}
