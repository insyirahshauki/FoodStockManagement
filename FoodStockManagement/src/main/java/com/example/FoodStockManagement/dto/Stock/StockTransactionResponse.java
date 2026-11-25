package com.example.FoodStockManagement.dto.Stock;

import java.time.LocalDateTime;

public record StockTransactionResponse(
    Integer stockTransactionId,
    Integer stockBatchId,
    Integer foodItemId,
    String foodName,
    String unit,
    String batchNo,
    String transactionType,
    Integer quantity,
    String referenceNo,
    LocalDateTime transactionDate,
    String notes
) {}