
package com.example.FoodStockManagement.controller.Stock;

import com.example.FoodStockManagement.dto.Stock.StockOutRequest;
import com.example.FoodStockManagement.dto.Stock.StockOutResponse;
import com.example.FoodStockManagement.service.Stock.StockOutService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stock-out")
@CrossOrigin(origins = "*")
public class StockOutController {

    private final StockOutService stockOutService;

    public StockOutController(StockOutService stockOutService) {
        this.stockOutService = stockOutService;
    }

    @PostMapping
    public ResponseEntity<StockOutResponse> stockOut(
            @RequestBody StockOutRequest request) {

        StockOutResponse response =
            stockOutService.stockOut(request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
    }
}
