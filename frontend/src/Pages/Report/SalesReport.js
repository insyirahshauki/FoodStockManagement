import React, { useCallback, useEffect, useState } from "react";
import { ReportService } from "../../Services/ReportService";
import StatusBadge from "../../components/common/StatusBadge";
import SummaryCard from "../../components/common/SummaryCard";
import FilterBar from "../../components/common/FilterBar";
import DataTable from "../../components/common/DataTable";

function SalesReport() {

    const [sales, setSales] = useState([]);
    const [summary, setSummary] = useState({
        totalOrders: 0,
        completedOrders: 0,
        totalSales: 0,
        totalPaid: 0,
        totalOutstanding: 0
    });

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [orderStatus, setOrderStatus] = useState("ALL");
    const [paymentStatus, setPaymentStatus] = useState("ALL");

    const [loading, setLoading] = useState(true);

    const buildParams = (
        from = fromDate,
        to = toDate,
        order = orderStatus,
        payment = paymentStatus
    ) => {
        const params = new URLSearchParams();

        if (from) {
            params.append("fromDate", from);
        }

        if (to) {
            params.append("toDate", to);
        }

        if (order && order !== "ALL") {
            params.append("orderStatus", order);
        }

        if (payment && payment !== "ALL") {
            params.append("paymentStatus", payment);
        }

        const query = params.toString();

        return query ? `?${query}` : "";
    };

  const loadReport = useCallback(async (
    from = fromDate,
    to = toDate,
    order = orderStatus,
    payment = paymentStatus
) => {
    try {
        setLoading(true);

        const params = buildParams(from, to, order, payment);

        const [salesData, summaryData] = await Promise.all([
            ReportService.getSalesReport(params),
            ReportService.getSalesReportSummary(params)
        ]);

        setSales(salesData);
        setSummary(summaryData);

    } catch (error) {
        console.error("Failed to load sales report:", error);
    } finally {
        setLoading(false);
    }
}, [fromDate, toDate, orderStatus, paymentStatus]);

  useEffect(() => {
    loadReport();
}, [loadReport]);

    const formatMoney = (amount) => {

        return Number(amount || 0)
            .toLocaleString("en-MY", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

    };

    const handleReset = () => {
        setFromDate("");
        setToDate("");
        setOrderStatus("ALL");
        setPaymentStatus("ALL");
        loadReport("", "", "ALL", "ALL");
    };

    const handleSearch = () => {
        loadReport(
            fromDate,
            toDate,
            orderStatus,
            paymentStatus
        );
    };

    const columns = [
        {
            key: "orderDate",
            label: "Order Date",
            render: (row) => (
                new Date(row.orderDate).toLocaleDateString()
            )
        },
        {
            key: "orderNo",
            label: "Order No",
            render: (row) => (
                <strong>{row.orderNo}</strong>
            )
        },
        {
            key: "customerName",
            label: "Customer",
            render: (row) => row.customerName || "-"
        },
        {
            key: "orderType",
            label: "Type"
        },
        {
            key: "collectionDate",
            label: "Collection Date",
            render: (row) => (
                row.collectionDate
                    ? new Date(row.collectionDate).toLocaleDateString()
                    : "-"
            )
        },
        {
            key: "orderStatus",
            label: "Order Status",
            render: (row) => (
                <StatusBadge status={row.orderStatus} />
            )
        },
        {
            key: "paymentStatus",
            label: "Payment",
            render: (row) => (
                <StatusBadge status={row.paymentStatus} />
            )
        },
        {
            key: "totalAmount",
            label: "Total",
            align: "right",
            render: (row) => (
                <span className="fw-bold">
                    RM {formatMoney(row.totalAmount)}
                </span>
            )
        }
    ];

    return (
        <div className="page-container">

            <div className="page-title">
                <h2>
                    Sales Report
                </h2>
            </div>

            <div className="page-subtitle">
                <p>
                    Sales order and payment summary
                </p>
            </div>

            <div className="card">
                <div className="container-fluid p-4">

                    {/* Header */}

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
                            title="Total Orders"
                            value={summary.totalOrders}
                            color="primary"
                            textColor="primary"
                            icon="📋"
                        />

                        <SummaryCard
                            title="Completed Orders"
                            value={summary.completedOrders}
                            color="success"
                            textColor="success"
                            icon="✓"
                        />

                        <SummaryCard
                            title="Total Sales"
                            value={`RM ${formatMoney(summary.totalSales)}`}
                            color="info"
                            textColor="info"
                            icon="💰"
                        />

                        <SummaryCard
                            title="Total Paid"
                            value={`RM ${formatMoney(summary.totalPaid)}`}
                            color="success"
                            textColor="success"
                            icon="💵"
                        />

                        <SummaryCard
                            title="Outstanding"
                            value={`RM ${formatMoney(summary.totalOutstanding)}`}
                            color="danger"
                            textColor="danger"
                            icon="!"
                        />




                    </div>

                    {/* Filters */}

                    <div className="card shadow-sm mb-4">

                        <div className="card-body">

                            <FilterBar
                                onSearch={handleSearch}
                                onReset={handleReset}
                            >
                                <div className="col-md-3">
                                    <label className="form-label">From Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">To Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">Order Status</label>
                                    <select
                                        className="form-select"
                                        value={orderStatus}
                                        onChange={(e) => setOrderStatus(e.target.value)}
                                    >
                                        <option value="ALL">All Status</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="CONFIRMED">Confirmed</option>
                                        <option value="READY">Ready</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label">Payment Status</label>
                                    <select
                                        className="form-select"
                                        value={paymentStatus}
                                        onChange={(e) => setPaymentStatus(e.target.value)}
                                    >
                                        <option value="ALL">All Payments</option>
                                        <option value="UNPAID">Unpaid</option>
                                        <option value="PARTIAL">Partial</option>
                                        <option value="PAID">Paid</option>
                                    </select>
                                </div>

                            </FilterBar>
                        </div>

                    </div>

                    {/* Sales Table */}

                    <div className="card shadow-sm">

                        <div className="card-body">

                            {loading ? (

                                <div className="text-center py-4">
                                    Loading sales report...
                                </div>

                            ) : (

                                <div className="table-responsive">


                                    <DataTable
                                        columns={columns}
                                        data={sales}
                                        loading={loading}
                                        rowKey="salesOrderId"
                                        defaultPageSize={10}
                                        emptyMessage="No sales records found."
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

export default SalesReport;