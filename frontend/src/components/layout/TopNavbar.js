import React from "react";

const TopNavbar = ({ toggleSidebar }) => {
    return (
        <nav className="top-navbar">
            <div className="d-flex align-items-center gap-3">
                <button
                    className="btn btn-light sidebar-toggle"
                    onClick={toggleSidebar}
                    aria-label="Toggle navigation"
                >
                    <i className="bi bi-list fs-4"></i>
                </button>

                <span className="navbar-title">
                    Food Stock Management System
                </span>
            </div>

            <div className="dropdown">
                <button
                    className="btn btn-light dropdown-toggle"
                    data-bs-toggle="dropdown"
                >
                    <i className="bi bi-person-circle me-2"></i>
                    Admin
                </button>

                <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                        <button className="dropdown-item">
                            <i className="bi bi-person me-2"></i>
                            Profile
                        </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                        <button className="dropdown-item text-danger">
                            <i className="bi bi-box-arrow-right me-2"></i>
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default TopNavbar;