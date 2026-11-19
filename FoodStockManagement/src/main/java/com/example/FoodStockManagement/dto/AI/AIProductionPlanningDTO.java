package com.example.FoodStockManagement.dto.AI;

import java.math.BigDecimal;

public class AIProductionPlanningDTO {

    private Integer foodItemId;
    private String foodName;

    private BigDecimal predictedDemand;
    private Integer confirmedPreorderQuantity;
    private Integer availableStock;
    private Integer recommendedProduction;

    private String productionPriority;
    private String recommendation;

    private int historyDaysAvailable;
    private String historyMessage;

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

    public BigDecimal getPredictedDemand() {
        return predictedDemand;
    }

    public void setPredictedDemand(BigDecimal predictedDemand) {
        this.predictedDemand = predictedDemand;
    }

    public Integer getConfirmedPreorderQuantity() {
        return confirmedPreorderQuantity;
    }

    public void setConfirmedPreorderQuantity(Integer confirmedPreorderQuantity) {
        this.confirmedPreorderQuantity = confirmedPreorderQuantity;
    }

    public Integer getAvailableStock() {
        return availableStock;
    }

    public void setAvailableStock(Integer availableStock) {
        this.availableStock = availableStock;
    }

    public Integer getRecommendedProduction() {
        return recommendedProduction;
    }

    public void setRecommendedProduction(Integer recommendedProduction) {
        this.recommendedProduction = recommendedProduction;
    }

    public String getProductionPriority() {
        return productionPriority;
    }

    public void setProductionPriority(String productionPriority) {
        this.productionPriority = productionPriority;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public int getHistoryDaysAvailable() {
        return historyDaysAvailable;
    }

    public void setHistoryDaysAvailable(int historyDaysAvailable) {
        this.historyDaysAvailable = historyDaysAvailable;
    }

    public String getHistoryMessage() {
        return historyMessage;
    }

    public void setHistoryMessage(String historyMessage) {
        this.historyMessage = historyMessage;
    }
}