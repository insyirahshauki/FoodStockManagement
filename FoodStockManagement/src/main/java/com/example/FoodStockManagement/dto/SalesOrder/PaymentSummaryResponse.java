package com.example.FoodStockManagement.dto.SalesOrder;

import java.math.BigDecimal;

public record PaymentSummaryResponse(
    Integer salesOrderId,
    BigDecimal totalAmount,
    BigDecimal totalPaid,
    BigDecimal balanceAmount,
    String paymentStatus
) {}