import React, { useEffect, useState } from "react";
import { StockService } from "../../Services/StockService";
import "./StockTransaction.css";
import DataTable from "../../components/common/DataTable";
const currencyDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-MY", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const StockTransaction = () => {

    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState("");
    const [transactionType, setTransactionType] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
            setError(
                err.message || "Unable to load stock transactions."
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(transaction => {

        const keyword = search.toLowerCase();

        const matchesSearch =
            (transaction.foodName || "").toLowerCase().includes(keyword) ||
            (transaction.code || "").toLowerCase().includes(keyword) ||
            (transaction.batchNo || "").toLowerCase().includes(keyword) ||
            (transaction.referenceNo || "").toLowerCase().includes(keyword);

        const matchesType =
            !transactionType ||
            transaction.transactionType === transactionType;

        return matchesSearch && matchesType;
    });

    const getTransactionBadge = (type) => {

        switch (type) {
            case "IN":
                return "bg-success";

            case "OUT":
                return "bg-danger";

            case "ADJUSTMENT":
                return "bg-warning text-dark";

            default:
                return "bg-secondary";
        }
    };

    const getQuantityDisplay = (transaction) => {

        const quantity = Number(transaction.quantity || 0);

        if (transaction.transactionType === "IN") {
            return `+${quantity}`;
        }

        if (transaction.transactionType === "OUT") {
            return `-${quantity}`;
        }

        return quantity;
    };
    const columns = [
        {
            key: "transactionDate",
            label: "Date",
            render: (row) => currencyDate(row.transactionDate)
        },
        {
            key: "referenceNo",
            label: "Reference No.",
            render: (row) => (
                <span className="fw-semibold">
                    {row.referenceNo || "-"}
                </span>
            )
        },
        {
            key: "foodName",
            label: "Product",
            render: (row) => (
                <div>
                    <div className="fw-semibold">
                        {row.foodName}
                    </div>

                    <small className="text-muted">
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
            label: "Type",
            render: (row) => (
                <span
                    className={`badge ${getTransactionBadge(
                        row.transactionType
                    )}`}
                >
                    {row.transactionType}
                </span>
            )
        },
        {
            key: "quantity",
            label: "Quantity",
            align: "right",
            render: (row) => (
                <span
                    className={`fw-bold ${row.transactionType === "IN"
                            ? "text-success"
                            : row.transactionType === "OUT"
                                ? "text-danger"
                                : ""
                        }`}
                >
                    {getQuantityDisplay(row)} {row.unit}
                </span>
            )
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
                <h3>
                    Stock Transactions
                </h3>
            </div>

            <div className="page-subtitle">
                <p>
                    View and track all stock movements.
                </p>
            </div>

            <div className="card">
                <div className="container-fluid stock-transaction-page">

                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <button
                            className="btn btn-outline-primary"
                            onClick={loadTransactions}
                            disabled={loading}
                        >
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            Refresh
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="row g-3 mb-4">

                        <div className="col-md-4">
                            <div className="card transaction-summary-card">
                                <div className="card-body">
                                    <div className="text-muted">
                                        Total Transactions
                                    </div>

                                    <h3 className="fw-bold mb-0">
                                        {transactions.length}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card transaction-summary-card">
                                <div className="card-body">
                                    <div className="text-muted">
                                        Stock In
                                    </div>

                                    <h3 className="fw-bold text-success mb-0">
                                        {transactions.filter(
                                            t => t.transactionType === "IN"
                                        ).length}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card transaction-summary-card">
                                <div className="card-body">
                                    <div className="text-muted">
                                        Stock Out
                                    </div>

                                    <h3 className="fw-bold text-danger mb-0">
                                        {transactions.filter(
                                            t => t.transactionType === "OUT"
                                        ).length}
                                    </h3>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Filters */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="row g-3">

                                <div className="col-md-8">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search product, code, batch or reference..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                <div className="col-md-4">
                                    <select
                                        className="form-select"
                                        value={transactionType}
                                        onChange={(e) =>
                                            setTransactionType(e.target.value)
                                        }
                                    >
                                        <option value="">All Transactions</option>
                                        <option value="IN">Stock In</option>
                                        <option value="OUT">Stock Out</option>
                                        <option value="ADJUSTMENT">Adjustment</option>
                                    </select>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Transaction Table */}
                    <div className="card">
                        <div className="card-body">

                            <div className="d-flex justify-content-between mb-3">
                                <h5 className="fw-bold mb-0">
                                    Transaction History
                                </h5>

                                <span className="text-muted">
                                    {filteredTransactions.length} records
                                </span>
                            </div>

                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary"></div>
                                    <p className="text-muted mt-2">
                                        Loading transactions...
                                    </p>
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

export default StockTransaction;