
import React, { useEffect, useState } from "react";
import { StockService } from "../../Services/StockService";
import "./StockIn.css";

const StockIn = () => {
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        foodItemId: "",
        batchNo: "",
        receivedDate: new Date().toISOString().slice(0, 10),
        expiryDate: "",
        quantityReceived: "",
        unitCost: "",
        notes: "",
    });

    useEffect(() => {
        loadFoodItems();
    }, []);

    const loadFoodItems = async () => {
        try {
            setLoading(true);
            const response = await StockService.getStockInItems();
            setFoodItems(response);
        } catch (err) {
            setError(err.message || "Failed to load food items.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setForm({
            foodItemId: "",
            batchNo: "",
            receivedDate: new Date().toISOString().slice(0, 10),
            expiryDate: "",
            quantityReceived: "",
            unitCost: "",
            notes: "",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!form.foodItemId) {
            setError("Please select a food item.");
            return;
        }

        if (!form.batchNo.trim()) {
            setError("Batch number is required.");
            return;
        }

        if (Number(form.quantityReceived) <= 0) {
            setError("Quantity must be greater than zero.");
            return;
        }

        if (Number(form.unitCost) < 0 || form.unitCost === "") {
            setError("Please enter a valid unit cost.");
            return;
        }

        if (
            form.expiryDate &&
            form.expiryDate < form.receivedDate
        ) {
            setError("Expiry date cannot be earlier than received date.");
            return;
        }

        const payload = {
            foodItemId: Number(form.foodItemId),
            batchNo: form.batchNo.trim(),
            receivedDate: form.receivedDate || null,
            expiryDate: form.expiryDate || null,
            quantityReceived: Number(form.quantityReceived),
            unitCost: Number(form.unitCost),
            notes: form.notes.trim(),
        };

        try {
            setSaving(true);

            await StockService.createStockIn(payload);

            setMessage("Stock In recorded successfully.");
            resetForm();
        } catch (err) {
            setError(err.message || "Failed to record Stock In.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-container">

            <div className="page-title">
                <h3>Stock In</h3>
            </div>

            <div className="page-subtitle">
                <p>Manage outgoing food stock</p>
            </div>

            <div className="card">
                <div className="stock-in-page">
                    {message && (
                        <div className="alert alert-success">{message}</div>
                    )}

                    {error && (
                        <div className="alert alert-danger">{error}</div>
                    )}

                    <div className="card shadow-sm">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Stock In Details</h5>
                        </div>

                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Food Item <span className="text-danger">*</span>
                                        </label>

                                        <select
                                            className="form-select"
                                            name="foodItemId"
                                            value={form.foodItemId}
                                            onChange={handleChange}
                                            disabled={loading}
                                            required
                                        >
                                            <option value="">Select food item</option>

                                            {foodItems.map((item) => (
                                                <option
                                                    key={item.foodItemId}
                                                    value={item.foodItemId}
                                                >
                                                     {item.foodName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Batch Number <span className="text-danger">*</span>
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            name="batchNo"
                                            value={form.batchNo}
                                            onChange={handleChange}
                                            maxLength="50"
                                            placeholder="e.g. LAS-2026-001"
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Received Date <span className="text-danger">*</span>
                                        </label>

                                        <input
                                            type="date"
                                            className="form-control"
                                            name="receivedDate"
                                            value={form.receivedDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Expiry Date
                                        </label>

                                        <input
                                            type="date"
                                            className="form-control"
                                            name="expiryDate"
                                            value={form.expiryDate}
                                            onChange={handleChange}
                                            min={form.receivedDate}
                                        />

                                        <small className="text-muted">
                                            Optional for food items without an expiry date.
                                        </small>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Quantity Received <span className="text-danger">*</span>
                                        </label>

                                        <input
                                            type="number"
                                            className="form-control"
                                            name="quantityReceived"
                                            value={form.quantityReceived}
                                            onChange={handleChange}
                                            min="1"
                                            step="1"
                                            placeholder="Enter quantity"
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Unit Cost (RM) <span className="text-danger">*</span>
                                        </label>

                                        <input
                                            type="number"
                                            className="form-control"
                                            name="unitCost"
                                            value={form.unitCost}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label">Notes</label>

                                        <textarea
                                            className="form-control"
                                            name="notes"
                                            value={form.notes}
                                            onChange={handleChange}
                                            rows="3"
                                            maxLength="255"
                                            placeholder="Additional information..."
                                        />
                                    </div>

                                </div>

                                <hr />

                                <div className="d-flex justify-content-end gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={resetForm}
                                    >
                                        Reset
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving || loading}
                                    >
                                        {saving ? "Saving..." : "Save Stock In"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

        </div>

    );
};

export default StockIn;
