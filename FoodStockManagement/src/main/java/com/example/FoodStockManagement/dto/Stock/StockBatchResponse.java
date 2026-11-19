package com.example.FoodStockManagement.dto.Stock;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.example.FoodStockManagement.model.Stock.StockBatch;

public record StockBatchResponse(
        Integer stockBatchId,
        String batchNo,
        Integer foodItemId,
        String foodName,
        Integer quantityReceived,
        Integer quantityRemaining,
        LocalDate expiryDate,
        BigDecimal unitCost
) {
    public static StockBatchResponse from(StockBatch batch) {
        return new StockBatchResponse(
                batch.getStockBatchId(),
                batch.getBatchNo(),
                batch.getFoodItem().getFoodItemId(),
                batch.getFoodItem().getFoodName(),
                batch.getQuantityReceived(),
                batch.getQuantityRemaining(),
                batch.getExpiryDate(),
                batch.getUnitCost()
        );
    }
}
