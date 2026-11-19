import React, { useEffect, useState } from "react";
import { SalesService } from "../../Services/SalesService";
import "./SalesHistory.css";
import DataTable from "../../components/common/DataTable";
import TableActions from "../../components/common/TableActions";
const currency = (amount) =>
    new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR"
    }).format(Number(amount || 0));

const SalesHistory = () => {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [orderType, setOrderType] = useState("");
    const [orderStatus, setOrderStatus] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [statusError, setStatusError] = useState("");
    const [statusSuccess, setStatusSuccess] = useState("");
    const [payments, setPayments] = useState([]);

    const [paymentForm, setPaymentForm] = useState({
        paymentAmount: "",
        paymentMethod: "CASH",
        referenceNo: "",
        notes: ""
    });

    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentSaving, setPaymentSaving] = useState(false);
    const [paymentError, setPaymentError] = useState("");
    const [paymentSuccess, setPaymentSuccess] = useState("");

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await SalesService.getSalesOrders();

            setOrders(Array.isArray(response) ? response : []);
        } catch (err) {
            setError(err.message || "Unable to load sales history.");
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const keyword = search.toLowerCase();

        const matchSearch =
            order.orderNo?.toLowerCase().includes(keyword) ||
            order.customerName?.toLowerCase().includes(keyword) ||
            order.customerPhone?.toLowerCase().includes(keyword);

        const matchType =
            !orderType || order.orderType === orderType;

        const matchStatus =
            !orderStatus || order.orderStatus === orderStatus;

        return matchSearch && matchType && matchStatus;
    });

    const statusClass = (status) => {
        switch (status) {
            case "COMPLETED":
                return "bg-success";
            case "CONFIRMED":
                return "bg-primary";
            case "READY":
                return "bg-info text-dark";
            case "CANCELLED":
                return "bg-danger";
            default:
                return "bg-warning text-dark";
        }
    };

    const paymentClass = (status) => {
        switch (status) {
            case "PAID":
                return "bg-success";
            case "PARTIAL":
                return "bg-warning text-dark";
            default:
                return "bg-secondary";
        }
    };

    const openOrder = async (order) => {
        try {
            setPaymentError("");
            setPaymentSuccess("");
            setPayments([]);
            setPaymentForm({
                paymentAmount: "",
                paymentMethod: "CASH",
                referenceNo: "",
                notes: ""
            });

            const response =
                await SalesService.getSalesOrderById(
                    order.salesOrderId
                );

            setSelectedOrder(response);

            await loadPaymentHistory(order.salesOrderId);

        } catch (err) {
            setError(err.message || "Unable to load order details.");
        }
    };

    const loadPaymentHistory = async (salesOrderId) => {
        try {
            setPaymentLoading(true);

            const response =
                await SalesService.getSalesPaymentHistory(
                    salesOrderId
                );

            setPayments(Array.isArray(response) ? response : []);

        } catch (err) {
            setPaymentError(
                err.message || "Unable to load payment history."
            );
        } finally {
            setPaymentLoading(false);
        }
    };
    const handlePaymentChange = (e) => {
        const { name, value } = e.target;

        setPaymentForm(previous => ({
            ...previous,
            [name]: value
        }));
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();

        setPaymentError("");
        setPaymentSuccess("");

        const amount = Number(paymentForm.paymentAmount);

        if (!paymentForm.paymentAmount || !Number.isFinite(amount) || amount <= 0) {
            setPaymentError("Please enter a valid payment amount.");
            return;
        }

        if (!Number.isInteger(amount * 100)) {
            setPaymentError("Payment amount can only have 2 decimal places.");
            return;
        }

        try {
            setPaymentSaving(true);

            await SalesService.recordSalesPayment(
                selectedOrder.salesOrderId,
                {
                    ...paymentForm,
                    paymentAmount: amount
                }
            );

            setPaymentSuccess("Payment recorded successfully.");

            // Refresh order details and latest balance
            const updatedOrder =
                await SalesService.getSalesOrderById(
                    selectedOrder.salesOrderId
                );

            setSelectedOrder(updatedOrder);

            // Refresh payment history
            await loadPaymentHistory(selectedOrder.salesOrderId);

            // Refresh sales order table
            await loadOrders();

            setPaymentForm({
                paymentAmount: "",
                paymentMethod: "CASH",
                referenceNo: "",
                notes: ""
            });

        } catch (err) {
            setPaymentError(
                err.message || "Unable to record payment."
            );
        } finally {
            setPaymentSaving(false);
        }
    };
    const getAvailableStatusActions = (order) => {
        const { orderType, orderStatus } = order;

        if (orderStatus === "PENDING") {
            return [
                { label: "Confirm", status: "CONFIRMED" },
                { label: "Cancel", status: "CANCELLED" }
            ];
        }

        if (orderStatus === "CONFIRMED") {
            if (orderType === "PRE_ORDER") {
                return [
                    { label: "Mark as Ready", status: "READY" },
                    { label: "Cancel", status: "CANCELLED" }
                ];
            }

            if (orderType === "READY_STOCK") {
                return [
                    { label: "Mark as Ready", status: "READY" }
                ];
            }
        }

        if (orderStatus === "READY") {
            return [
                { label: "Complete", status: "COMPLETED" }
            ];
        }

        return [];
    };

    const handleUpdateStatus = async (order, newStatus) => {
        const confirmed = window.confirm(
            `Update order ${order.orderNo} to ${newStatus}?`
        );

        if (!confirmed) return;

        try {
            setUpdatingStatus(true);
            setStatusError("");
            setStatusSuccess("");

            await SalesService.updateSalesOrderStatus(
                order.salesOrderId,
                newStatus
            );

            setStatusSuccess(
                `Order ${order.orderNo} updated to ${newStatus}.`
            );

            // Refresh sales order list
            await loadOrders();

            // Refresh selected order details
            const updatedOrder =
                await SalesService.getSalesOrderById(
                    order.salesOrderId
                );

            setSelectedOrder(updatedOrder);

        } catch (err) {
            setStatusError(
                err.message || "Unable to update order status."
            );
        } finally {
            setUpdatingStatus(false);
        }
    };
    const printPaymentReceipt = (payment) => {
        const receiptWindow = window.open("", "_blank");

        if (!receiptWindow) {
            alert("Please allow pop-ups to print the receipt.");
            return;
        }

        const currency = (value) =>
            `RM ${Number(value || 0).toFixed(2)}`;

        const paymentDate = payment.paymentDate
            ? new Date(payment.paymentDate).toLocaleString("en-MY")
            : "-";

        receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Receipt</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 30px;
                    max-width: 500px;
                    margin: auto;
                    color: #333;
                }

                .center {
                    text-align: center;
                }

                .row {
                    display: flex;
                    justify-content: space-between;
                    margin: 12px 0;
                }

                hr {
                    border: 0;
                    border-top: 1px dashed #aaa;
                    margin: 20px 0;
                }

                .amount {
                    font-size: 24px;
                    font-weight: bold;
                }

                @media print {
                    button {
                        display: none;
                    }
                }
            </style>
        </head>

        <body>
            <div class="center">
                <h2>FOOD STOCK MANAGEMENT</h2>
                <h3>PAYMENT RECEIPT</h3>
                <p>${payment.referenceNo || "-"}</p>
            </div>

            <hr>

            <div class="row">
                <span>Order No.</span>
                <strong>${payment.orderNo}</strong>
            </div>

            <div class="row">
                <span>Customer</span>
                <strong>${payment.customerName}</strong>
            </div>

            <div class="row">
                <span>Payment Date</span>
                <strong>${paymentDate}</strong>
            </div>

            <div class="row">
                <span>Payment Method</span>
                <strong>${payment.paymentMethod || "-"}</strong>
            </div>

            <hr>

            <div class="row amount">
                <span>Payment Amount</span>
                <span>${currency(payment.paymentAmount)}</span>
            </div>

            <div class="row">
                <span>Order Total</span>
                <strong>${currency(payment.orderTotal)}</strong>
            </div>

            <div class="row">
                <span>Total Paid</span>
                <strong>${currency(payment.totalPaid)}</strong>
            </div>

            <div class="row">
                <span>Balance</span>
                <strong>${currency(payment.balanceAmount)}</strong>
            </div>

            <hr>

            <p class="center">Thank you for your payment!</p>

            <div class="center">
                <button onclick="window.print()">Print Receipt</button>
            </div>
        </body>
        </html>
    `);

        receiptWindow.document.close();
    };

    const orderColumns = [
        {
            key: "orderNo",
            label: "Order No",
            render: (row) => (
                <span className="fw-semibold">
                    {row.orderNo}
                </span>
            )
        },
        {
            key: "customerName",
            label: "Customer",
            render: (row) => (
                <div>
                    <div>{row.customerName || "-"}</div>
                    <small className="text-muted">
                        {row.customerPhone || "-"}
                    </small>
                </div>
            )
        },
        {
            key: "orderType",
            label: "Order Type",
            render: (row) => (
                row.orderType === "PRE_ORDER"
                    ? "Pre-Order"
                    : "Ready Stock"
            )
        },
        {
            key: "collectionDate",
            label: "Collection Date",
            render: (row) => (
                row.collectionDate
                    ? new Date(row.collectionDate).toLocaleString("en-MY")
                    : "-"
            )
        },
        {
            key: "totalAmount",
            label: "Total",
            align: "right",
            render: (row) => currency(row.totalAmount)
        },
        {
            key: "depositAmount",
            label: "Deposit",
            align: "right",
            render: (row) => currency(row.depositAmount)
        },
        {
            key: "balanceAmount",
            label: "Balance",
            align: "right",
            render: (row) => (
                <span className="fw-semibold">
                    {currency(row.balanceAmount)}
                </span>
            )
        },
        {
            key: "orderStatus",
            label: "Status",
            render: (row) => (
                <span className={`badge ${statusClass(row.orderStatus)}`}>
                    {row.orderStatus}
                </span>
            )
        },
        {
            key: "paymentStatus",
            label: "Payment",
            render: (row) => (
                <span className={`badge ${paymentClass(row.paymentStatus)}`}>
                    {row.paymentStatus}
                </span>
            )
        },
        {
            key: "actions",
            label: "Action",
            align: "center",
            width: "100px",
            render: (row) => (
                <TableActions
                    onView={() => openOrder(row)}
                />
            )
        }
    ];

    return (
        <div className="page-container">

            <div className="page-title">
                <h3>Sales History</h3>
            </div>

            <div className="page-subtitle">
                <p>
                    View and manage customer orders
                </p>
            </div>

            <div className="card">
                <div className="sales-history-page">

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <button
                            className="btn btn-outline-primary"
                            onClick={loadOrders}
                        >
                            <i className="bi bi-arrow-clockwise me-1" />
                            Refresh
                        </button>
                    </div>

                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {/* Summary */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-4">
                            <div className="card summary-card">
                                <div className="card-body">
                                    <div className="text-muted">Total Orders</div>
                                    <h3>{orders.length}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card summary-card">
                                <div className="card-body">
                                    <div className="text-muted">Total Sales</div>
                                    <h3>
                                        {currency(
                                            orders.reduce(
                                                (sum, order) =>
                                                    sum + Number(order.totalAmount || 0),
                                                0
                                            )
                                        )}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="card summary-card">
                                <div className="card-body">
                                    <div className="text-muted">Pending Orders</div>
                                    <h3>
                                        {orders.filter(
                                            order => order.orderStatus === "PENDING"
                                        ).length}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search order no, customer..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>

                                <div className="col-md-3">
                                    <select
                                        className="form-select"
                                        value={orderType}
                                        onChange={e => setOrderType(e.target.value)}
                                    >
                                        <option value="">All Order Types</option>
                                        <option value="READY_STOCK">Ready Stock</option>
                                        <option value="PRE_ORDER">Pre-Order</option>
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <select
                                        className="form-select"
                                        value={orderStatus}
                                        onChange={e => setOrderStatus(e.target.value)}
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="CONFIRMED">Confirmed</option>
                                        <option value="READY">Ready</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="card">
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" />
                                    <p className="mt-2">Loading sales history...</p>
                                </div>
                            ) : (
                                <div className="table-responsive">

                                    <DataTable
                                        columns={orderColumns}
                                        data={filteredOrders}
                                        loading={loading}
                                        rowKey="salesOrderId"
                                        defaultPageSize={10}
                                        emptyMessage="No sales orders found."
                                    />

                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Details Modal */}
                    {selectedOrder && (
                        <div
                            className="sales-modal-backdrop"
                            onClick={() => setSelectedOrder(null)}
                        >
                            <div
                                className="sales-modal"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div>
                                        <h5 className="mb-1">Order Details</h5>
                                        <small className="text-muted">
                                            {selectedOrder.orderNo}
                                        </small>
                                    </div>

                                    <button
                                        className="btn-close"
                                        onClick={() => setSelectedOrder(null)}
                                    />
                                </div>

                                <hr />

                                <div className="row g-3 mb-3">
                                    <div className="col-6">
                                        <small className="text-muted">Customer</small>
                                        <div className="fw-semibold">
                                            {selectedOrder.customerName}
                                        </div>
                                    </div>

                                    <div className="col-6">
                                        <small className="text-muted">Phone</small>
                                        <div>
                                            {selectedOrder.customerPhone || "-"}
                                        </div>
                                    </div>

                                    <div className="col-6">
                                        <small className="text-muted">Order Type</small>
                                        <div>{selectedOrder.orderType}</div>
                                    </div>

                                    <div className="col-6">
                                        <small className="text-muted">Order Status</small>
                                        <div>{selectedOrder.orderStatus}</div>
                                    </div>
                                </div>

                                <h6>Items</h6>

                                <div className="table-responsive">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Food Item</th>
                                                <th>Qty</th>
                                                <th>Price</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {selectedOrder.items?.map(item => (
                                                <tr key={item.salesOrderDetailId}>
                                                    <td>{item.foodName}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{currency(item.unitPrice)}</td>
                                                    <td>{currency(item.subtotal)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="card bg-light mt-3">
                                    <div className="card-body">
                                        <h6 className="mb-3">Payment Summary</h6>

                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Total Amount</span>
                                            <strong>{currency(selectedOrder.totalAmount)}</strong>
                                        </div>

                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Initial Deposit</span>
                                            <span>{currency(selectedOrder.depositAmount)}</span>
                                        </div>

                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Additional Payments</span>
                                            <span>
                                                {currency(
                                                    payments.reduce(
                                                        (sum, payment) =>
                                                            sum + Number(payment.paymentAmount || 0),
                                                        0
                                                    )
                                                )}
                                            </span>
                                        </div>

                                        <hr />

                                        <div className="d-flex justify-content-between mb-2">
                                            <strong>Total Paid</strong>
                                            <strong>
                                                {currency(
                                                    Number(selectedOrder.totalAmount || 0) -
                                                    Number(selectedOrder.balanceAmount || 0)
                                                )}
                                            </strong>
                                        </div>

                                        <div className="d-flex justify-content-between mb-2">
                                            <strong>Balance</strong>
                                            <strong className="text-danger">
                                                {currency(selectedOrder.balanceAmount)}
                                            </strong>
                                        </div>

                                        <div className="d-flex justify-content-between">
                                            <span>Payment Status</span>
                                            <span className={`badge ${paymentClass(selectedOrder.paymentStatus)}`}>
                                                {selectedOrder.paymentStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h6 className="mb-3">Payment History</h6>

                                    {paymentLoading ? (
                                        <div className="text-center py-3">
                                            <div className="spinner-border spinner-border-sm text-primary" />
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-sm table-bordered">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Date</th>
                                                        <th>Amount</th>
                                                        <th>Method</th>
                                                        <th>Reference</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {payments.map(payment => (
                                                        <tr key={payment.salesPaymentId}>
                                                            <td>
                                                                {payment.paymentDate
                                                                    ? new Date(payment.paymentDate).toLocaleString("en-MY")
                                                                    : "-"}
                                                            </td>

                                                            <td>
                                                                {currency(payment.paymentAmount)}
                                                            </td>

                                                            <td>{payment.paymentMethod || "-"}</td>

                                                            <td>{payment.referenceNo || "-"}</td>
                                                            <td>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => printPaymentReceipt(payment)}
                                                                >
                                                                    <i className="bi bi-printer"></i> Receipt
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}

                                                    {payments.length === 0 && (
                                                        <tr>
                                                            <td colSpan="4" className="text-center text-muted">
                                                                No additional payments recorded.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                                {Number(selectedOrder.balanceAmount) > 0 &&
                                    selectedOrder.orderStatus !== "CANCELLED" && (
                                        <div className="card mt-4">
                                            <div className="card-body">
                                                <h6 className="mb-3">Record New Payment</h6>

                                                {paymentError && (
                                                    <div className="alert alert-danger">
                                                        {paymentError}
                                                    </div>
                                                )}

                                                {paymentSuccess && (
                                                    <div className="alert alert-success">
                                                        {paymentSuccess}
                                                    </div>
                                                )}

                                                <form onSubmit={handleRecordPayment}>
                                                    <div className="mb-3">
                                                        <label className="form-label">
                                                            Payment Amount (RM)
                                                        </label>

                                                        <input
                                                            type="number"
                                                            name="paymentAmount"
                                                            className="form-control"
                                                            min="0.01"
                                                            max={selectedOrder.balanceAmount}
                                                            step="0.01"
                                                            value={paymentForm.paymentAmount}
                                                            onChange={handlePaymentChange}
                                                            placeholder="Enter payment amount"
                                                            required
                                                        />

                                                        <small className="text-muted">
                                                            Remaining balance: {currency(selectedOrder.balanceAmount)}
                                                        </small>
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="form-label">
                                                            Payment Method
                                                        </label>

                                                        <select
                                                            name="paymentMethod"
                                                            className="form-select"
                                                            value={paymentForm.paymentMethod}
                                                            onChange={handlePaymentChange}
                                                        >
                                                            <option value="CASH">Cash</option>
                                                            <option value="BANK_TRANSFER">Bank Transfer</option>
                                                            <option value="E_WALLET">E-Wallet</option>
                                                            <option value="CARD">Card</option>
                                                        </select>
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="form-label">
                                                            Reference No
                                                        </label>

                                                        <input
                                                            type="text"
                                                            name="referenceNo"
                                                            className="form-control"
                                                            maxLength="50"
                                                            value={paymentForm.referenceNo}
                                                            onChange={handlePaymentChange}
                                                            placeholder="Optional"
                                                        />
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="form-label">
                                                            Notes
                                                        </label>

                                                        <textarea
                                                            name="notes"
                                                            className="form-control"
                                                            rows="2"
                                                            maxLength="255"
                                                            value={paymentForm.notes}
                                                            onChange={handlePaymentChange}
                                                            placeholder="Optional notes"
                                                        />
                                                    </div>

                                                    <button
                                                        type="submit"
                                                        className="btn btn-primary w-100"
                                                        disabled={paymentSaving}
                                                    >
                                                        {paymentSaving ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" />
                                                                Saving Payment...
                                                            </>
                                                        ) : (
                                                            "Record Payment"
                                                        )}
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    )}

                                {selectedOrder.notes && (
                                    <div className="mt-3">
                                        <small className="text-muted">Notes</small>
                                        <p>{selectedOrder.notes}</p>
                                    </div>
                                )}
                                <div className="sales-status-actions mt-4">
                                    <hr />

                                    <h6>Update Order Status</h6>

                                    {statusError && (
                                        <div className="alert alert-danger">
                                            {statusError}
                                        </div>
                                    )}

                                    {statusSuccess && (
                                        <div className="alert alert-success">
                                            {statusSuccess}
                                        </div>
                                    )}

                                    <div className="d-flex flex-wrap gap-2">
                                        {getAvailableStatusActions(selectedOrder).map(action => (
                                            <button
                                                key={action.status}
                                                type="button"
                                                className={`btn ${action.status === "CANCELLED"
                                                    ? "btn-outline-danger"
                                                    : "btn-primary"
                                                    }`}
                                                disabled={updatingStatus}
                                                onClick={() =>
                                                    handleUpdateStatus(selectedOrder, action.status)
                                                }
                                            >
                                                {updatingStatus ? "Updating..." : action.label}
                                            </button>
                                        ))}
                                    </div>

                                    {getAvailableStatusActions(selectedOrder).length === 0 && (
                                        <p className="text-muted mb-0">
                                            No further status updates available.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>

    );
};

export default SalesHistory;