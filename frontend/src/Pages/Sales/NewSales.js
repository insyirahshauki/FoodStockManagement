import React, { useEffect, useMemo, useState } from "react";
import { SalesService } from "../../Services/SalesService";
import { FoodService } from "../../Services/FoodService";
import "./NewSales.css";

const currency = (amount) =>
    new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR"
    }).format(Number(amount || 0));

const NewSales = () => {
    const [foodItems, setFoodItems] = useState([]);
    const [orderType, setOrderType] = useState("READY_STOCK");
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [orderDate, setOrderDate] = useState("");
    const [collectionDate, setCollectionDate] = useState("");
    const [depositAmount, setDepositAmount] = useState("0");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState([
        { foodItemId: "", quantity: 1 }
    ]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadFoodItems();
    }, []);

    const loadFoodItems = async () => {
        try {
            setLoading(true);
            const response = await FoodService.getFoodItems();

            // Supports either a direct array or Spring Page response.
            const data = Array.isArray(response)
                ? response
                : response?.content || [];

            setFoodItems(data.filter(item => item.isActive !== false));
        } catch (err) {
            setError(err.message || "Failed to load food items.");
        } finally {
            setLoading(false);
        }
    };

    const getSelectedFood = (foodItemId) =>
        foodItems.find(
            item => String(item.foodItemId) === String(foodItemId)
        );

    const orderDetails = useMemo(() => {
    return items.map(item => {
        const food = foodItems.find(
            food => String(food.foodItemId) === String(item.foodItemId)
        );

        const quantity = Number(item.quantity || 0);
        const unitPrice = Number(food?.sellingPrice || 0);

        return {
            ...item,
            food,
            quantity,
            unitPrice,
            subtotal: quantity * unitPrice
        };
    });
}, [items, foodItems]);

    const totalAmount = orderDetails.reduce(
        (sum, item) => sum + item.subtotal, 0
    );

    const deposit = Number(depositAmount || 0);
    const balanceAmount = totalAmount - deposit;

    const paymentStatus =
        deposit === 0
            ? "UNPAID"
            : deposit === totalAmount
                ? "PAID"
                : "PARTIAL";

    const handleItemChange = (index, field, value) => {
        setItems(previous =>
            previous.map((item, i) =>
                i === index
                    ? { ...item, [field]: value }
                    : item
            )
        );
    };

    const addItem = () => {
        setItems(previous => [
            ...previous,
            { foodItemId: "", quantity: 1 }
        ]);
    };

    const removeItem = (index) => {
        setItems(previous => {
            if (previous.length === 1) return previous;
            return previous.filter((_, i) => i !== index);
        });
    };

    const resetForm = () => {
        setOrderType("READY_STOCK");
        setCustomerName("");
        setCustomerPhone("");
        setCollectionDate("");
        setOrderDate("");
        setDepositAmount("0");
        setNotes("");
        setItems([{ foodItemId: "", quantity: 1 }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!customerName.trim()) {
            setError("Please enter customer name.");
            return;
        }

        if (items.some(item => !item.foodItemId)) {
            setError("Please select a food item for every row.");
            return;
        }

        const selectedIds = items.map(item => item.foodItemId);

        if (new Set(selectedIds).size !== selectedIds.length) {
            setError("Duplicate food items are not allowed. Please combine their quantities.");
            return;
        }

        if (items.some(item => Number(item.quantity) <= 0)) {
            setError("Quantity must be greater than zero.");
            return;
        }

        if (deposit < 0 || deposit > totalAmount) {
            setError("Deposit cannot be negative or greater than total amount.");
            return;
        }

        if (items.some(item => {
            const food = getSelectedFood(item.foodItemId);
            return !food || Number(food.sellingPrice) <= 0;
        })) {
            setError("A selected product has no valid selling price.");
            return;
        }

        const request = {
            orderType,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            collectionDate: collectionDate || null,
            orderDate: orderDate || null,
            depositAmount: deposit,
            notes: notes.trim(),
            items: items.map(item => ({
                foodItemId: Number(item.foodItemId),
                quantity: Number(item.quantity)
            }))
        };

        try {
            setSaving(true);

            const response =
                await SalesService.createSalesOrder(request);

            setSuccess(
                `Sales order ${response.orderNo} created successfully.`
            );

            resetForm();

        } catch (err) {
            setError(err.message || "Failed to create sales order.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-container">

            <div className="page-title">
                <h3>New Sales</h3>
            </div>

            <div className="page-subtitle">
                <p>
                    Create a new customer order
                </p>
            </div>

            <div className="card">
                <div className="new-sales-page">
                    {error && (
                        <div className="alert alert-danger alert-dismissible">
                            {error}
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setError("")}
                            />
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success alert-dismissible">
                            {success}
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setSuccess("")}
                            />
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Order Information */}
                        <div className="card mb-4">
                            <div className="card-header bg-white">
                                <h5 className="mb-0">Order Information</h5>
                            </div>

                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Order Type <span className="text-danger">*</span>
                                        </label>

                                        <select
                                            className="form-select"
                                            value={orderType}
                                            onChange={e => setOrderType(e.target.value)}
                                        >
                                            <option value="READY_STOCK">
                                                Ready Stock
                                            </option>
                                            <option value="PRE_ORDER">
                                                Pre-Order
                                            </option>
                                        </select>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Customer Name <span className="text-danger">*</span>
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            value={customerName}
                                            onChange={e => setCustomerName(e.target.value)}
                                            placeholder="Enter customer name"
                                            maxLength={150}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Customer Phone
                                        </label>

                                        <input
                                            type="tel"
                                            className="form-control"
                                            value={customerPhone}
                                            onChange={e => setCustomerPhone(e.target.value)}
                                            placeholder="e.g. 0123456789"
                                            maxLength={30}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Order Date
                                        </label>

                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            value={orderDate}
                                            onChange={e => setOrderDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Collection Date
                                        </label>

                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            value={collectionDate}
                                            onChange={e => setCollectionDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="col-md-8">
                                        <label className="form-label">
                                            Notes
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            placeholder="Optional notes"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="card mb-4">
                            <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Order Items</h5>

                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={addItem}
                                    disabled={loading}
                                >
                                    <i className="bi bi-plus-lg me-1" />
                                    Add Item
                                </button>
                            </div>

                            <div className="card-body">
                                {loading ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" />
                                        <p className="mt-2 text-muted">
                                            Loading food items...
                                        </p>
                                    </div>
                                ) : foodItems.length === 0 ? (
                                    <div className="alert alert-warning mb-0">
                                        No active food items found. Please add food items first.
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table align-middle">
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: "220px" }}>
                                                        Food Item
                                                    </th>
                                                    <th>Unit Price</th>
                                                    <th style={{ width: "120px" }}>
                                                        Quantity
                                                    </th>
                                                    <th>Subtotal</th>
                                                    <th style={{ width: "60px" }} />
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {orderDetails.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <select
                                                                className="form-select"
                                                                value={item.foodItemId}
                                                                onChange={e =>
                                                                    handleItemChange(
                                                                        index,
                                                                        "foodItemId",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                required
                                                            >
                                                                <option value="">
                                                                    Select food item
                                                                </option>

                                                                {foodItems.map(food => (
                                                                    <option
                                                                        key={food.foodItemId}
                                                                        value={food.foodItemId}
                                                                    >
                                                                        {food.code} - {food.foodName}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>

                                                        <td>
                                                            {item.food
                                                                ? currency(item.unitPrice)
                                                                : "-"}
                                                        </td>

                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                min="1"
                                                                step="1"
                                                                value={item.quantity}
                                                                onChange={e =>
                                                                    handleItemChange(
                                                                        index,
                                                                        "quantity",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                required
                                                            />
                                                        </td>

                                                        <td className="fw-semibold">
                                                            {currency(item.subtotal)}
                                                        </td>

                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() => removeItem(index)}
                                                                disabled={items.length === 1}
                                                                title="Remove item"
                                                            >
                                                                <i className="bi bi-trash" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="row justify-content-end">
                            <div className="col-lg-5">
                                <div className="card mb-4">
                                    <div className="card-header bg-white">
                                        <h5 className="mb-0">Payment Summary</h5>
                                    </div>

                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-3">
                                            <span>Total Amount</span>
                                            <strong>{currency(totalAmount)}</strong>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                Deposit Amount (RM)
                                            </label>

                                            <input
                                                type="number"
                                                className="form-control"
                                                min="0"
                                                max={totalAmount}
                                                step="0.01"
                                                value={depositAmount}
                                                onChange={e => setDepositAmount(e.target.value)}
                                            />
                                        </div>

                                        <div className="d-flex justify-content-between mb-3">
                                            <span>Balance</span>
                                            <strong className={balanceAmount < 0 ? "text-danger" : ""}>
                                                {currency(balanceAmount)}
                                            </strong>
                                        </div>

                                        <div className="d-flex justify-content-between">
                                            <span>Payment Status</span>
                                            <span className={`badge ${paymentStatus === "PAID"
                                                ? "bg-success"
                                                : paymentStatus === "PARTIAL"
                                                    ? "bg-warning text-dark"
                                                    : "bg-secondary"
                                                }`}>
                                                {paymentStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="d-flex justify-content-end gap-2 mb-4">
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
                                disabled={saving || loading || foodItems.length === 0}
                            >
                                {saving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-save me-1" />
                                        Create Sales Order
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        </div>

    );
};

export default NewSales;