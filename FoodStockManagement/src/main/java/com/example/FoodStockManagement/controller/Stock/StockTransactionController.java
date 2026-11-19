package com.example.FoodStockManagement.controller.Stock;

import com.example.FoodStockManagement.dto.Stock.StockTransactionResponse;
import com.example.FoodStockManagement.service.Stock.StockTransactionService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-transactions")
@CrossOrigin(origins = "*")
public class StockTransactionController {

    private final StockTransactionService stockTransactionService;

    public StockTransactionController(
            StockTransactionService stockTransactionService) {
        this.stockTransactionService = stockTransactionService;
    }

    @GetMapping
    public List<StockTransactionResponse> getAllTransactions() {
        return stockTransactionService.getAllTransactions();
    }
}