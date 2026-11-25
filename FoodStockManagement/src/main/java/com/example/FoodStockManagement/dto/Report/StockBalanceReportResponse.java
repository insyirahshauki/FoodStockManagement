package com.example.FoodStockManagement.dto.Report;

public record StockBalanceReportResponse(
        Integer foodItemId,
        String foodName,
        String unit,
        Integer currentStock,
        Integer minimumStock,
        String status
) {}