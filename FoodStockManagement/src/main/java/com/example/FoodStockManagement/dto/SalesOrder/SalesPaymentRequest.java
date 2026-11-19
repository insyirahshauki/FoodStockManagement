package com.example.FoodStockManagement.dto.SalesOrder;

import java.math.BigDecimal;

public record SalesPaymentRequest(
    BigDecimal paymentAmount,
    String paymentMethod,
    String referenceNo,
    String notes
) {}