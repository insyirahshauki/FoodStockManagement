
import React, { useEffect, useState, useCallback } from "react";
import { AIService } from "../../Services/AIService";
import "./AIStockPrediction.css";

const AIStockPrediction = () => {

    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchPredictions = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await AIService.getAIStockPredictions();

            setPredictions(data);

        } catch (err) {
            console.error("AI Prediction Error:", err);
            setError(err.message || "Unable to load predictions.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPredictions();
    }, [fetchPredictions]);

    const totalProducts = predictions.length;

    const lowStockCount = predictions.filter(
        item => item.stockStatus === "LOW"
    ).length;

    const sufficientCount = predictions.filter(
        item => item.stockStatus === "SUFFICIENT"
    ).length;

    const insufficientDataCount = predictions.filter(
        item => item.stockStatus === "INSUFFICIENT_DATA"
    ).length; 

    const totalProduction = predictions.reduce(
        (total, item) =>
            total + Number(item.recommendedProduction || 0),
        0
    );

    const formatNumber = (value) =>
        Number(value || 0).toLocaleString("en-MY", {
            maximumFractionDigits: 2
        });
    // const insufficientDataCount = predictions.filter(
    //     item => item.stockStatus === "INSUFFICIENT_DATA"
    // ).length;

    const predictionProducts = predictions.filter(
        item => item.stockStatus !== "INSUFFICIENT_DATA"
    );

    const historyDays = predictions.length > 0
        ? Math.min(
            ...predictions.map(item => item.historyDaysAvailable)
        )
        : 0;
    return (
        <div className="ai-prediction-page">

            {/* Page Header */}
            <div className="page-header d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h4 className="mb-1">
                        <i className="bi bi-robot me-2"></i>
                        AI Stock Prediction
                    </h4>

                    <p className="text-muted mb-0">
                        Analyse stock levels and predict future demand.
                    </p>
                </div>

                <button
                    className="btn btn-outline-primary"
                    onClick={fetchPredictions}
                    disabled={loading}
                >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh
                </button>

            </div>

            {/* Loading */}
            {loading && (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                    <p className="text-muted mt-2">
                        Analysing stock data...
                    </p>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="alert alert-danger">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}

                    <button
                        className="btn btn-sm btn-outline-danger ms-3"
                        onClick={fetchPredictions}
                    >
                        Try Again
                    </button>
                </div>
            )}

            {!loading && !error && (
                <>

                    {/* Summary Cards */}
                    <div className="row g-3 mb-4">

                        <div className="col-xl-3 col-md-6">
                            <div className="card ai-summary-card">
                                <div className="card-body">
                                    <div className="ai-card-icon bg-primary-subtle text-primary">
                                        <i className="bi bi-box-seam"></i>
                                    </div>

                                    <h3>{totalProducts}</h3>
                                    <p>Total Products Analysed</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-3 col-md-6">
                            <div className="card ai-summary-card">
                                <div className="card-body">
                                    <div className="ai-card-icon bg-danger-subtle text-danger">
                                        <i className="bi bi-exclamation-triangle"></i>
                                    </div>

                                    <h3>{lowStockCount}</h3>
                                    <p>Low Stock Risk</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-3 col-md-6">
                            <div className="card ai-summary-card">
                                <div className="card-body">
                                    <div className="ai-card-icon bg-success-subtle text-success">
                                        <i className="bi bi-check-circle"></i>
                                    </div>

                                    <h3>{sufficientCount}</h3>
                                    <p>Sufficient Stock</p>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-3 col-md-6">
                            <div className="card ai-summary-card">
                                <div className="card-body">
                                    <div className="ai-card-icon bg-warning-subtle text-warning">
                                        <i className="bi bi-clipboard-data"></i>
                                    </div>

                                    <h3>{formatNumber(totalProduction)}</h3>
                                    <p>Suggested Production (Units)</p>
                                </div>
                            </div>
                        </div>

                    </div>
                    {/* AI Prediction Information */}

                    {insufficientDataCount > 0 ? (

                        <div className="alert alert-warning d-flex align-items-start mb-4">

                            <i className="bi bi-exclamation-triangle me-2 mt-1"></i>

                            <div>
                                <strong>AI Prediction Notice</strong>

                                <div className="mt-1">
                                    {insufficientDataCount} product
                                    {insufficientDataCount > 1 ? "s" : ""}
                                    {" "}do not have enough sales history for a reliable
                                    prediction. At least 7 days of completed sales history
                                    is required.
                                </div>
                            </div>

                        </div>

                    ) : (

                        <div className="alert alert-info d-flex align-items-start mb-4">

                            <i className="bi bi-robot me-2 mt-1"></i>

                            <div>
                                <strong>AI Prediction</strong>

                                <div className="mt-1">
                                    Predictions are based on the last 28 days of
                                    completed sales and forecast demand for the next
                                    7 days.
                                </div>
                            </div>

                        </div>

                    )}
                    {/* Prediction Table */}
                    <div className="card ai-prediction-table-card">

                        <div className="card-header bg-white py-3">
                            <h5 className="mb-1">
                                <i className="bi bi-graph-up-arrow me-2"></i>
                                Stock Demand Forecast
                            </h5>

                            <small className="text-muted">
                                Based on the last 28 days of completed sales.
                                Forecast period: next 7 days.
                            </small>
                        </div>

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead className="table-light">
                                    <tr>
                                        <th>No.</th>
                                        <th>Food Item</th>
                                        <th className="text-end">Current Stock</th>
                                        <th className="text-end">Avg. Daily Sales</th>
                                        <th className="text-end">Predicted Demand</th>
                                        <th className="text-end">Suggested Production</th>
                                        <th>Status</th>
                                        <th>Recommendation</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {predictions.length > 0 ? (
                                        predictions.map((item, index) => (

                                            <tr key={item.foodItemId}>
                                                <td>{index + 1}</td>

                                                <td>
                                                    <strong>{item.foodName}</strong>
                                                </td>

                                                <td className="text-end">
                                                    {formatNumber(item.currentStock)}
                                                </td>

                                                <td className="text-end">
                                                    {item.stockStatus === "INSUFFICIENT_DATA"
                                                        ? "—"
                                                        : formatNumber(item.averageDailySales)}
                                                </td>

                                                <td className="text-end">
                                                    {item.stockStatus === "INSUFFICIENT_DATA"
                                                        ? "—"
                                                        : formatNumber(item.predictedDemand)}
                                                </td>

                                                <td className="text-end fw-semibold">
                                                    {item.stockStatus === "INSUFFICIENT_DATA"
                                                        ? "—"
                                                        : formatNumber(item.recommendedProduction)}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`badge ${item.stockStatus === "LOW"
                                                                ? "bg-danger-subtle text-danger"
                                                                : item.stockStatus === "INSUFFICIENT_DATA"
                                                                    ? "bg-warning-subtle text-warning"
                                                                    : "bg-success-subtle text-success"
                                                            }`}
                                                    >
                                                        {item.stockStatus === "INSUFFICIENT_DATA"
                                                            ? "INSUFFICIENT DATA"
                                                            : item.stockStatus}
                                                    </span>
                                                </td>

                                                <td>
                                                    <small>
                                                        {item.recommendation}
                                                    </small>
                                                </td>

                                            </tr>

                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center py-5 text-muted">
                                                No prediction data available.
                                            </td>
                                        </tr>
                                    )}

                                </tbody>

                            </table>

                        </div>
                    </div>

                    {/* Information */}
                    <div className="alert alert-info mt-4">
                        <i className="bi bi-info-circle me-2"></i>

                        <strong>AI Insight:</strong> Predictions are calculated
                        using historical completed sales over 28 days.
                        Review production recommendations before preparing
                        additional products.
                    </div>

                </>
            )}

        </div>
    );
};

export default AIStockPrediction;
