package com.example.FoodStockManagement.dto.AI;

import java.time.LocalDate;

public class AIExpiryRiskDTO {

    private Integer batchId;
    private Integer foodItemId;
    private String foodName;
    private String batchNo;
    private LocalDate expiryDate;
    private Integer quantityRemaining;
    private long daysUntilExpiry;
    private String riskLevel;
    private String recommendation;

    public Integer getBatchId() {
        return batchId;
    }

    public void setBatchId(Integer batchId) {
        this.batchId = batchId;
    }

    public Integer getFoodItemId() {
        return foodItemId;
    }

    public void setFoodItemId(Integer foodItemId) {
        this.foodItemId = foodItemId;
    }

    public String getFoodName() {
        return foodName;
    }

    public void setFoodName(String foodName) {
        this.foodName = foodName;
    }

    public String getBatchNo() {
        return batchNo;
    }

    public void setBatchNo(String batchNo) {
        this.batchNo = batchNo;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Integer getQuantityRemaining() {
        return quantityRemaining;
    }

    public void setQuantityRemaining(Integer quantityRemaining) {
        this.quantityRemaining = quantityRemaining;
    }

    public long getDaysUntilExpiry() {
        return daysUntilExpiry;
    }

    public void setDaysUntilExpiry(long daysUntilExpiry) {
        this.daysUntilExpiry = daysUntilExpiry;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }
}