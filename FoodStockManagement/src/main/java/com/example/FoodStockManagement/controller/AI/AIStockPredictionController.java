
package com.example.FoodStockManagement.controller.AI;

import com.example.FoodStockManagement.dto.AI.AIStockPredictionDTO;
import com.example.FoodStockManagement.service.AI.AIStockPredictionService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIStockPredictionController {

    private final AIStockPredictionService service;

    public AIStockPredictionController(
            AIStockPredictionService service) {
        this.service = service;
    }

    @GetMapping("/stock-prediction")
    public ResponseEntity<List<AIStockPredictionDTO>>
            getStockPredictions() {

        List<AIStockPredictionDTO> predictions =
                service.getStockPredictions();

        return ResponseEntity.ok(predictions);
    }
}
