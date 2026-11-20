
package com.example.FoodStockManagement.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    private static final Set<String> ALLOWED_TYPES = Set.of(
        "image/jpeg",
        "image/png",
        "image/webp"
    );

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public Map uploadImage(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                "Please select an image."
            );
        }

        if (!ALLOWED_TYPES.contains(
                file.getContentType() == null
                    ? ""
                    : file.getContentType().toLowerCase(Locale.ROOT))) {

            throw new IllegalArgumentException(
                "Only JPG, PNG and WebP images are allowed."
            );
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException(
                "Image size must not exceed 5MB."
            );
        }

        return cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap(
                "folder", "foodstock/products",
                "resource_type", "image"
            )
        );
    }

    public void deleteImage(String publicId) throws IOException {

        if (publicId == null || publicId.isBlank()) {
            return;
        }

        cloudinary.uploader().destroy(
            publicId,
            ObjectUtils.emptyMap()
        );
    }
}
