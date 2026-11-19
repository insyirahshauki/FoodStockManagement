package com.example.FoodStockManagement.dto.Stock;

public record ExpiredStockAdjustmentRequest(
    Integer stockBatchId,
    Integer quantity,
    String notes
) {}