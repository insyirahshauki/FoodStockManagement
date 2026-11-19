import React, { useEffect, useState } from "react";
import { AIService } from "../../Services/AIService";
import "./AIExpiryRisk.css";

const AIExpiryRisk = () => {

    const [risks, setRisks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchExpiryRisks = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await AIService.getAIExpiryRisks();
            setRisks(data);

        } catch (err) {
            console.error("Expiry risk error:", err);
            setError("Unable to load expiry risk data. Please try again.");

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpiryRisks();
    }, []);

    const expiredCount = risks.filter(
        item => item.riskLevel === "EXPIRED"
    ).length;

    const criticalCount = risks.filter(
        item => item.riskLevel === "CRITICAL"
    ).length;

    const warningCount = risks.filter(
        item => item.riskLevel === "WARNING"
    ).length;

    const upcomingCount = risks.filter(
        item => item.riskLevel === "UPCOMING"
    ).length;

    const formatDate = date => {
        if (!date) return "—";

        // Parse YYYY-MM-DD as a local date to avoid timezone shifts.
        const [year, month, day] = date.split("-").map(Number);

        return new Date(year, month - 1, day).toLocaleDateString("en-MY", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const formatNumber = value =>
        Number(value || 0).toLocaleString("en-MY");

    const getRiskBadge = riskLevel => {
        switch (riskLevel) {
            case "EXPIRED":
                return (
                    <span className="badge bg-danger">
                        <i className="bi bi-x-circle me-1"></i>
                        Expired
                    </span>
                );

            case "CRITICAL":
                return (
                    <span className="badge bg-danger-subtle text-danger">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Critical
                    </span>
                );

            case "WARNING":
                return (
                    <span className="badge bg-warning-subtle text-warning">
                        <i className="bi bi-exclamation-circle me-1"></i>
                        Warning
                    </span>
                );

            case "UPCOMING":
                return (
                    <span className="badge bg-info-subtle text-info">
                        <i className="bi bi-calendar-event me-1"></i>
                        Upcoming
                    </span>
                );

            default:
                return (
                    <span className="badge bg-success-subtle text-success">
                        <i className="bi bi-check-circle me-1"></i>
                        Safe
                    </span>
                );
        }
    };

    const getExpiryText = days => {
        if (days < 0) {
            return `${Math.abs(days)} day(s) overdue`;
        }

        if (days === 0) {
            return "Expires today";
        }

        return `${days} day(s) left`;
    };

    return (
        <div className="ai-expiry-page">

            {/* Page Header */}

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h4 className="fw-bold mb-1">
                        <i className="bi bi-calendar2-x me-2"></i>
                        AI Expiry Risk Analysis
                    </h4>

                    <p className="text-muted mb-0">
                        Monitor food batches and identify stock approaching expiry.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={fetchExpiryRisks}
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
                        Analysing batch expiry dates...
                    </p>
                </div>
            ) : (
                <>

                    {/* Summary Cards */}

                    <div className="row g-3 mb-4">

                        <div className="col-md-3">
                            <div className="card ai-expiry-card h-100">
                                <div className="card-body">
                                    <div className="text-muted small">
                                        Expired Batches
                                    </div>

                                    <h3 className="fw-bold text-danger mb-0">
                                        {expiredCount}
                                    </h3>

                                    <i className="bi bi-x-octagon ai-expiry-icon text-danger"></i>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card ai-expiry-card h-100">
                                <div className="card-body">
                                    <div className="text-muted small">
                                        Critical Batches
                                    </div>

                                    <h3 className="fw-bold text-danger mb-0">
                                        {criticalCount}
                                    </h3>

                                    <i className="bi bi-exclamation-triangle ai-expiry-icon text-danger"></i>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card ai-expiry-card h-100">
                                <div className="card-body">
                                    <div className="text-muted small">
                                        Warning Batches
                                    </div>

                                    <h3 className="fw-bold text-warning mb-0">
                                        {warningCount}
                                    </h3>

                                    <i className="bi bi-exclamation-circle ai-expiry-icon text-warning"></i>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="card ai-expiry-card h-100">
                                <div className="card-body">
                                    <div className="text-muted small">
                                        Upcoming Expiry
                                    </div>

                                    <h3 className="fw-bold text-info mb-0">
                                        {upcomingCount}
                                    </h3>

                                    <i className="bi bi-calendar-event ai-expiry-icon text-info"></i>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* AI Insight */}

                    <div className="alert alert-info d-flex align-items-start mb-4">
                        <i className="bi bi-robot me-2 mt-1"></i>

                        <div>
                            <strong>AI Expiry Insight</strong>

                            <div className="mt-1">
                                Expiry risk is calculated using each batch's
                                recorded expiry date and remaining quantity.
                                Review expired and high-risk batches before
                                planning stock usage.
                            </div>
                        </div>
                    </div>

                    {/* Expiry Risk Table */}

                    <div className="card ai-expiry-table-card">

                        <div className="card-header bg-white py-3">
                            <h6 className="fw-bold mb-0">
                                Batch Expiry Details
                            </h6>
                        </div>

                        <div className="card-body p-0">
                            <div className="table-responsive">

                                <table className="table table-hover align-middle mb-0">

                                    <thead className="table-light">
                                        <tr>
                                            <th>No.</th>
                                            <th>Food Item</th>
                                            <th>Batch No.</th>
                                            <th>Expiry Date</th>
                                            <th className="text-end">
                                                Remaining Qty
                                            </th>
                                            <th>Days Remaining</th>
                                            <th>Risk Level</th>
                                            <th>Recommendation</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {risks.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="8"
                                                    className="text-center py-4 text-muted"
                                                >
                                                    No batches with remaining
                                                    stock and expiry dates found.
                                                </td>
                                            </tr>
                                        ) : (
                                            risks.map((item, index) => (
                                                <tr key={item.batchId}>
                                                    <td>{index + 1}</td>

                                                    <td className="fw-semibold">
                                                        {item.foodName}
                                                    </td>

                                                    <td>
                                                        {item.batchNo}
                                                    </td>

                                                    <td>
                                                        {formatDate(item.expiryDate)}
                                                    </td>

                                                    <td className="text-end fw-semibold">
                                                        {formatNumber(item.quantityRemaining)}
                                                    </td>

                                                    <td>
                                                        <span className={
                                                            item.daysUntilExpiry < 0
                                                                ? "text-danger fw-semibold"
                                                                : item.daysUntilExpiry <= 3
                                                                    ? "text-danger fw-semibold"
                                                                    : ""
                                                        }>
                                                            {getExpiryText(item.daysUntilExpiry)}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {getRiskBadge(item.riskLevel)}
                                                    </td>

                                                    <td className="ai-expiry-recommendation">
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

                    {/* Risk Legend */}

                    <div className="mt-4">
                        <h6 className="fw-bold mb-3">
                            Expiry Risk Classification
                        </h6>

                        <div className="d-flex flex-wrap gap-3">
                            <span>
                                <span className="badge bg-danger me-1">
                                    Expired
                                </span>
                                Past expiry date
                            </span>

                            <span>
                                <span className="badge bg-danger-subtle text-danger me-1">
                                    Critical
                                </span>
                                0–3 days
                            </span>

                            <span>
                                <span className="badge bg-warning-subtle text-warning me-1">
                                    Warning
                                </span>
                                4–7 days
                            </span>

                            <span>
                                <span className="badge bg-info-subtle text-info me-1">
                                    Upcoming
                                </span>
                                8–30 days
                            </span>

                            <span>
                                <span className="badge bg-success-subtle text-success me-1">
                                    Safe
                                </span>
                                More than 30 days
                            </span>
                        </div>
                    </div>

                </>
            )}

        </div>
    );
};

export default AIExpiryRisk;