
package com.example.FoodStockManagement.dto.Stock;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record StockBalanceResponse(
    Integer foodItemId,
    String foodName,
    String unit,
    Integer minimumStock,
    Integer totalQuantity,
    String stockStatus,
    List<BatchBalanceResponse> batches
) {
    public record BatchBalanceResponse(
        Integer stockBatchId,
        String batchNo,
        LocalDate receivedDate,
        LocalDate expiryDate,
        Integer quantityReceived,
        Integer quantityRemaining
    ) {

        public BatchBalanceResponse(Integer stockBatchId2, String batchNo2, LocalDateTime receivedDate2,
                        LocalDate expiryDate2, Integer quantityRemaining2) {
            this(
                stockBatchId2,
                batchNo2,
                receivedDate2 == null ? null : receivedDate2.toLocalDate(),
                expiryDate2,
                null,
                quantityRemaining2
            );
        }
    }
}



