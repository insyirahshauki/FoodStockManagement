
import React from "react";

const Pagination = ({
    currentPage,
    totalPages,
    totalRecords,
    pageSize,
    onPageChange,
    onPageSizeChange
}) => {

    const startRecord =
        totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;

    const endRecord = Math.min(
        currentPage * pageSize,
        totalRecords
    );

    return (
        <div className="common-pagination">

            <div className="pagination-info">
                Showing {startRecord} to {endRecord} of {totalRecords} records
            </div>

            <div className="pagination-controls">

                <select
                    className="form-select form-select-sm page-size-select"
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                >
                    {[5, 10, 20, 50].map(size => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>

                <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    <i className="bi bi-chevron-left"></i>
                </button>

                <span className="px-2 small">
                    Page {currentPage} of {totalPages}
                </span>

                <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    <i className="bi bi-chevron-right"></i>
                </button>

            </div>

        </div>
    );
};

export default Pagination;
