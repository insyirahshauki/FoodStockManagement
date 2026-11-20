package com.example.FoodStockManagement.controller.Food;

import com.example.FoodStockManagement.dto.Food.FoodItemRequest;
import com.example.FoodStockManagement.dto.Food.FoodItemResponse;
import com.example.FoodStockManagement.service.Food.FoodItemService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController
@RequestMapping("/api/food-items")
@CrossOrigin(origins = "*")
public class FoodItemController {

    private final FoodItemService service;

    public FoodItemController(FoodItemService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<FoodItemResponse>> getAllFoodItems() {
        return ResponseEntity.ok(service.getAllFoodItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodItemResponse> getFoodItemById(
            @PathVariable Integer id) {

        return ResponseEntity.ok(service.getFoodItemById(id));
    }

    @PostMapping
    public ResponseEntity<FoodItemResponse> createFoodItem(
            @RequestBody FoodItemRequest request) {

        FoodItemResponse response = service.createFoodItem(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FoodItemResponse> updateFoodItem(
            @PathVariable Integer id,
            @RequestBody FoodItemRequest request) {

        return ResponseEntity.ok(service.updateFoodItem(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFoodItem(
            @PathVariable Integer id) {

        service.deleteFoodItem(id);

        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadFoodItemImage(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file) {

        try {
            FoodItemResponse response = service.uploadFoodItemImage(id, file);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    java.util.Map.of("message", e.getMessage()));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(
                    java.util.Map.of("message", "Image upload failed."));
        }
    }

}