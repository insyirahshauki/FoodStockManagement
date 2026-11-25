
import React, { useEffect, useMemo, useState } from "react";
import { StockService } from "../../Services/StockService";
import "./StockBalance.css";
import DataTable from "../../components/common/DataTable";
import TableActions from "../../components/common/TableActions";
const StockBalance = () => {
    const [stockItems, setStockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        loadStockBalance();
    }, []);

    const loadStockBalance = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await StockService.getStockBalance();
            setStockItems(Array.isArray(response) ? response : []);
        } catch (err) {
            setError(err.message || "Failed to load stock balance.");
        } finally {
            setLoading(false);
        }
    };

    const summary = useMemo(() => {
        return {
            totalProducts: stockItems.length,
            inStock: stockItems.filter(
                item => item.stockStatus === "IN_STOCK"
            ).length,
            lowStock: stockItems.filter(
                item => item.stockStatus === "LOW_STOCK"
            ).length,
            outOfStock: stockItems.filter(
                item => item.stockStatus === "OUT_OF_STOCK"
            ).length,
            totalQuantity: stockItems.reduce(
                (total, item) => total + (item.totalQuantity || 0),
                0
            ),
        };
    }, [stockItems]);

    const filteredItems = useMemo(() => {
        return stockItems.filter(item => {
            const keyword = search.toLowerCase();

            const matchesSearch =
                (item.foodName || "").toLowerCase().includes(keyword) ;
                //||
                //(item.code || "").toLowerCase().includes(keyword);

            const matchesStatus =
                statusFilter === "ALL" ||
                item.stockStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [stockItems, search, statusFilter]);

    const getStatusLabel = (status) => {
        switch (status) {
            case "IN_STOCK":
                return "In Stock";
            case "LOW_STOCK":
                return "Low Stock";
            case "OUT_OF_STOCK":
                return "Out of Stock";
            default:
                return status;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "IN_STOCK":
                return "stock-status-in";
            case "LOW_STOCK":
                return "stock-status-low";
            case "OUT_OF_STOCK":
                return "stock-status-out";
            default:
                return "";
        }
    };

    const formatDate = (date) => {
        if (!date) return "-";

        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
    };

    const columns = [
        // {
        //     key: "code",
        //     label: "Code"
        // },
        {
            key: "foodName",
            label: "Food Item",
            render: (row) => (
                <span className="fw-semibold">
                    {row.foodName}
                </span>
            )
        },
        {
            key: "minimumStock",
            label: "Minimum Stock",
            render: (row) => (
                `${row.minimumStock} ${row.unit}`
            )
        },
        {
            key: "totalQuantity",
            label: "Available Quantity",
            render: (row) => (
                <span className="fw-semibold">
                    {row.totalQuantity} {row.unit}
                </span>
            )
        },
        {
            key: "stockStatus",
            label: "Status",
            render: (row) => (
                <span className={`stock-status-badge ${getStatusClass(row.stockStatus)}`}>
                    {getStatusLabel(row.stockStatus)}
                </span>
            )
        },
        {
            key: "actions",
            label: "Action",
            align: "center",
            width: "150px",
            render: (row) => (
                <TableActions
                    onView={() => setSelectedItem(row)}
                    viewLabel="View Batches"
                />
            )
        }
    ];

    return (
        <div className="page-container">

            <div className="page-title">
                <h3>Stock Balance</h3>
            </div>

            <div className="page-subtitle">
                <p>Monitor current stock levels for all food items.</p>
            </div>

            <div className="card">
                <div className="stock-balance-page">
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={loadStockBalance}
                        disabled={loading}
                    >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {/* Summary Cards */}
                <div className="row g-3 mb-4">

                    <div className="col-6 col-lg">
                        <div className="stock-summary-card">
                            <div className="summary-icon icon-total">
                                <i className="bi bi-box-seam"></i>
                            </div>
                            <div>
                                <p>Total Products</p>
                                <h4>{summary.totalProducts}</h4>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-lg">
                        <div className="stock-summary-card">
                            <div className="summary-icon icon-quantity">
                                <i className="bi bi-boxes"></i>
                            </div>
                            <div>
                                <p>Total Quantity</p>
                                <h4>{summary.totalQuantity}</h4>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-lg">
                        <div className="stock-summary-card">
                            <div className="summary-icon icon-in">
                                <i className="bi bi-check-circle"></i>
                            </div>
                            <div>
                                <p>In Stock</p>
                                <h4>{summary.inStock}</h4>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-lg">
                        <div className="stock-summary-card">
                            <div className="summary-icon icon-low">
                                <i className="bi bi-exclamation-triangle"></i>
                            </div>
                            <div>
                                <p>Low Stock</p>
                                <h4>{summary.lowStock}</h4>
                            </div>
                        </div>
                    </div>

                    <div className="col-6 col-lg">
                        <div className="stock-summary-card">
                            <div className="summary-icon icon-out">
                                <i className="bi bi-x-circle"></i>
                            </div>
                            <div>
                                <p>Out of Stock</p>
                                <h4>{summary.outOfStock}</h4>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Stock Balance Table */}
                <div className="card stock-balance-card">

                    <div className="card-header bg-white">
                        <h5 className="mb-0">Stock Overview</h5>
                    </div>

                    <div className="card-body">

                        <div className="row g-3 mb-3">

                            <div className="col-md-7">
                                <div className="input-group">
                                    <span className="input-group-text bg-white">
                                        <i className="bi bi-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search food name..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="col-md-5">
                                <select
                                    className="form-select"
                                    value={statusFilter}
                                    onChange={e => setStatusFilter(e.target.value)}
                                >
                                    <option value="ALL">All Stock Status</option>
                                    <option value="IN_STOCK">In Stock</option>
                                    <option value="LOW_STOCK">Low Stock</option>
                                    <option value="OUT_OF_STOCK">Out of Stock</option>
                                </select>
                            </div>

                        </div>

                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary"></div>
                                <p className="mt-2 text-muted">Loading stock balance...</p>
                            </div>
                        ) : (
                            <div className="table-responsive">

                                <DataTable
                                    columns={columns}
                                    data={filteredItems}
                                    loading={loading}
                                    rowKey="foodItemId"
                                    defaultPageSize={10}
                                    emptyMessage="No stock records found."
                                />

                            </div>
                        )}

                    </div>
                </div>

                {/* Batch Details Modal */}
                {selectedItem && (
                    <div
                        className="stock-modal-backdrop"
                        onClick={() => setSelectedItem(null)}
                    >
                        <div
                            className="stock-modal"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="stock-modal-header">
                                <div>
                                    <h5 className="mb-1">Batch Details</h5>
                                    <small className="text-muted">
                                         {selectedItem.foodName}
                                    </small>
                                </div>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setSelectedItem(null)}
                                ></button>
                            </div>

                            <div className="stock-modal-body">
                                <div className="row g-3 mb-3">
                                    <div className="col-6">
                                        <div className="batch-info">
                                            <small>Available Quantity</small>
                                            <h5>
                                                {selectedItem.totalQuantity} {selectedItem.unit}
                                            </h5>
                                        </div>
                                    </div>

                                    <div className="col-6">
                                        <div className="batch-info">
                                            <small>Minimum Stock</small>
                                            <h5>
                                                {selectedItem.minimumStock} {selectedItem.unit}
                                            </h5>
                                        </div>
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-sm table-bordered align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Batch No.</th>
                                                <th>Received Date</th>
                                                <th>Expiry Date</th>
                                                <th>Received Qty</th>
                                                <th>Remaining Qty</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {selectedItem.batches?.length > 0 ? (
                                                selectedItem.batches.map(batch => (
                                                    <tr key={batch.stockBatchId}>
                                                        <td>{batch.batchNo}</td>
                                                        <td>{formatDate(batch.receivedDate)}</td>
                                                        <td>{formatDate(batch.expiryDate)}</td>
                                                        <td>{batch.quantityReceived}</td>
                                                        <td className="fw-semibold">
                                                            {batch.quantityRemaining}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-3">
                                                        No available batches.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="stock-modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedItem(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default StockBalance;
