package com.example.FoodStockManagement.service.Stock;

import com.example.FoodStockManagement.dto.Stock.ExpiredStockAdjustmentRequest;
import com.example.FoodStockManagement.dto.Stock.ExpiredStockAdjustmentResponse;
import com.example.FoodStockManagement.model.Stock.StockBatch;
import com.example.FoodStockManagement.model.Stock.StockTransaction;
import com.example.FoodStockManagement.repository.Stock.StockBatchRepository;
import com.example.FoodStockManagement.repository.Stock.StockTransactionRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class ExpiredStockAdjustmentService {

    private final StockBatchRepository stockBatchRepository;
    private final StockTransactionRepository stockTransactionRepository;

    public ExpiredStockAdjustmentService(
            StockBatchRepository stockBatchRepository,
            StockTransactionRepository stockTransactionRepository) {

        this.stockBatchRepository = stockBatchRepository;
        this.stockTransactionRepository = stockTransactionRepository;
    }

    @Transactional
    public ExpiredStockAdjustmentResponse adjustExpiredStock(
            ExpiredStockAdjustmentRequest request) {

        // Validate request
        if (request == null || request.stockBatchId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Stock batch is required."
            );
        }

        if (request.quantity() == null || request.quantity() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Adjustment quantity must be greater than zero."
            );
        }

        // Retrieve batch with database lock
        StockBatch batch = stockBatchRepository
                .findByIdForUpdate(request.stockBatchId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Stock batch not found."
                ));

        LocalDate today = LocalDate.now();

        // Check expiry date
        if (batch.getExpiryDate() == null ||
                !batch.getExpiryDate().isBefore(today)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only expired stock can be adjusted."
            );
        }

        Integer previousQuantity = batch.getQuantityRemaining();

        if (previousQuantity == null || previousQuantity <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This batch has no remaining stock."
            );
        }

        if (request.quantity() > previousQuantity) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Adjustment quantity cannot exceed remaining stock."
            );
        }

        // Update stock batch
        Integer remainingQuantity =
                previousQuantity - request.quantity();

        batch.setQuantityRemaining(remainingQuantity);

        stockBatchRepository.save(batch);

        // Create stock transaction
        StockTransaction transaction = new StockTransaction();

        transaction.setStockBatch(batch);
        transaction.setTransactionType("ADJUSTMENT_OUT");
        transaction.setQuantity(request.quantity());
        transaction.setReferenceNo(batch.getBatchNo());
        transaction.setTransactionDate(LocalDateTime.now());

        String notes = request.notes();

        transaction.setNotes(
                notes == null || notes.isBlank()
                        ? "Expired stock adjustment"
                        : notes.trim()
        );

        stockTransactionRepository.save(transaction);

        return new ExpiredStockAdjustmentResponse(
                batch.getStockBatchId(),
                batch.getBatchNo(),
                batch.getFoodItem().getFoodName(),
                request.quantity(),
                previousQuantity,
                remainingQuantity,
                "ADJUSTMENT_OUT",
                transaction.getTransactionDate()
        );
    }
}