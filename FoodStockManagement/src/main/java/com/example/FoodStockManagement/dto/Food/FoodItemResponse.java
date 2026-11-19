package com.example.FoodStockManagement.dto.Food;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FoodItemResponse(
        Integer foodItemId,
        Integer categoryId,
        String categoryName,
        String code,
        String foodName,
        String unit,
        Integer minimumStock,
        BigDecimal costPrice,
        BigDecimal sellingPrice,
        Boolean isActive,
        LocalDateTime createdAt
) {}