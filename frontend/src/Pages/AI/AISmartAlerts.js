
import React, { useEffect, useState, useCallback } from "react";
import { AIService } from "../../Services/AIService";
import "./AISmartAlerts.css";

const AISmartAlerts = () => {

    const [alerts, setAlerts] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadAlerts = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await AIService.getSmartAlerts();

            setAlerts(Array.isArray(data) ? data : []);

        } catch (err) {
            setError(err.message || "Unable to load smart alerts.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAlerts();
    }, [loadAlerts]);

    const criticalCount = alerts.filter(
        alert => alert.severity === "CRITICAL"
    ).length;

    const warningCount = alerts.filter(
        alert => alert.severity === "WARNING"
    ).length;

    const infoCount = alerts.filter(
        alert => alert.severity === "INFO"
    ).length;

    const filteredAlerts = alerts.filter(alert =>
        filter === "ALL" || alert.severity === filter
    );

    const getSeverityClass = severity => {
        switch (severity) {
            case "CRITICAL":
                return "critical";
            case "WARNING":
                return "warning";
            case "INFO":
                return "info";
            default:
                return "default";
        }
    };

    const getAlertIcon = type => {
        switch (type) {
            case "LOW_STOCK":
                return "📦";
            case "EXPIRY_RISK":
                return "⚠️";
            case "PRODUCTION":
                return "🏭";
            default:
                return "🔔";
        }
    };

    return (
        <div className="smart-alert-page">

            <div className="smart-alert-header">
                <div>
                    <h2>Smart Alerts</h2>
                    <p>
                        Monitor important stock, expiry and
                        production activities.
                    </p>
                </div>

                <button
                    className="refresh-alert-btn"
                    onClick={loadAlerts}
                    disabled={loading}
                >
                    ↻ {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            <div className="smart-alert-summary">

                <div className="alert-summary-card">
                    <span>Total Alerts</span>
                    <h2>{alerts.length}</h2>
                </div>

                <div className="alert-summary-card critical-summary">
                    <span>Critical</span>
                    <h2>{criticalCount}</h2>
                </div>

                <div className="alert-summary-card warning-summary">
                    <span>Warnings</span>
                    <h2>{warningCount}</h2>
                </div>

                <div className="alert-summary-card info-summary">
                    <span>Recommendations</span>
                    <h2>{infoCount}</h2>
                </div>

            </div>

            <div className="smart-alert-toolbar">

                <h3>Alert List</h3>

                <select
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                >
                    <option value="ALL">All Alerts</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="WARNING">Warnings</option>
                    <option value="INFO">Recommendations</option>
                </select>

            </div>

            {loading && (
                <div className="alert-message">
                    Loading smart alerts...
                </div>
            )}

            {!loading && error && (
                <div className="alert-error">
                    {error}
                    <button onClick={loadAlerts}>
                        Try Again
                    </button>
                </div>
            )}

            {!loading && !error && filteredAlerts.length === 0 && (
                <div className="alert-empty">
                    <div className="empty-icon">🔔</div>
                    <h3>No alerts found</h3>
                    <p>
                        {alerts.length === 0
                            ? "Your business currently has no active alerts."
                            : "No alerts match the selected severity."}
                    </p>
                </div>
            )}

            {!loading && !error && filteredAlerts.length > 0 && (

                <div className="smart-alert-list">

                    {filteredAlerts.map((alert, index) => (

                        <div
                            className={`smart-alert-card ${getSeverityClass(alert.severity)}`}
                            key={`${alert.type}-${alert.foodName}-${index}`}
                        >

                            <div className="alert-card-icon">
                                {getAlertIcon(alert.type)}
                            </div>

                            <div className="alert-card-content">

                                <div className="alert-card-heading">
                                    <h4>{alert.title}</h4>

                                    <span className={`severity-badge ${getSeverityClass(alert.severity)}`}>
                                        {alert.severity}
                                    </span>
                                </div>

                                <p>{alert.message}</p>

                                {alert.foodName && (
                                    <div className="alert-product">
                                        Product: <strong>{alert.foodName}</strong>
                                    </div>
                                )}

                                {alert.currentStock !== null &&
                                    alert.currentStock !== undefined && (
                                        <div className="alert-detail">
                                            Current Stock: {alert.currentStock}
                                        </div>
                                    )}

                                {alert.minimumStock !== null &&
                                    alert.minimumStock !== undefined && (
                                        <div className="alert-detail">
                                            Minimum Stock: {alert.minimumStock}
                                        </div>
                                    )}

                                {alert.daysUntilExpiry !== null &&
                                    alert.daysUntilExpiry !== undefined && (
                                        <div className="alert-detail">
                                            Days Until Expiry: {alert.daysUntilExpiry}
                                        </div>
                                    )}

                                {alert.recommendedProduction !== null &&
                                    alert.recommendedProduction !== undefined && (
                                        <div className="alert-detail">
                                            Recommended Production:{" "}
                                            {alert.recommendedProduction} units
                                        </div>
                                    )}

                            </div>

                        </div>

                    ))}

                </div>
            )}

        </div>
    );
};

export default AISmartAlerts;
