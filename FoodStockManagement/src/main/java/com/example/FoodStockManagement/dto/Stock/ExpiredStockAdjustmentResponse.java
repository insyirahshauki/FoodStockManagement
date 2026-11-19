package com.example.FoodStockManagement.dto.Stock;

import java.time.LocalDateTime;

public record ExpiredStockAdjustmentResponse(
    Integer stockBatchId,
    String batchNo,
    String foodName,
    Integer quantityAdjusted,
    Integer previousQuantity,
    Integer remainingQuantity,
    String transactionType,
    LocalDateTime transactionDate
) {}