package com.example.FoodStockManagement.controller.AI;

import com.example.FoodStockManagement.dto.AI.AIExpiryRiskDTO;
import com.example.FoodStockManagement.service.AI.AIExpiryRiskService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIExpiryRiskController {

    private final AIExpiryRiskService service;

    public AIExpiryRiskController(
            AIExpiryRiskService service) {
        this.service = service;
    }

    @GetMapping("/expiry-risk")
    public ResponseEntity<List<AIExpiryRiskDTO>> getExpiryRisks() {

        List<AIExpiryRiskDTO> risks =
                service.getExpiryRisks();

        return ResponseEntity.ok(risks);
    }
}