
import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const SideBar = ({ closeSidebar }) => {

    // Submenu states
    const [expandedMenus, setExpandedMenus] = useState({
        "Food Management": true,
        "Stock Management": true,
        "Sales Management": true,
        "Reports": true
    });

    // Toggle submenu
    const toggleSubmenu = (title) => {
        setExpandedMenus(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const menuItems = [
        {
            title: "Dashboard",
            path: "/",
            icon: "bi-speedometer2"
        },
        {
            title: "Food Management",
            icon: "bi-basket",
            submenu: [
                { title: "Food Categories", path: "/categories" },
                { title: "Food Items", path: "/food-items" }
            ]
        },
        {
            title: "Stock Management",
            icon: "bi-box-seam",
            submenu: [
                { title: "Stock In", path: "/stock-in" },
                { title: "Stock Out", path: "/stock-out" },
                { title: "Stock Balance", path: "/stock-balance" },
                { title: "Expiry Management", path: "/expiry" },
                { title: "Expired Stock Adjustment", path: "/expired-stock-adjustment" },
                { title: "Stock Transaction History", path: "/transaction-history" }
            ]
        },
        {
            title: "Sales Management",
            icon: "bi-cart",
            submenu: [
                { title: "New Sales", path: "/sales" },
                { title: "Sales History", path: "/sales-history" }
            ]
        },
        {
            title: "Transactions",
            path: "/stock-transactions",
            icon: "bi-arrow-left-right"
        },
        {
            title: "Reports",
            icon: "bi-file-earmark-bar-graph",
            submenu: [
                { title: "Stock Balance Report", path: "/reports/stock-balance" },
                { title: "Stock Movement Report", path: "/reports/stock-movement" },
                { title: "Stock Expiry Report", path: "/reports/stock-expiry" },
                { title: "Sales Report", path: "/reports/sales" }
            ]
        }
    ];

    return (
        <div className="sidebar">

            {/* Sidebar Brand */}
            <div className="sidebar-brand">
                <i className="bi bi-box-seam me-2"></i>
                <span>Food Stock</span>
            </div>

            {/* Sidebar Menu */}
            <div className="sidebar-menu">

                {menuItems.map((item) => (

                    <div className="sidebar-group" key={item.title}>

                        {/* Single Navigation Link */}
                        {item.path ? (

                            <NavLink
                                to={item.path}
                                end={item.path === "/"}
                                onClick={closeSidebar}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? "active" : ""}`
                                }
                            >
                                <i className={`bi ${item.icon}`}></i>
                                <span>{item.title}</span>
                            </NavLink>

                        ) : (

                            <>
                                {/* Parent Menu */}
                                <button
                                    type="button"
                                    className="sidebar-heading"
                                    onClick={() => toggleSubmenu(item.title)}
                                    aria-expanded={!!expandedMenus[item.title]}
                                >
                                    <i className={`bi ${item.icon}`}></i>

                                    <span>{item.title}</span>

                                    <i className={`bi bi-chevron-down submenu-arrow ${
                                        expandedMenus[item.title] ? "rotated" : ""
                                    }`}></i>
                                </button>

                                {/* Animated Submenu */}
                                <div className={`submenu-container ${
                                    expandedMenus[item.title] ? "expanded" : ""
                                }`}>
                                    <div className="submenu-inner">

                                        {item.submenu.map((sub) => (

                                            <NavLink
                                                key={sub.path}
                                                to={sub.path}
                                                onClick={closeSidebar}
                                                className={({ isActive }) =>
                                                    `sidebar-sublink ${isActive ? "active" : ""}`
                                                }
                                            >
                                                {sub.title}
                                            </NavLink>

                                        ))}

                                    </div>
                                </div>
                            </>

                        )}

                    </div>

                ))}

            </div>
        </div>
    );
};

export default SideBar;
