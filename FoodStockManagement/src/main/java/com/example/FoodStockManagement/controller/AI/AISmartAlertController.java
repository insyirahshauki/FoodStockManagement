
package com.example.FoodStockManagement.controller.AI;

import com.example.FoodStockManagement.dto.AI.AISmartAlertDTO;
import com.example.FoodStockManagement.service.AI.AISmartAlertService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AISmartAlertController {

    private final AISmartAlertService service;

    public AISmartAlertController(AISmartAlertService service) {
        this.service = service;
    }

    @GetMapping("/smart-alerts")
    public List<AISmartAlertDTO> getSmartAlerts() {
        return service.getSmartAlerts();
    }
}
