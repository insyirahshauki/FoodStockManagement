package com.example.FoodStockManagement.dto.SalesOrder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SalesPaymentResponse(
        Integer salesPaymentId,
        Integer salesOrderId,
        BigDecimal paymentAmount,
        LocalDateTime paymentDate,
        String paymentMethod,
        String referenceNo,
        String notes,
        String orderNo,
        String customerName,
        BigDecimal orderTotal,
        BigDecimal totalPaid,
        BigDecimal balanceAmount) {

    public SalesPaymentResponse(Integer salesPaymentId2, Integer salesOrderId2, String orderNo2, String customerName2,
            BigDecimal paymentAmount2, LocalDateTime paymentDate2, String paymentMethod2, String referenceNo2,
            String notes2, BigDecimal totalAmount, BigDecimal totalPaid2, BigDecimal balance) {
        this(salesPaymentId2, salesOrderId2, paymentAmount2, paymentDate2, paymentMethod2, referenceNo2, notes2,
                orderNo2, customerName2, totalAmount, totalPaid2, balance);
    }
}