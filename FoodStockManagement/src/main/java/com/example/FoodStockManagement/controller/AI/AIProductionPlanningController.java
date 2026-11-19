package com.example.FoodStockManagement.controller.AI;

import com.example.FoodStockManagement.dto.AI.AIProductionPlanningDTO;
import com.example.FoodStockManagement.service.AI.AIProductionPlanningService;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIProductionPlanningController {

    private final AIProductionPlanningService service;

    public AIProductionPlanningController(
            AIProductionPlanningService service) {
        this.service = service;
    }

    @GetMapping("/production-planning")
    public List<AIProductionPlanningDTO> getProductionPlans() {

        return service.getProductionPlans();
    }
}