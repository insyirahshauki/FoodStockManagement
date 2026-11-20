import React, { useEffect, useState } from "react";
import { FoodService } from "../../Services/FoodService";
import "./FoodBrochure.css";

const FoodBrochure = () => {
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadFoodItems();
    }, []);

    const loadFoodItems = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await FoodService.getFoodItems();

            const items = Array.isArray(data) ? data : [];

            // Only show active food items
            const activeItems = items.filter(
                item => item.isActive === true
            );

            setFoodItems(activeItems);

        } catch (err) {
            console.error("Error loading food items:", err);
            setError("Failed to load food items.");
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        const value = Number(price);

        if (isNaN(value)) {
            return "RM 0.00";
        }

        return `RM ${value.toFixed(2)}`;
    };

    const getCategoryName = (item) => {
        if (item.category?.categoryName) {
            return item.category.categoryName;
        }

        if (item.categoryName) {
            return item.categoryName;
        }

        return "Food";
    };

    const getImageUrl = (item) => {
        if (item.imageUrl) {
            return item.imageUrl;
        }

        if (item.image) {
            return item.image;
        }

        return "https://via.placeholder.com/600x400?text=Food+Item";
    };

    const handlePrint = () => {
        window.print();
    };

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
                    className="brochure-print-btn"
                    onClick={handlePrint}
                >
                    🖨 Print / Save as PDF
                </button>

            </div>


            {/* =========================
                BROCHURE
            ========================= */}

            <div className="food-brochure">

                {/* =========================
                    COVER
                ========================= */}

                <section className="brochure-cover">

                    <div className="brochure-cover-content">

                        <div className="brochure-logo">
                            🍴
                        </div>

                        <h1>
                            FOOD COLLECTION
                        </h1>

                        <p className="brochure-tagline">
                            Fresh • Delicious • Homemade
                        </p>

                        <div className="brochure-line"></div>

                        <p className="brochure-intro">
                            Discover our delicious selection of
                            freshly prepared food items.
                        </p>

                    </div>

                </section>


                {/* =========================
                    PRODUCTS
                ========================= */}

                <section className="brochure-products">

                    <div className="brochure-section-title">

                        <span>
                            OUR PRODUCTS
                        </span>

                        <p>
                            Delicious choices made for you
                        </p>

                    </div>


                    {/* Loading */}

                    {loading && (
                        <div className="brochure-message">
                            Loading food items...
                        </div>
                    )}


                    {/* Error */}

                    {!loading && error && (
                        <div className="brochure-error">
                            {error}
                        </div>
                    )}


                    {/* No products */}

                    {!loading &&
                        !error &&
                        foodItems.length === 0 && (

                            <div className="brochure-message">
                                No active food items available.
                            </div>

                        )}


                    {/* Products */}

                    {!loading &&
                        !error &&
                        foodItems.length > 0 && (

                            <div className="brochure-grid">

                                {foodItems.map((item) => (

                                    <div
                                        className="brochure-card"
                                        key={item.foodItemId || item.id}
                                    >

                                        {/* Image */}

                                        <div className="brochure-image-container">

                                            <img
                                                src={getImageUrl(item)}
                                                alt={item.foodName}
                                                className="brochure-food-image"
                                            />

                                        </div>


                                        {/* Content */}

                                        <div className="brochure-card-content">

                                            <div className="brochure-category">
                                                {getCategoryName(item)}
                                            </div>


                                            <h2>
                                                {item.foodName}
                                            </h2>


                                            {/* <p className="brochure-description">
                                                Delicious and freshly
                                                prepared food, perfect
                                                for your everyday
                                                enjoyment.
                                            </p> */}


                                            <div className="brochure-product-bottom">

                                                <span className="brochure-price">
                                                    {formatPrice(
                                                        item.sellingPrice
                                                    )}
                                                </span>

                                                <span className="brochure-unit">
                                                    / {item.unit || "unit"}
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        )}

                </section>


                {/* =========================
                    FOOTER
                ========================= */}

                <section className="brochure-footer">

                    <h2>
                        THANK YOU FOR CHOOSING US
                    </h2>

                    <p>
                        Fresh food • Quality ingredients •
                        Made with care
                    </p>

                    <div className="brochure-footer-line"></div>

                    <p className="brochure-footer-small">
                        For orders and enquiries, please contact us.
                    </p>

                </section>

            </div>

        </div>
    );
};

export default FoodBrochure;