package com.example.FoodStockManagement.dto.Report;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SalesReportResponse(
        Integer salesOrderId,
        String orderNo,
        String orderType,
        String customerName,
        LocalDateTime orderDate,
        LocalDateTime collectionDate,
        String orderStatus,
        String paymentStatus,
        BigDecimal totalAmount
) {}