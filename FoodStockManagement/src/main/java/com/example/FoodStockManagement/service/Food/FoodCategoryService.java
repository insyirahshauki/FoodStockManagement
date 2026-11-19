package com.example.FoodStockManagement.service.Food;

import com.example.FoodStockManagement.model.Food.FoodCategory;
import com.example.FoodStockManagement.repository.Food.FoodCategoryRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FoodCategoryService {

    private final FoodCategoryRepository repository;

    public FoodCategoryService(FoodCategoryRepository repository) {
        this.repository = repository;
    }

    public List<FoodCategory> getAllCategories() {
        return repository.findByIsActiveTrue();
    }

    public FoodCategory getCategoryById(Integer id) {
        return repository.findById(id)
                .filter(category -> Boolean.TRUE.equals(category.getIsActive()))
                .orElseThrow(() ->
                        new RuntimeException("Food category not found."));
    }

    public FoodCategory createCategory(FoodCategory category) {

        String name = category.getCategoryName().trim();

        if (name.isEmpty()) {
            throw new RuntimeException("Category name is required.");
        }

        if (repository.existsByCategoryNameIgnoreCase(name)) {
            throw new RuntimeException("Category name already exists.");
        }

        category.setCategoryName(name);
        category.setIsActive(true);

        return repository.save(category);
    }

    public FoodCategory updateCategory(Integer id, FoodCategory request) {

        FoodCategory existing = getCategoryById(id);

        String name = request.getCategoryName().trim();

        if (name.isEmpty()) {
            throw new RuntimeException("Category name is required.");
        }

        boolean duplicate = repository
                .existsByCategoryNameIgnoreCase(name);

        if (duplicate && !existing.getCategoryName().equalsIgnoreCase(name)) {
            throw new RuntimeException("Category name already exists.");
        }

        existing.setCategoryName(name);
        existing.setDescription(request.getDescription());

        return repository.save(existing);
    }

    @Transactional
    public void deleteCategory(Integer id) {

        FoodCategory category = getCategoryById(id);

        category.setIsActive(false);

        repository.save(category);
    }
}