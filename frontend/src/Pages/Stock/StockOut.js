
import React, { useEffect, useMemo, useState } from "react";
import { StockService } from "../../Services/StockService";
import "./StockOut.css";

const StockOut = () => {
    const [foodItems, setFoodItems] = useState([]);
    const [selectedFoodItem, setSelectedFoodItem] = useState(null);

    const [quantity, setQuantity] = useState("");
    const [referenceNo, setReferenceNo] = useState("");
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successResult, setSuccessResult] = useState(null);

    useEffect(() => {
        loadFoodItems();
    }, []);


    const loadFoodItems = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await StockService.getStockBalance();
            setFoodItems(Array.isArray(response) ? response : []);
        } catch (err) {
            setError(err.message || "Failed to load stock balance.");
        } finally {
            setLoading(false);
        }
    };


    const stockAvailable = useMemo(() => {
        if (!selectedFoodItem) return 0;
        return Number(selectedFoodItem.totalQuantity || 0);
    }, [selectedFoodItem]);

    const remainingAfterOut = useMemo(() => {
        if (!quantity || Number(quantity) <= 0) return stockAvailable;
        return Math.max(0, stockAvailable - Number(quantity));
    }, [quantity, stockAvailable]);

    const handleFoodItemChange = (e) => {
        const foodItemId = Number(e.target.value);

        const item = foodItems.find(
            food => food.foodItemId === foodItemId
        );

        setSelectedFoodItem(item || null);
        setQuantity("");
        setSuccessResult(null);
        setError("");
    };

    const resetForm = () => {
        setSelectedFoodItem(null);
        setQuantity("");
        setReferenceNo("");
        setNotes("");
        setSuccessResult(null);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccessResult(null);

        if (!selectedFoodItem) {
            setError("Please select a food item.");
            return;
        }

        const requestedQuantity = Number(quantity);

        if (!Number.isInteger(requestedQuantity) || requestedQuantity <= 0) {
            setError("Quantity must be a whole number greater than zero.");
            return;
        }

        if (requestedQuantity > stockAvailable) {
            setError(
                `Insufficient stock. Available quantity: ${stockAvailable} ${selectedFoodItem.unit}.`
            );
            return;
        }

        const confirmed = window.confirm(
            `Confirm Stock Out of ${requestedQuantity} ${selectedFoodItem.unit} of ${selectedFoodItem.foodName}? The system will allocate batches using FIFO.`
        );

        if (!confirmed) return;

        const payload = {
            foodItemId: selectedFoodItem.foodItemId,
            quantity: requestedQuantity,
            referenceNo: referenceNo.trim() || null,
            notes: notes.trim() || null,
        };

        try {
            setSaving(true);

            const response = await StockService.createStockOut(payload);

            setSuccessResult(response);

            // Refresh stock balance after successful Stock Out.
            const refreshedItems = await StockService.getStockBalance();

            setFoodItems(
                Array.isArray(refreshedItems) ? refreshedItems : []
            );

            const updatedItem = refreshedItems.find(
                item => item.foodItemId === selectedFoodItem.foodItemId
            );

            setSelectedFoodItem(updatedItem || null);

            setQuantity("");
            setReferenceNo("");
            setNotes("");

        } catch (err) {
            setError(err.message || "Failed to process Stock Out.");
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "-";

        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="page-container">

            <div className="page-title">
                <h3>Stock Out</h3>
            </div>

            <div className="page-subtitle">
                <p>Manage outgoing food stock</p>
            </div>

            <div className="card">
                <div className="stock-out-page">
                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}

                    {successResult && (
                        <div className="alert alert-success">
                            <h6 className="alert-heading">
                                <i className="bi bi-check-circle me-2"></i>
                                Stock Out recorded successfully!
                            </h6>

                            <p className="mb-2">
                                {successResult.foodName}:
                                {" "}
                                <strong>
                                    {successResult.quantityIssued} units issued
                                </strong>
                            </p>

                            <p className="mb-0">
                                Reference: {successResult.referenceNo || "-"}
                            </p>
                        </div>
                    )}

                    <div className="row g-4">

                        {/* Stock Out Form */}
                        <div className="col-lg-7">
                            <div className="card stock-out-card h-100">

                                <div className="card-header bg-white">
                                    <h5 className="mb-0">Stock Out Details</h5>
                                </div>

                                <div className="card-body">
                                    <form onSubmit={handleSubmit}>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Food Item <span className="text-danger">*</span>
                                            </label>

                                            <select
                                                className="form-select"
                                                value={selectedFoodItem?.foodItemId || ""}
                                                onChange={handleFoodItemChange}
                                                disabled={loading || saving}
                                                required
                                            >
                                                <option value="">Select food item</option>

                                                {foodItems.map(item => (
                                                    <option
                                                        key={item.foodItemId}
                                                        value={item.foodItemId}
                                                    >
                                                        {item.sku} - {item.foodName}
                                                    </option>
                                                ))}
                                            </select>

                                            {loading && (
                                                <small className="text-muted">
                                                    Loading food items...
                                                </small>
                                            )}
                                        </div>

                                        {selectedFoodItem && (
                                            <div className="stock-available-panel mb-3">
                                                <div>
                                                    <small>Available Stock</small>
                                                    <h3>
                                                        {stockAvailable}
                                                        {" "}
                                                        <span>{selectedFoodItem.unit}</span>
                                                    </h3>
                                                </div>

                                                <div className="stock-available-icon">
                                                    <i className="bi bi-box-seam"></i>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Quantity to Issue
                                                {" "}
                                                <span className="text-danger">*</span>
                                            </label>

                                            <input
                                                type="number"
                                                className="form-control"
                                                value={quantity}
                                                onChange={e => setQuantity(e.target.value)}
                                                min="1"
                                                max={stockAvailable}
                                                step="1"
                                                placeholder="Enter quantity"
                                                disabled={!selectedFoodItem || saving}
                                                required
                                            />

                                            {selectedFoodItem && (
                                                <small className="text-muted">
                                                    Maximum available: {stockAvailable} {selectedFoodItem.unit}
                                                </small>
                                            )}
                                        </div>

                                        {selectedFoodItem && Number(quantity) > 0 && (
                                            <div className="stock-out-preview mb-3">
                                                <div>
                                                    <span>Current Stock</span>
                                                    <strong>
                                                        {stockAvailable} {selectedFoodItem.unit}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Quantity to Issue</span>
                                                    <strong>
                                                        {Number(quantity)} {selectedFoodItem.unit}
                                                    </strong>
                                                </div>

                                                <hr />

                                                <div>
                                                    <span>Estimated Remaining Stock</span>
                                                    <strong className={
                                                        remainingAfterOut === 0
                                                            ? "text-danger"
                                                            : "text-success"
                                                    }>
                                                        {remainingAfterOut} {selectedFoodItem.unit}
                                                    </strong>
                                                </div>

                                                <small className="text-muted d-block mt-2">
                                                    Estimate only. Actual FIFO batch allocation is confirmed by the server.
                                                </small>
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Reference Number
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control"
                                                value={referenceNo}
                                                onChange={e => setReferenceNo(e.target.value)}
                                                maxLength="50"
                                                placeholder="e.g. SO-2026-001"
                                                disabled={saving}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Notes</label>

                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                maxLength="255"
                                                value={notes}
                                                onChange={e => setNotes(e.target.value)}
                                                placeholder="Reason for stock out..."
                                                disabled={saving}
                                            />
                                        </div>

                                        <div className="stock-out-info mb-3">
                                            <i className="bi bi-info-circle me-2"></i>
                                            Stock will be deducted from the earliest received
                                            batch first (FIFO). Expired batches are excluded.
                                        </div>

                                        <div className="d-flex justify-content-end gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={resetForm}
                                                disabled={saving}
                                            >
                                                Reset
                                            </button>

                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={
                                                    saving ||
                                                    loading ||
                                                    !selectedFoodItem ||
                                                    !quantity ||
                                                    Number(quantity) <= 0 ||
                                                    Number(quantity) > stockAvailable
                                                }
                                            >
                                                {saving ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="bi bi-box-arrow-up me-2"></i>
                                                        Submit Stock Out
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* FIFO Result */}
                        <div className="col-lg-5">
                            <div className="card stock-out-card h-100">

                                <div className="card-header bg-white">
                                    <h5 className="mb-0">FIFO Allocation Result</h5>
                                </div>

                                <div className="card-body">

                                    {successResult ? (
                                        <>
                                            <div className="fifo-result-summary mb-3">
                                                <small>Total Quantity Issued</small>
                                                <h3>
                                                    {successResult.quantityIssued}
                                                </h3>
                                            </div>

                                            <p className="text-muted small">
                                                The following batches were used in FIFO order.
                                            </p>

                                            <div className="table-responsive">
                                                <table className="table table-sm table-bordered align-middle">
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>Batch No.</th>
                                                            <th>Issued</th>
                                                            <th>Remaining</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {successResult.allocations?.map(
                                                            (batch, index) => (
                                                                <tr key={batch.stockBatchId}>
                                                                    <td>
                                                                        <div className="fw-semibold">
                                                                            {batch.batchNo}
                                                                        </div>
                                                                        <small className="text-muted">
                                                                            FIFO #{index + 1}
                                                                        </small>
                                                                    </td>
                                                                    <td>{batch.quantityIssued}</td>
                                                                    <td className="fw-semibold">
                                                                        {batch.remainingQuantity}
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="fifo-empty-state">
                                            <i className="bi bi-arrow-left-right"></i>
                                            <h6>No Stock Out Yet</h6>
                                            <p>
                                                Submit a Stock Out transaction to see
                                                the FIFO batch allocation here.
                                            </p>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </div>

    );
};

export default StockOut;
