
package com.example.FoodStockManagement.service.AI;

import com.example.FoodStockManagement.dto.AI.AIStockPredictionDTO;
import com.example.FoodStockManagement.repository.AI.AIStockPredictionRepository;
import com.example.FoodStockManagement.repository.AI.DailySalesProjection;
import com.example.FoodStockManagement.repository.AI.StockBalanceProjection;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class AIStockPredictionService {

        private final AIStockPredictionRepository repository;

        private static final int HISTORY_DAYS = 28;
        private static final int FORECAST_DAYS = 7;

        public AIStockPredictionService(
                        AIStockPredictionRepository repository) {
                this.repository = repository;
        }

        @Transactional(readOnly = true)
        public List<AIStockPredictionDTO> getStockPredictions() {

                LocalDateTime startDate = LocalDateTime.now().minusDays(HISTORY_DAYS);

                List<DailySalesProjection> sales = repository.findDailySales(startDate);

                List<StockBalanceProjection> stocks = repository.findCurrentStock();

                // Group sales by food item
                Map<Integer, Long> totalSales = new HashMap<>();

                for (DailySalesProjection sale : sales) {

                        totalSales.merge(
                                        sale.getFoodItemId(),
                                        sale.getQuantitySold() == null
                                                        ? 0L
                                                        : sale.getQuantitySold(),
                                        Long::sum);
                }

                List<AIStockPredictionDTO> predictions = new ArrayList<>();

                for (StockBalanceProjection stock : stocks) {

                        Integer foodItemId = stock.getFoodItemId();

                        BigDecimal currentStock = stock.getCurrentStock() == null
                                        ? BigDecimal.ZERO
                                        : stock.getCurrentStock();

                        long quantitySold = totalSales.getOrDefault(foodItemId, 0L);

                        // Calculate available sales history
                        int historyDays = calculateHistoryDays(foodItemId, sales);

                        String historyMessage;

                        BigDecimal averageDailySales = BigDecimal.ZERO;
                        BigDecimal predictedDemand = BigDecimal.ZERO;
                        BigDecimal recommendedProduction = BigDecimal.ZERO;

                        String stockStatus;
                        String recommendation;

                        /*
                         * Less than 7 days of sales history
                         * ----------------------------------
                         * Do not generate a prediction yet.
                         */
                        if (historyDays < 7) {

                                historyMessage = "Insufficient sales history. At least 7 days of data is required.";

                                stockStatus = "INSUFFICIENT_DATA";

                                recommendation = "Continue recording sales to generate a more reliable prediction.";

                        } else {

                                /*
                                 * If we have less than 28 days,
                                 * use the actual available history.
                                 *
                                 * Example:
                                 * 14 days available
                                 * 56 units sold
                                 *
                                 * Average = 56 / 14 = 4 units/day
                                 */
                                historyMessage = historyDays < HISTORY_DAYS
                                                ? "Prediction based on " + historyDays
                                                                + " days of available sales history."
                                                : "Prediction based on the last 28 days of sales.";

                                // Average daily sales
                                BigDecimal averageDailySalesValue = BigDecimal.valueOf(quantitySold)
                                                .divide(
                                                                BigDecimal.valueOf(historyDays),
                                                                2,
                                                                RoundingMode.HALF_UP);

                                averageDailySales = averageDailySalesValue;

                                // Predict demand for next 7 days
                                predictedDemand = averageDailySales
                                                .multiply(BigDecimal.valueOf(FORECAST_DAYS))
                                                .setScale(0, RoundingMode.CEILING);

                                // Calculate additional production required
                                recommendedProduction = predictedDemand.subtract(currentStock);

                                if (recommendedProduction.compareTo(
                                                BigDecimal.ZERO) < 0) {

                                        recommendedProduction = BigDecimal.ZERO;
                                }

                                // Determine stock status
                                if (currentStock.compareTo(predictedDemand) < 0) {

                                        stockStatus = "LOW";

                                        recommendation = "Prepare another "
                                                        + recommendedProduction.intValue()
                                                        + " units to meet predicted demand.";

                                } else {

                                        stockStatus = "SUFFICIENT";

                                        recommendation = "Current stock is sufficient for predicted demand.";
                                }
                        }

                        // Build response
                        AIStockPredictionDTO dto = new AIStockPredictionDTO();

                        dto.setFoodItemId(foodItemId);
                        dto.setFoodName(stock.getFoodName());
                        dto.setCurrentStock(currentStock);
                        dto.setAverageDailySales(averageDailySales);
                        dto.setPredictedDemand(predictedDemand);
                        dto.setRecommendedProduction(recommendedProduction);
                        dto.setStockStatus(stockStatus);
                        dto.setRecommendation(recommendation);

                        // New fields
                        dto.setHistoryDaysAvailable(historyDays);
                        dto.setHistoryMessage(historyMessage);

                        predictions.add(dto);
                }

                return predictions;
        }

        private int calculateHistoryDays(
                        Integer foodItemId,
                        List<DailySalesProjection> sales) {

                LocalDate today = LocalDate.now();

                Optional<LocalDate> firstSalesDate = sales.stream()
                                .filter(s -> s.getFoodItemId().equals(foodItemId))
                                .map(s -> LocalDate.of(
                                                s.getSalesYear(),
                                                s.getSalesMonth(),
                                                s.getSalesDay()))
                                .min(LocalDate::compareTo);

                if (firstSalesDate.isEmpty()) {
                        return 0;
                }

                long days = ChronoUnit.DAYS.between(
                                firstSalesDate.get(), today) + 1;

                return (int) Math.min(days, HISTORY_DAYS);
        }
}
