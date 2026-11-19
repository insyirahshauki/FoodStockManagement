import React, { useEffect, useState } from "react";
import { AIService } from "../../Services/AIService";
import "./AISalesForecast.css";

const AISalesForecast = () => {

    const [forecasts, setForecasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchForecasts = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await AIService.getAISalesForecast();
            setForecasts(data);

        } catch (err) {
            console.error("Sales forecast error:", err);
            setError("Unable to load sales forecast. Please try again.");

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchForecasts();
    }, []);

    const validForecasts = forecasts.filter(
        item => item.salesTrend !== "INSUFFICIENT_DATA"
    );

    const totalForecast = validForecasts.reduce(
        (total, item) =>
            total + Number(item.predictedDemand || 0),
        0
    );

    const increasingCount = forecasts.filter(
        item => item.salesTrend === "INCREASING"
    ).length;

    const decreasingCount = forecasts.filter(
        item => item.salesTrend === "DECREASING"
    ).length;

    const insufficientCount = forecasts.filter(
        item => item.salesTrend === "INSUFFICIENT_DATA"
    ).length;

    const formatNumber = value =>
        Number(value || 0).toLocaleString("en-MY", {
            maximumFractionDigits: 2
        });

    const getTrendBadge = trend => {
        switch (trend) {
            case "INCREASING":
                return (
                    <span className="badge bg-success-subtle text-success">
                        <i className="bi bi-graph-up-arrow me-1"></i>
                        Increasing
                    </span>
                );

            case "DECREASING":
                return (
                    <span className="badge bg-danger-subtle text-danger">
                        <i className="bi bi-graph-down-arrow me-1"></i>
                        Decreasing
                    </span>
                );

            case "INSUFFICIENT_DATA":
                return (
                    <span className="badge bg-warning-subtle text-warning">
                        Insufficient Data
                    </span>
                );

            default:
                return (
                    <span className="badge bg-secondary-subtle text-secondary">
                        <i className="bi bi-dash-lg me-1"></i>
                        Stable
                    </span>
                );
        }
    };

    return (
        <div className="ai-forecast-page">

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h4 className="fw-bold mb-1">
                        <i className="bi bi-graph-up-arrow me-2"></i>
                        AI Sales Forecasting
                    </h4>

                    <p className="text-muted mb-0">
                        Forecast future food sales using historical completed orders.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={fetchForecasts}
                    disabled={loading}
                >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh
                </button>
            </div>

            {error && (
                <div className="alert alert-danger">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                    <p className="text-muted mt-2">
                        Analysing sales data...
                    </p>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}

                    <div className="row g-3 mb-4">

                        <div className="col-md-3">
                            <div className="card ai-forecast-card h-100">
                                <div className="card-body">
                                    <div className="text-muted small">
                                        Products Analysed
                                    </div>
                                    <h3 className="fw-bold mb-0">
                                        {forecasts.length}
                                    </h3>
                                    <i className="bi bi-box-seam ai-forecast-icon"></i>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card ai-forecast-card h-100">
                                <div className="card-body">
                                    <div className="text-muted small">
                                        Forecasted Demand
                                    </div>
                                    <h3 className="fw-bold mb-0">
                                        {formatNumber(totalForecast)}
                                    </h3>
                                    <i className="bi bi-bar-chart-line ai-forecast-icon"></i>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card ai-forecast-card h-100">
                                <div className="card-body">
                                    <div className="text-muted small">
                                        Increasing Sales
                                    </div>
                                    <h3 className="fw-bold mb-0 text-success">
                                        {increasingCount}
                                    </h3>
                                    <i className="bi bi-graph-up-arrow ai-forecast-icon text-success"></i>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card ai-forecast-card h-100">
                                <div className="card-body">
                                    <div className="text-muted small">
                                        Decreasing Sales
                                    </div>
                                    <h3 className="fw-bold mb-0 text-danger">
                                        {decreasingCount}
                                    </h3>
                                    <i className="bi bi-graph-down-arrow ai-forecast-icon text-danger"></i>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Forecast Information */}

                    {insufficientCount > 0 ? (
                        <div className="alert alert-warning d-flex align-items-start mb-4">
                            <i className="bi bi-exclamation-triangle me-2 mt-1"></i>
                            <div>
                                <strong>Forecast Notice</strong>
                                <div className="mt-1">
                                    {insufficientCount} product
                                    {insufficientCount > 1 ? "s" : ""}
                                    {" "}do not have enough sales history.
                                    At least 7 days of history is required.
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="alert alert-info d-flex align-items-start mb-4">
                            <i className="bi bi-robot me-2 mt-1"></i>
                            <div>
                                <strong>AI Sales Insight</strong>
                                <div className="mt-1">
                                    Forecasts estimate demand for the next
                                    7 days using historical completed sales.
                                    Review recommendations before making
                                    production decisions.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Forecast Table */}

                    <div className="card ai-forecast-table-card">
                        <div className="card-header bg-white py-3">
                            <h6 className="fw-bold mb-0">
                                Sales Forecast Details
                            </h6>
                        </div>

                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">

                                    <thead className="table-light">
                                        <tr>
                                            <th>No.</th>
                                            <th>Food Item</th>
                                            <th className="text-end">
                                                Avg. Daily Sales
                                            </th>
                                            <th className="text-end">
                                                7-Day Forecast
                                            </th>
                                            <th>Sales Trend</th>
                                            <th>Recommendation</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {forecasts.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-4 text-muted">
                                                    No completed sales data available.
                                                </td>
                                            </tr>
                                        ) : (
                                            forecasts.map((item, index) => (
                                                <tr key={item.foodItemId}>
                                                    <td>{index + 1}</td>

                                                    <td className="fw-semibold">
                                                        {item.foodName}
                                                    </td>

                                                    <td className="text-end">
                                                        {item.salesTrend === "INSUFFICIENT_DATA"
                                                            ? "—"
                                                            : formatNumber(item.averageDailySales)}
                                                    </td>

                                                    <td className="text-end fw-semibold">
                                                        {item.salesTrend === "INSUFFICIENT_DATA"
                                                            ? "—"
                                                            : formatNumber(item.predictedDemand)}
                                                    </td>

                                                    <td>
                                                        {getTrendBadge(item.salesTrend)}
                                                    </td>

                                                    <td className="ai-forecast-recommendation">
                                                        {item.recommendation}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>

                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}

        </div>
    );
};

export default AISalesForecast;