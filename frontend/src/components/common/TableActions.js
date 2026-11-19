
import React from "react";

const TableActions = ({
    onView,
    onEdit,
    onDelete,
    onPrint,
    onPayment,
    onReceipt,
    viewLabel = "View"
}) => {

    return (
        <div className="table-actions">

          {onView && (
    <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        title={viewLabel}
        onClick={onView}
    >
        <i className="bi bi-eye me-1"></i>
        {viewLabel}
    </button>
)}

            {onEdit && (
                <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    title="Edit"
                    onClick={onEdit}
                >
                    <i className="bi bi-pencil"></i>
                </button>
            )}

            {onPayment && (
                <button
                    type="button"
                    className="btn btn-sm btn-outline-success"
                    title="Payment"
                    onClick={onPayment}
                >
                    <i className="bi bi-credit-card"></i>
                </button>
            )}

            {onPrint && (
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    title="Print"
                    onClick={onPrint}
                >
                    <i className="bi bi-printer"></i>
                </button>
            )}

            {onDelete && (
                <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    title="Delete"
                    onClick={onDelete}
                >
                    <i className="bi bi-trash"></i>
                </button>
            )}

        </div>
    );
};

export default TableActions;
