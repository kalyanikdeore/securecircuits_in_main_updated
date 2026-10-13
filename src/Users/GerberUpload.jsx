import "../Users/GerberUpload.css";
import { FaUpload, FaLock } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../Config/Base-url";
import toast from "react-hot-toast";
import Pdf from "../Users/Pdf";
import Modal from "react-bootstrap/Modal";
import html2pdf from "html2pdf.js";

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

    const fileInputRef = useRef();
    const pdfRef = useRef();
    const heroRef = useRef(null);
    const footerRef = useRef(null);
    const dragRef = useRef(false);
    const startRef = useRef({ x: 0, y: 0 });

    const [showQty, setShowQty] = useState(false);
    const [customQty, setCustomQty] = useState("");
    const qtyRef = useRef();

    // Show Section - Hide Section
    const [showSpecifications, setShowSpecifications] = useState(true);
    const [showHighspec, setShowHighspec] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(true);
    const [showPdf, setShowPdf] = useState(false);
    const [stickyState, setStickyState] = useState("normal");

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadData, setUploadData] = useState(null);
    const [showSaveQuoteModal, setShowSaveQuoteModal] = useState(false);

    const [viewer, setViewer] = useState({
        open: false,
        side: "front",
        scale: 1,
        x: 0,
        y: 0,
    });

    const handleWheel = (e) => {
        e.preventDefault();

        let newScale =
            viewer.scale + (e.deltaY < 0 ? 0.2 : -0.2);

        newScale = Math.max(0.5, Math.min(8, newScale));

        setViewer((prev) => ({
            ...prev,
            scale: newScale,
        }));
    };

    const handleMouseDown = (e) => {
        dragRef.current = true;

        startRef.current = {
            x: e.clientX - viewer.x,
            y: e.clientY - viewer.y,
        };
    };

    const handleMouseMove = (e) => {
        if (!dragRef.current) return;

        setViewer((prev) => ({
            ...prev,
            x: e.clientX - startRef.current.x,
            y: e.clientY - startRef.current.y,
        }));
    };

    const handleMouseUp = () => {
        dragRef.current = false;
    };

    const [previewImages, setPreviewImages] = useState({
        top_copper: "",
        top_mask: "",
        top_silk: "",
        outline: "",
        drill: "",
        bottom_copper: "",
        bottom_mask: "",
        bottom_silk: "",
        top_silk_bg: {},
        bottom_silk_bg: {}
    });

    const [previewSize, setPreviewSize] = useState({
        width: 250,
        height: 2500,
    });

    useEffect(() => {
        const imageSrc =
            previewImages.outline ||
            previewImages.top_mask ||
            previewImages.top_copper ||
            previewImages.bottom_mask ||
            previewImages.bottom_copper ||
            previewImages.top_silk_green_bg ||
            previewImages.bottom_silk_green_bg

        if (!imageSrc) return;

        const img = new Image();

        img.onload = () => {
            setPreviewSize({
                width: img.naturalWidth,
                height: img.naturalHeight,
            });
        };

        img.src = imageSrc;
    }, [previewImages]);


    useEffect(() => {

        if (window.innerWidth < 992) return; 

        const handleScroll = () => {
            const heroBottom =
                heroRef.current.getBoundingClientRect().bottom;

            const footerTop =
                footerRef.current.getBoundingClientRect().top;

            if (heroBottom > 0) {
                setStickyState("normal");
            }
            else if (footerTop <= window.innerHeight) {
                setStickyState("bottom");
            }
            else {
                setStickyState("fixed");
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);


        const close = (e) => {
            if (qtyRef.current && !qtyRef.current.contains(e.target)) {
                setShowQty(false);
            }
        }

        document.addEventListener("mousedown", close);

        return () => document.removeEventListener("mousedown", close);
    }, []);

    const [customerInfo, setCustomerInfo] = useState({
        cust_contact_person: "",
        cust_email: "",
        cust_mobile: "",
        save_quote_name: "",
    });

    const [boardInfo, setBoardInfo] = useState({
        width: "",
        height: "",
        unit: "mm",
        layer_count: 1,
        board_type: "",
        warnings: []
    });

    const [specifications, setSpecifications] = useState({
        base_material: "FR-4",
        pcb_qut: 5,
        product_type: "Industrial/Consumer electronics",
        different_design: 1,
        delivery_format: "Single PCB",
        pcb_thickness: "1.6mm",
        pcb_color: "Green",
        silkscreen: "White",
        material: "FR4 TG135",
        surface_finish: "HASL(with lead)",
        outer_copper: "1 oz",
        via_covering: "Tented",
        via_plating: "Not Specified",
        min_via_size: "0.3mm",
        board_outline_tolerance: "±0.2mm",
        confirm_production_file: "No",
        mark_on_pcb: "Remove Mark",
        electrical_test: "No",
        gold_fingers: "No",
        castellated_holes: "No",
        edge_plating: "No",
        blind_slots: "No",
        ul_marking: "No",
        humidity_indicator_card: "No",
        pcb_remark: ""
    });

    const pcbPreviewColors = {
        Green: "#166303",
        Red: "#530000",
        Blue: "#000853",
        Yellow: "#85830bf1",
        Purple: "#530045",
        Black: "#000000",
        White: "#ffffff",
    };

    const materialRules = {
        "FR-4": {
            layers: [1, 2, 4],
            product_type: [
                "Industrial/Consumer electronics",
                "Aerospace",
                "Medical"
            ],
            pcb_thickness: [
                "0.8mm",
                "1.0mm",
                "1.2mm",
                "1.6mm",
                "2.0mm",
                "2.4mm",
                "3.2mm"
            ],
            pcb_color: [
                "Green",
                "Purple",
                "Red",
                "Yellow",
                "Blue",
                "White",
                "Black"
            ],
            material: [
                "FR4 TG135",
                "KB6164 - TG135",
                "Nan Ya NP-140F",
                "S1141 TG140",
                "S1000H TG155"
            ],
            surface_finish: [
                "HASL(with lead)",
                "LeadFree HASL",
                "ENIG"
            ]
        },

        "Aluminum": {
            layers: [1],
            product_type: [
                "Industrial/Consumer electronics",
                "Aerospace",
                "Medical"
            ],
            pcb_thickness: [
                "0.8mm",
                "1.0mm",
                "1.2mm",
                "1.6mm",
                "2.0mm",
                "2.4mm",
                "3.2mm"
            ],
            pcb_color: [
                "White",
                "Black"
            ],
            material: [
                ""
            ],
            surface_finish: [
                "HASL(with lead)",
                "LeadFree HASL"
            ]
        },

        
    };

    const rule = materialRules[specifications.base_material];

    const isLayerAllowed = (value) =>
        rule.layers.includes(value);

    const isThicknessAllowed = (value) =>
        rule.pcb_thickness.includes(value);

    const isProductAllowed = (value) =>
        rule.product_type.includes(value);

    const isColorAllowed = (value) =>
        rule.pcb_color.includes(value);

    const isMaterialAllowed = (value) =>
        rule.material.includes(value);

    const isSurfaceAllowed = (value) =>
        rule.surface_finish.includes(value);

    const browseFile = () => {
        fileInputRef.current.click();
    };


    const handleGerberUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        const formData = new FormData();
        formData.append("gerber", file);

        try {
            setUploading(true);
            const res = await axios.post(BASE_URL + "gerber/uploadGerber", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (event) => {
                    setProgress(Math.round((event.loaded * 100) / event.total));
                }
            });

            if (res.data.status) {
                const folder = res.data.data.gerber_folder;
                const img = res.data.preview.images || {};


                const availableColors = ["green", "red", "blue", "yellow", "purple", "black", "white"];
                const bgUrls = {};

                availableColors.forEach(color => {
                    if (img[`pcb_bg_${color}`]) {
                        bgUrls[color] = `${BASE_URL}public/Uploads/Gerber/${folder}/preview/${img[`pcb_bg_${color}`]}`;
                    }
                });

                setPreviewImages({
                    top_copper: img.top_copper ? `${BASE_URL}public/Uploads/Gerber/${folder}/preview/${img.top_copper}` : "",
                    top_mask: img.top_mask ? `${BASE_URL}public/Uploads/Gerber/${folder}/preview/${img.top_mask}` : "",
                    top_silk: img.top_silk ? `${BASE_URL}public/Uploads/Gerber/${folder}/preview/${img.top_silk}` : "",
                    outline: img.outline ? `${BASE_URL}public/Uploads/Gerber/${folder}/preview/${img.outline}` : "",
                    drill: img.drill ? `${BASE_URL}public/Uploads/Gerber/${folder}/preview/${img.drill}` : "",
                    bottom_copper: img.bottom_copper ? `${BASE_URL}public/Uploads/Gerber/${folder}/preview/${img.bottom_copper}` : "",
                    bottom_mask: img.bottom_mask ? `${BASE_URL}public/Uploads/Gerber/${folder}/preview/${img.bottom_mask}` : "",
                    bottom_silk: img.bottom_silk ? `${BASE_URL}public/Uploads/Gerber/${folder}/preview/${img.bottom_silk}` : "",
                    pcb_bg: bgUrls
                });

                // Automatically updating board fields from Python Parser Output
                if (res.data.python?.board) {
                    const pcb = res.data.python.board;
                    setBoardInfo({
                        width: pcb.width || "",
                        height: pcb.height || "",
                        unit: pcb.unit || "mm",
                        layer_count: pcb.layer_count || 2,
                        board_type: pcb.board_type || "Double Layer",
                        warnings: pcb.warnings || []
                    });
                }
                toast.success("File upload and data detection complete!");
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            toast.error("Upload process encountered an error.");
        } finally {
            setUploading(false);
        }
    };

    const generatePdf = async () => {

        const element = pdfRef.current;

        const opt = {
            margin: [8, 0, 0, 0],
            filename: "quotation.pdf",
            image: {
                type: "jpeg",
                quality: 1
            },
            html2canvas: {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff"
            },
            jsPDF: {
                unit: "mm",
                format: "a4",
                orientation: "portrait"
            }
        };

        const worker = html2pdf().set(opt).from(element);
        const pdfBlob = await worker.outputPdf("blob");
        return pdfBlob;
    };

    const uploadGeneratedPdf = async () => {
        const blob = await generatePdf();
        const formData = new FormData();
        formData.append(
            "save_quote_pdf",
            blob,
            "quotation.pdf"
        );

        const res = await axios.post(
            `${BASE_URL}gerber/fileupload`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );
        return res.data.files.save_quote_pdf;
    };



    const handleSaveQuote = async () => {
        try {
            const uploadedPdf = await uploadGeneratedPdf();

            const payload = {
                cust_contact_person: customerInfo.cust_contact_person,
                cust_email: customerInfo.cust_email,
                cust_mobile: customerInfo.cust_mobile,
                save_quote_name: customerInfo.save_quote_name,
                cust_status: "1",
                cust_menu: "1,4,5,7,11",
                save_quote_pdf: uploadedPdf,
            };

            const response = await axios.post(
                `${BASE_URL}gerber/insert/tbl_customers`,
                payload
            );

            if (response.data.status) {
                toast.success(response.data.message);
                setShowSaveQuoteModal(false);
            } else {
                toast.error(response.data.message);
                setShowSaveQuoteModal(false);
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    }

    return (
        <>
            <section className="contact-hero" ref={heroRef}>
                <div className="contact-overlay">
                    <div className="container">
                        <div className="contact-content">
                            <h1>
                                GET AN INSTANT PCB MANUFACTURING QUOTE
                            </h1>
                            <p>
                                Upload your Gerber files or PCB requirements and receive a fast, accurate quotation from our experienced engineering team.  </p>
                        </div>
                    </div>
                </div>
            </section>
            <div className="row bg-light">
                <div className="col-lg-8 col-md-6 pt-4 ps-lg-4 pb-lg-4 pcb-gerber-content">
                    <div className="pcb-gerber-wrapper">
                        <div className="pcb-gerber-header">
                            <h5 className="pcb-gerber-title">Online PCB Quote</h5>
                        </div>

                        <div className="pcb-gerber-box">
                            {!selectedFile && (
                                <>
                                    <button
                                        className="pcb-gerber-upload-btn"
                                        onClick={browseFile}
                                    >
                                        <FaUpload />
                                        <span>
                                            {selectedFile ? "Change Gerber File" : "Add Gerber File"}
                                        </span>
                                    </button>

                                    <input
                                        type="file"
                                        hidden
                                        ref={fileInputRef}
                                        accept=".zip"
                                        onChange={handleGerberUpload}
                                    />

                                    <p className="pcb-gerber-text">
                                        Only accept zip or rar, Max 100 MB,
                                        <span className="pcb-gerber-example">
                                            View example &gt;
                                        </span>
                                    </p>
                                </>)}

                            {selectedFile && (
                                <div className="pcb-upload-card">
                                    <div className="pcb-upload-left">
                                        <div className="pcb-upload-icon">
                                            <i className="fa-solid fa-file-zipper"></i>
                                        </div>

                                        <div className="pcb-upload-details">
                                            <h6>{selectedFile.name}</h6>

                                            <div className="pcb-upload-meta">
                                                <span>
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </span>

                                                <span className="pcb-upload-dot"></span>

                                                <span>ZIP Archive</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pcb-upload-right">
                                        {uploading ? (
                                            <span className="pcb-upload-status uploading">
                                                <i className="fa-solid fa-spinner fa-spin"></i>
                                                {progress}%
                                            </span>
                                        ) : (
                                            <span className="pcb-upload-status success">
                                                <i className="fa-solid fa-circle-check"></i>
                                                Uploaded
                                            </span>
                                        )}

                                        {!uploading && (
                                            <button
                                                className="pcb-upload-remove"
                                                onClick={() => {
                                                    setSelectedFile(null);
                                                    setUploadData(null);
                                                    setProgress(0);
                                                    setPreviewImages({

                                                        top_copper: "",
                                                        top_mask: "",
                                                        top_silk: "",
                                                        outline: "",
                                                        drill: "",

                                                        bottom_copper: "",
                                                        bottom_mask: "",
                                                        bottom_silk: ""

                                                    });

                                                    setBoardInfo({
                                                        width: "",
                                                        height: "",
                                                        unit: "mm",
                                                        layer_count: 1,
                                                        board_type: "",
                                                        warnings: []
                                                    });

                                                    setSpecifications({
                                                        base_material: "FR-4",
                                                        product_type: "Industrial/Consumer electronics",
                                                        pcb_qut: 1,
                                                        different_design: 1,
                                                        delivery_format: "Single PCB",
                                                        pcb_thickness: "1.6mm",
                                                        pcb_color: "Green",
                                                        silkscreen: "White",
                                                        material: "FR4 TG135",
                                                        surface_finish: "HASL(with lead)",
                                                        outer_copper: "1 oz",
                                                        via_covering: "Tented",
                                                        via_plating: "Not Specified",
                                                        min_via_size: "0.3mm",
                                                        board_outline_tolerance: "±0.2mm",
                                                        confirm_production_file: "No",
                                                        mark_on_pcb: "Remove Mark",
                                                        electrical_test: "No",
                                                        gold_fingers: "No",
                                                        castellated_holes: "No",
                                                        edge_plating: "No",
                                                        blind_slots: "No",
                                                        ul_marking: "No",
                                                        humidity_indicator_card: "No"
                                                    });


                                                    fileInputRef.current.value = "";
                                                }}
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="pcb-gerber-secure">
                                <FaLock />
                                <span>All uploads are secure and confidential.</span>
                            </div>


                        </div>
                    </div>


                    {(
                        previewImages.top_copper ||
                        previewImages.bottom_copper ||
                        previewImages.outline ||
                        previewImages.top_silk ||
                        previewImages.drill ||
                        previewImages.pcb_bg?.[specifications.pcb_color.toLowerCase()]
                    ) && (
                            <div className="pcb-preview-card mt-3">
                                <div className="row p-3">

                                    {/* ================= FRONT SIDE ================= */}
                                    <div className="col-md-6 text-center">
                                        <h6 className="text-center mb-2">FRONT SIDE</h6>
                                        <div
                                            className="pcb-layer-box"
                                            style={{
                                                position: "relative",
                                                width: "100%",
                                                maxWidth: "450px",
                                                aspectRatio: `${boardInfo.width || 100} / ${boardInfo.height || 100}`,
                                                background: "transparent",
                                                margin: "0 auto",
                                                cursor: "pointer",
                                                borderRadius: "6px",
                                                overflow: "hidden"
                                            }}
                                            onClick={() =>
                                                setViewer({ open: true, side: "front", scale: 1, x: 0, y: 0 })
                                            }
                                        >
                                            {previewImages.pcb_bg?.[specifications.pcb_color.toLowerCase()] && (
                                                <img
                                                    src={previewImages.pcb_bg[specifications.pcb_color.toLowerCase()]}
                                                    className="pcb-layer pcb-board-bg"
                                                    style={{ zIndex: 1 }}
                                                    alt=""
                                                />
                                            )}

                                            {previewImages.top_copper && <img src={previewImages.top_copper} className="pcb-layer copper" style={{ zIndex: 2 }} alt="" />}
                                            {previewImages.top_mask && <img src={previewImages.top_mask} className="pcb-layer mask" style={{ zIndex: 3 }} alt="" />}
                                            {previewImages.outline && <img src={previewImages.outline} className="pcb-layer outline" style={{ zIndex: 4 }} alt="" />}
                                            {previewImages.top_silk && <img src={previewImages.top_silk} className="pcb-layer silk" style={{ zIndex: 5 }} alt="" />}
                                            {previewImages.drill && <img src={previewImages.drill} className="pcb-layer drill" style={{ zIndex: 6 }} alt="" />}
                                        </div>
                                    </div>

                                    {/* ================= BACK SIDE ================= */}
                                    <div className="col-md-6 text-center">
                                        <h6 className="text-center mb-2">BACK SIDE</h6>
                                        <div
                                            className="pcb-layer-box"
                                            style={{
                                                position: "relative",
                                                width: "100%",
                                                maxWidth: "450px",
                                                aspectRatio: `${boardInfo.width || 100} / ${boardInfo.height || 100}`,
                                                background: "transparent",
                                                margin: "0 auto",
                                                cursor: "pointer",
                                                borderRadius: "6px",
                                                overflow: "hidden",
                                                transform: "scaleX(-1)"
                                            }}
                                            onClick={() =>
                                                setViewer({ open: true, side: "back", scale: 1, x: 0, y: 0 })
                                            }
                                        >
                                            {previewImages.pcb_bg?.[specifications.pcb_color.toLowerCase()] && (
                                                <img
                                                    src={previewImages.pcb_bg[specifications.pcb_color.toLowerCase()]}
                                                    className="pcb-layer pcb-board-bg"
                                                    style={{ zIndex: 1 }}
                                                    alt=""
                                                />
                                            )}

                                            {previewImages.bottom_copper && <img src={previewImages.bottom_copper} className="pcb-layer copper" style={{ zIndex: 2 }} alt="" />}
                                            {previewImages.bottom_mask && <img src={previewImages.bottom_mask} className="pcb-layer mask" style={{ zIndex: 3 }} alt="" />}
                                            {previewImages.outline && <img src={previewImages.outline} className="pcb-layer outline" style={{ zIndex: 4 }} alt="" />}
                                            {previewImages.bottom_silk && <img src={previewImages.bottom_silk} className="pcb-layer silk" style={{ zIndex: 5 }} alt="" />}
                                            {previewImages.drill && <img src={previewImages.drill} className="pcb-layer drill" style={{ zIndex: 6 }} alt="" />}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}


                    <div className="pcb-spec-wrapper">
                        {/* Base Material */}
                        <div className="pcb-spec-row">
                            <label className="pcb-spec-label">
                                Base Material
                                <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                            </label>

                            <div className="pcb-spec-options">
                                <button
                                    className={`pcb-material-card ${specifications.base_material === "FR-4" ? "active" : ""
                                        }`}
                                    onClick={() =>
                                        setSpecifications({
                                            ...specifications,
                                            base_material: "FR-4",
                                            product_type: "Industrial/Consumer electronics",
                                            pcb_color: "Green",
                                            pcb_thickness: "1.6mm",
                                            layers: 1,
                                            material: "FR4 TG135",
                                            surface_finish: "HASL(with lead)",
                                        })
                                    }
                                >
                                    <img src="assets/images/FR-4.png" alt="" />
                                    <span>FR-4</span>
                                </button>

                                <button
                                    className={`pcb-material-card ${specifications.base_material === "Aluminum" ? "active" : ""
                                        }`}
                                    onClick={() =>
                                        setSpecifications({
                                            ...specifications,
                                            base_material: "Aluminum",
                                            product_type: "Industrial/Consumer electronics",
                                            pcb_color: "White",
                                            pcb_thickness: "0.8mm",
                                            layers: 1,
                                            material: "",
                                            surface_finish: "HASL(with lead)",
                                        })
                                    }
                                >
                                    <img src="assets/images/aluminium.png" alt="" />
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
                                <button
                                    className={`pcb-layer-btn ${boardInfo.layer_count === 1 ? "active" : ""
                                        }`}
                                    onClick={() =>
                                        setBoardInfo({
                                            ...boardInfo,
                                            layer_count: 1
                                        })
                                    }
                                    disabled={!isLayerAllowed(1)}
                                >
                                    1
                                </button>
                                <button
                                    className={`pcb-layer-btn ${boardInfo.layer_count === 2 ? "active" : ""
                                        }`}
                                    onClick={() =>
                                        setBoardInfo({
                                            ...boardInfo,
                                            layer_count: 2
                                        })
                                    }
                                    disabled={!isLayerAllowed(2)}
                                >
                                    2
                                </button>
                                <button
                                    className={`pcb-layer-btn ${boardInfo.layer_count === 4 ? "active" : ""
                                        }`}
                                    onClick={() =>
                                        setBoardInfo({
                                            ...boardInfo,
                                            layer_count: 4
                                        })
                                    }
                                    disabled={!isLayerAllowed(4)}
                                >
                                    4
                                </button>

                                <button
                                    className={`pcb-layer-btn ${boardInfo.layer_count === 6 ? "active" : ""
                                        }`}
                                    onClick={() =>
                                        setBoardInfo({
                                            ...boardInfo,
                                            layer_count: 6
                                        })
                                    }
                                    disabled={!isLayerAllowed(6)}
                                >
                                    6
                                </button>

                                <button
                                    className={`pcb-layer-btn ${boardInfo.layer_count === 8 ? "active" : ""
                                        }`}
                                    onClick={() =>
                                        setBoardInfo({
                                            ...boardInfo,
                                            layer_count: 8
                                        })
                                    }
                                    disabled={!isLayerAllowed(8)}
                                >
                                    8
                                </button>

                                <button
                                    className={`pcb-layer-btn ${boardInfo.layer_count === 10 ? "active" : ""
                                        }`}
                                    onClick={() =>
                                        setBoardInfo({
                                            ...boardInfo,
                                            layer_count: 10
                                        })
                                    }
                                    disabled={!isLayerAllowed(10)}
                                >
                                    10
                                </button>
                            </div>
                        </div>

                        {/* Dimensions */}

                        <div className="pcb-spec-row">
                            <label className="pcb-spec-label">
                                Dimensions
                                <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                            </label>
                            <div className="pcb-dimension-box">
                                <input
                                    type="number"
                                    value={boardInfo.width}
                                    className="pcb-input-size"
                                    placeholder="Width"
                                    readOnly
                                />
                                <span className="pcb-cross">×</span>
                                <input
                                    type="number"
                                    value={boardInfo.height}
                                    className="pcb-input-size"
                                    placeholder="Height"
                                    readOnly
                                />
                                <select className="pcb-unit-select">
                                    <option>mm</option>
                                    <option>inch</option>
                                </select>
                            </div>
                        </div>

                        {/* PCB Qty */}
                        <div className="pcb-spec-row">
                            <label className="pcb-spec-label">
                                PCB Qty
                            </label>
                            <div className="pcb-qty-wrapper" ref={qtyRef}>
                                <div
                                    className="pcb-qty-select"
                                    onClick={() => setShowQty(!showQty)}
                                >
                                    <span>{specifications.pcb_qut}</span>
                                    <i className="fa-solid fa-angle-down"></i>
                                </div>

                                {
                                    showQty && (
                                        <div className="pcb-qty-popup">
                                            <div className="pcb-qty-grid">
                                                {
                                                    qtyList.map((qty) => (
                                                        <button
                                                            key={qty}
                                                            className={`pcb-layer-btn ${specifications.pcb_qut === qty ? "active" : ""
                                                                }`}
                                                            onClick={() => {
                                                                setSpecifications({
                                                                    ...specifications,
                                                                    pcb_qut: qty
                                                                })
                                                                setShowQty(false);
                                                            }}
                                                        >
                                                            {qty}
                                                        </button>
                                                    ))
                                                }
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
                                                            setSpecifications({
                                                                ...specifications,
                                                                pcb_qut: Number(customQty)
                                                            })
                                                            setShowQty(false)
                                                        }
                                                    }}
                                                >
                                                    Confirm
                                                </button>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>

                        {/* Product Type */}
                        <div className="pcb-spec-row">
                            <label className="pcb-spec-label">
                                Product Type
                                <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                            </label>
                            <div className="pcb-product-list">
                                <button
                                    className={`pcb-product-btn ${specifications.product_type === "Industrial/Consumer electronics" ? "active" : ""
                                        }`}
                                    onClick={() =>
                                        setSpecifications({
                                            ...specifications,
                                            product_type: "Industrial/Consumer electronics"
                                        })
                                    }

                                    disabled={
                                        !isProductAllowed(
                                            "Industrial/Consumer electronics"
                                        )
                                    }
                                >
                                    Industrial/Consumer electronics
                                </button>
                                <button
                                    className={`pcb-product-btn ${specifications.product_type === "Aerospace" ? "active" : ""
                                        }`}
                                    onClick={() =>
                                        setSpecifications({
                                            ...specifications,
                                            product_type: "Aerospace"
                                        })
                                    }
                                    disabled={
                                        !isProductAllowed(
                                            "Aerospace"
                                        )
                                    }
                                >
                                    Aerospace
                                </button>
                                <button
                                    className={`pcb-product-btn ${specifications.product_type === "Medical" ? "active" : ""
                                        }`}
                                    onClick={() =>
                                        setSpecifications({
                                            ...specifications,
                                            product_type: "Medical"
                                        })
                                    }

                                    disabled={
                                        !isProductAllowed(
                                            "Medical"
                                        )
                                    }
                                >
                                    Medical
                                </button>
                            </div>
                        </div>
                    </div>


                    <div className="pcb-specification-section">
                        <div
                            className="pcb-specification-header"
                            onClick={() => setShowSpecifications(!showSpecifications)}
                            style={{ cursor: "pointer" }}
                        >
                            <h5>PCB Specifications</h5>

                            <i
                                className={`fa-solid ${showSpecifications ? "fa-angle-up" : "fa-angle-down"
                                    }`}
                            ></i>
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
                                        <button className={`pcb-option-btn ${specifications.different_design === 1
                                            ? "active"
                                            : ""
                                            }`} onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    different_design: 1
                                                })
                                            }>1</button>
                                        <button className={`pcb-option-btn ${specifications.different_design === 2
                                            ? "active"
                                            : ""
                                            }`} onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    different_design: 2
                                                })
                                            }>2</button>
                                        <button className={`pcb-option-btn ${specifications.different_design === 3
                                            ? "active"
                                            : ""
                                            }`} onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    different_design: 3
                                                })
                                            }>3</button>
                                        <button className={`pcb-option-btn ${specifications.different_design === 4
                                            ? "active"
                                            : ""
                                            }`} onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    different_design: 4
                                                })
                                            }>4</button>
                                        <button className={`pcb-option-btn ${specifications.different_design === 5
                                            ? "active"
                                            : ""
                                            }`} onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    different_design: 5
                                                })
                                            }>5</button>
                                        <button className={`pcb-option-btn ${specifications.different_design === 6
                                            ? "active"
                                            : ""
                                            }`} onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    different_design: 6
                                                })
                                            }>6</button>
                                        <button className={`pcb-option-btn ${specifications.different_design === 7
                                            ? "active"
                                            : ""
                                            }`} onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    different_design: 7
                                                })
                                            }>7</button>
                                    </div>
                                </div>

                                {/* Delivery Format */}

                                <div className="pcb-specification-row">
                                    <label className="pcb-specification-label">
                                        Delivery Format
                                        <i className="fa-regular fa-circle-question pcb-help-icon"></i>
                                    </label>
                                    <div className="pcb-option-group">
                                        <button className={`pcb-option-btn ${specifications.delivery_format === "Single PCB"
                                            ? "active"
                                            : ""
                                            }`} onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    delivery_format: "Single PCB"
                                                })
                                            }>
                                            Single PCB
                                        </button>
                                        <button className={`pcb-option-btn ${specifications.delivery_format === "Panel by Customer"
                                            ? "active"
                                            : ""
                                            }`} onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    delivery_format: "Panel by Customer"
                                                })
                                            }>
                                            Panel by Customer
                                        </button>
                                        <button className={`pcb-option-btn ${specifications.delivery_format === "Panel by SC"
                                            ? "active"
                                            : ""
                                            }`} onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    delivery_format: "Panel by SC"
                                                })
                                            }>
                                            Panel by Secure Circuit
                                        </button>
                                    </div>
                                </div>

                                {/* PCB Thickness */}

                                <div className="pcb-specification-row">
                                    <label className="pcb-specification-label">
                                        PCB Thickness
                                        <i className="fa-regular fa-circle-question pcb-help-icon"></i>
                                    </label>
                                    <div className="pcb-option-group">
                                        <button
                                            className={`pcb-option-btn ${specifications.pcb_thickness === "0.8" ||
                                                specifications.pcb_thickness === "0.8mm"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    pcb_thickness: "0.8mm"
                                                })
                                            }
                                            disabled={!isThicknessAllowed("0.8mm")}
                                        >
                                            0.8mm
                                        </button>
                                        <button
                                            className={`pcb-option-btn ${specifications.pcb_thickness === "1.0" ||
                                                specifications.pcb_thickness === "1.0mm"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    pcb_thickness: "1.0mm"
                                                })
                                            }
                                            disabled={!isThicknessAllowed("1.0mm")}
                                        >
                                            1.0mm
                                        </button>

                                        <button
                                            className={`pcb-option-btn ${specifications.pcb_thickness === "1.2" ||
                                                specifications.pcb_thickness === "1.2mm"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    pcb_thickness: "1.2mm"
                                                })
                                            }
                                            disabled={!isThicknessAllowed("1.2mm")}
                                        >
                                            1.2mm
                                        </button>
                                       
                                        <button
                                            className={`pcb-option-btn ${specifications.pcb_thickness === "1.6" || specifications.pcb_thickness === "1.6mm"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    pcb_thickness: "1.6mm"
                                                })
                                            }
                                            disabled={!isThicknessAllowed("1.6mm")}
                                        >
                                            1.6mm
                                        </button>
                                        <button
                                            className={`pcb-option-btn ${specifications.pcb_thickness === "2.0" ||
                                                specifications.pcb_thickness === "2.0mm"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    pcb_thickness: "2.0mm"
                                                })
                                            }
                                            disabled={!isThicknessAllowed("2.0mm")}
                                        >
                                            2.0mm
                                        </button>
                                        <button
                                            className={`pcb-option-btn ${specifications.pcb_thickness === "2.4" ||
                                                specifications.pcb_thickness === "2.4mm"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    pcb_thickness: "2.4mm"
                                                })
                                            }
                                            disabled={!isThicknessAllowed("2.4mm")}
                                        >
                                            2.4mm
                                        </button>
                                        <button
                                            className={`pcb-option-btn ${specifications.pcb_thickness === "3.2" ||
                                                specifications.pcb_thickness === "3.2mm"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    pcb_thickness: "3.2mm"
                                                })
                                            }
                                            disabled={!isThicknessAllowed("3.2mm")}
                                        >
                                            3.2mm
                                        </button>
                                    </div>
                                </div>

                                {/* PCB Color */}

                                <div className="pcb-specification-row">
                                    <label className="pcb-specification-label">
                                        PCB Color
                                        <i className="fa-regular fa-circle-question pcb-help-icon"></i>
                                    </label>
                                    <div className="pcb-option-group">
                                        <button
                                            className={`pcb-color-btn ${specifications.pcb_color === "Green" ? "active" : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    pcb_color: "Green"
                                                })
                                            }
                                            disabled={!isColorAllowed("Green")}
                                        >
                                            <span className="pcb-color green"></span>
                                            Green
                                        </button>
                                        <button
                                            className={`pcb-color-btn ${specifications.pcb_color === "Purple"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    pcb_color: "Purple"
                                                })
                                            }
                                            disabled={!isColorAllowed("Purple")}
                                        >
                                            <span className="pcb-color purple"></span>
                                            Purple
                                        </button>
                                        <button
                                            className={`pcb-color-btn ${specifications.pcb_color === "Red" ? "active" : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    pcb_color: "Red"
                                                })
                                            }
                                            disabled={!isColorAllowed("Red")}
                                        >
                                            <span className="pcb-color red"></span>
                                            Red
                                        </button>
                                        <button
                                            className={`pcb-color-btn ${specifications.pcb_color === "Yellow"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    pcb_color: "Yellow"
                                                })
                                            }
                                            disabled={!isColorAllowed("Yellow")}
                                        >
                                            <span className="pcb-color yellow"></span>
                                            Yellow
                                        </button>
                                        <button
                                            className={`pcb-color-btn ${specifications.pcb_color === "Blue"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    pcb_color: "Blue"
                                                })
                                            }
                                            disabled={!isColorAllowed("Blue")}
                                        >
                                            <span className="pcb-color blue"></span>
                                            Blue
                                        </button>
                                        <button
                                            className={`pcb-color-btn ${specifications.pcb_color === "White"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    pcb_color: "White"
                                                })
                                            }
                                            disabled={!isColorAllowed("White")}
                                        >
                                            <span className="pcb-color white"></span>
                                            White
                                        </button>

                                        <button
                                            className={`pcb-color-btn ${specifications.pcb_color === "Black"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    pcb_color: "Black"
                                                })
                                            }
                                            disabled={!isColorAllowed("Black")}
                                        >
                                            <span className="pcb-color black"></span>
                                            Black
                                        </button>
                                    </div>
                                </div>

                                {/* Silkscreen */}

                                <div className="pcb-specification-row">
                                    <label className="pcb-specification-label">
                                        Silkscreen
                                        <i className="fa-regular fa-circle-question pcb-help-icon"></i>
                                    </label>
                                    <div className="pcb-option-group">
                                        <button
                                            className={`pcb-color-btn ${specifications.silkscreen === "White"
                                                ? "active"
                                                : "active"
                                                }`}

                                        >
                                            <span className="pcb-color white"></span>
                                            White
                                        </button>
                                    </div>
                                </div>

                                {/* Material Type */}

                                <div className="pcb-specification-row">
                                    <label className="pcb-specification-label">
                                        Material Type
                                        <i className="fa-regular fa-circle-question pcb-help-icon"></i>
                                    </label>
                                    <div className="pcb-option-group">
                                        <button
                                            className={`pcb-option-btn ${specifications.material === "FR4 TG135"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    material: "FR4 TG135"
                                                })
                                            }
                                            disabled={!isMaterialAllowed("FR4 TG135")}
                                        >
                                            FR4 TG135
                                        </button>
                                        <button
                                            className={`pcb-option-btn ${specifications.material === "KB6164 - TG135"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    material: "KB6164 - TG135"
                                                })
                                            }
                                            disabled={!isMaterialAllowed("KB6164 - TG135")}
                                        >
                                            KB6164 - TG135
                                        </button>
                                        <button
                                            className={`pcb-option-btn ${specifications.material === "Nan Ya NP-140F"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    material: "Nan Ya NP-140F"
                                                })
                                            }
                                            disabled={!isMaterialAllowed("Nan Ya NP-140F")}
                                        >
                                            Nan Ya NP-140F
                                        </button>
                                        <button
                                            className={`pcb-option-btn ${specifications.material === "S1141 TG140"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    material: "S1141 TG140"
                                                })
                                            }
                                            disabled={!isMaterialAllowed("S1141 TG140")}
                                        >
                                            S1141 TG140
                                        </button>
                                        <button
                                            className={`pcb-option-btn ${specifications.material === "S1000H TG155"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    material: "S1000H TG155"
                                                })
                                            }
                                            disabled={!isMaterialAllowed("S1000H TG155")}
                                        >
                                            S1000H TG155
                                        </button>
                                    </div>
                                </div>

                                {/* Surface Finish */}

                                <div className="pcb-specification-row">
                                    <label className="pcb-specification-label">
                                        Surface Finish
                                        <i className="fa-regular fa-circle-question pcb-help-icon"></i>
                                    </label>
                                    <div className="pcb-option-group">
                                        <button
                                            className={`pcb-option-btn ${specifications.surface_finish === "HASL(with lead)"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    surface_finish: "HASL(with lead)"
                                                })
                                            }
                                            disabled={!isSurfaceAllowed("HASL(with lead)")}
                                        >
                                            HASL(with lead)
                                        </button>
                                        <button
                                            className={`pcb-option-btn ${specifications.surface_finish === "LeadFree HASL"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    surface_finish: "LeadFree HASL"
                                                })
                                            }
                                            disabled={!isSurfaceAllowed("LeadFree HASL")}
                                        >
                                            LeadFree HASL
                                        </button>
                                        <button
                                            className={`pcb-option-btn ${specifications.surface_finish === "ENIG"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    surface_finish: "ENIG"
                                                })
                                            }
                                            disabled={!isSurfaceAllowed("ENIG")}
                                        >
                                            ENIG
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ==========================================
                                    High-spec Options
                        ========================================== */}

                    <div className="pcb-highspec-section">
                        <div className="pcb-highspec-header" onClick={() => setShowHighspec(!showHighspec)} style={{ cursor: "pointer" }}>
                            <h5>High Specifications Options</h5>
                            <i
                                className={`fa-solid ${showHighspec ? "fa-angle-up" : "fa-angle-down"
                                    }`}
                            ></i>
                        </div>
                        {showHighspec && (
                            <div className="pcb-highspec-body">
                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Outer Copper Weight
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>
                                    <div className="pcb-highspec-options">
                                        <button
                                            className={`pcb-highspec-btn ${specifications.outer_copper === "1 oz"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    outer_copper: "1 oz"
                                                })
                                            }
                                        >
                                            1 oz
                                        </button>
                                        <button
                                            className={`pcb-highspec-btn ${specifications.outer_copper === "2 oz"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    outer_copper: "2 oz"
                                                })
                                            }
                                        >
                                            2 oz
                                        </button>
                                        <button
                                            className={`pcb-highspec-btn ${specifications.outer_copper === "2.5 oz"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    outer_copper: "2.5 oz"
                                                })
                                            }
                                        >
                                            2.5 oz
                                        </button>
                                        <button
                                            className={`pcb-highspec-btn ${specifications.outer_copper === "3.5 oz"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    outer_copper: "3.5 oz"
                                                })
                                            }
                                        >
                                            3.5 oz
                                        </button>
                                        <button
                                            className={`pcb-highspec-btn ${specifications.outer_copper === "4.5 oz"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    outer_copper: "4.5 oz"
                                                })
                                            }
                                        >
                                            4.5 oz
                                        </button>
                                    </div>
                                </div>

                                {/* Via Covering */}

                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Via Covering
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>
                                    <div className="pcb-highspec-options">
                                        <button
                                            className={`pcb-highspec-btn ${specifications.via_covering === "Tented"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    via_covering: "Tented"
                                                })
                                            }
                                        >
                                            Tented
                                        </button>
                                        <button
                                            className={`pcb-highspec-btn ${specifications.via_covering === "Untented"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    via_covering: "Untented"
                                                })
                                            }
                                        >
                                            Untented
                                        </button>
                                        <button
                                            className={`pcb-highspec-btn ${specifications.via_covering === "Plugged"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    via_covering: "Plugged"
                                                })
                                            }
                                        >
                                            Plugged
                                        </button>
                                        <button
                                            className={`pcb-highspec-btn ${specifications.via_covering === "Epoxy Filled & Capped"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    via_covering: "Epoxy Filled & Capped"
                                                })
                                            }
                                        >
                                            Epoxy Filled &amp; Capped
                                        </button>
                                    </div>
                                </div>

                                {/* Via Plating Method */}

                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Via Plating Method
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>

                                    <div className="pcb-highspec-options">
                                        <button
                                            className={`pcb-highspec-btn ${specifications.via_plating === "Not Specified"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    via_plating: "Not Specified"
                                                })
                                            }
                                        >
                                            Not Specified
                                        </button>
                                        <button
                                            className={`pcb-highspec-btn ${specifications.via_plating === "Conductive Adhesive"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    via_plating: "Conductive Adhesive"
                                                })
                                            }
                                        >
                                            Conductive Adhesive
                                        </button>
                                    </div>
                                </div>

                                {/* Min Via Hole */}

                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Min via hole size / diameter
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>
                                    <div className="pcb-highspec-options">
                                        <button
                                            className={`pcb-highspec-btn ${specifications.min_via_size === "0.3mm"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    min_via_size: "0.3mm"
                                                })
                                            }
                                        >
                                            0.3mm (0.4 / 0.45mm)
                                        </button>
                                        <button
                                            className={`pcb-highspec-btn ${specifications.min_via_size === "0.25mm"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    min_via_size: "0.25mm"
                                                })
                                            }
                                        > 0.25mm (0.35 / 0.4mm)
                                        </button>
                                        <button
                                            className={`pcb-highspec-btn ${specifications.min_via_size === "0.2mm"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    min_via_size: "0.2mm"
                                                })
                                            }
                                        >
                                            0.2mm (0.3 / 0.35mm)
                                        </button>
                                        <button
                                            className={`pcb-highspec-btn ${specifications.min_via_size === "0.15mm"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    min_via_size: "0.15mm"
                                                })
                                            }
                                        >
                                            0.15mm (0.25 / 0.3mm)
                                        </button>
                                    </div>
                                </div>

                                {/* Board Outline Tolerance */}

                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Board Outline Tolerance
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>
                                    <div className="pcb-highspec-options">
                                        <button
                                            className={`pcb-highspec-btn ${specifications.board_outline_tolerance === "±0.2mm"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    board_outline_tolerance: "±0.2mm"
                                                })
                                            }
                                        >
                                            ±0.2mm (Regular)
                                        </button>
                                        <button
                                            className={`pcb-highspec-btn ${specifications.board_outline_tolerance === "±0.1mm"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    board_outline_tolerance: "±0.1mm"
                                                })
                                            }
                                        >
                                            ±0.1mm (Precision)
                                        </button>
                                    </div>
                                </div>


                                {/* ==========================================
                                           Remaining High-spec Options
                                    ========================================== */}

                                {/* Confirm Production File */}

                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Confirm Production File
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>

                                    <div className="pcb-highspec-options">
                                        <button
                                            className={`pcb-highspec-btn ${specifications.confirm_production_file === "No"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    confirm_production_file: "No"
                                                })
                                            }
                                        >No</button>
                                        <button
                                            className={`pcb-highspec-btn ${specifications.confirm_production_file === "Yes"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    confirm_production_file: "Yes"
                                                })
                                            }
                                        >Yes</button>
                                    </div>
                                </div>

                                {/* Mark on PCB */}

                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Mark on PCB
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>

                                    <div className="pcb-highspec-options">
                                        <button
                                            className={`pcb-highspec-btn ${specifications.mark_on_pcb === "Remove Mark"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    mark_on_pcb: "Remove Mark"
                                                })
                                            }
                                        >
                                            Remove Mark
                                        </button>

                                        <button
                                            className={`pcb-highspec-btn ${specifications.mark_on_pcb === "2D barcode (Serial Number)"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    mark_on_pcb: "2D barcode (Serial Number)"
                                                })
                                            }
                                        >
                                            2D barcode (Serial Number)
                                        </button>
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
                                            className={`pcb-highspec-btn ${specifications.electrical_test === "Flying Probe Fully Test"
                                                ? "active"
                                                : "active"
                                                }`}
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
                                        <button
                                            className={`pcb-highspec-btn ${specifications.gold_fingers === "No"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    gold_fingers: "No"
                                                })
                                            }
                                        >No</button>
                                        <button
                                            className={`pcb-highspec-btn ${specifications.gold_fingers === "Yes"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    gold_fingers: "Yes"
                                                })
                                            }
                                        >Yes</button>
                                    </div>
                                </div>

                                {/* Castellated Holes */}

                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Castellated Holes
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>
                                    <div className="pcb-highspec-options">
                                        <button
                                            className={`pcb-highspec-btn ${specifications.castellated_holes === "No"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    castellated_holes: "No"
                                                })
                                            }
                                        >No</button>
                                        <button
                                            className={`pcb-highspec-btn ${specifications.castellated_holes === "Yes"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    castellated_holes: "Yes"
                                                })
                                            }
                                        >Yes</button>
                                    </div>
                                </div>

                                {/* Edge Plating */}

                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Edge Plating
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>

                                    <div className="pcb-highspec-options">
                                        <button
                                            className={`pcb-highspec-btn ${specifications.edge_plating === "No"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    edge_plating: "No"
                                                })
                                            }
                                        >No</button>
                                        <button
                                            className={`pcb-highspec-btn ${specifications.edge_plating === "Yes"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    edge_plating: "Yes"
                                                })
                                            }
                                        >Yes</button>
                                    </div>
                                </div>

                                {/* Blind Slots */}

                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Blind Slots
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>

                                    <div className="pcb-highspec-options">
                                        <button
                                            className={`pcb-highspec-btn ${specifications.blind_slots === "No"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    blind_slots: "No"
                                                })
                                            }
                                        >No</button>
                                        <button
                                            className={`pcb-highspec-btn ${specifications.blind_slots === "Yes"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    blind_slots: "Yes"
                                                })
                                            }
                                        >Yes</button>
                                    </div>
                                </div>

                                {/* UL Marking */}

                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        UL Marking
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>

                                    <div className="pcb-highspec-options">
                                        <button
                                            className={`pcb-highspec-btn ${specifications.ul_marking === "No"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    ul_marking: "No"
                                                })
                                            }
                                        >
                                            No
                                        </button>
                                        <button
                                            className={`pcb-highspec-btn ${specifications.ul_marking === "Yes (Any Position)"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    ul_marking: "Yes (Any Position)"
                                                })
                                            }
                                        >
                                            Yes (Any Position)
                                        </button>
                                        <button
                                            className={`pcb-highspec-btn ${specifications.ul_marking === "Yes (Specify Position)"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    ul_marking: "Yes (Specify Position)"
                                                })
                                            }
                                        >
                                            Yes (Specify Position)
                                        </button>

                                    </div>
                                </div>

                                {/* Humidity Indicator Card */}

                                <div className="pcb-highspec-row">
                                    <label className="pcb-highspec-label">
                                        Humidity Indicator Card
                                        <i className="fa-regular fa-circle-question pcb-highspec-help"></i>
                                    </label>
                                    <div className="pcb-highspec-options">
                                        <button
                                            className={`pcb-highspec-btn ${specifications.humidity_indicator_card === "No"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    humidity_indicator_card: "No"
                                                })
                                            }
                                        >No</button>
                                        <button
                                            className={`pcb-highspec-btn ${specifications.humidity_indicator_card === "Yes"
                                                ? "active"
                                                : ""
                                                }`}
                                            onClick={() =>
                                                setSpecifications({
                                                    ...specifications,
                                                    humidity_indicator_card: "Yes"
                                                })
                                            }
                                        >Yes</button>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                    {/* ==========================================
                                     Advanced Options
                        ========================================== */}

                    <div className="pcb-advanced-section">

                        <div className="pcb-advanced-header" onClick={() => setShowAdvanced(!showAdvanced)} style={{ cursor: "pointer" }}>
                            <h5>Advanced Options</h5>
                            <i
                                className={`fa-solid ${showAdvanced ? "fa-angle-up" : "fa-angle-down"
                                    }`}
                            ></i>
                        </div>

                        {showAdvanced && (
                            <div className="pcb-advanced-body">

                                {/* PCB Remark */}

                                <div className="pcb-advanced-row align-start">
                                    <label className="pcb-advanced-label">
                                        PCB Remark
                                        <i className="fa-solid fa-pencil pcb-advanced-help"></i>
                                    </label>
                                    <div className="pcb-advanced-remark">
                                        <textarea
                                            className="pcb-advanced-textarea"
                                            maxLength="200"
                                            value={specifications.pcb_remark}
                                            onChange={(e) =>
                                                setSpecifications({
                                                    ...specifications,
                                                    pcb_remark: e.target.value,
                                                })
                                            }
                                            placeholder="Leave a remark for this PCB order if necessary. Other remarks about the PCBA or stencil, please fill in the corresponding areas."
                                        ></textarea>

                                        <span className="pcb-advanced-counter">
                                            200
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-lg-4 col-md-6 pt-lg-4 pe-lg-4">
                    <div
                        className={`pcb-sticky ${stickyState}`}
                    >
                        <div className="pcb-cart-card">

                            <div className="pcb-preview-header mt-3">
                                <h6>Quote Preview</h6>
                                <span>Live Preview</span>
                            </div>

                            <div
                                className="pcb-preview-card-quote"
                                onClick={() => setShowPdf(true)}
                            >

                                <img
                                    src="assets/images/pdf-preview.png"
                                    alt="PDF Preview"
                                    className="pcb-preview-image"
                                />

                                <div className="pcb-preview-overlay">
                                    <i className="fa-regular fa-file-pdf"></i>
                                    <span>Preview</span>
                                </div>

                            </div>

                            <button
                                className="pcb-add-cart-btn mt-3"
                                onClick={() => setShowSaveQuoteModal(true)}
                            >
                                <i className="fa-solid fa-floppy-disk me-2"></i>
                                SAVE CART
                            </button>

                        </div>

                    </div>
                </div>
            </div>

            <div ref={footerRef}></div>

            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    opacity: 0,
                    pointerEvents: "none",
                    width: "100%",
                    background: "#fff",
                    zIndex: -9999
                }}
            >
                <div ref={pdfRef}>
                    <Pdf
                        boardInfo={boardInfo}
                        specifications={specifications}
                    />
                </div>
            </div>

            {showPdf && (
                <div className="pdf-modal">
                    <div className="pdf-modal-content">

                        <button
                            className="pdf-close"
                            onClick={() => setShowPdf(false)}
                        >
                            ✕
                        </button>

                        <div className="pdf-modal-content">
                            <Pdf
                                boardInfo={boardInfo}
                                specifications={specifications}
                            />
                        </div>

                    </div>
                </div>
            )}



            {showSaveQuoteModal && (
                <div className="model-add-edit-modal-overlay">
                    <div className="model-add-edit-modal-dialog model-size-sm">
                        <div className="model-add-edit-modal-content">
                            <div className="model-add-edit-modal-header">
                                <h5 className="model-add-edit-modal-title">
                                    Save Cart
                                </h5>

                                <button
                                    type="button"
                                    className="model-add-edit-modal-close"
                                    onClick={() => {
                                        setShowSaveQuoteModal(false);

                                        setCustomerInfo({
                                            cust_contact_person: "",
                                            cust_email: "",
                                            cust_mobile: "",
                                        });
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="model-add-edit-modal-body">
                                <div className="row g-3"></div>

                                <div className="col-md-12 mt-2">
                                    <label className="model-add-edit-label">Full Name</label>
                                    <input
                                        className="model-add-edit-input"
                                        value={customerInfo.cust_contact_person}
                                        placeholder="Full Name"
                                        onChange={(e) =>
                                            setCustomerInfo({
                                                ...customerInfo,
                                                cust_contact_person: e.target.value
                                            })
                                        }
                                    />
                                </div>

                                <div className="col-md-12 mt-2">
                                    <label className="model-add-edit-label">Email</label>
                                    <input
                                        className="model-add-edit-input"
                                        type="email"
                                        value={customerInfo.cust_email}
                                        placeholder="Email"
                                        onChange={(e) =>
                                            setCustomerInfo({
                                                ...customerInfo,
                                                cust_email: e.target.value
                                            })
                                        }
                                    />
                                </div>

                                <div className="col-md-12 mt-2">
                                    <label className="model-add-edit-label">Mobile</label>
                                    <input
                                        className="model-add-edit-input"
                                        placeholder="Mobile Number"
                                        value={customerInfo.cust_mobile}
                                        onChange={(e) =>
                                            setCustomerInfo({
                                                ...customerInfo,
                                                cust_mobile: e.target.value
                                            })
                                        }
                                    />
                                </div>

                                <div className="col-md-12 mt-2">
                                    <label className="model-add-edit-label">Component/Part Name</label>
                                    <input
                                        className="model-add-edit-input"
                                        value={customerInfo.save_quote_name}
                                        placeholder="Component/Part Name"
                                        onChange={(e) =>
                                            setCustomerInfo({
                                                ...customerInfo,
                                                save_quote_name: e.target.value
                                            })
                                        }
                                    />
                                </div>

                            </div>

                            <div className="model-add-edit-modal-footer d-flex justify-content-between">
                                <button
                                    className="model-add-edit-btn model-add-edit-btn-cancel"
                                    onClick={() => {
                                        setShowSaveQuoteModal(false);

                                        setCustomerInfo({
                                            cust_contact_person: "",
                                            cust_email: "",
                                            cust_mobile: "",
                                            save_quote_name: ""
                                        });
                                    }}
                                >
                                    Close
                                </button>

                                <button
                                    className="model-add-edit-btn model-add-edit-btn-save"
                                    onClick={handleSaveQuote}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            )}

            {viewer.open && (
                <div
                    className="pcb-image-viewer"
                    onWheel={handleWheel}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    <button
                        className="pcb-close-btn"
                        onClick={() =>
                            setViewer({
                                open: false,
                                side: "front",
                                scale: 1,
                                x: 0,
                                y: 0,
                            })
                        }
                    >
                        ✕
                    </button>

                    <button
                        className="pcb-reset-btn"
                        onClick={() =>
                            setViewer((prev) => ({
                                ...prev,
                                scale: 1,
                                x: 0,
                                y: 0,
                            }))
                        }
                    >
                        Reset
                    </button>

                    <div
                        className="pcb-view-board"
                        style={{
                            transform: `translate(${viewer.x}px,${viewer.y}px) scale(${viewer.scale})`
                        }}
                    >
                        {viewer.side === "front" ? (
                            <>
                                {previewImages.pcb_bg?.[specifications.pcb_color.toLowerCase()] && (
                                    <img
                                        src={previewImages.pcb_bg[specifications.pcb_color.toLowerCase()]}
                                        className="pcb-layer pcb-board-bg"
                                        style={{ zIndex: 2 }}
                                        alt=""
                                    />
                                )}

                                <img src={previewImages.top_copper} className="pcb-layer copper" style={{ zIndex: 3 }} />
                                <img src={previewImages.top_mask} className="pcb-layer mask" style={{ zIndex: 4 }} />
                                <img src={previewImages.outline} className="pcb-layer outline" style={{ zIndex: 5 }} />
                                <img src={previewImages.top_silk} className="pcb-layer silk" style={{ zIndex: 6 }} />
                                <img src={previewImages.drill} className="pcb-layer drill" style={{ zIndex: 7 }} />
                            </>
                        ) : (
                            <>
                                {previewImages.pcb_bg?.[specifications.pcb_color.toLowerCase()] && (
                                    <img
                                        src={previewImages.pcb_bg[specifications.pcb_color.toLowerCase()]}
                                        className="pcb-layer pcb-board-bg"
                                        style={{ zIndex: 2 }}
                                        alt=""
                                    />
                                )}

                                <img src={previewImages.bottom_copper} className="pcb-layer copper" style={{ zIndex: 3 }} />
                                <img src={previewImages.bottom_mask} className="pcb-layer mask" style={{ zIndex: 4 }} />
                                <img src={previewImages.outline} className="pcb-layer outline" style={{ zIndex: 5 }} />
                                <img src={previewImages.bottom_silk} className="pcb-layer silk" style={{ zIndex: 6 }} />
                                <img src={previewImages.drill} className="pcb-layer drill" style={{ zIndex: 7 }} />
                            </>
                        )}
                    </div>
                </div>
            )}

        </>
    );
};