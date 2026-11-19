package com.example.FoodStockManagement.repository.Food;

import com.example.FoodStockManagement.model.Food.FoodPrice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FoodPriceRepository
        extends JpaRepository<FoodPrice, Integer> {

    Optional<FoodPrice>
    findFirstByFoodItemFoodItemIdAndEffectiveToIsNullOrderByEffectiveFromDesc(
            Integer foodItemId
    );
}