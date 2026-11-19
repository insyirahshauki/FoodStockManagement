import React from "react";
import { NavLink } from "react-router-dom";

const SideBar = ({ closeSidebar }) => {

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
        },
          {
            title: "AI",
            icon: "bi-stars",
            submenu: [
                { title: "AI Stock Prediction", path: "/ai-stock-prediction"},
                { title: "AI Sales Forecasting", path: "/ai-sales-forecast" },
                { title: "AI Expiry Risk Analysis", path: "/ai-expiry-risk" },
                { title: "AI Production Planning", path: "/ai-production-planning" }
            ]
        },
 {
    title: "AI Business Assistant",
    path: "/ai-business-assistant",
    icon: "bi-robot"
},
 {
    title: "Smart Alerts",
    path: "/smart-alerts",
    icon: "bi-robot"
},

    ];

    return (
        <div className="sidebar">
            <div className="sidebar-brand">
                <i className="bi bi-box-seam me-2"></i>
                <span>Food Stock</span>
            </div>

            <div className="sidebar-menu">
                {menuItems.map((item, index) => (
                    <div key={index}>
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
                                <div className="sidebar-heading">
                                    <i className={`bi ${item.icon}`}></i>
                                    <span>{item.title}</span>
                                </div>

                                {item.submenu.map((sub, subIndex) => (
                                    <NavLink
                                        key={subIndex}
                                        to={sub.path}
                                        onClick={closeSidebar}
                                        className={({ isActive }) =>
                                            `sidebar-sublink ${isActive ? "active" : ""}`
                                        }
                                    >
                                        {sub.title}
                                    </NavLink>
                                ))}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SideBar;