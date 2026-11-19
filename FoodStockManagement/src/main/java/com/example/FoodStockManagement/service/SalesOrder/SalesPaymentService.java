package com.example.FoodStockManagement.service.SalesOrder;

import com.example.FoodStockManagement.dto.SalesOrder.PaymentSummaryResponse;
import com.example.FoodStockManagement.dto.SalesOrder.SalesPaymentRequest;
import com.example.FoodStockManagement.dto.SalesOrder.SalesPaymentResponse;
import com.example.FoodStockManagement.model.SalesOrder.SalesOrder;
import com.example.FoodStockManagement.model.SalesOrder.SalesPayment;
import com.example.FoodStockManagement.repository.SalesOrder.SalesOrderRepository;
import com.example.FoodStockManagement.repository.SalesOrder.SalesPaymentRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SalesPaymentService {

    private final SalesOrderRepository salesOrderRepository;
    private final SalesPaymentRepository salesPaymentRepository;

    public SalesPaymentService(
            SalesOrderRepository salesOrderRepository,
            SalesPaymentRepository salesPaymentRepository) {

        this.salesOrderRepository = salesOrderRepository;
        this.salesPaymentRepository = salesPaymentRepository;
    }

    @Transactional
    public PaymentSummaryResponse recordPayment(
            Integer salesOrderId,
            SalesPaymentRequest request) {

        // Lock the order while processing payment
        SalesOrder order = salesOrderRepository
                .findByIdForUpdate(salesOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Sales order not found."));

        if ("CANCELLED".equalsIgnoreCase(order.getOrderStatus())) {
            throw new IllegalArgumentException(
                    "Cannot record payment for a cancelled order.");
        }

        if (request.paymentAmount() == null ||
                request.paymentAmount().compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Payment amount must be greater than zero.");
        }

        if (request.paymentAmount().scale() > 2) {
            throw new IllegalArgumentException(
                    "Payment amount can only have 2 decimal places.");
        }

        BigDecimal totalAmount = order.getTotalAmount() == null
                ? BigDecimal.ZERO
                : order.getTotalAmount();

        BigDecimal depositAmount = order.getDepositAmount() == null
                ? BigDecimal.ZERO
                : order.getDepositAmount();

        // Additional payments already recorded
        BigDecimal additionalPayments = salesPaymentRepository.sumPaymentAmountBySalesOrderId(
                salesOrderId);

        if (additionalPayments == null) {
            additionalPayments = BigDecimal.ZERO;
        }

        // Deposit is stored separately in SalesOrder
        BigDecimal totalPaid = depositAmount.add(additionalPayments);

        BigDecimal balance = totalAmount.subtract(totalPaid);

        if (balance.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "This order has already been fully paid.");
        }

        if (request.paymentAmount().compareTo(balance) > 0) {
            throw new IllegalArgumentException(
                    "Payment exceeds the remaining balance. Remaining balance: RM "
                            + balance);
        }

        // Create payment record
        SalesPayment payment = new SalesPayment();

        payment.setSalesOrder(order);
        payment.setPaymentAmount(request.paymentAmount());
        payment.setPaymentDate(LocalDateTime.now());
        payment.setPaymentMethod(request.paymentMethod());
        payment.setReferenceNo(request.referenceNo());
        payment.setNotes(request.notes());

        salesPaymentRepository.save(payment);

        // Update payment status
        BigDecimal newTotalPaid = totalPaid.add(request.paymentAmount());

        String paymentStatus;

        if (newTotalPaid.compareTo(BigDecimal.ZERO) == 0) {
            paymentStatus = "UNPAID";
        } else if (newTotalPaid.compareTo(totalAmount) < 0) {
            paymentStatus = "PARTIAL";
        } else {
            paymentStatus = "PAID";
        }

        order.setPaymentStatus(paymentStatus);
        salesOrderRepository.save(order);

        BigDecimal newBalance = totalAmount.subtract(newTotalPaid);

        return new PaymentSummaryResponse(
                order.getSalesOrderId(),
                totalAmount,
                newTotalPaid,
                newBalance,
                paymentStatus);
    }

    @Transactional(readOnly = true)
    public List<SalesPaymentResponse> getPaymentHistory(
            Integer salesOrderId) {

        if (!salesOrderRepository.existsById(salesOrderId)) {
            throw new IllegalArgumentException("Sales order not found.");
        }

        return salesPaymentRepository
                .findBySalesOrderSalesOrderIdOrderByPaymentDateDesc(
                        salesOrderId)
                .stream()
                .map(payment -> {
                    SalesOrder order = payment.getSalesOrder();

                    BigDecimal deposit = order.getDepositAmount() == null
                            ? BigDecimal.ZERO
                            : order.getDepositAmount();

                    BigDecimal additionalPayments = salesPaymentRepository.sumPaymentAmountBySalesOrderId(
                            order.getSalesOrderId());

                    if (additionalPayments == null) {
                        additionalPayments = BigDecimal.ZERO;
                    }

                    BigDecimal totalPaid = deposit.add(additionalPayments);

                    BigDecimal balance = order.getTotalAmount()
                            .subtract(totalPaid);

                    return new SalesPaymentResponse(
                            payment.getSalesPaymentId(),
                            order.getSalesOrderId(),
                            order.getOrderNo(),
                            order.getCustomerName(),
                            payment.getPaymentAmount(),
                            payment.getPaymentDate(),
                            payment.getPaymentMethod(),
                            payment.getReferenceNo(),
                            payment.getNotes(),
                            order.getTotalAmount(),
                            totalPaid,
                            balance);
                })
                .toList();
    }
}