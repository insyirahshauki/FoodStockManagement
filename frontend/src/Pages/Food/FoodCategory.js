import React, { useEffect, useState } from "react";
import { FoodService } from "../../Services/FoodService";
import "./FoodCategory.css";
import DataTable from "../../components/common/DataTable";
import TableActions from "../../components/common/TableActions";
import CommonButton from "../../components/common/CommonButton";
function FoodCategory() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    const [selectedId, setSelectedId] = useState(null);

    const [formData, setFormData] = useState({
        categoryName: "",
        description: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadCategories();
    }, []);

    // Load categories
    const loadCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await FoodService.getFoodCategories();

            setCategories(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error(err);
            setError("Unable to load food categories.");
        } finally {
            setLoading(false);
        }
    };

    // Open Add Modal
    const handleAdd = () => {
        setIsEdit(false);
        setSelectedId(null);

        setFormData({
            categoryName: "",
            description: ""
        });

        setError("");
        setShowModal(true);
    };

    // Open Edit Modal
    const handleEdit = (category) => {
        setIsEdit(true);
        setSelectedId(category.categoryId);

        setFormData({
            categoryName: category.categoryName || "",
            description: category.description || ""
        });

        setError("");
        setShowModal(true);
    };

    // Form input
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Save category
    const handleSubmit = async (e) => {
        e.preventDefault();

        const categoryName = formData.categoryName.trim();

        if (!categoryName) {
            setError("Category name is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const data = {
                categoryName: categoryName,
                description: formData.description.trim()
            };

            if (isEdit) {
                await FoodService.updateFoodCategory(
                    selectedId,
                    data
                );

                setSuccess("Category updated successfully.");
            } else {
                await FoodService.createFoodCategory(data);

                setSuccess("Category added successfully.");
            }

            setShowModal(false);
            await loadCategories();

        } catch (err) {
            console.error(err);
            setError(err.message || "Unable to save category.");
        } finally {
            setSaving(false);
        }
    };

    // Delete category
    const handleDelete = async (category) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${category.categoryName}"?`
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            await FoodService.deleteFoodCategory(
                category.categoryId
            );

            setSuccess("Category deleted successfully.");

            await loadCategories();

        } catch (err) {
            console.error(err);
            setError(err.message || "Unable to delete category.");
        }
    };

    // Search
    const filteredCategories = categories.filter(category =>
        category.categoryName
            ?.toLowerCase()
            .includes(search.toLowerCase())
    );

    const columns = [
        {
            key: "rowNumber",
            label: "No.",
            width: "80px"
        },
        {
            key: "categoryName",
            label: "Category Name",
            render: (row) => (
                <span className="fw-semibold">
                    {row.categoryName}
                </span>
            )
        },
        {
            key: "description",
            label: "Description",
            render: (row) => row.description || "-"
        },
        {
            key: "actions",
            label: "Action",
            align: "center",
            width: "150px",
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
                <h3 className="fw-bold mb-1">Food Categories</h3>
            </div>

            <div className="page-subtitle">
                <p>
                    Manage your food categories
                </p>
            </div>

            <div className="card">
                <div className="container-fluid p-4">

                    {/* Page Header */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                        <CommonButton
                            icon="bi bi-plus-lg"
                            onClick={handleAdd}
                        >
                            Add Category
                        </CommonButton>

                    </div>

                    {/* Alert Messages */}
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

                    {/* Category Table */}
                    <div className="card border-0 shadow-sm">

                        <div className="card-header bg-white py-3">
                            <div className="row align-items-center g-3">

                                <div className="col-md-6">
                                    <h5 className="fw-bold mb-0">
                                        Category List
                                    </h5>
                                </div>

                                <div className="col-md-6">
                                    <div className="input-group">
                                        <span className="input-group-text bg-white">
                                            <i className="bi bi-search"></i>
                                        </span>

                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search category..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="card-body">

                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary"></div>
                                    <p className="text-muted mt-2">
                                        Loading categories...
                                    </p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <DataTable
                                        columns={columns}
                                        data={filteredCategories}
                                        loading={loading}
                                        rowKey="categoryId"
                                        defaultPageSize={10}
                                        emptyMessage="No categories found."
                                    />

                                </div>
                            )}

                            <div className="text-muted small mt-2">
                                Total categories: {filteredCategories.length}
                            </div>

                        </div>
                    </div>

                    {/* Add / Edit Modal */}
                    {showModal && (
                        <div
                            className="category-modal-backdrop"
                            onClick={() => setShowModal(false)}
                        >
                            <div
                                className="category-modal"
                                onClick={(e) => e.stopPropagation()}
                            >

                                <div className="d-flex justify-content-between align-items-center border-bottom p-3">
                                    <h5 className="fw-bold mb-0">
                                        {isEdit ? "Edit Category" : "Add Category"}
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

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Category Name
                                                <span className="text-danger"> *</span>
                                            </label>

                                            <input
                                                type="text"
                                                className="form-control"
                                                name="categoryName"
                                                value={formData.categoryName}
                                                onChange={handleChange}
                                                placeholder="Enter category name"
                                                maxLength="100"
                                                required
                                                autoFocus
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Description
                                            </label>

                                            <textarea
                                                className="form-control"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Enter description"
                                                rows="3"
                                                maxLength="255"
                                            />
                                        </div>

                                    </div>

                                    <div className="d-flex justify-content-end gap-2 border-top p-3">

                                        <CommonButton
                                            variant="outline-secondary"
                                            icon="bi bi-x-lg"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Cancel
                                        </CommonButton>

                                        <CommonButton
                                            type="submit"
                                            icon="bi bi-check-lg"
                                            loading={saving}
                                        >
                                            Save
                                        </CommonButton>
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

export default FoodCategory;