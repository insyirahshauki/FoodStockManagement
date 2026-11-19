
package com.example.FoodStockManagement.dto.Stock;

public record StockOutRequest(
    Integer foodItemId,
    Integer quantity,
    String referenceNo,
    String notes
) {}
