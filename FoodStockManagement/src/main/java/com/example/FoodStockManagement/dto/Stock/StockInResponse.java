package com.example.FoodStockManagement.dto.Stock;

import java.time.LocalDate;

public record StockInResponse(
    Integer stockBatchId,
    Integer foodItemId,
    String foodName,
    String batchNo,
    LocalDate receivedDate,
    LocalDate expiryDate,
    Integer quantityReceived,
    Integer quantityRemaining
) {}