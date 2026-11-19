package com.example.FoodStockManagement.dto.Dashboard;

public class DashboardSummary {
    private long totalEmployees;
    private long totalClients;
    private long activeEmployees;
    private long inactiveEmployees;
    private long activeClients;
    private long inactiveClients;
    private long totalVendors;
    private long activeVendors;
    private long inactiveVendors;

    public DashboardSummary() {
    }

    public DashboardSummary(long totalEmployees, long totalClients, long totalVendors) {
        this.totalEmployees = totalEmployees;
        this.totalClients = totalClients;
        this.totalVendors = totalVendors;
    }
    public DashboardSummary(
            long totalEmployees,
            long activeEmployees,
            long inactiveEmployees,
            long totalClients,
            long activeClients,
            long inactiveClients,
            long totalVendors,
            long activeVendors,
            long inactiveVendors) {

        this.totalEmployees = totalEmployees;
        this.activeEmployees = activeEmployees;
        this.inactiveEmployees = inactiveEmployees;
        this.totalClients = totalClients;
        this.activeClients = activeClients;
        this.inactiveClients = inactiveClients;
        this.totalVendors = totalVendors;
        this.activeVendors = activeVendors; 
        this.inactiveVendors = inactiveVendors;
    }
    public long getTotalEmployees() {
        return totalEmployees;
    }

    public long getActiveEmployees() {
        return activeEmployees;
    }

    public void setActiveEmployees(long activeEmployees) {
        this.activeEmployees = activeEmployees;
    }

    public long getInactiveEmployees() {
        return inactiveEmployees;
    }

    public void setInactiveEmployees(long inactiveEmployees) {
        this.inactiveEmployees = inactiveEmployees;
    }

    public void setTotalEmployees(long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public long getTotalClients() {
        return totalClients;
    }

    public void setTotalClients(long totalClients) {
        this.totalClients = totalClients;
    }
    public long getActiveClients() {
        return activeClients;
    }
    public void setActiveClients(long activeClients) {
        this.activeClients = activeClients;
    }
    public long getInactiveClients() {
        return inactiveClients;
    }
    public void setInactiveClients(long inactiveClients) {
        this.inactiveClients = inactiveClients;
    }
    public long getTotalVendors() {
        return totalVendors;
    }
    public void setTotalVendors(long totalVendors) {
        this.totalVendors = totalVendors;
    }
    public long getActiveVendors() {
        return activeVendors;
    }
    public void setActiveVendors(long activeVendors) {
        this.activeVendors = activeVendors;
    }
    public long getInactiveVendors() {
        return inactiveVendors;
    }
    public void setInactiveVendors(long inactiveVendors) {
        this.inactiveVendors = inactiveVendors;
    }
}
