package com.example.FoodStockManagement.repository.Food;

import com.example.FoodStockManagement.model.Food.FoodCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodCategoryRepository
        extends JpaRepository<FoodCategory, Integer> {

    List<FoodCategory> findByIsActiveTrue();

    boolean existsByCategoryNameIgnoreCase(String categoryName);
}