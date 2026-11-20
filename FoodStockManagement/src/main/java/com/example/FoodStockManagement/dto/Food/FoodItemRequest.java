package com.example.FoodStockManagement.dto.Food;

import java.math.BigDecimal;

public record FoodItemRequest(
        Integer categoryId,
        String code,
        String foodName,
        String unit,
        Integer minimumStock,
        BigDecimal costPrice,
        BigDecimal sellingPrice,
        Boolean isActive,
        String imageUrl
) {}