
package com.example.FoodStockManagement.service.AI;

import com.example.FoodStockManagement.dto.AI.AISmartAlertDTO;
import com.example.FoodStockManagement.dto.AI.AIStockPredictionDTO;
import com.example.FoodStockManagement.dto.AI.AIExpiryRiskDTO;
import com.example.FoodStockManagement.dto.AI.AIProductionPlanningDTO;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class AISmartAlertService {

    private final AIStockPredictionService stockPredictionService;
    private final AIExpiryRiskService expiryRiskService;
    private final AIProductionPlanningService productionPlanningService;

    public AISmartAlertService(
            AIStockPredictionService stockPredictionService,
            AIExpiryRiskService expiryRiskService,
            AIProductionPlanningService productionPlanningService) {

        this.stockPredictionService = stockPredictionService;
        this.expiryRiskService = expiryRiskService;
        this.productionPlanningService = productionPlanningService;
    }

    @Transactional(readOnly = true)
    public List<AISmartAlertDTO> getSmartAlerts() {

        List<AISmartAlertDTO> alerts = new ArrayList<>();

        addStockAlerts(alerts);
        addExpiryAlerts(alerts);
        addProductionAlerts(alerts);

        return alerts;
    }

    private void addStockAlerts(List<AISmartAlertDTO> alerts) {

        List<AIStockPredictionDTO> predictions =
                stockPredictionService.getStockPredictions();

        for (AIStockPredictionDTO item : predictions) {

            String status = item.getStockStatus() == null
                    ? ""
                    : item.getStockStatus().toUpperCase(Locale.ROOT);

            if (!"LOW".equals(status)) {
                continue;
            }

            Integer currentStock = item.getCurrentStock() == null
                    ? null
                    : item.getCurrentStock().intValue();

            String severity = currentStock != null && currentStock <= 0
                    ? "CRITICAL"
                    : "WARNING";

            String message = currentStock != null && currentStock <= 0
                    ? item.getFoodName() + " is out of stock."
                    : item.getFoodName() + " has low stock. Current stock: "
                            + currentStock + ".";

            alerts.add(new AISmartAlertDTO(
                    "LOW_STOCK",
                    severity,
                    severity.equals("CRITICAL")
                            ? "Out of Stock"
                            : "Low Stock",
                    message,
                    item.getFoodName(),
                    currentStock,
                    null,
                    null,
                    null
            ));
        }
    }

    private void addExpiryAlerts(List<AISmartAlertDTO> alerts) {

        List<AIExpiryRiskDTO> risks =
                expiryRiskService.getExpiryRisks();

        for (AIExpiryRiskDTO item : risks) {

            String risk = item.getRiskLevel() == null
                    ? ""
                    : item.getRiskLevel().toUpperCase(Locale.ROOT);

            if (risk.isBlank() || "SAFE".equals(risk)) {
                continue;
            }

            String severity;

            if (risk.contains("EXPIRED") || risk.contains("HIGH")) {
                severity = "CRITICAL";
            } else {
                severity = "WARNING";
            }

            String message = item.getFoodName()
                    + " batch " + item.getBatchNo()
                    + " has expiry date " + item.getExpiryDate()
                    + ". Remaining quantity: "
                    + item.getQuantityRemaining()
                    + ". Risk: " + risk + ".";

            alerts.add(new AISmartAlertDTO(
                    "EXPIRY_RISK",
                    severity,
                    risk.contains("EXPIRED")
                            ? "Expired Stock"
                            : "Expiry Risk",
                    message,
                    item.getFoodName(),
                    null,
                    null,
                    null,
                    null
            ));
        }
    }

    private void addProductionAlerts(List<AISmartAlertDTO> alerts) {

        List<AIProductionPlanningDTO> plans =
                productionPlanningService.getProductionPlans();

        for (AIProductionPlanningDTO item : plans) {

            Integer recommendedProduction =
                    item.getRecommendedProduction();

            // Do not create a production alert when there is
            // insufficient sales history.
            if (item.getHistoryDaysAvailable() < 7
                    || recommendedProduction == null
                    || recommendedProduction <= 0) {
                continue;
            }

            String priority = item.getProductionPriority() == null
                    ? "LOW"
                    : item.getProductionPriority().toUpperCase(Locale.ROOT);

            String severity = "HIGH".equals(priority)
                    ? "WARNING"
                    : "INFO";

            String message = "Prepare "
                    + recommendedProduction
                    + " units of " + item.getFoodName()
                    + ". " + item.getRecommendation();

            alerts.add(new AISmartAlertDTO(
                    "PRODUCTION",
                    severity,
                    "Production Recommended",
                    message,
                    item.getFoodName(),
                    item.getAvailableStock(),
                    null,
                    null,
                    recommendedProduction
            ));
        }
    }
}
