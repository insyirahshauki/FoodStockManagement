package com.example.FoodStockManagement.controller.Food;

import com.example.FoodStockManagement.model.Food.FoodCategory;
import com.example.FoodStockManagement.service.Food.FoodCategoryService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food-categories")
@CrossOrigin(origins = "*")
public class FoodCategoryController {

    private final FoodCategoryService service;

    public FoodCategoryController(FoodCategoryService service) {
        this.service = service;
    }

    // GET: Get all active categories
    @GetMapping
    public ResponseEntity<List<FoodCategory>> getAllCategories() {
        return ResponseEntity.ok(service.getAllCategories());
    }

    // GET: Get category by ID
    @GetMapping("/{id}")
    public ResponseEntity<FoodCategory> getCategoryById(
            @PathVariable Integer id) {

        return ResponseEntity.ok(service.getCategoryById(id));
    }

    // POST: Create category
    @PostMapping
    public ResponseEntity<FoodCategory> createCategory(
            @RequestBody FoodCategory category) {

        FoodCategory result = service.createCategory(category);

        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    // PUT: Update category
    @PutMapping("/{id}")
    public ResponseEntity<FoodCategory> updateCategory(
            @PathVariable Integer id,
            @RequestBody FoodCategory category) {

        return ResponseEntity.ok(service.updateCategory(id, category));
    }

    // DELETE: Soft delete category
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Integer id) {

        service.deleteCategory(id);

        return ResponseEntity.noContent().build();
    }
}