package com.example.FoodStockManagement.dto.AI;

import java.math.BigDecimal;

public class AISalesForecastDTO {

    private Integer foodItemId;
    private String foodName;

    private BigDecimal averageDailySales;
    private BigDecimal predictedDemand;

    private String salesTrend;
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

    public String getSalesTrend() {
        return salesTrend;
    }

    public void setSalesTrend(String salesTrend) {
        this.salesTrend = salesTrend;
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