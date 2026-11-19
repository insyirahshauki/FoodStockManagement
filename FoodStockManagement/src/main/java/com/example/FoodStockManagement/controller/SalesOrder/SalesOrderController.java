package com.example.FoodStockManagement.controller.SalesOrder;

import com.example.FoodStockManagement.dto.SalesOrder.SalesOrderRequest;
import com.example.FoodStockManagement.dto.SalesOrder.SalesOrderResponse;
import com.example.FoodStockManagement.dto.SalesOrder.SalesOrderStatusRequest;
import com.example.FoodStockManagement.service.SalesOrder.SalesOrderService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sales-orders")
@CrossOrigin(origins = "*")
public class SalesOrderController {

    private final SalesOrderService salesOrderService;

    public SalesOrderController(SalesOrderService salesOrderService) {
        this.salesOrderService = salesOrderService;
    }

    @PostMapping
    public ResponseEntity<?> createSalesOrder(
            @RequestBody SalesOrderRequest request) {

        try {
            SalesOrderResponse response = salesOrderService.createSalesOrder(request);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<SalesOrderResponse>> getAllSalesOrders() {

        return ResponseEntity.ok(
                salesOrderService.getAllSalesOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSalesOrderById(
            @PathVariable Integer id) {

        try {
            return ResponseEntity.ok(
                    salesOrderService.getSalesOrderById(id));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ex.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Integer id,
            @RequestBody SalesOrderStatusRequest request) {

        try {
            SalesOrderResponse response = salesOrderService.updateOrderStatus(
                    id,
                    request.orderStatus());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        }
    }
}