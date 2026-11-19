package com.example.FoodStockManagement.service.AI;

import com.example.FoodStockManagement.dto.AI.AIExpiryRiskDTO;
import com.example.FoodStockManagement.repository.AI.AIExpiryRiskRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class AIExpiryRiskService {

    private final AIExpiryRiskRepository repository;

    public AIExpiryRiskService(AIExpiryRiskRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<AIExpiryRiskDTO> getExpiryRisks() {

        var batches =
                repository.findBatchesForExpiryAnalysis();

        List<AIExpiryRiskDTO> results = new ArrayList<>();

        LocalDate today = LocalDate.now();

        for (var batch : batches) {

            LocalDate expiryDate = batch.getExpiryDate();

            if (expiryDate == null) {
                continue;
            }

            long daysUntilExpiry =
                    ChronoUnit.DAYS.between(today, expiryDate);

            String riskLevel;
            String recommendation;

            if (daysUntilExpiry < 0) {

                riskLevel = "EXPIRED";

                recommendation =
                        "Expired stock detected. Remove from available stock "
                        + "and follow your food safety disposal procedure.";

            } else if (daysUntilExpiry <= 3) {

                riskLevel = "CRITICAL";

                recommendation =
                        "Expiry is approaching. Prioritise this batch for "
                        + "immediate review and use if still safe.";

            } else if (daysUntilExpiry <= 7) {

                riskLevel = "WARNING";

                recommendation =
                        "This batch expires soon. Prioritise it for production "
                        + "planning if appropriate.";

            } else if (daysUntilExpiry <= 30) {

                riskLevel = "UPCOMING";

                recommendation =
                        "Monitor this batch and plan stock usage before expiry.";

            } else {

                riskLevel = "SAFE";

                recommendation =
                        "No immediate expiry concern. Continue monitoring.";
            }

            AIExpiryRiskDTO dto = new AIExpiryRiskDTO();

            dto.setBatchId(batch.getStockBatchId());
            dto.setFoodItemId(batch.getFoodItem().getFoodItemId());
            dto.setFoodName(batch.getFoodItem().getFoodName());
            dto.setBatchNo(batch.getBatchNo());
            dto.setExpiryDate(expiryDate);
            dto.setQuantityRemaining(batch.getQuantityRemaining());
            dto.setDaysUntilExpiry(daysUntilExpiry);
            dto.setRiskLevel(riskLevel);
            dto.setRecommendation(recommendation);

            results.add(dto);
        }

        return results;
    }
}