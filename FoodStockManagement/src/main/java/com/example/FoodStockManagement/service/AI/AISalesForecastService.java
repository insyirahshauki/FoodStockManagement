package com.example.FoodStockManagement.service.AI;

import com.example.FoodStockManagement.dto.AI.AISalesForecastDTO;
import com.example.FoodStockManagement.repository.AI.AISalesForecastRepository;
import com.example.FoodStockManagement.repository.AI.DailySalesProjection;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AISalesForecastService {

    private static final int HISTORY_DAYS = 28;
    private static final int FORECAST_DAYS = 7;
    private static final int MINIMUM_HISTORY_DAYS = 7;

    private final AISalesForecastRepository repository;

    public AISalesForecastService(
            AISalesForecastRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<AISalesForecastDTO> getSalesForecasts() {

        LocalDateTime startDate =
                LocalDateTime.now().minusDays(HISTORY_DAYS);

        List<DailySalesProjection> sales =
                repository.findDailySales(startDate);

        Map<Integer, Long> totalSales = new HashMap<>();

        for (DailySalesProjection sale : sales) {

            Integer foodItemId = sale.getFoodItemId();

            long quantitySold =
                    sale.getQuantitySold() == null
                            ? 0L
                            : sale.getQuantitySold();

            totalSales.merge(
                    foodItemId,
                    quantitySold,
                    Long::sum
            );
        }

        List<AISalesForecastDTO> forecasts =
                new ArrayList<>();

        Map<Integer, DailySalesProjection> foodItems =
                new HashMap<>();

        for (DailySalesProjection sale : sales) {
            foodItems.putIfAbsent(
                    sale.getFoodItemId(),
                    sale
            );
        }

        for (DailySalesProjection sale : foodItems.values()) {

            Integer foodItemId =
                    sale.getFoodItemId();

            long quantitySold =
                    totalSales.getOrDefault(
                            foodItemId,
                            0L
                    );

            int historyDays =
                    calculateHistoryDays(
                            foodItemId,
                            sales
                    );

            AISalesForecastDTO dto =
                    new AISalesForecastDTO();

            dto.setFoodItemId(foodItemId);
            dto.setFoodName(sale.getFoodName());
            dto.setHistoryDaysAvailable(historyDays);

            if (historyDays < MINIMUM_HISTORY_DAYS) {

                dto.setAverageDailySales(
                        BigDecimal.ZERO
                );

                dto.setPredictedDemand(
                        BigDecimal.ZERO
                );

                dto.setSalesTrend(
                        "INSUFFICIENT_DATA"
                );

                dto.setRecommendation(
                        "Continue recording completed sales "
                        + "to generate a more reliable forecast."
                );

                dto.setHistoryMessage(
                        "At least 7 days of sales history "
                        + "is required for forecasting."
                );

            } else {

                BigDecimal averageDailySales =
                        BigDecimal.valueOf(quantitySold)
                                .divide(
                                        BigDecimal.valueOf(historyDays),
                                        2,
                                        RoundingMode.HALF_UP
                                );

                BigDecimal predictedDemand =
                        averageDailySales
                                .multiply(
                                        BigDecimal.valueOf(
                                                FORECAST_DAYS
                                        )
                                )
                                .setScale(
                                        0,
                                        RoundingMode.CEILING
                                );

                String salesTrend =
                        determineSalesTrend(
                                foodItemId,
                                sales
                        );

                String recommendation =
                        generateRecommendation(
                                salesTrend,
                                predictedDemand
                        );

                dto.setAverageDailySales(
                        averageDailySales
                );

                dto.setPredictedDemand(
                        predictedDemand
                );

                dto.setSalesTrend(
                        salesTrend
                );

                dto.setRecommendation(
                        recommendation
                );

                dto.setHistoryMessage(
                        historyDays < HISTORY_DAYS
                                ? "Forecast based on "
                                + historyDays
                                + " days of available sales history."
                                : "Forecast based on the last "
                                + HISTORY_DAYS
                                + " days of completed sales."
                );
            }

            forecasts.add(dto);
        }

        return forecasts;
    }

    private int calculateHistoryDays(
            Integer foodItemId,
            List<DailySalesProjection> sales) {

        LocalDate today = LocalDate.now();

        Optional<LocalDate> firstSalesDate =
                sales.stream()
                        .filter(s ->
                                s.getFoodItemId()
                                        .equals(foodItemId))
                        .map(s ->
                                LocalDate.of(
                                        s.getSalesYear(),
                                        s.getSalesMonth(),
                                        s.getSalesDay()
                                ))
                        .min(LocalDate::compareTo);

        if (firstSalesDate.isEmpty()) {
            return 0;
        }

        long days =
                ChronoUnit.DAYS.between(
                        firstSalesDate.get(),
                        today
                ) + 1;

        return (int) Math.min(
                days,
                HISTORY_DAYS
        );
    }

    private String determineSalesTrend(
            Integer foodItemId,
            List<DailySalesProjection> sales) {

        LocalDate today = LocalDate.now();

        long recentSales = 0;
        long previousSales = 0;

        for (DailySalesProjection sale : sales) {

            if (!sale.getFoodItemId().equals(foodItemId)) {
                continue;
            }

            LocalDate saleDate =
                    LocalDate.of(
                            sale.getSalesYear(),
                            sale.getSalesMonth(),
                            sale.getSalesDay()
                    );

            long quantity =
                    sale.getQuantitySold() == null
                            ? 0L
                            : sale.getQuantitySold();

            long daysAgo =
                    ChronoUnit.DAYS.between(
                            saleDate,
                            today
                    );

            if (daysAgo < 14) {
                recentSales += quantity;
            } else {
                previousSales += quantity;
            }
        }

        if (recentSales > previousSales * 1.10) {
            return "INCREASING";
        }

        if (recentSales < previousSales * 0.90) {
            return "DECREASING";
        }

        return "STABLE";
    }

    private String generateRecommendation(
            String salesTrend,
            BigDecimal predictedDemand) {

        switch (salesTrend) {

            case "INCREASING":
                return "Sales are increasing. "
                        + "Consider preparing additional stock "
                        + "for the forecast period.";

            case "DECREASING":
                return "Sales are decreasing. "
                        + "Avoid overproducing and monitor demand.";

            default:
                return "Sales are relatively stable. "
                        + "Maintain production close to forecasted demand.";
        }
    }
}