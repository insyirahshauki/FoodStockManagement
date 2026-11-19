package com.example.FoodStockManagement.controller.Stock;

import com.example.FoodStockManagement.dto.Stock.ExpiredStockAdjustmentRequest;
import com.example.FoodStockManagement.dto.Stock.ExpiredStockAdjustmentResponse;
import com.example.FoodStockManagement.service.Stock.ExpiredStockAdjustmentService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/expired-stock-adjustment")
@CrossOrigin(origins = "*")
public class ExpiredStockAdjustmentController {

    private final ExpiredStockAdjustmentService adjustmentService;

    public ExpiredStockAdjustmentController(
            ExpiredStockAdjustmentService adjustmentService) {
        this.adjustmentService = adjustmentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExpiredStockAdjustmentResponse adjustExpiredStock(
            @RequestBody ExpiredStockAdjustmentRequest request) {

        return adjustmentService.adjustExpiredStock(request);
    }
}