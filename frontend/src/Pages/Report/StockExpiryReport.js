import React, { useEffect, useState } from "react";
import { ReportService } from "../../Services/ReportService";
import StatusBadge from "../../components/common/StatusBadge";
import FilterBar from "../../components/common/FilterBar";
import SummaryCard from "../../components/common/SummaryCard";
import DataTable from "../../components/common/DataTable";

function StockExpiryReport() {

    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");

    const [loading, setLoading] = useState(true);

    const loadReport = async () => {

        try {

            setLoading(true);

            const data = await ReportService.getStockExpiryReport();

            setItems(data);
            setFilteredItems(data);

        } catch (error) {

            console.error(
                "Failed to load stock expiry report:",
                error
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        loadReport();
    }, []);

    useEffect(() => {

        let result = [...items];

        // Search
        if (search.trim() !== "") {

            const keyword = search.toLowerCase();

            result = result.filter(item =>
               // item.code?.toLowerCase().includes(keyword) ||
                item.foodName?.toLowerCase().includes(keyword) ||
                item.batchNo?.toLowerCase().includes(keyword)
            );
        }

        // Status
        if (status !== "ALL") {

            result = result.filter(
                item => item.expiryStatus === status
            );

        }

        setFilteredItems(result);

    }, [search, status, items]);


    const formatDaysRemaining = (days) => {

        if (days < 0) {
            return `${Math.abs(days)} day(s) overdue`;
        }

        if (days === 0) {
            return "Expires today";
        }

        return `${days} day(s)`;
    };

    const expiredCount = filteredItems.filter(
        x => x.expiryStatus === "EXPIRED"
    ).length;

    const expiringSoonCount = filteredItems.filter(
        x =>
            x.expiryStatus === "EXPIRING SOON" ||
            x.expiryStatus === "EXPIRING"
    ).length;

    const totalStock = filteredItems.reduce(
        (sum, x) => sum + Number(x.quantityRemaining || 0),
        0
    );

    const handleReset = () => {
        setStatus("ALL");
        setSearch("");
        loadReport();
    }

    const columns = [
        {
            key: "foodName",
            label: "Product",
            render: (row) => (
                <div>
                    <strong>{row.foodName}</strong>
                    <br />
                  
                </div>
            )
        },
        {
            key: "batchNo",
            label: "Batch",
            render: (row) => row.batchNo || "-"
        },
        {
            key: "expiryDate",
            label: "Expiry Date",
            render: (row) => row.expiryDate || "-"
        },
        {
            key: "quantityRemaining",
            label: "Remaining",
            align: "right",
            render: (row) => (
                <span className="fw-bold">
                    {row.quantityRemaining} {row.unit}
                </span>
            )
        },
        {
            key: "daysRemaining",
            label: "Days Remaining",
            render: (row) => formatDaysRemaining(row.daysRemaining)
        },
        {
            key: "expiryStatus",
            label: "Status",
            render: (row) => (
                <StatusBadge status={row.expiryStatus} />
            )
        }
    ];

    return (
        <div className="page-container">

            <div className="page-title">
                <h3>
                    Stock Expiry Report
                </h3>
            </div>

            <div className="page-subtitle">
                <p className="text-muted mb-0">
                    Monitor expired and upcoming stock expiry
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
                            title="Expired Batches"
                            value={expiredCount}
                            color="danger"
                            textColor="danger"
                            icon="📅"
                        />
                        <SummaryCard
                            title="Expiring Soon"
                            value={expiringSoonCount}
                            color="warning"
                            textColor="warning"
                            icon="🕐"
                        />

                        <SummaryCard
                            title="Remaining Stock"
                            value={totalStock}
                            color="primary"
                            textColor="primary"
                            icon="📦"
                        />


                    </div>

                    {/* Filters */}

                    <div className="card shadow-sm mb-4">

                        <div className="card-body">
                            <FilterBar
                                onReset={handleReset}
                                showSearch={false}
                            >
                                <div className="col-md-6">

                                    <label className="form-label">
                                        Search
                                    </label>

                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Code / Product / Batch"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />

                                </div>

                                <div className="col-md-6">

                                    <label className="form-label">
                                        Expiry Status
                                    </label>

                                    <select
                                        className="form-select"
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(e.target.value)
                                        }
                                    >

                                        <option value="ALL">
                                            All
                                        </option>

                                        <option value="EXPIRED">
                                            Expired
                                        </option>

                                        <option value="EXPIRING SOON">
                                            Expiring Soon
                                        </option>

                                        <option value="EXPIRING">
                                            Expiring
                                        </option>

                                        <option value="SAFE">
                                            Safe
                                        </option>

                                    </select>

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
                                        data={filteredItems}
                                        loading={loading}
                                        rowKey="stockBatchId"
                                        defaultPageSize={10}
                                        emptyMessage="No expiry records found."
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

export default StockExpiryReport;