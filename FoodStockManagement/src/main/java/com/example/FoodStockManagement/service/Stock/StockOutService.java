
package com.example.FoodStockManagement.service.Stock;

import com.example.FoodStockManagement.dto.Stock.StockOutRequest;
import com.example.FoodStockManagement.dto.Stock.StockOutResponse;
import com.example.FoodStockManagement.model.Food.FoodItem;
import com.example.FoodStockManagement.model.Stock.StockBatch;
import com.example.FoodStockManagement.model.Stock.StockTransaction;
import com.example.FoodStockManagement.repository.Food.FoodItemRepository;
import com.example.FoodStockManagement.repository.Stock.StockBatchRepository;
import com.example.FoodStockManagement.repository.Stock.StockTransactionRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class StockOutService {

    private final FoodItemRepository foodItemRepository;
    private final StockBatchRepository stockBatchRepository;
    private final StockTransactionRepository stockTransactionRepository;

    public StockOutService(
            FoodItemRepository foodItemRepository,
            StockBatchRepository stockBatchRepository,
            StockTransactionRepository stockTransactionRepository) {

        this.foodItemRepository = foodItemRepository;
        this.stockBatchRepository = stockBatchRepository;
        this.stockTransactionRepository = stockTransactionRepository;
    }

    @Transactional
    public StockOutResponse stockOut(StockOutRequest request) {

        validateRequest(request);

        // Find active food item.
        FoodItem foodItem = foodItemRepository
                .findById(request.foodItemId())
                .filter(item -> Boolean.TRUE.equals(item.getIsActive()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Active food item not found."
                ));

        // Get available non-expired batches in FEFO order.
        LocalDate today = LocalDate.now();

        List<StockBatch> validBatches =
                stockBatchRepository.findAvailableBatchesForFEFOUpdate(
                        foodItem.getFoodItemId(),
                        today
                );

        // Calculate total available non-expired stock.
        int availableQuantity = validBatches.stream()
                .mapToInt(StockBatch::getQuantityRemaining)
                .sum();

        // Reject stock-out if available quantity is insufficient.
        if (availableQuantity < request.quantity()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient non-expired stock. Available quantity: "
                            + availableQuantity
            );
        }

        int remainingToIssue = request.quantity();

        List<StockOutResponse.BatchAllocation> allocations =
                new ArrayList<>();

        String referenceNo = request.referenceNo() == null
                || request.referenceNo().isBlank()
                ? null
                : request.referenceNo().trim();

        // FEFO allocation: earliest expiry date first.
        for (StockBatch batch : validBatches) {

            if (remainingToIssue <= 0) {
                break;
            }

            int batchAvailable = batch.getQuantityRemaining();

            int quantityToIssue = Math.min(
                    remainingToIssue,
                    batchAvailable
            );

            int newRemainingQuantity =
                    batchAvailable - quantityToIssue;

            // Update batch stock balance.
            batch.setQuantityRemaining(newRemainingQuantity);

            stockBatchRepository.save(batch);

            // Record stock-out transaction.
            StockTransaction transaction = new StockTransaction();

            transaction.setStockBatch(batch);
            transaction.setTransactionType("OUT");
            transaction.setQuantity(quantityToIssue);
            transaction.setReferenceNo(referenceNo);
            transaction.setNotes(request.notes());

            stockTransactionRepository.save(transaction);

            // Add batch allocation to response.
            allocations.add(
                    new StockOutResponse.BatchAllocation(
                            batch.getStockBatchId(),
                            batch.getBatchNo(),
                            quantityToIssue,
                            newRemainingQuantity
                    )
            );

            remainingToIssue -= quantityToIssue;
        }

        // Return stock-out response.
        return new StockOutResponse(
                foodItem.getFoodItemId(),
                foodItem.getFoodName(),
                request.quantity(),
                request.quantity(),
                referenceNo,
                allocations
        );
    }

    private void validateRequest(StockOutRequest request) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Stock Out request is required."
            );
        }

        if (request.foodItemId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Food item is required."
            );
        }

        if (request.quantity() == null || request.quantity() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Quantity must be greater than zero."
            );
        }

        if (request.referenceNo() != null
                && request.referenceNo().trim().length() > 50) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Reference number cannot exceed 50 characters."
            );
        }

        if (request.notes() != null
                && request.notes().length() > 255) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Notes cannot exceed 255 characters."
            );
        }
    }
}
