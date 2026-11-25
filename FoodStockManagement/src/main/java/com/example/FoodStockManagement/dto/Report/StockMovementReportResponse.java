package com.example.FoodStockManagement.dto.Report;

import java.time.LocalDateTime;

public record StockMovementReportResponse(
        Integer stockTransactionId,
        LocalDateTime transactionDate,
        String transactionType,
       // String code,
        String foodName,
        String unit,
        String batchNo,
        Integer quantity,
        String referenceNo,
        String notes
) {}