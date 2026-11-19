package com.example.FoodStockManagement.dto.SalesOrder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record SalesOrderRequest(
    String orderType,
    String customerName,
    String customerPhone,
    LocalDateTime orderDate,
    LocalDateTime collectionDate,
    BigDecimal depositAmount,
    String notes,
    List<SalesOrderDetailRequest> items
) {
    public record SalesOrderDetailRequest(
        Integer foodItemId,
        Integer quantity
    ) {}
}