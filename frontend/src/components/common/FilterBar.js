
import React from "react";

const FilterBar = ({
    children,
    onSearch,
    onReset,
    showSearch = true,
    showReset = true,
    actions
}) => {
    return (
        <div className="card filter-card mb-4">
            <div className="card-body">

                <div className="row g-3 align-items-end">
                    {children}
                </div>

                {(showSearch || showReset || actions) && (
                    <div className="d-flex justify-content-end gap-2 mt-3">

                        {showReset && (
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={onReset}
                            >
                                <i className="bi bi-arrow-counterclockwise me-1"></i>
                                Reset
                            </button>
                        )}

                        {showSearch && (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={onSearch}
                            >
                                <i className="bi bi-search me-1"></i>
                                Search
                            </button>
                        )}

                        {actions}

                    </div>
                )}

            </div>
        </div>
    );
};

export default FilterBar;
