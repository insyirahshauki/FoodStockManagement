package com.example.FoodStockManagement.controller.Stock;

import com.example.FoodStockManagement.dto.Stock.ExpiryManagementResponse;
import com.example.FoodStockManagement.service.Stock.ExpiryManagementService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expiry-management")
@CrossOrigin(origins = "*")
public class ExpiryManagementController {

    private final ExpiryManagementService expiryManagementService;

    public ExpiryManagementController(
            ExpiryManagementService expiryManagementService) {
        this.expiryManagementService = expiryManagementService;
    }

    @GetMapping
    public List<ExpiryManagementResponse> getExpiryManagement() {
        return expiryManagementService.getExpiryManagement();
    }
}