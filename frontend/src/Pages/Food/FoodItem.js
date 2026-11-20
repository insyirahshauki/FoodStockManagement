import React, { useEffect, useState } from "react";
import { FoodService } from "../../Services/FoodService";
import "./FoodItem.css";
import DataTable from "../../components/common/DataTable";
import TableActions from "../../components/common/TableActions";
const initialForm = {
    categoryId: "",
    code: "",
    foodName: "",
    unit: "",
    minimumStock: 0,
    costPrice: "",
    sellingPrice: ""
};

function FoodItem() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [formData, setFormData] = useState(initialForm);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadPageData();
    }, []);

    const loadPageData = async () => {
        try {
            setLoading(true);
            setError("");

            const [itemResponse, categoryResponse] = await Promise.all([
                FoodService.getFoodItems(),
                FoodService.getFoodCategories()
            ]);

            setItems(Array.isArray(itemResponse) ? itemResponse : []);
            setCategories(
                Array.isArray(categoryResponse) ? categoryResponse : []
            );
        } catch (err) {
            console.error(err);
            setError("Unable to load food items or categories.");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setIsEdit(false);
        setSelectedId(null);
        setFormData(initialForm);
        setError("");
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setIsEdit(true);
        setSelectedId(item.foodItemId);

        setFormData({
            categoryId: String(item.categoryId || ""),
            code: item.code || "",
            foodName: item.foodName || "",
            unit: item.unit || "",
            minimumStock: item.minimumStock ?? 0,
            costPrice: item.costPrice ?? "",
            sellingPrice: item.sellingPrice ?? ""
        });

        setError("");
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.categoryId) {
            setError("Please select a category.");
            return;
        }

        if (!formData.code.trim() || !formData.foodName.trim()) {
            setError("Code and food name are required.");
            return;
        }

        if (!formData.unit.trim()) {
            setError("Unit is required.");
            return;
        }

        if (
            formData.minimumStock === "" ||
            Number(formData.minimumStock) < 0 ||
            !Number.isInteger(Number(formData.minimumStock))
        ) {
            setError("Minimum stock must be a whole number of zero or greater.");
            return;
        }

        const costPrice = Number(formData.costPrice);
        const sellingPrice = Number(formData.sellingPrice);

        if (
            formData.costPrice === "" ||
            formData.sellingPrice === "" ||
            !Number.isFinite(costPrice) ||
            !Number.isFinite(sellingPrice) ||
            costPrice < 0 ||
            sellingPrice < 0 ||
            !/^\d+(\.\d{1,2})?$/.test(formData.costPrice) ||
            !/^\d+(\.\d{1,2})?$/.test(formData.sellingPrice)
        ) {
            setError("Please enter valid prices with up to 2 decimal places.");
            return;
        }

        const requestData = {
            categoryId: Number(formData.categoryId),
            code: formData.code.trim(),
            foodName: formData.foodName.trim(),
            unit: formData.unit.trim(),
            minimumStock: Number(formData.minimumStock),
            costPrice: costPrice,
            sellingPrice: sellingPrice
        };

        try {
            setSaving(true);
            setError("");

            if (isEdit) {
                await FoodService.updateFoodItem(
                    selectedId,
                    requestData
                );

                setSuccess("Food item updated successfully.");
            } else {
                await FoodService.createFoodItem(requestData);

                setSuccess("Food item added successfully.");
            }

            setShowModal(false);
            await loadPageData();

        } catch (err) {
            console.error(err);
            setError(err.message || "Unable to save food item.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate "${item.foodName}"?`
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            await FoodService.deleteFoodItem(item.foodItemId);

            setSuccess("Food item deactivated successfully.");
            await loadPageData();

        } catch (err) {
            console.error(err);
            setError(err.message || "Unable to delete food item.");
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-MY", {
            style: "currency",
            currency: "MYR"
        }).format(amount || 0);
    };

    const filteredItems = items.filter(item => {
        const keyword = search.toLowerCase();

        const matchesSearch =
            item.foodName?.toLowerCase().includes(keyword) ||
            item.code?.toLowerCase().includes(keyword);

        const matchesCategory =
            !categoryFilter ||
            String(item.categoryId) === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    const columns = [
        {
            key: "rowNumber",
            label: "No.",
            width: "60px"
        },
        {
            key: "code",
            label: "Code",
            render: (row) => (
                <span className="fw-semibold">
                    {row.code}
                </span>
            )
        },
        {
            key: "foodName",
            label: "Food Name"
        },
        {
            key: "categoryName",
            label: "Category",
            render: (row) => row.categoryName || "-"
        },
        {
            key: "unit",
            label: "Unit"
        },
        {
            key: "costPrice",
            label: "Cost Price",
            align: "right",
            render: (row) => formatCurrency(row.costPrice)
        },
        {
            key: "sellingPrice",
            label: "Selling Price",
            align: "right",
            render: (row) => (
                <span className="fw-semibold">
                    {formatCurrency(row.sellingPrice)}
                </span>
            )
        },
        {
            key: "minimumStock",
            label: "Min. Stock",
            align: "center"
        },
        {
            key: "actions",
            label: "Action",
            align: "center",
            width: "120px",
            render: (row) => (
                <TableActions
                    onEdit={() => handleEdit(row)}
                    onDelete={() => handleDelete(row)}
                />
            )
        }
    ];

    return (
        <div className="page-container">

            <div className="page-title">
                <h3>Food Items</h3>
            </div>

            <div className="page-subtitle">
                <p>
                    Manage your food products and selling prices
                </p>
            </div>

            <div className="card">
                <div className="container-fluid p-4">

                    {/* Page Header */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                        <button
                            className="btn btn-primary"
                            onClick={handleAdd}
                            disabled={categories.length === 0}
                        >
                            <i className="bi bi-plus-lg me-2"></i>
                            Add Food Item
                        </button>
                    </div>

                    {success && (
                        <div className="alert alert-success alert-dismissible fade show">
                            {success}
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setSuccess("")}
                            />
                        </div>
                    )}

                    {error && !showModal && (
                        <div className="alert alert-danger alert-dismissible fade show">
                            {error}
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setError("")}
                            />
                        </div>
                    )}

                    {categories.length === 0 && !loading && (
                        <div className="alert alert-warning">
                            No active food categories found. Please create a food
                            category before adding a food item.
                        </div>
                    )}

                    {/* Food Item Table */}
                    <div className="card border-0 shadow-sm">

                        <div className="card-header bg-white py-3">
                            <div className="row g-3 align-items-center">

                                <div className="col-lg-4">
                                    <h5 className="fw-bold mb-0">
                                        Food Item List
                                    </h5>
                                </div>

                                <div className="col-lg-4">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search Code or food name..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>

                                <div className="col-lg-4">
                                    <select
                                        className="form-select"
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                    >
                                        <option value="">All Categories</option>

                                        {categories.map(category => (
                                            <option
                                                key={category.categoryId}
                                                value={category.categoryId}
                                            >
                                                {category.categoryName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                            </div>
                        </div>

                        <div className="card-body">

                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary"></div>
                                    <p className="text-muted mt-2">
                                        Loading food items...
                                    </p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                  
                                        <DataTable
                                            columns={columns}
                                            data={filteredItems}
                                            loading={loading}
                                            rowKey="foodItemId"
                                            defaultPageSize={10}
                                            emptyMessage="No food items found."
                                        />

                                </div>
                            )}

                            <div className="text-muted small mt-2">
                                Total food items: {filteredItems.length}
                            </div>

                        </div>
                    </div>

                    {/* Add / Edit Modal */}
                    {showModal && (
                        <div
                            className="food-item-modal-backdrop"
                            onClick={() => !saving && setShowModal(false)}
                        >
                            <div
                                className="food-item-modal"
                                onClick={(e) => e.stopPropagation()}
                            >

                                <div className="d-flex justify-content-between align-items-center border-bottom p-3">
                                    <h5 className="fw-bold mb-0">
                                        {isEdit ? "Edit Food Item" : "Add Food Item"}
                                    </h5>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                        disabled={saving}
                                    />
                                </div>

                                <form onSubmit={handleSubmit}>

                                    <div className="p-4">

                                        {error && (
                                            <div className="alert alert-danger">
                                                {error}
                                            </div>
                                        )}

                                        <div className="row g-3">

                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">
                                                    Category <span className="text-danger">*</span>
                                                </label>

                                                <select
                                                    className="form-select"
                                                    name="categoryId"
                                                    value={formData.categoryId}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">Select Category</option>

                                                    {categories.map(category => (
                                                        <option
                                                            key={category.categoryId}
                                                            value={category.categoryId}
                                                        >
                                                            {category.categoryName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">
                                                    Code <span className="text-danger">*</span>
                                                </label>

                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="code"
                                                    value={formData.code}
                                                    onChange={handleChange}
                                                    placeholder="e.g. FOOD001"
                                                    maxLength="50"
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-12">
                                                <label className="form-label fw-semibold">
                                                    Food Name <span className="text-danger">*</span>
                                                </label>

                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="foodName"
                                                    value={formData.foodName}
                                                    onChange={handleChange}
                                                    placeholder="Enter food name"
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">
                                                    Unit <span className="text-danger">*</span>
                                                </label>

                                                <select
                                                    className="form-select"
                                                    name="unit"
                                                    value={formData.unit}
                                                    onChange={handleChange}
                                                    required
                                                >
                                                    <option value="">Select Unit</option>
                                                    <option value="Pcs">Pcs</option>
                                                    <option value="Small">Small</option>
                                                    <option value="Big">Big</option>
                                                    {/* <option value="Box">Box</option>
                                                    <option value="Slice">Slice</option>
                                                    <option value="Bottle">Bottle</option>
                                                    <option value="Set">Set</option> */}
                                                </select>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">
                                                    Minimum Stock
                                                </label>

                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="minimumStock"
                                                    value={formData.minimumStock}
                                                    onChange={handleChange}
                                                    min="0"
                                                    step="1"
                                                    required
                                                />
                                            </div>

                                            <div className="col-12">
                                                <hr />
                                                <h6 className="fw-bold">
                                                    Product Pricing
                                                </h6>
                                                <p className="text-muted small">
                                                    All prices are in Malaysian Ringgit (MYR).
                                                </p>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">
                                                    Cost Price (RM) <span className="text-danger">*</span>
                                                </label>

                                                <div className="input-group">
                                                    <span className="input-group-text">RM</span>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="costPrice"
                                                        value={formData.costPrice}
                                                        onChange={handleChange}
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">
                                                    Selling Price (RM) <span className="text-danger">*</span>
                                                </label>

                                                <div className="input-group">
                                                    <span className="input-group-text">RM</span>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="sellingPrice"
                                                        value={formData.sellingPrice}
                                                        onChange={handleChange}
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-end gap-2 border-top p-3">

                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setShowModal(false)}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check-lg me-2"></i>
                                                    Save
                                                </>
                                            )}
                                        </button>

                                    </div>

                                </form>
                            </div>
                        </div>
                    )}

                </div>
            </div>

        </div>

    );
}

export default FoodItem;