package com.example.FoodStockManagement.repository.Food;

import com.example.FoodStockManagement.model.Food.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FoodItemRepository extends JpaRepository<FoodItem, Integer> {

    List<FoodItem> findByIsActiveTrue();

    boolean existsByCode(String code);
    Optional<FoodItem> findByFoodItemIdAndIsActiveTrue(Integer foodItemId);
    List<FoodItem> findByIsActiveTrueAndCategory_IsActiveTrue();
}