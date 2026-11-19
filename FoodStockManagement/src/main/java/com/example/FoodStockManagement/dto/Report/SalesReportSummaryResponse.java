package com.example.FoodStockManagement.dto.Report;

import java.math.BigDecimal;

public record SalesReportSummaryResponse(
        Integer totalOrders,
        Integer completedOrders,
        BigDecimal totalSales,
        BigDecimal totalPaid,
        BigDecimal totalOutstanding
) {}