package com.example.FoodStockManagement.controller.SalesOrder;

import com.example.FoodStockManagement.dto.SalesOrder.PaymentSummaryResponse;
import com.example.FoodStockManagement.dto.SalesOrder.SalesPaymentRequest;
import com.example.FoodStockManagement.dto.SalesOrder.SalesPaymentResponse;
import com.example.FoodStockManagement.service.SalesOrder.SalesPaymentService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sales-orders/{salesOrderId}/payments")
@CrossOrigin(origins = "*")
public class SalesPaymentController {

    private final SalesPaymentService salesPaymentService;

    public SalesPaymentController(
            SalesPaymentService salesPaymentService) {
        this.salesPaymentService = salesPaymentService;
    }

    // Record a payment
    @PostMapping
    public ResponseEntity<?> recordPayment(
            @PathVariable Integer salesOrderId,
            @RequestBody SalesPaymentRequest request) {

        try {
            PaymentSummaryResponse response =
                    salesPaymentService.recordPayment(
                            salesOrderId, request);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // Get payment history
    @GetMapping
    public ResponseEntity<?> getPaymentHistory(
            @PathVariable Integer salesOrderId) {

        try {
            List<SalesPaymentResponse> response =
                    salesPaymentService.getPaymentHistory(salesOrderId);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}