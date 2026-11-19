package com.example.FoodStockManagement.dto.SalesOrder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record SalesOrderResponse(
    Integer salesOrderId,
    String orderNo,
    String orderType,
    String customerName,
    String customerPhone,
    LocalDateTime orderDate,
    LocalDateTime collectionDate,
    String orderStatus,
    String paymentStatus,
    BigDecimal depositAmount,
    BigDecimal totalAmount,
    BigDecimal balanceAmount,
    String notes,
    LocalDateTime createdAt,
    List<SalesOrderDetailResponse> items
) {
    public record SalesOrderDetailResponse(
        Integer salesOrderDetailId,
        Integer foodItemId,
        String foodName,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
    ) {}
}