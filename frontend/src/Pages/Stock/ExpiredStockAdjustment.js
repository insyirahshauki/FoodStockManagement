
import React, { useEffect, useMemo, useState } from "react";
import { StockService } from "../../Services/StockService";
import "./ExpiredStockAdjustment.css";

const ExpiredStockAdjustment = () => {
    const [batches, setBatches] = useState([]);
    const [selectedBatchId, setSelectedBatchId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null);
    const [refreshWarning, setRefreshWarning] = useState("");

    useEffect(() => {
        loadExpiredBatches();
    }, []);

    const loadExpiredBatches = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await StockService.getExpiryManagement();

            const expiredBatches = Array.isArray(response)
                ? response.filter(
                    batch =>
                        batch.expiryStatus === "EXPIRED" &&
                        batch.quantityRemaining > 0
                )
                : [];

            setBatches(expiredBatches);

            setSelectedBatchId(currentId => {
                const stillExists = expiredBatches.some(
                    batch => String(batch.stockBatchId) === String(currentId)
                );

                return stillExists ? currentId : "";
            });
        } catch (err) {
            setError(err.message || "Failed to load expired stock.");
        } finally {
            setLoading(false);
        }
    };

    const selectedBatch = useMemo(
        () => batches.find(
            batch => String(batch.stockBatchId) === String(selectedBatchId)
        ) || null,
        [batches, selectedBatchId]
    );

    const handleBatchChange = event => {
        setSelectedBatchId(event.target.value);
        setQuantity("");
        setSuccess(null);
        setError("");
    };

    const handleSubmit = async event => {
        event.preventDefault();

        setError("");
        setSuccess(null);
        setRefreshWarning("");

        if (!selectedBatch) {
            setError("Please select an expired stock batch.");
            return;
        }

        const adjustmentQuantity = Number(quantity);

        if (!Number.isInteger(adjustmentQuantity) ||
            adjustmentQuantity <= 0) {
            setError("Quantity must be a positive whole number.");
            return;
        }

        if (adjustmentQuantity > selectedBatch.quantityRemaining) {
            setError("Quantity cannot exceed the remaining stock.");
            return;
        }

        const confirmed = window.confirm(
            `Confirm adjustment of ${adjustmentQuantity} ${selectedBatch.unit} ` +
            `for batch ${selectedBatch.batchNo}?`
        );

        if (!confirmed) return;

        try {
            setSubmitting(true);

            const response = await StockService.adjustExpiredStock({
                stockBatchId: selectedBatch.stockBatchId,
                quantity: adjustmentQuantity,
                notes: notes.trim() || "Expired stock adjustment"
            });

            setSuccess(response);
            setQuantity("");
            setNotes("");

            // Refresh separately: a refresh failure must not hide
            // the fact that the adjustment was successfully saved.
            try {
                await loadExpiredBatches();
            } catch {
                setRefreshWarning(
                    "Adjustment was saved, but the batch list could not be refreshed."
                );
            }
        } catch (err) {
            setError(err.message || "Failed to adjust expired stock.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = date => {
        if (!date) return "-";

        return new Date(`${date}T00:00:00`).toLocaleDateString("en-MY", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="page-container">

            <div className="page-title">
                <h3>Expired Stock Adjustment</h3>
            </div>

            <div className="page-subtitle">
                <p>
                    Record the disposal of expired food stock.
                </p>
            </div>

            <div className="card">
                <div className="expired-adjustment-page">

                    <div className="expired-adjustment-header">
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={loadExpiredBatches}
                            disabled={loading || submitting}
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

                    {refreshWarning && (
                        <div className="alert alert-warning">
                            {refreshWarning}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            <h6 className="alert-heading">
                                Stock adjustment successful
                            </h6>

                            <p className="mb-1">
                                Batch: <strong>{success.batchNo}</strong>
                            </p>

                            <p className="mb-1">
                                Quantity adjusted:{" "}
                                <strong>{success.quantityAdjusted}</strong>
                            </p>

                            <p className="mb-0">
                                Remaining quantity:{" "}
                                <strong>{success.remainingQuantity}</strong>
                            </p>
                        </div>
                    )}

                    <div className="row g-3 mb-4">
                        <div className="col-md-4">
                            <div className="expired-adjustment-summary">
                                <span>Expired Batches with Stock</span>
                                <h4>{batches.length}</h4>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="expired-adjustment-summary">
                                <span>Total Expired Quantity</span>
                                <h4>
                                    {batches.reduce(
                                        (total, batch) =>
                                            total + (batch.quantityRemaining || 0),
                                        0
                                    )}
                                </h4>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="expired-adjustment-summary">
                                <span>Selected Batch</span>
                                <h4>{selectedBatch ? selectedBatch.batchNo : "-"}</h4>
                            </div>
                        </div>
                    </div>

                    <div className="expired-adjustment-card">
                        <div className="expired-adjustment-card-header">
                            <h5>New Stock Adjustment</h5>
                            <span className="badge bg-danger">Expired Stock Only</span>
                        </div>

                        {loading ? (
                            <div className="text-center p-5">
                                <div className="spinner-border text-primary"></div>
                                <p className="mt-2 text-muted">
                                    Loading expired batches...
                                </p>
                            </div>
                        ) : batches.length === 0 ? (
                            <div className="text-center p-5">
                                <i className="bi bi-check-circle text-success fs-1"></i>
                                <h6 className="mt-3">No expired stock available</h6>
                                <p className="text-muted mb-0">
                                    There are no expired batches with remaining quantity.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">

                                    <div className="col-md-12">
                                        <label className="form-label">
                                            Select Batch <span className="text-danger">*</span>
                                        </label>

                                        <select
                                            className="form-select"
                                            value={selectedBatchId}
                                            onChange={handleBatchChange}
                                            required
                                            disabled={submitting}
                                        >
                                            <option value="">Select expired batch</option>

                                            {batches.map(batch => (
                                                <option
                                                    key={batch.stockBatchId}
                                                    value={batch.stockBatchId}
                                                >
                                                    {batch.foodName} - {batch.batchNo}
                                                    {" | Remaining: "}
                                                    {batch.quantityRemaining}
                                                    {" | Expired: "}
                                                    {formatDate(batch.expiryDate)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedBatch && (
                                        <div className="col-md-12">
                                            <div className="selected-expired-batch">
                                                <div>
                                                    <span>Food Item</span>
                                                    <strong>{selectedBatch.foodName}</strong>
                                                </div>

                                                <div>
                                                    <span>Batch Number</span>
                                                    <strong>{selectedBatch.batchNo}</strong>
                                                </div>

                                                <div>
                                                    <span>Expiry Date</span>
                                                    <strong>
                                                        {formatDate(selectedBatch.expiryDate)}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Available Quantity</span>
                                                    <strong className="text-danger">
                                                        {selectedBatch.quantityRemaining}{" "}
                                                        {selectedBatch.unit}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Adjustment Quantity{" "}
                                            <span className="text-danger">*</span>
                                        </label>

                                        <input
                                            type="number"
                                            className="form-control"
                                            min="1"
                                            max={selectedBatch?.quantityRemaining || undefined}
                                            step="1"
                                            value={quantity}
                                            onChange={e => setQuantity(e.target.value)}
                                            placeholder="Enter quantity"
                                            required
                                            disabled={!selectedBatch || submitting}
                                        />

                                        {selectedBatch && (
                                            <small className="text-muted">
                                                Maximum: {selectedBatch.quantityRemaining}
                                                {" "}{selectedBatch.unit}
                                            </small>
                                        )}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Reason / Notes
                                        </label>

                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            placeholder="e.g. Expired stock - disposed"
                                            disabled={submitting}
                                        />
                                    </div>

                                    {selectedBatch && quantity &&
                                        Number.isInteger(Number(quantity)) &&
                                        Number(quantity) > 0 &&
                                        Number(quantity) <= selectedBatch.quantityRemaining && (
                                            <div className="col-md-12">
                                                <div className="adjustment-preview">
                                                    <div>
                                                        <span>Previous Quantity</span>
                                                        <strong>
                                                            {selectedBatch.quantityRemaining}
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <span>Adjustment</span>
                                                        <strong className="text-danger">
                                                            - {quantity}
                                                        </strong>
                                                    </div>

                                                    <div>
                                                        <span>Remaining Quantity</span>
                                                        <strong>
                                                            {selectedBatch.quantityRemaining -
                                                                Number(quantity)}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    <div className="col-md-12 d-flex justify-content-end">
                                        <button
                                            type="submit"
                                            className="btn btn-danger"
                                            disabled={!selectedBatch || submitting}
                                        >
                                            {submitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-trash3 me-2"></i>
                                                    Confirm Adjustment
                                                </>
                                            )}
                                        </button>
                                    </div>

                                </div>
                            </form>
                        )}
                    </div>

                    <div className="expired-adjustment-note">
                        <i className="bi bi-info-circle me-2"></i>
                        Every successful adjustment creates an
                        <strong> ADJUSTMENT_OUT </strong>
                        transaction record. Previous stock transactions are retained.
                    </div>

                </div>
            </div>

        </div>

    );
};

export default ExpiredStockAdjustment;
