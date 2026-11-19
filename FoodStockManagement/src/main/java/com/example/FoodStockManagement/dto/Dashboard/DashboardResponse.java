package com.example.FoodStockManagement.dto.Dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record DashboardResponse(
    Summary summary,
    SalesSummary salesSummary,
    List<ExpiryAlert> expiryAlerts,
    List<RecentTransaction> recentTransactions,
    List<BestSellingProduct> bestSellingProducts
) {

    public record Summary(
        Long totalProducts,
        Long availableStock,
        Long lowStock,
        Long outOfStock,
        Long expiredBatches,
        Long expiringSoonBatches
    ) {}

    public record SalesSummary(
        BigDecimal totalSales,
        BigDecimal todaySales,
        BigDecimal monthlySales,
        BigDecimal preOrderSales,
        BigDecimal readyStockSales,
        Long totalOrders
    ) {}

    public record ExpiryAlert(
        Integer stockBatchId,
        String batchNo,
        Integer foodItemId,
        String foodName,
        Integer quantityRemaining,
        LocalDate expiryDate,
        String expiryStatus
    ) {}

    public record RecentTransaction(
        Integer stockTransactionId,
        String transactionType,
        String foodName,
        String batchNo,
        Integer quantity,
        String referenceNo,
        LocalDateTime transactionDate
    ) {}

    public record BestSellingProduct(
        Integer foodItemId,
        String foodName,
        Long totalQuantitySold,
        BigDecimal totalSales
    ) {}
}