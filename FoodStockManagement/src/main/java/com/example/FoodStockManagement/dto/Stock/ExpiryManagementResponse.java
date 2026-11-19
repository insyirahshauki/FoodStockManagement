package com.example.FoodStockManagement.dto.Stock;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ExpiryManagementResponse(
    Integer stockBatchId,
    Integer foodItemId,
    String sku,
    String foodName,
    String unit,
    String batchNo,
    LocalDate receivedDate,
    LocalDate expiryDate,
    Integer quantityReceived,
    Integer quantityRemaining,
    Long daysUntilExpiry,
    String expiryStatus
) {

    public ExpiryManagementResponse(Integer stockBatchId2, Integer foodItemId2, String code, String foodName2,
            String unit2, String batchNo2, LocalDateTime receivedDate2, LocalDate expiryDate2,
            Integer quantityReceived2, Integer quantityRemaining2, Long daysUntilExpiry2, String status) {
        this(stockBatchId2, foodItemId2, code, foodName2, unit2, batchNo2,
                receivedDate2 == null ? null : receivedDate2.toLocalDate(), expiryDate2,
                quantityReceived2, quantityRemaining2, daysUntilExpiry2, status);
    }
}