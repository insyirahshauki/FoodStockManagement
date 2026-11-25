
import React, { useEffect, useRef, useState } from "react";
import { FoodService } from "../../Services/FoodService";
import html2pdf from "html2pdf.js";
import "./FoodCatalog.css";

const FoodCatalog = () => {

    // =========================
    // STATE
    // =========================

    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [downloading, setDownloading] = useState(false);

    const brochureRef = useRef(null);


    // =========================
    // CATEGORY COLOURS
    // =========================

    const categoryColors = [
        "pink",
        "purple",
        "green",
        "orange",
        "turquoise",
        "blue"
    ];


    // =========================
    // LOAD FOOD ITEMS
    // =========================

    useEffect(() => {
        loadFoodItems();
    }, []);

    const loadFoodItems = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await FoodService.getActiveFoodItemsForCatalogue();

            // await FoodService.getActiveFoodItemsForCatalogue();

            setFoodItems(response);

        } catch (err) {
            console.error("Error loading food items:", err);
            setError("Failed to load food catalogue.");
        } finally {
            setLoading(false);
        }
    };


    // =========================
    // FORMAT PRICE
    // =========================

    const formatPrice = (price) => {

        const value = Number(price);

        if (!Number.isFinite(value)) {
            return "RM 0.00";
        }

        return `RM ${value.toFixed(2)}`;

    };


    // // =========================
    // // GET CATEGORY NAME
    // // =========================
    // const getCategoryName = (item) => {
    //     return item.categoryName || "Other";
    // };


    // =========================
    // GROUP FOOD ITEMS
    // =========================

    const groupedFoodItems = foodItems.reduce((groups, item) => {
        const categoryName =
            item.category?.categoryName ||
            item.categoryName ||
            "Other";

        if (!groups[categoryName]) {
            groups[categoryName] = [];
        }

        groups[categoryName].push(item);

        return groups;
    }, {});


    // =========================
    // SORT CATEGORY NAMES
    // =========================

    const sortedCategories = Object.entries(groupedFoodItems)
        .sort(([a], [b]) => a.localeCompare(b));


    // =========================
    // DOWNLOAD PDF
    // =========================

  
const handleDownload = async () => {

    if (!brochureRef.current || downloading) {
        return;
    }

    const element = brochureRef.current;

    try {

        setDownloading(true);

        // Activate PDF-specific design
        element.classList.add("brochure-print-mode");

        // Wait for CSS layout to update
        await new Promise(resolve =>
            requestAnimationFrame(() =>
                requestAnimationFrame(resolve)
            )
        );

        // Wait for fonts
        if (document.fonts?.ready) {
            await document.fonts.ready;
        }

        // Wait for images
        const images = Array.from(
            element.querySelectorAll("img")
        );

        await Promise.all(
            images.map(img => {
                if (img.complete) {
                    return Promise.resolve();
                }

                return new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            })
        );

        const options = {

            margin: [8, 8, 8, 8],

            filename: "Homemade-Food-Catalogue.pdf",

            image: {
                type: "jpeg",
                quality: 0.98
            },

            html2canvas: {
                scale: 2,
                useCORS: true,
                backgroundColor: "#fffaf6",
                logging: false,
                windowWidth: 1000,
                scrollX: 0,
                scrollY: 0
            },

            jsPDF: {
                unit: "mm",
                format: "a4",
                orientation: "portrait"
            },

            pagebreak: {
                mode: ["css", "legacy"],
                avoid: [
                    ".brochure-category-card",
                    ".brochure-footer"
                ]
            }

        };

        await html2pdf()
            .set(options)
            .from(element)
            .save();

    } catch (err) {

        console.error("PDF download error:", err);

        alert(
            "Unable to download brochure. Please try again."
        );

    } finally {

        // Restore original screen design
        element.classList.remove("brochure-print-mode");

        setDownloading(false);

    }

};



    // =========================
    // RENDER
    // =========================

    return (

        <div className="food-brochure-page">

            {/* =========================
                ACTION BAR
            ========================= */}

            <div className="brochure-actions">

                <button
                    type="button"
                    className="brochure-back-btn"
                    onClick={() => window.history.back()}
                >
                    ← Back
                </button>


                <button
                    type="button"
                    className="brochure-download-btn"
                    onClick={handleDownload}
                    disabled={
                        loading ||
                        downloading ||
                        !!error ||
                        foodItems.length === 0
                    }
                >

                    {downloading
                        ? "Preparing PDF..."
                        : "⬇ Download Brochure"}

                </button>

            </div>


            {/* =========================
                BROCHURE CONTENT
            ========================= */}

            <div
                className="food-brochure"
                ref={brochureRef}
            >


                {/* =========================
                    COVER
                ========================= */}

                <section className="brochure-cover">

                    <div className="brochure-decoration decoration-left">
                        ♥
                    </div>

                    <div className="brochure-decoration decoration-right">
                        ♥
                    </div>


                    <div className="brochure-cover-content">

                        <div className="brochure-logo">
                            ♡
                        </div>


                        <p className="brochure-small-title">
                            WELCOME TO OUR LITTLE KITCHEN
                        </p>


                        <h3>
                            Homemade
                            <br />
                            Food Catalogue
                        </h3>


                        <div className="brochure-ribbon">
                            Delicious Homemade Treats ♡
                        </div>


                        <p className="brochure-intro">
                            Freshly prepared with love,
                            made specially for you!
                        </p>


                        <div className="brochure-flower">
                            ✿　♡　✿
                        </div>

                    </div>

                </section>



                {/* =========================
                    PRODUCT SECTION
                ========================= */}

                <section className="brochure-products">


                    <div className="brochure-section-title">

                        <span>
                            ♡ OUR HOMEMADE SELECTION ♡
                        </span>

                        <p>
                            Explore our delicious homemade treats
                        </p>

                    </div>



                    {/* LOADING */}

                    {loading && (

                        <div className="brochure-message">
                            Loading food catalogue...
                        </div>

                    )}



                    {/* ERROR */}

                    {!loading && error && (

                        <div className="brochure-error">
                            {error}
                        </div>

                    )}



                    {/* NO FOOD ITEMS */}

                    {!loading &&
                        !error &&
                        foodItems.length === 0 && (

                            <div className="brochure-message">
                                No active food items available.
                            </div>

                        )}



                    {/* CATEGORY CARDS */}

                    {!loading &&
                        !error &&
                        foodItems.length > 0 && (

                            <div className="brochure-category-grid">

                                {sortedCategories.map(
                                    ([category, items], index) => (

                                        <div
                                            className={`brochure-category-card ${categoryColors[
                                                index % categoryColors.length
                                            ]
                                                }`}
                                            key={category}
                                        >


                                            {/* CATEGORY HEADER */}

                                            <div className="brochure-category-header">

                                                <span>
                                                    {category}
                                                </span>

                                            </div>



                                            {/* FOOD ITEM LIST */}

                                            <div className="brochure-item-list">

                                                {items.map((item, itemIndex) => (

                                                    <div
                                                        className="brochure-item"
                                                        key={
                                                            item.foodItemId ||
                                                            item.id ||
                                                            `${category}-${itemIndex}`
                                                        }
                                                    >


                                                        {/* FOOD NAME */}

                                                        <div className="brochure-item-name">

                                                            <span className="brochure-heart">
                                                                ♥
                                                            </span>

                                                            <span>
                                                                {item.foodName}
                                                            </span>

                                                        </div>



                                                        {/* SELLING PRICE */}

                                                        <div className="brochure-item-price">

                                                            {formatPrice(
                                                                item.sellingPrice
                                                            )}

                                                            {item.unit && (
                                                                <small>
                                                                    / {item.unit}
                                                                </small>
                                                            )}

                                                        </div>

                                                    </div>

                                                ))}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                </section>



                {/* =========================
                    FOOTER
                ========================= */}

                <section className="brochure-footer">

                    <div className="brochure-footer-decoration">
                        ♥
                    </div>


                    <h2>
                        Thank You for Your Support!
                    </h2>


                    <p>
                        Homemade with Love • Fresh & Delicious
                    </p>


                    <div className="brochure-footer-heart">
                        ♡
                    </div>

                </section>


            </div>

        </div>

    );

};

export default FoodCatalog;
