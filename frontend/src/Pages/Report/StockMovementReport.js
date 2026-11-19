import React, { useEffect, useState } from "react";
import { ReportService } from "../../Services/ReportService";
import StatusBadge from "../../components/common/StatusBadge";
import FilterBar from "../../components/common/FilterBar";
import SummaryCard from "../../components/common/SummaryCard";
import DataTable from "../../components/common/DataTable";
function StockMovementReport() {

    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);

    const [search, setSearch] = useState("");
    const [transactionType, setTransactionType] = useState("ALL");

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [loading, setLoading] = useState(true);

    const loadReport = async () => {
        try {
            setLoading(true);

            const data = await ReportService.getStockMovementReport();

            setTransactions(data);
            setFilteredTransactions(data);

        } catch (error) {
            console.error("Failed to load stock movement report:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReport();
    }, []);

    useEffect(() => {

        let result = [...transactions];

        // Search
        if (search.trim() !== "") {

            const keyword = search.toLowerCase();

            result = result.filter(item =>
                item.code?.toLowerCase().includes(keyword) ||
                item.foodName?.toLowerCase().includes(keyword) ||
                item.batchNo?.toLowerCase().includes(keyword) ||
                item.referenceNo?.toLowerCase().includes(keyword)
            );
        }

        // Transaction Type
        if (transactionType !== "ALL") {
            result = result.filter(
                item => item.transactionType === transactionType
            );
        }

        // From Date
        if (fromDate !== "") {

            result = result.filter(item => {
                const date = item.transactionDate.substring(0, 10);
                return date >= fromDate;
            });
        }

        // To Date
        if (toDate !== "") {

            result = result.filter(item => {
                const date = item.transactionDate.substring(0, 10);
                return date <= toDate;
            });
        }

        setFilteredTransactions(result);

    }, [
        search,
        transactionType,
        fromDate,
        toDate,
        transactions
    ]);

    const getQuantityDisplay = (item) => {

        if (item.transactionType === "IN") {
            return `+${item.quantity}`;
        }

        if (item.transactionType === "OUT") {
            return `-${item.quantity}`;
        }

        return item.quantity;
    };


    const totalIn = filteredTransactions
        .filter(x => x.transactionType === "IN")
        .reduce((sum, x) => sum + Number(x.quantity || 0), 0);

    const totalOut = filteredTransactions
        .filter(x => x.transactionType === "OUT")
        .reduce((sum, x) => sum + Number(x.quantity || 0), 0);

    const handleSearch = () => {
        loadReport(
            search,
            transactionType,
            fromDate,
            toDate
        );
    };


    const handleReset = () => {
        setFromDate("");
        setToDate("");
        setTransactionType("ALL");
        setSearch("");
        loadReport("", "", "ALL", "");
    };

    const columns = [
        {
            key: "transactionDate",
            label: "Date",
            render: (row) => (
                new Date(row.transactionDate).toLocaleString()
            )
        },
        {
            key: "referenceNo",
            label: "Reference",
            render: (row) => row.referenceNo || "-"
        },
        {
            key: "foodName",
            label: "Product",
            render: (row) => (
                <div>
                    <strong>{row.foodName}</strong>
                    <br />
                    <small className="text-muted">
                        {row.code}
                    </small>
                </div>
            )
        },
        {
            key: "batchNo",
            label: "Batch",
            render: (row) => row.batchNo || "-"
        },
        {
            key: "transactionType",
            label: "Type",
            render: (row) => (
                <StatusBadge status={row.transactionType} />
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
                    {getQuantityDisplay(row)}
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
                <h3>Stock Movement Report</h3>
            </div>

            <div className="page-subtitle">
                <p>
                    Stock In and Stock Out movement history
                </p>
            </div>

            <div className="card">
                <div className="container-fluid p-4">

                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <button
                            className="btn btn-outline-primary"
                            onClick={loadReport}
                        >
                            🔄 Refresh
                        </button>

                    </div>

                    {/* Summary */}

                    <div className="row mb-4">
                        <SummaryCard
                            title="Total Stock In"
                            value={`+ ${(totalIn)}`}
                            color="primary"
                            textColor="primary"
                            icon="📦"
                        />

                        <SummaryCard
                            title="Total Stock Out"
                            value={`- ${(totalOut)}`}
                            color="danger"
                            textColor="danger"
                            icon="📤"
                        />

                        <SummaryCard
                            title="Total Transactions"
                            value={filteredTransactions.length}
                            color="success"
                            textColor="success"
                            icon="📊"
                        />

                    </div>

                    {/* Filters */}

                    <div className="card shadow-sm mb-4">

                        <div className="card-body">
                            <FilterBar

                                onReset={handleReset}
                                showSearch={false}
                            >

                                <div className="col-md-3">

                                    <label className="form-label">
                                        Search
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Code / Product / Batch / Reference"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />

                                </div>

                                <div className="col-md-3">

                                    <label className="form-label">
                                        Type
                                    </label>

                                    <select
                                        className="form-select"
                                        value={transactionType}
                                        onChange={(e) =>
                                            setTransactionType(e.target.value)
                                        }
                                    >

                                        <option value="ALL">
                                            All
                                        </option>

                                        <option value="IN">
                                            Stock In
                                        </option>

                                        <option value="OUT">
                                            Stock Out
                                        </option>

                                        <option value="ADJUSTMENT">
                                            Adjustment
                                        </option>

                                    </select>

                                </div>

                                <div className="col-md-3">

                                    <label className="form-label">
                                        From Date
                                    </label>

                                    <input
                                        type="date"
                                        className="form-control"
                                        value={fromDate}
                                        onChange={(e) =>
                                            setFromDate(e.target.value)
                                        }
                                    />

                                </div>

                                <div className="col-md-3">

                                    <label className="form-label">
                                        To Date
                                    </label>

                                    <input
                                        type="date"
                                        className="form-control"
                                        value={toDate}
                                        onChange={(e) =>
                                            setToDate(e.target.value)
                                        }
                                    />

                                </div>

                            </FilterBar>


                        </div>

                    </div>

                    {/* Table */}

                    <div className="card shadow-sm">

                        <div className="card-body">

                            {loading ? (

                                <div className="text-center py-4">
                                    Loading report...
                                </div>

                            ) : (

                                <div className="table-responsive">


                                    <DataTable
                                        columns={columns}
                                        data={filteredTransactions}
                                        loading={loading}
                                        rowKey="stockTransactionId"
                                        defaultPageSize={10}
                                        emptyMessage="No stock movement found."
                                    />


                                </div>

                            )}

                        </div>

                    </div>

                </div>
            </div>

        </div>

    );
}

export default StockMovementReport;