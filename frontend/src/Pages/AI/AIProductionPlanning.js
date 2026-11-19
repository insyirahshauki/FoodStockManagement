import React, { useEffect, useState } from "react";

import "./AIProductionPlanning.css";
import { AIService } from "../../Services/AIService";
const AIProductionPlanning = () => {

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchProductionPlans = async () => {

        try {
            setLoading(true);
            setError("");

            const data = await AIService.getAIProductionPlanning();

            setPlans(data);

        } catch (err) {

            console.error(err);

            setError(
                "Unable to retrieve AI production planning."
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductionPlans();
    }, []);

    const totalProduction = plans.reduce(
        (total, item) =>
            total + (item.recommendedProduction || 0),
        0
    );

    const highPriority = plans.filter(
        item => item.productionPriority === "HIGH"
    ).length;

    const mediumPriority = plans.filter(
        item => item.productionPriority === "MEDIUM"
    ).length;

    const sufficientStock = plans.filter(
        item => (item.recommendedProduction || 0) === 0
    ).length;

    const getPriorityClass = (priority) => {

        switch (priority) {

            case "HIGH":
                return "ai-production-badge high";

            case "MEDIUM":
                return "ai-production-badge medium";

            default:
                return "ai-production-badge low";
        }
    };

    const formatQuantity = (quantity) => {

        return Number(quantity || 0).toLocaleString();
    };

    return (
        <div className="ai-production-page">

            {/* Header */}
            <div className="ai-production-header">

                <div>
                    <h2>
                        <i className="bi bi-box-seam me-2"></i>
                        AI Production Planning
                    </h2>

                    <p>
                        Production recommendations based on sales
                        forecast, confirmed preorders and available
                        stock.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={fetchProductionPlans}
                    disabled={loading}
                >
                    <i className="bi bi-arrow-clockwise me-1"></i>

                    {loading ? "Refreshing..." : "Refresh"}
                </button>

            </div>

            {/* Error */}
            {error && (
                <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="ai-production-loading">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Loading...
                        </span>
                    </div>

                    <p>
                        Calculating production recommendations...
                    </p>

                </div>
            )}

            {!loading && !error && (
                <>

                    {/* Summary Cards */}
                    <div className="row g-3 mb-4">

                        <div className="col-md-3">
                            <div className="ai-production-card">

                                <div className="ai-production-icon">
                                    <i className="bi bi-box-seam"></i>
                                </div>

                                <div>
                                    <span>
                                        Total Production
                                    </span>

                                    <h3>
                                        {formatQuantity(
                                            totalProduction
                                        )}
                                    </h3>

                                    <small>
                                        Units recommended
                                    </small>
                                </div>

                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="ai-production-card">

                                <div className="ai-production-icon">
                                    <i className="bi bi-exclamation-circle"></i>
                                </div>

                                <div>
                                    <span>
                                        High Priority
                                    </span>

                                    <h3>
                                        {highPriority}
                                    </h3>

                                    <small>
                                        Items requiring attention
                                    </small>
                                </div>

                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="ai-production-card">

                                <div className="ai-production-icon">
                                    <i className="bi bi-hourglass-split"></i>
                                </div>

                                <div>
                                    <span>
                                        Medium Priority
                                    </span>

                                    <h3>
                                        {mediumPriority}
                                    </h3>

                                    <small>
                                        Items to monitor
                                    </small>
                                </div>

                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="ai-production-card">

                                <div className="ai-production-icon">
                                    <i className="bi bi-check-circle"></i>
                                </div>

                                <div>
                                    <span>
                                        Stock Sufficient
                                    </span>

                                    <h3>
                                        {sufficientStock}
                                    </h3>

                                    <small>
                                        No additional production
                                    </small>
                                </div>

                            </div>
                        </div>

                    </div>

                    {/* AI Insight */}
                    <div className="alert alert-info ai-production-insight">

                        <div className="d-flex">

                            <i className="bi bi-stars fs-4 me-3"></i>

                            <div>

                                <strong>
                                    AI Production Insight
                                </strong>

                                <p className="mb-0 mt-1">
                                    Production recommendations combine
                                    the 7-day sales forecast, confirmed
                                    preorder commitments and available
                                    non-expired stock. Review the
                                    recommendations before preparing
                                    additional products.
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* Table */}
                    <div className="ai-production-table-card">

                        <div className="ai-production-table-header">

                            <div>
                                <h5>
                                    Production Recommendations
                                </h5>

                                <span>
                                    Recommended production for the
                                    upcoming 7-day planning period.
                                </span>
                            </div>

                        </div>

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead className="table-light">

                                    <tr>

                                        <th>
                                            Food Item
                                        </th>

                                        <th>
                                            7-Day Forecast
                                        </th>

                                        <th>
                                            Confirmed Preorder
                                        </th>

                                        <th>
                                            Available Stock
                                        </th>

                                        <th>
                                            Recommended Production
                                        </th>

                                        <th>
                                            Priority
                                        </th>

                                        <th>
                                            Recommendation
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {plans.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="7"
                                                className="text-center py-5"
                                            >

                                                <i className="bi bi-inbox fs-2 d-block mb-2"></i>

                                                No production planning
                                                data available.

                                            </td>

                                        </tr>

                                    ) : (

                                        plans.map((item) => (

                                            <tr
                                                key={item.foodItemId}
                                            >

                                                <td>
                                                    <strong>
                                                        {item.foodName}
                                                    </strong>
                                                </td>
                                                <td>
                                                    {item.historyDaysAvailable < 7 ? (
                                                        <span className="badge bg-secondary">
                                                            Insufficient Data
                                                        </span>
                                                    ) : (
                                                        item.predictedDemand
                                                    )}
                                                </td>


                                                <td>
                                                    {formatQuantity(
                                                        item.confirmedPreorderQuantity
                                                    )}
                                                </td>

                                                <td>
                                                    {formatQuantity(
                                                        item.availableStock
                                                    )}
                                                </td>

                                                {/* <td>

                                                    <strong className={
                                                        item.recommendedProduction > 0
                                                            ? "text-primary"
                                                            : "text-success"
                                                    }>
                                                        {formatQuantity(
                                                            item.recommendedProduction
                                                        )}
                                                    </strong>

                                                </td> */}
                                                <td>
                                                    {item.historyDaysAvailable < 7 ? (
                                                        <span className="badge bg-secondary">
                                                            Review Manually
                                                        </span>
                                                    ) : (
                                                        item.recommendedProduction
                                                    )}
                                                </td>
                                                <td>
                                                    {item.historyDaysAvailable < 7 ? (
                                                        <span className="badge bg-secondary">
                                                            REVIEW
                                                        </span>
                                                    ) : (
                                                        <span className={`badge ${getPriorityClass(item.productionPriority)}`}>
                                                            {item.productionPriority}
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    <div>{item.recommendation}</div>

                                                    {item.historyMessage && (
                                                        <small className="text-muted d-block mt-1">
                                                            {item.historyMessage}
                                                        </small>
                                                    )}
                                                </td>

                                            </tr>

                                        ))

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </>
            )}

        </div>
    );
};

export default AIProductionPlanning;