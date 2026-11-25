package com.example.FoodStockManagement.model.Food;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;

@Entity
@Table(name = "FoodItem")
public class FoodItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FoodItemID")
    private Integer foodItemId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CategoryID", nullable = false)
    private FoodCategory category;

    @Column(name = "Code", nullable = false, length = 30)
    private String code;

    @Column(name = "FoodName", nullable = false, length = 150)
    private String foodName;

    @Column(name = "Unit", nullable = false, length = 30)
    private String unit = "unit";

    @Column(name = "MinimumStock", nullable = false)
    private Integer minimumStock = 0;

    @Column(name = "IsActive", nullable = false)
    private Boolean isActive = true;

    @Column(name = "CreatedAt", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "ImageUrl", length = 500)
    private String imageUrl;

    @Column(name = "ImagePublicId", length = 255)
    private String imagePublicId;
    @OneToMany(mappedBy = "foodItem")
    private List<FoodPrice> foodPrices;

    public Integer getFoodItemId() {
        return foodItemId;
    }

    public FoodCategory getCategory() {
        return category;
    }

    public void setCategory(FoodCategory value) {
        category = value;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String value) {
        code = value;
    }

    public String getFoodName() {
        return foodName;
    }

    public void setFoodName(String value) {
        foodName = value;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String value) {
        unit = value;
    }

    public Integer getMinimumStock() {
        return minimumStock;
    }

    public void setMinimumStock(Integer value) {
        minimumStock = value;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean value) {
        isActive = value;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getImagePublicId() {
        return imagePublicId;
    }

    public void setImagePublicId(String imagePublicId) {
        this.imagePublicId = imagePublicId;
    }

}
