package com.example.FoodStockManagement.controller.Stock;

import com.example.FoodStockManagement.dto.Stock.StockInRequest;
import com.example.FoodStockManagement.dto.Stock.StockInResponse;
import com.example.FoodStockManagement.model.Stock.StockBatch;
import com.example.FoodStockManagement.service.Stock.StockInService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stock-in")
@CrossOrigin(origins = "*")
public class StockInController {

    private final StockInService service;

    public StockInController(StockInService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<StockInResponse> stockIn(
            @RequestBody StockInRequest request) {

        StockBatch batch = service.stockIn(request);

        StockInResponse response = new StockInResponse(
                batch.getStockBatchId(),
                batch.getFoodItem().getFoodItemId(),
                batch.getFoodItem().getFoodName(),
                batch.getBatchNo(),
                batch.getReceivedDate().toLocalDate(),
                batch.getExpiryDate(),
                batch.getQuantityReceived(),
                batch.getQuantityRemaining());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}