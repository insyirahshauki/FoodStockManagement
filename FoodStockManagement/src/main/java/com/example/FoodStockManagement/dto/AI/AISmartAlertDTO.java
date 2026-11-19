package com.example.FoodStockManagement.dto.AI;

public record AISmartAlertDTO(
        String type,
        String severity,
        String title,
        String message,
        String foodName,
        Integer currentStock,
        Integer minimumStock,
        Integer daysUntilExpiry,
        Integer recommendedProduction
) {
}