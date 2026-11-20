package com.example.FoodStockManagement.controller;

import com.example.FoodStockManagement.service.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "*")
public class ImageUploadController {

    private final CloudinaryService cloudinaryService;

    public ImageUploadController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file) {

        try {
            Map result = cloudinaryService.uploadImage(file);

            return ResponseEntity.ok(Map.of(
                "imageUrl", result.get("secure_url"),
                "publicId", result.get("public_id")
            ));

        } catch (IOException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                Map.of("message", e.getMessage())
            );
        }
    }
}