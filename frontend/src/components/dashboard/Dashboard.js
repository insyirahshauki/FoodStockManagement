import React, { useEffect, useState } from "react";
import { DashboardService } from "../../Services/DashboardService";
import "./Dashboard.css";

function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await DashboardService.getDashboard();
            setDashboard(response);
        } catch (err) {
            console.error("Dashboard API Error:", err);
            setError("Unable to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-MY", {
            style: "currency",
            currency: "MYR"
        }).format(amount || 0);
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-MY", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const formatDateTime = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString("en-MY");
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" />
                <p className="mt-2">Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                {error}
                <button
                    className="btn btn-sm btn-outline-danger ms-3"
                    onClick={loadDashboard}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!dashboard) return null;

    const summary = dashboard.summary || {};
    const sales = dashboard.salesSummary || {};

    const summaryCards = [
        {
            title: "Total Products",
            value: summary.totalProducts,
            icon: "bi-box-seam",
            color: "primary"
        },
        {
            title: "Available Stock",
            value: summary.availableStock,
            icon: "bi-boxes",
            color: "success"
        },
        {
            title: "Low Stock",
            value: summary.lowStock,
            icon: "bi-exclamation-triangle",
            color: "warning"
        },
        {
            title: "Out of Stock",
            value: summary.outOfStock,
            icon: "bi-x-circle",
            color: "danger"
        }
    ];

    return (
        <div className="container-fluid">

            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold">Dashboard</h3>
                    <p className="text-muted mb-0">
                        Overview of your food stock and sales
                    </p>
                </div>

                <button
                    className="btn btn-outline-primary"
                    onClick={loadDashboard}
                >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh
                </button>
            </div>

            {/* Stock Summary */}
            <div className="row g-3 mb-4">
                {summaryCards.map((card, index) => (
                    <div className="col-12 col-sm-6 col-xl-3" key={index}>
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body d-flex align-items-center">
                                <div className={`rounded p-3 bg-${card.color} bg-opacity-10 me-3`}>
                                    <i className={`bi ${card.icon} fs-3 text-${card.color}`}></i>
                                </div>

                                <div>
                                    <p className="text-muted mb-1">
                                        {card.title}
                                    </p>
                                    <h4 className="fw-bold mb-0">
                                        {card.value ?? 0}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sales Summary */}
            <h5 className="fw-bold mb-3">Sales Overview</h5>

            <div className="row g-3 mb-4">
                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <p className="text-muted mb-1">Total Sales</p>
                            <h4 className="fw-bold text-primary">
                                {formatCurrency(sales.totalSales)}
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <p className="text-muted mb-1">Today's Sales</p>
                            <h4 className="fw-bold text-success">
                                {formatCurrency(sales.todaySales)}
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <p className="text-muted mb-1">Monthly Sales</p>
                            <h4 className="fw-bold text-info">
                                {formatCurrency(sales.monthlySales)}
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <p className="text-muted mb-1">Pre-order Sales</p>
                            <h5 className="fw-bold">
                                {formatCurrency(sales.preOrderSales)}
                            </h5>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <p className="text-muted mb-1">Ready Stock Sales</p>
                            <h5 className="fw-bold">
                                {formatCurrency(sales.readyStockSales)}
                            </h5>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <p className="text-muted mb-1">Completed Orders</p>
                            <h5 className="fw-bold">
                                {sales.totalOrders ?? 0}
                            </h5>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expiry Alerts */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white py-3">
                    <h5 className="fw-bold mb-0">
                        <i className="bi bi-calendar2-x text-danger me-2"></i>
                        Expiry Alerts
                    </h5>
                </div>

                <div className="card-body">
                    {dashboard.expiryAlerts?.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>Food Name</th>
                                        <th>Batch No.</th>
                                        <th>Remaining Qty</th>
                                        <th>Expiry Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {dashboard.expiryAlerts.map((item) => (
                                        <tr key={item.stockBatchId}>
                                            <td>{item.foodName}</td>
                                            <td>{item.batchNo}</td>
                                            <td>{item.quantityRemaining}</td>
                                            <td>{formatDate(item.expiryDate)}</td>
                                            <td>
                                                <span className={`badge ${
                                                    item.expiryStatus === "EXPIRED"
                                                        ? "bg-danger"
                                                        : item.expiryStatus === "EXPIRES_TODAY"
                                                            ? "bg-warning text-dark"
                                                            : "bg-warning text-dark"
                                                }`}>
                                                    {item.expiryStatus?.replaceAll("_", " ")}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-muted mb-0">
                            No expiry alerts.
                        </p>
                    )}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white py-3">
                    <h5 className="fw-bold mb-0">
                        <i className="bi bi-clock-history me-2"></i>
                        Recent Transactions
                    </h5>
                </div>

                <div className="card-body">
                    {dashboard.recentTransactions?.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Food Name</th>
                                        <th>Batch No.</th>
                                        <th>Type</th>
                                        <th>Quantity</th>
                                        <th>Reference No.</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {dashboard.recentTransactions.map((item) => (
                                        <tr key={item.stockTransactionId}>
                                            <td>{formatDateTime(item.transactionDate)}</td>
                                            <td>{item.foodName}</td>
                                            <td>{item.batchNo}</td>
                                            <td>
                                                <span className="badge bg-secondary">
                                                    {item.transactionType}
                                                </span>
                                            </td>
                                            <td>{item.quantity}</td>
                                            <td>{item.referenceNo || "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-muted mb-0">
                            No recent transactions.
                        </p>
                    )}
                </div>
            </div>

            {/* Best Selling Products */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white py-3">
                    <h5 className="fw-bold mb-0">
                        <i className="bi bi-trophy me-2 text-warning"></i>
                        Best Selling Products
                    </h5>
                </div>

                <div className="card-body">
                    {dashboard.bestSellingProducts?.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>Food Name</th>
                                        <th>Total Quantity Sold</th>
                                        <th>Total Sales</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {dashboard.bestSellingProducts.map((item) => (
                                        <tr key={item.foodItemId}>
                                            <td>{item.foodName}</td>
                                            <td>{item.totalQuantitySold}</td>
                                            <td>{formatCurrency(item.totalSales)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-muted mb-0">
                            No completed sales yet.
                        </p>
                    )}
                </div>
            </div>

        </div>
    );
}

export default Dashboard;