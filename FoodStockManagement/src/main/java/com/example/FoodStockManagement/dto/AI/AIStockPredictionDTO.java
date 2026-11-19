
package com.example.FoodStockManagement.dto.AI;

import java.math.BigDecimal;

public class AIStockPredictionDTO {

    private Integer foodItemId;
    private String foodName;

    private BigDecimal currentStock;
    private BigDecimal averageDailySales;
    private BigDecimal predictedDemand;

    private BigDecimal recommendedProduction;
    private String stockStatus;
    private String recommendation;
    private Integer historyDaysAvailable;
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

    public BigDecimal getCurrentStock() {
        return currentStock;
    }

    public void setCurrentStock(BigDecimal currentStock) {
        this.currentStock = currentStock;
    }

    public BigDecimal getAverageDailySales() {
        return averageDailySales;
    }

    public void setAverageDailySales(BigDecimal averageDailySales) {
        this.averageDailySales = averageDailySales;
    }

    public BigDecimal getPredictedDemand() {
        return predictedDemand;
    }

    public void setPredictedDemand(BigDecimal predictedDemand) {
        this.predictedDemand = predictedDemand;
    }

    public BigDecimal getRecommendedProduction() {
        return recommendedProduction;
    }

    public void setRecommendedProduction(BigDecimal recommendedProduction) {
        this.recommendedProduction = recommendedProduction;
    }

    public String getStockStatus() {
        return stockStatus;
    }

    public void setStockStatus(String stockStatus) {
        this.stockStatus = stockStatus;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }
    public Integer getHistoryDaysAvailable() {
    return historyDaysAvailable;
    }

    public void setHistoryDaysAvailable(Integer historyDaysAvailable) {
        this.historyDaysAvailable = historyDaysAvailable;
    }

    public String getHistoryMessage() {
        return historyMessage;
    }

    public void setHistoryMessage(String historyMessage) {
        this.historyMessage = historyMessage;
    }
}
