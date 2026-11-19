import React, { useEffect, useMemo, useState } from "react";
import { StockService } from "../../Services/StockService";
import "./ExpiryManagement.css";
import DataTable from "../../components/common/DataTable";
import TableActions from "../../components/common/TableActions";
const ExpiryManagement = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    useEffect(() => {
        loadExpiryManagement();
    }, []);

    const loadExpiryManagement = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await StockService.getExpiryManagement();

            setBatches(Array.isArray(response) ? response : []);
        } catch (err) {
            setError(
                err.message || "Failed to load expiry management."
            );
        } finally {
            setLoading(false);
        }
    };

    const summary = useMemo(() => {
        const activeBatches = batches.filter(
            batch => batch.expiryStatus !== "OUT_OF_STOCK"
        );

        return {
            totalBatches: batches.length,

            expired: activeBatches.filter(
                batch => batch.expiryStatus === "EXPIRED"
            ).length,

            expiringSoon: activeBatches.filter(
                batch => batch.expiryStatus === "EXPIRING_SOON"
            ).length,

            goodStock: activeBatches.filter(
                batch => batch.expiryStatus === "GOOD_STOCK"
            ).length,

            noExpiryDate: activeBatches.filter(
                batch => batch.expiryStatus === "NO_EXPIRY_DATE"
            ).length,

            outOfStock: batches.filter(
                batch => batch.expiryStatus === "OUT_OF_STOCK"
            ).length
        };
    }, [batches]);

    const filteredBatches = useMemo(() => {
        return batches.filter(batch => {
            const keyword = searchTerm.toLowerCase();

            const matchesSearch =
                (batch.foodName || "").toLowerCase().includes(keyword) ||
                (batch.sku || "").toLowerCase().includes(keyword) ||
                (batch.batchNo || "").toLowerCase().includes(keyword);

            const matchesStatus =
                statusFilter === "ALL" ||
                batch.expiryStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [batches, searchTerm, statusFilter]);

    const getStatusBadge = status => {
        const statusConfig = {
            EXPIRED: {
                label: "Expired",
                className: "expiry-badge-expired"
            },
            EXPIRING_SOON: {
                label: "Expiring Soon",
                className: "expiry-badge-warning"
            },
            GOOD_STOCK: {
                label: "Good Stock",
                className: "expiry-badge-good"
            },
            NO_EXPIRY_DATE: {
                label: "No Expiry Date",
                className: "expiry-badge-neutral"
            },
            OUT_OF_STOCK: {
                label: "Out of Stock",
                className: "expiry-badge-empty"
            }
        };

        const config = statusConfig[status] || {
            label: status,
            className: "expiry-badge-neutral"
        };

        return (
            <span className={`expiry-badge ${config.className}`}>
                {config.label}
            </span>
        );
    };

    const getExpiryMessage = batch => {
        if (batch.expiryDate === null) {
            return "-";
        }

        if (batch.expiryStatus === "EXPIRED") {
            return `${Math.abs(batch.daysUntilExpiry)} day(s) ago`;
        }

        if (batch.expiryStatus === "OUT_OF_STOCK") {
            return "-";
        }

        if (batch.daysUntilExpiry === 0) {
            return "Expires today";
        }

        return `${batch.daysUntilExpiry} day(s) left`;
    };

    const formatDate = date => {
        if (!date) return "-";

        return new Date(`${date}T00:00:00`).toLocaleDateString(
            "en-MY",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    
    const columns = [
        {
            key: "foodName",
            label: "Food Item",
            render: (row) => (
                <div>
                    <div className="expiry-food-name">
                        {row.foodName}
                    </div>
                    <small className="text-muted">
                        {row.sku}
                    </small>
                </div>
            )
        },
        {
            key: "batchNo",
            label: "Batch No.",
            render: (row) => row.batchNo || "-"
        },
        {
            key: "receivedDate",
            label: "Received Date",
            render: (row) => formatDate(row.receivedDate)
        },
        {
            key: "expiryDate",
            label: "Expiry Date",
            render: (row) => formatDate(row.expiryDate)
        },
        {
            key: "quantityRemaining",
            label: "Remaining Qty",
            render: (row) => (
                <>
                    <strong>{row.quantityRemaining}</strong>
                    {" "}
                    {row.unit}
                </>
            )
        },
        {
            key: "expiryStatus",
            label: "Expiry Status",
            render: (row) => getStatusBadge(row.expiryStatus)
        },
        {
            key: "expiryCountdown",
            label: "Expiry Countdown",
            render: (row) => getExpiryMessage(row)
        }
    ];


    return (
        <div className="page-container">

            <div className="page-title">
                <h3>Expiry Management</h3>
            </div>

            <div className="page-subtitle">
                <p>Monitor food stock batches and expiry dates.</p>
            </div>

            <div className="card">
                <div className="expiry-management-page">

                    {/* Page Header */}
                    <div className="expiry-page-header">
                        <button
                            className="btn btn-outline-primary"
                            onClick={loadExpiryManagement}
                            disabled={loading}
                        >
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            Refresh
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="row g-3 mb-4">

                        <div className="col-12 col-sm-6 col-xl-3">
                            <div className="expiry-summary-card">
                                <div className="expiry-summary-icon bg-primary-subtle text-primary">
                                    <i className="bi bi-box-seam"></i>
                                </div>
                                <div>
                                    <span>Total Batches</span>
                                    <h4>{summary.totalBatches}</h4>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-xl-3">
                            <div className="expiry-summary-card">
                                <div className="expiry-summary-icon bg-danger-subtle text-danger">
                                    <i className="bi bi-exclamation-circle"></i>
                                </div>
                                <div>
                                    <span>Expired</span>
                                    <h4>{summary.expired}</h4>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-xl-3">
                            <div className="expiry-summary-card">
                                <div className="expiry-summary-icon bg-warning-subtle text-warning">
                                    <i className="bi bi-clock-history"></i>
                                </div>
                                <div>
                                    <span>Expiring Soon</span>
                                    <h4>{summary.expiringSoon}</h4>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-xl-3">
                            <div className="expiry-summary-card">
                                <div className="expiry-summary-icon bg-success-subtle text-success">
                                    <i className="bi bi-check-circle"></i>
                                </div>
                                <div>
                                    <span>Good Stock</span>
                                    <h4>{summary.goodStock}</h4>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Additional Summary */}
                    <div className="expiry-additional-summary mb-4">
                        <span>
                            No Expiry Date: <strong>{summary.noExpiryDate}</strong>
                        </span>

                        <span>
                            Out of Stock: <strong>{summary.outOfStock}</strong>
                        </span>
                    </div>

                    {/* Main Table */}
                        <div className="card">
                        <div className="card-body">

                           <div className="expiry-table-header">
                            <h5>Stock Batch List</h5>

                            <div className="expiry-filter-group">
                                <div className="expiry-search">
                                    <i className="bi bi-search"></i>
                                    <input
                                        type="text"
                                        placeholder="Search food, SKU or batch..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <select
                                    className="form-select"
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="EXPIRED">Expired</option>
                                    <option value="EXPIRING_SOON">Expiring Soon</option>
                                    <option value="GOOD_STOCK">Good Stock</option>
                                    <option value="NO_EXPIRY_DATE">No Expiry Date</option>
                                    <option value="OUT_OF_STOCK">Out of Stock</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="expiry-empty-state">
                                <div className="spinner-border text-primary"></div>
                                <p>Loading expiry information...</p>
                            </div>
                        ) : (
                            <div className="table-responsive">

                                <DataTable
                                    columns={columns}
                                    data={filteredBatches}
                                    loading={loading}
                                    rowKey="stockBatchId"
                                    defaultPageSize={10}
                                    emptyMessage="No stock batches found."
                                    className="expiry-table mb-0"
                                />

                            </div>
                        )}


                        </div>
                    </div>
                  
                </div>
            </div>

        </div>

    );
};

export default ExpiryManagement;