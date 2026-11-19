package com.example.FoodStockManagement.service.Stock;

import com.example.FoodStockManagement.dto.Stock.ExpiryManagementResponse;
import com.example.FoodStockManagement.model.Stock.StockBatch;
import com.example.FoodStockManagement.repository.Stock.StockBatchRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ExpiryManagementService {

    private final StockBatchRepository stockBatchRepository;

    public ExpiryManagementService(
            StockBatchRepository stockBatchRepository) {
        this.stockBatchRepository = stockBatchRepository;
    }

    @Transactional(readOnly = true)
    public List<ExpiryManagementResponse> getExpiryManagement() {

        LocalDate today = LocalDate.now();

        List<StockBatch> batches =
                stockBatchRepository.findAllByOrderByExpiryDateAscReceivedDateAsc();

        return batches.stream()
                .map(batch -> mapToResponse(batch, today))
                .toList();
    }

    private ExpiryManagementResponse mapToResponse(
            StockBatch batch,
            LocalDate today) {

        LocalDate expiryDate = batch.getExpiryDate();

        Long daysUntilExpiry = expiryDate == null
                ? null
                : ChronoUnit.DAYS.between(today, expiryDate);

        String status;

        if (batch.getQuantityRemaining() == null
                || batch.getQuantityRemaining() <= 0) {

            status = "OUT_OF_STOCK";

        } else if (expiryDate == null) {

            status = "NO_EXPIRY_DATE";

        } else if (expiryDate.isBefore(today)) {

            status = "EXPIRED";

        } else if (daysUntilExpiry <= 7) {

            status = "EXPIRING_SOON";

        } else {

            status = "GOOD_STOCK";
        }

        return new ExpiryManagementResponse(
                batch.getStockBatchId(),
                batch.getFoodItem().getFoodItemId(),
                batch.getFoodItem().getCode(),
                batch.getFoodItem().getFoodName(),
                batch.getFoodItem().getUnit(),
                batch.getBatchNo(),
                batch.getReceivedDate(),
                expiryDate,
                batch.getQuantityReceived(),
                batch.getQuantityRemaining(),
                daysUntilExpiry,
                status
        );
    }
}