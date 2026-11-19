package com.example.FoodStockManagement.service.AI;

import com.example.FoodStockManagement.dto.AI.AIProductionPlanningDTO;
import com.example.FoodStockManagement.dto.AI.AISalesForecastDTO;
import com.example.FoodStockManagement.repository.AI.AIProductionFoodItemProjection;
import com.example.FoodStockManagement.repository.AI.AIProductionPlanningRepository;
import com.example.FoodStockManagement.repository.AI.AIProductionPreorderProjection;
import com.example.FoodStockManagement.repository.AI.AIProductionStockProjection;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIProductionPlanningService {

    private static final int PLANNING_DAYS = 7;

    private final AIProductionPlanningRepository repository;
    private final AISalesForecastService salesForecastService;

    public AIProductionPlanningService(
            AIProductionPlanningRepository repository,
            AISalesForecastService salesForecastService) {

        this.repository = repository;
        this.salesForecastService = salesForecastService;
    }

    @Transactional(readOnly = true)
    public List<AIProductionPlanningDTO> getProductionPlans() {

        LocalDate today = LocalDate.now();

        LocalDateTime startDate = today.atStartOfDay();

        LocalDateTime endDate = today.plusDays(PLANNING_DAYS)
                .atStartOfDay();

        // Get all active food items.
        List<AIProductionFoodItemProjection> foodItems = repository.findActiveFoodItems();

        // Get existing 7-day sales forecasts.
        List<AISalesForecastDTO> forecasts = salesForecastService.getSalesForecasts();

        // Get confirmed preorder quantities.
        List<AIProductionPreorderProjection> preorders = repository.findConfirmedPreorders(
                startDate,
                endDate);

        // Get available non-expired stock.
        List<AIProductionStockProjection> stocks = repository.findAvailableNonExpiredStock(
                today);

        // Map sales forecasts by food item.
        Map<Integer, AISalesForecastDTO> forecastMap = new HashMap<>();

        for (AISalesForecastDTO forecast : forecasts) {

            forecastMap.put(
                    forecast.getFoodItemId(),
                    forecast);
        }

        // Map preorder quantities by food item.
        Map<Integer, Integer> preorderMap = new HashMap<>();

        for (AIProductionPreorderProjection preorder : preorders) {

            int quantity = preorder.getPreorderQuantity() == null
                    ? 0
                    : preorder.getPreorderQuantity().intValue();

            preorderMap.put(
                    preorder.getFoodItemId(),
                    quantity);
        }

        // Map available stock by food item.
        Map<Integer, Integer> stockMap = new HashMap<>();

        for (AIProductionStockProjection stock : stocks) {

            int quantity = stock.getAvailableStock() == null
                    ? 0
                    : stock.getAvailableStock().intValue();

            stockMap.put(
                    stock.getFoodItemId(),
                    quantity);
        }

        List<AIProductionPlanningDTO> plans = new ArrayList<>();

        // Loop through ALL active food items.
        for (AIProductionFoodItemProjection foodItem : foodItems) {

            Integer foodItemId = foodItem.getFoodItemId();

            AISalesForecastDTO forecast = forecastMap.get(foodItemId);

            BigDecimal predictedDemand = BigDecimal.ZERO;

            int historyDays = 0;

            String historyMessage = "No completed sales history is available.";

            String salesTrend = "INSUFFICIENT_DATA";

            // Use forecast if available.
            if (forecast != null) {

                predictedDemand = forecast.getPredictedDemand() == null
                        ? BigDecimal.ZERO
                        : forecast.getPredictedDemand();

                historyDays = forecast.getHistoryDaysAvailable();

                historyMessage = forecast.getHistoryMessage();

                salesTrend = forecast.getSalesTrend();
            }

            int preorderQuantity = preorderMap.getOrDefault(
                    foodItemId,
                    0);

            int availableStock = stockMap.getOrDefault(
                    foodItemId,
                    0);

            int forecastQuantity = predictedDemand.intValue();

            int recommendedProduction = forecastQuantity
                    + preorderQuantity
                    - availableStock;

            // Never recommend negative production.
            recommendedProduction = Math.max(
                    0,
                    recommendedProduction);

            AIProductionPlanningDTO dto = new AIProductionPlanningDTO();

            dto.setFoodItemId(foodItemId);

            dto.setFoodName(
                    foodItem.getFoodName());

            dto.setPredictedDemand(
                    predictedDemand);

            dto.setConfirmedPreorderQuantity(
                    preorderQuantity);

            dto.setAvailableStock(
                    availableStock);

            dto.setRecommendedProduction(
                    recommendedProduction);

            dto.setHistoryDaysAvailable(
                    historyDays);

            dto.setHistoryMessage(
                    historyMessage);

            dto.setProductionPriority(
                    determinePriority(
                            recommendedProduction,
                            salesTrend));

            dto.setRecommendation(
                    generateRecommendation(
                            recommendedProduction,
                            preorderQuantity,
                            availableStock,
                            salesTrend,
                            historyDays));

            plans.add(dto);
        }

        return plans;
    }
    // @Transactional(readOnly = true)
    // public List<AIProductionPlanningDTO> getProductionPlans() {

    // LocalDate today = LocalDate.now();

    // LocalDateTime startDate =
    // today.atStartOfDay();

    // LocalDateTime endDate =
    // today.plusDays(PLANNING_DAYS)
    // .atStartOfDay();

    // // Get existing 7-day sales forecasts.
    // List<AISalesForecastDTO> forecasts =
    // salesForecastService.getSalesForecasts();

    // // Get confirmed preorder quantities.
    // List<AIProductionPreorderProjection> preorders =
    // repository.findConfirmedPreorders(
    // startDate,
    // endDate
    // );

    // // Get available non-expired stock.
    // List<AIProductionStockProjection> stocks =
    // repository.findAvailableNonExpiredStock(
    // today
    // );

    // // Map preorder quantities by food item.
    // Map<Integer, Integer> preorderMap =
    // new HashMap<>();

    // for (AIProductionPreorderProjection preorder : preorders) {

    // int quantity =
    // preorder.getPreorderQuantity() == null
    // ? 0
    // : preorder.getPreorderQuantity().intValue();

    // preorderMap.put(
    // preorder.getFoodItemId(),
    // quantity
    // );
    // }

    // // Map available stock by food item.
    // Map<Integer, Integer> stockMap =
    // new HashMap<>();

    // for (AIProductionStockProjection stock : stocks) {

    // int quantity =
    // stock.getAvailableStock() == null
    // ? 0
    // : stock.getAvailableStock().intValue();

    // stockMap.put(
    // stock.getFoodItemId(),
    // quantity
    // );
    // }

    // List<AIProductionPlanningDTO> plans =
    // new ArrayList<>();

    // // Create production plan from sales forecasts.
    // for (AISalesForecastDTO forecast : forecasts) {

    // Integer foodItemId =
    // forecast.getFoodItemId();

    // BigDecimal predictedDemand =
    // forecast.getPredictedDemand() == null
    // ? BigDecimal.ZERO
    // : forecast.getPredictedDemand();

    // int preorderQuantity =
    // preorderMap.getOrDefault(
    // foodItemId,
    // 0
    // );

    // int availableStock =
    // stockMap.getOrDefault(
    // foodItemId,
    // 0
    // );

    // int demandQuantity =
    // predictedDemand.intValue();

    // int requiredProduction =
    // demandQuantity
    // + preorderQuantity
    // - availableStock;

    // // Never recommend negative production.
    // requiredProduction =
    // Math.max(
    // 0,
    // requiredProduction
    // );

    // AIProductionPlanningDTO dto =
    // new AIProductionPlanningDTO();

    // dto.setFoodItemId(foodItemId);
    // dto.setFoodName(
    // forecast.getFoodName()
    // );

    // dto.setPredictedDemand(
    // predictedDemand
    // );

    // dto.setConfirmedPreorderQuantity(
    // preorderQuantity
    // );

    // dto.setAvailableStock(
    // availableStock
    // );

    // dto.setRecommendedProduction(
    // requiredProduction
    // );

    // dto.setHistoryDaysAvailable(
    // forecast.getHistoryDaysAvailable()
    // );

    // dto.setHistoryMessage(
    // forecast.getHistoryMessage()
    // );

    // dto.setProductionPriority(
    // determinePriority(
    // requiredProduction,
    // forecast.getSalesTrend()
    // )
    // );

    // dto.setRecommendation(
    // generateRecommendation(
    // requiredProduction,
    // preorderQuantity,
    // availableStock,
    // forecast.getSalesTrend(),
    // forecast.getHistoryDaysAvailable()
    // )
    // );

    // plans.add(dto);
    // }

    // return plans;
    // }

    private String determinePriority(
            int recommendedProduction,
            String salesTrend) {

        if (recommendedProduction <= 0) {
            return "LOW";
        }

        if ("INCREASING".equals(salesTrend)
                || recommendedProduction >= 10) {
            return "HIGH";
        }

        if (recommendedProduction >= 5) {
            return "MEDIUM";
        }

        return "LOW";
    }

    private String generateRecommendation(
            int recommendedProduction,
            int preorderQuantity,
            int availableStock,
            String salesTrend,
            int historyDays) {

        if (historyDays < 7) {

            return "Sales history is insufficient. "
                    + "Review preorder commitments manually "
                    + "before production.";
        }

        if (recommendedProduction <= 0) {

            return "Current non-expired stock is sufficient "
                    + "for the forecast demand and confirmed preorders.";
        }

        if (preorderQuantity > 0
                && salesTrend.equals("INCREASING")) {

            return "Confirmed preorders and increasing sales "
                    + "indicate higher production is recommended.";
        }

        if (preorderQuantity > 0) {

            return "Confirmed preorders require additional "
                    + "production beyond available stock.";
        }

        if (salesTrend.equals("INCREASING")) {

            return "Sales are increasing. Consider preparing "
                    + "additional stock.";
        }

        if (salesTrend.equals("DECREASING")) {

            return "Sales are decreasing. Produce only the "
                    + "recommended quantity and avoid overproduction.";
        }

        return "Prepare the recommended quantity based on "
                + "forecast demand and current stock.";
    }
}