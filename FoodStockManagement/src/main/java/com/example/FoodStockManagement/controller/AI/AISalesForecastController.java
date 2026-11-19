package com.example.FoodStockManagement.controller.AI;

import com.example.FoodStockManagement.dto.AI.AISalesForecastDTO;
import com.example.FoodStockManagement.service.AI.AISalesForecastService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AISalesForecastController {

    private final AISalesForecastService service;

    public AISalesForecastController(
            AISalesForecastService service) {
        this.service = service;
    }

    @GetMapping("/sales-forecast")
    public ResponseEntity<List<AISalesForecastDTO>> getSalesForecasts() {

        List<AISalesForecastDTO> forecasts =
                service.getSalesForecasts();

        return ResponseEntity.ok(forecasts);
    }
}