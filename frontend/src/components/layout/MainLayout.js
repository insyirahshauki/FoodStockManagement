import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./SideBar";
import TopNavbar from "./TopNavbar";
import "./MainLayout.css";

const MainLayout = () => {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="app-layout">

            <div className={`sidebar-wrapper ${sidebarOpen ? "show" : ""}`}>
                <Sidebar closeSidebar={closeSidebar} />
            </div>

            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeSidebar}
                />
            )}

            <div className="main-wrapper">
                <TopNavbar toggleSidebar={toggleSidebar} />

                <main className="main-content">
                    <Outlet />
                </main>
            </div>

        </div>
    );
};

export default MainLayout;