
import React, { useEffect, useState } from "react";
import Pagination from "./Pagination";

const DataTable = ({
      columns = [],
    data = [],
    loading = false,
    emptyMessage = "No data available.",
    rowKey = "id",
    showPagination = true,
    defaultPageSize = 10,
    className = ""
}) => {

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    const totalRecords = data.length;
    const totalPages = Math.ceil(totalRecords / pageSize);

    useEffect(() => {
        setCurrentPage(1);
    }, [data]);

    useEffect(() => {
        setCurrentPage(1);
    }, [pageSize]);

    const paginatedData = showPagination
        ? data.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
        )
        : data;

    const renderCell = (column, row, index) => {
        if (column.render) {
            return column.render(
                row,
                (currentPage - 1) * pageSize + index
            );
        }

        if (column.key === "rowNumber") {
            return (currentPage - 1) * pageSize + index + 1;
        }

        return row[column.key] ?? "-";
    };

    return (
        <div className="datatable-container">

            <div className="table-responsive">
                <table className={`table common-data-table table-hover align-middle ${className}`}>

                    <thead className="table-light">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={column.className || ""}
                                    style={{
                                        width: column.width,
                                        textAlign: column.align || "left"
                                    }}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>

                        {loading ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="text-center py-5"
                                >
                                    <div className="spinner-border spinner-border-sm me-2" />
                                    Loading...
                                </td>
                            </tr>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((row, index) => (
                                <tr key={row[rowKey] ?? index}>
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className={column.cellClassName || ""}
                                            style={{
                                                textAlign: column.align || "left"
                                            }}
                                        >
                                            {renderCell(column, row, index)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="text-center text-muted py-5"
                                >
                                    <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}

                    </tbody>

                </table>
            </div>

            {!loading && showPagination && totalRecords > 0 && (
                <Pagination
                    currentPage={Math.min(currentPage, totalPages)}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                />
            )}

        </div>
    );
};

export default DataTable;
