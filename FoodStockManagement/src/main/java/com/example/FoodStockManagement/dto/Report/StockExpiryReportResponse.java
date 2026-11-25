package com.example.FoodStockManagement.dto.Report;

import java.time.LocalDate;

public record StockExpiryReportResponse(
        Integer stockBatchId,
        Integer foodItemId,
        //String code,
        String foodName,
        String unit,
        String batchNo,
        LocalDate expiryDate,
        Integer quantityRemaining,
        String expiryStatus,
        Long daysRemaining
) {}