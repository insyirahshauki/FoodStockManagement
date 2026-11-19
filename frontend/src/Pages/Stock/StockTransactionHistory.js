
import React, { useEffect, useMemo, useState } from "react";
import { StockService } from "../../Services/StockService";
import "./StockTransactionHistory.css";
import DataTable from "../../components/common/DataTable";
const StockTransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await StockService.getStockTransactions();

            setTransactions(Array.isArray(response) ? response : []);
        } catch (err) {
            setError(err.message || "Failed to load stock transactions.");
        } finally {
            setLoading(false);
        }
    };

    const summary = useMemo(() => ({
        total: transactions.length,
        stockIn: transactions.filter(
            t => t.transactionType === "IN"
        ).length,
        stockOut: transactions.filter(
            t => t.transactionType === "OUT"
        ).length,
        adjustment: transactions.filter(
            t => ["ADJUSTMENT_IN", "ADJUSTMENT_OUT"]
                .includes(t.transactionType)
        ).length
    }), [transactions]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction => {
            const keyword = searchTerm.toLowerCase();

            const matchesSearch = [
                transaction.foodName,
                transaction.code,
                transaction.batchNo,
                transaction.referenceNo,
                transaction.notes
            ].some(value =>
                (value || "").toLowerCase().includes(keyword)
            );

            const matchesType =
                typeFilter === "ALL" ||
                transaction.transactionType === typeFilter;

            return matchesSearch && matchesType;
        });
    }, [transactions, searchTerm, typeFilter]);

    const getTransactionLabel = type => {
        const labels = {
            IN: "Stock In",
            OUT: "Stock Out",
            //  ADJUSTMENT_IN: "Adjustment In",
            ADJUSTMENT_OUT: "Adjustment Out"
        };

        return labels[type] || type;
    };

    const getTransactionClass = type => {
        const classes = {
            IN: "transaction-in",
            OUT: "transaction-out",
            // ADJUSTMENT_IN: "transaction-adjustment-in",
            ADJUSTMENT_OUT: "transaction-adjustment-out"
        };

        return classes[type] || "";
    };

    const formatDate = date => {
        if (!date) return "-";

        return new Date(date).toLocaleString("en-MY", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };
    const columns = [
        {
            key: "transactionDate",
            label: "Date & Time",
            render: (row) => formatDate(row.transactionDate)
        },
        {
            key: "foodName",
            label: "Food Item",
            render: (row) => (
                <div>
                    <strong>{row.foodName}</strong>

                    <small className="d-block text-muted">
                        {row.code}
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
            key: "transactionType",
            label: "Transaction Type",
            render: (row) => (
                <span
                    className={`transaction-type-badge ${getTransactionClass(
                        row.transactionType
                    )}`}
                >
                    {getTransactionLabel(row.transactionType)}
                </span>
            )
        },
        {
            key: "quantity",
            label: "Quantity",
            render: (row) => (
                <span>
                    <strong>{row.quantity}</strong>{" "}
                    {row.unit}
                </span>
            )
        },
        {
            key: "referenceNo",
            label: "Reference No.",
            render: (row) => row.referenceNo || "-"
        },
        {
            key: "notes",
            label: "Notes",
            render: (row) => row.notes || "-"
        }
    ];
    return (
        <div className="page-container">

            <div className="page-title">
                <h3>Stock Transaction History</h3>
            </div>

            <div className="page-subtitle">
                <p>
                    View and monitor all stock movements.
                </p>
            </div>

            <div className="card">
                <div className="stock-transaction-page">

                    <div className="transaction-page-header">
                        <button
                            className="btn btn-outline-primary"
                            onClick={loadTransactions}
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

                        <div className="col-12 col-sm-6 col-xl-3">
                            <div className="transaction-summary-card">
                                <div className="transaction-summary-icon bg-primary-subtle text-primary">
                                    <i className="bi bi-list-ul"></i>
                                </div>
                                <div>
                                    <span>Total Transactions</span>
                                    <h4>{summary.total}</h4>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-xl-3">
                            <div className="transaction-summary-card">
                                <div className="transaction-summary-icon bg-success-subtle text-success">
                                    <i className="bi bi-box-arrow-in-down"></i>
                                </div>
                                <div>
                                    <span>Stock In</span>
                                    <h4>{summary.stockIn}</h4>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-xl-3">
                            <div className="transaction-summary-card">
                                <div className="transaction-summary-icon bg-danger-subtle text-danger">
                                    <i className="bi bi-box-arrow-up"></i>
                                </div>
                                <div>
                                    <span>Stock Out</span>
                                    <h4>{summary.stockOut}</h4>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-sm-6 col-xl-3">
                            <div className="transaction-summary-card">
                                <div className="transaction-summary-icon bg-warning-subtle text-warning">
                                    <i className="bi bi-arrow-left-right"></i>
                                </div>
                                <div>
                                    <span>Adjustments</span>
                                    <h4>{summary.adjustment}</h4>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Transaction Table */}
                    <div className="card">
                        <div className="card-body">

                          <div className="transaction-table-header">
                            <h5>Transaction Records</h5>

                            <div className="transaction-filter-group">

                                <div className="transaction-search">
                                    <i className="bi bi-search"></i>
                                    <input
                                        type="text"
                                        placeholder="Search food, code, batch..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <select
                                    className="form-select"
                                    value={typeFilter}
                                    onChange={e => setTypeFilter(e.target.value)}
                                >
                                    <option value="ALL">All Transactions</option>
                                    <option value="IN">Stock In</option>
                                    <option value="OUT">Stock Out</option>
                                    {/* <option value="ADJUSTMENT_IN">Adjustment In</option> */}
                                    <option value="ADJUSTMENT_OUT">Adjustment Out</option>
                                </select>

                            </div>
                        </div>

                        {loading ? (
                            <div className="transaction-empty-state">
                                <div className="spinner-border text-primary"></div>
                                <p>Loading transactions...</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <DataTable
                                    columns={columns}
                                    data={filteredTransactions}
                                    loading={loading}
                                    rowKey="stockTransactionId"
                                    defaultPageSize={10}
                                    emptyMessage="No transactions found."
                                    className="stock-transaction-table mb-0"
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

export default StockTransactionHistory;
