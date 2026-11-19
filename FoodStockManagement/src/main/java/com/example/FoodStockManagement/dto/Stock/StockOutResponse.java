
package com.example.FoodStockManagement.dto.Stock;

import java.util.List;

public record StockOutResponse(
    Integer foodItemId,
    String foodName,
    Integer quantityRequested,
    Integer quantityIssued,
    String referenceNo,
    List<BatchAllocation> allocations
) {
    public record BatchAllocation(
        Integer stockBatchId,
        String batchNo,
        Integer quantityIssued,
        Integer remainingQuantity
    ) {}
}
