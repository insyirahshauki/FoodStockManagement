package com.example.FoodStockManagement.service.Food;

import com.example.FoodStockManagement.dto.Food.FoodItemRequest;
import com.example.FoodStockManagement.dto.Food.FoodItemResponse;
import com.example.FoodStockManagement.model.Food.*;
import com.example.FoodStockManagement.repository.Food.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.example.FoodStockManagement.service.CloudinaryService;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

@Service
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;
    private final FoodCategoryRepository categoryRepository;
    private final FoodPriceRepository priceRepository;
    private final CloudinaryService cloudinaryService;

    public FoodItemService(
            FoodItemRepository foodItemRepository,
            FoodCategoryRepository categoryRepository,
            FoodPriceRepository priceRepository,
            CloudinaryService cloudinaryService) {

        this.foodItemRepository = foodItemRepository;
        this.categoryRepository = categoryRepository;
        this.priceRepository = priceRepository;
        this.cloudinaryService = cloudinaryService;
    }

    @Transactional(readOnly = true)
    public List<FoodItemResponse> getAllFoodItems() {

        return foodItemRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public FoodItemResponse getFoodItemById(Integer id) {

        FoodItem item = getActiveFoodItem(id);

        return mapToResponse(item);
    }

    @Transactional
    public FoodItemResponse createFoodItem(FoodItemRequest request) {

        validateRequest(request);

        String code = request.code().trim();

        if (foodItemRepository.existsByCode(code)) {
            throw new IllegalArgumentException("Code already exists.");
        }

        FoodCategory category = getActiveCategory(request.categoryId());

        FoodItem item = new FoodItem();

        item.setCategory(category);
        item.setCode(code);
        item.setFoodName(request.foodName().trim());
        item.setUnit(request.unit().trim());
        item.setMinimumStock(request.minimumStock());
        item.setIsActive(true);
        item.setImageUrl(request.imageUrl());

        FoodItem savedItem = foodItemRepository.save(item);

        saveNewPrice(
                savedItem,
                request.costPrice(),
                request.sellingPrice());

        return mapToResponse(savedItem);
    }

    @Transactional
    public FoodItemResponse updateFoodItem(
            Integer id,
            FoodItemRequest request) {

        validateRequest(request);

        FoodItem existing = getActiveFoodItem(id);

        String code = request.code().trim();

        if (!existing.getCode().equalsIgnoreCase(code)
                && foodItemRepository.existsByCode(code)) {
            throw new IllegalArgumentException("Code already exists.");
        }

        FoodCategory category = getActiveCategory(request.categoryId());

        existing.setCategory(category);
        existing.setCode(code);
        existing.setFoodName(request.foodName().trim());
        existing.setUnit(request.unit().trim());
        existing.setMinimumStock(request.minimumStock());
        existing.setIsActive(request.isActive());
        if (request.imageUrl() != null) {
            existing.setImageUrl(request.imageUrl());
        }
        FoodItem savedItem = foodItemRepository.save(existing);

        updatePriceIfChanged(
                savedItem,
                request.costPrice(),
                request.sellingPrice());

        return mapToResponse(savedItem);
    }

    @Transactional
    public void deleteFoodItem(Integer id) {

        FoodItem item = getActiveFoodItem(id);

        item.setIsActive(false);

        foodItemRepository.save(item);
    }

    private FoodItem getActiveFoodItem(Integer id) {

        return foodItemRepository.findById(id)
                .filter(item -> Boolean.TRUE.equals(item.getIsActive()))
                .orElseThrow(() -> new IllegalArgumentException("Food item not found."));
    }

    private FoodCategory getActiveCategory(Integer id) {

        if (id == null) {
            throw new IllegalArgumentException("Category is required.");
        }

        return categoryRepository.findById(id)
                .filter(category -> Boolean.TRUE.equals(category.getIsActive()))
                .orElseThrow(() -> new IllegalArgumentException(
                        "Active food category not found."));
    }

    private void validateRequest(FoodItemRequest request) {

        if (request == null) {
            throw new IllegalArgumentException("Request is required.");
        }

        if (request.code() == null || request.code().isBlank()) {
            throw new IllegalArgumentException("Code is required.");
        }

        if (request.foodName() == null || request.foodName().isBlank()) {
            throw new IllegalArgumentException("Food name is required.");
        }

        if (request.unit() == null || request.unit().isBlank()) {
            throw new IllegalArgumentException("Unit is required.");
        }

        if (request.minimumStock() == null || request.minimumStock() < 0) {
            throw new IllegalArgumentException(
                    "Minimum stock must be zero or greater.");
        }

        validatePrice(request.costPrice(), "Cost price");
        validatePrice(request.sellingPrice(), "Selling price");
    }

    private void validatePrice(BigDecimal price, String fieldName) {

        if (price == null || price.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    fieldName + " must be zero or greater.");
        }

        if (price.scale() > 2) {
            throw new IllegalArgumentException(
                    fieldName + " supports up to 2 decimal places.");
        }
    }

    private void saveNewPrice(
            FoodItem item,
            BigDecimal costPrice,
            BigDecimal sellingPrice) {

        FoodPrice price = new FoodPrice();

        price.setFoodItem(item);
        price.setCostPrice(costPrice);
        price.setSellingPrice(sellingPrice);
        price.setEffectiveFrom(LocalDateTime.now());
        price.setEffectiveTo(null);

        priceRepository.save(price);
    }

    private void updatePriceIfChanged(
            FoodItem item,
            BigDecimal costPrice,
            BigDecimal sellingPrice) {

        FoodPrice currentPrice = priceRepository
                .findFirstByFoodItemFoodItemIdAndEffectiveToIsNullOrderByEffectiveFromDesc(
                        item.getFoodItemId())
                .orElse(null);

        boolean changed = currentPrice == null
                || currentPrice.getCostPrice().compareTo(costPrice) != 0
                || currentPrice.getSellingPrice().compareTo(sellingPrice) != 0;

        if (!changed) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        if (currentPrice != null) {
            currentPrice.setEffectiveTo(now);
            priceRepository.save(currentPrice);
        }

        saveNewPrice(item, costPrice, sellingPrice);
    }

    private FoodItemResponse mapToResponse(FoodItem item) {

        FoodPrice price = priceRepository
                .findFirstByFoodItemFoodItemIdAndEffectiveToIsNullOrderByEffectiveFromDesc(
                        item.getFoodItemId())
                .orElse(null);

       return new FoodItemResponse(
                item.getFoodItemId(),
                item.getCategory() != null
                        ? item.getCategory().getCategoryId()
                        : null,
                item.getCategory() != null
                        ? item.getCategory().getCategoryName()
                        : null,
                item.getCode(),
                item.getFoodName(),
                item.getUnit(),
                item.getMinimumStock(),
                price != null ? price.getCostPrice() : BigDecimal.ZERO,
                price != null ? price.getSellingPrice() : BigDecimal.ZERO,
                item.getIsActive(),
                item.getCreatedAt(),
                item.getImageUrl(),
                item.getImagePublicId()
        );
    }

    @Transactional
    public FoodItemResponse uploadFoodItemImage(
            Integer id,
            MultipartFile file) throws IOException {

        FoodItem item = getActiveFoodItem(id);

        // Upload new image first
        Map result = cloudinaryService.uploadImage(file);

        String newImageUrl = (String) result.get("secure_url");
        String newPublicId = (String) result.get("public_id");

        // Keep old image details until new upload succeeds
        String oldPublicId = item.getImagePublicId();

        item.setImageUrl(newImageUrl);
        item.setImagePublicId(newPublicId);

        FoodItem savedItem = foodItemRepository.save(item);

        // Delete old image only after new image is saved
        if (oldPublicId != null && !oldPublicId.isBlank()) {
            try {
                cloudinaryService.deleteImage(oldPublicId);
            } catch (IOException e) {
                // Log this failure; do not lose the newly saved image
                System.err.println(
                        "Unable to delete old Cloudinary image: " + oldPublicId);
            }
        }

        return mapToResponse(savedItem);
    }
}