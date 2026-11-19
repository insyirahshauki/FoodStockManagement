package com.example.FoodStockManagement.dto.Stock;

import java.math.BigDecimal;
import java.time.LocalDate;

public record StockInRequest(
        Integer foodItemId,
        String batchNo,
        LocalDate receivedDate,
        LocalDate expiryDate,
        Integer quantityReceived,
        BigDecimal unitCost,
        String notes
) {}