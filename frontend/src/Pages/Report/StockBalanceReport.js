import React, { useEffect, useState } from "react";
import { ReportService } from "../../Services/ReportService";
import StatusBadge from "../../components/common/StatusBadge";
import DataTable from "../../components/common/DataTable";

const StockBalanceReport = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadReport();
    }, []);

    const loadReport = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await ReportService.getStockBalanceReport();

            setData(Array.isArray(response) ? response : []);

        } catch (err) {
            setError(
                err.message || "Unable to load stock balance report."
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredData = data.filter(item => {

        const keyword = search.toLowerCase();

        return (
            (item.code || "").toLowerCase().includes(keyword) ||
            (item.foodName || "").toLowerCase().includes(keyword)
        );
    });

const columns = [
    // {
    //     key: "code",
    //     label: "Code",
    //     render: (row) => (
    //         <span className="fw-semibold">
    //             {row.code}
    //         </span>
    //     )
    // },
    {
        key: "foodName",
        label: "Food Name"
    },
    {
        key: "unit",
        label: "Unit"
    },
    {
        key: "currentStock",
        label: "Current Stock",
        align: "right",
        render: (row) => (
            <span className="fw-bold">
                {row.currentStock}
            </span>
        )
    },
    {
        key: "minimumStock",
        label: "Minimum Stock",
        align: "right"
    },
    {
        key: "status",
        label: "Status",
        render: (row) => (
            <StatusBadge status={row.status} />
        )
    }
];

    return (
        <div className="page-container">

            <div className="page-title">
                <h3>
                    Stock Balance Report
                </h3>
            </div>

            <div className="page-subtitle">
                <p>
                    Current stock balance by food item.
                </p>
            </div>

            <div className="card">
                <div className="container-fluid p-4">

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <button
                            className="btn btn-outline-primary"
                            onClick={loadReport}
                            disabled={loading}
                        >
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            Refresh
                        </button>

                    </div>

                    <div className="card mb-4">
                        <div className="card-body">

                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search food item ..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    <div className="card">

                        <div className="card-body">

                            <div className="d-flex justify-content-between mb-3">

                                <h5 className="fw-bold mb-0">
                                    Stock Balance
                                </h5>

                                <span className="text-muted">
                                    {filteredData.length} items
                                </span>

                            </div>

                            {loading ? (

                                <div className="text-center py-5">

                                    <div className="spinner-border text-primary"></div>

                                    <p className="text-muted mt-2">
                                        Loading report...
                                    </p>

                                </div>

                            ) : (

                                <div className="table-responsive">

                                   
<DataTable
    columns={columns}
    data={filteredData}
    loading={loading}
    rowKey="foodItemId"
    defaultPageSize={10}
    emptyMessage="No stock records found."
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

export default StockBalanceReport;