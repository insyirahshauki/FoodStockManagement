
package com.example.FoodStockManagement.controller.Stock;

import com.example.FoodStockManagement.dto.Stock.StockBalanceResponse;
import com.example.FoodStockManagement.service.Stock.StockBalanceService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-balance")
@CrossOrigin(origins = "*")
public class StockBalanceController {

    private final StockBalanceService stockBalanceService;

    public StockBalanceController(
            StockBalanceService stockBalanceService) {
        this.stockBalanceService = stockBalanceService;
    }

    @GetMapping
    public ResponseEntity<List<StockBalanceResponse>> getStockBalance() {
        return ResponseEntity.ok(
            stockBalanceService.getStockBalance()
        );
    }
}
