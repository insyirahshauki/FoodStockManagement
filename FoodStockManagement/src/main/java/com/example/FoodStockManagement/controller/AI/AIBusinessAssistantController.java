
package com.example.FoodStockManagement.controller.AI;

import com.example.FoodStockManagement.dto.AI.AIBusinessAssistantRequest;
import com.example.FoodStockManagement.dto.AI.AIBusinessAssistantResponse;
import com.example.FoodStockManagement.service.AI.AIBusinessAssistantService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIBusinessAssistantController {

    private final AIBusinessAssistantService service;

    public AIBusinessAssistantController(
            AIBusinessAssistantService service) {
        this.service = service;
    }

    @PostMapping("/business-assistant")
    public AIBusinessAssistantResponse askQuestion(
            @RequestBody AIBusinessAssistantRequest request) {

        return service.askQuestion(request);
    }
}
