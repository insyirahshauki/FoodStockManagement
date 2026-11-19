package com.example.FoodStockManagement.service.Stock;

import com.example.FoodStockManagement.dto.Stock.StockInRequest;
import com.example.FoodStockManagement.model.Food.FoodItem;
import com.example.FoodStockManagement.model.Stock.StockBatch;
import com.example.FoodStockManagement.model.Stock.StockTransaction;
import com.example.FoodStockManagement.repository.Food.FoodItemRepository;
import com.example.FoodStockManagement.repository.Stock.StockBatchRepository;
import com.example.FoodStockManagement.repository.Stock.StockTransactionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class StockInService {

    private final FoodItemRepository foodItemRepository;
    private final StockBatchRepository stockBatchRepository;
    private final StockTransactionRepository stockTransactionRepository;

    public StockInService(
            FoodItemRepository foodItemRepository,
            StockBatchRepository stockBatchRepository,
            StockTransactionRepository stockTransactionRepository) {

        this.foodItemRepository = foodItemRepository;
        this.stockBatchRepository = stockBatchRepository;
        this.stockTransactionRepository = stockTransactionRepository;
    }

    @Transactional
    public StockBatch stockIn(StockInRequest request) {

        validateRequest(request);

        FoodItem foodItem = foodItemRepository
                .findById(request.foodItemId())
                .filter(item -> Boolean.TRUE.equals(item.getIsActive()))
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Active food item not found."
                        ));

        String batchNo = request.batchNo().trim();

        if (stockBatchRepository.existsByFoodItemFoodItemIdAndBatchNo(
                foodItem.getFoodItemId(), batchNo)) {

            throw new IllegalArgumentException(
                    "Batch number already exists for this food item."
            );
        }

        // Create Stock Batch
        StockBatch batch = new StockBatch();

        batch.setFoodItem(foodItem);
        batch.setBatchNo(batchNo);
        LocalDate receivedDate = request.receivedDate() != null
        ? request.receivedDate()
        : LocalDate.now();

        batch.setReceivedDate(receivedDate);
        //batch.setReceivedDate(request.receivedDate());
        batch.setExpiryDate(request.expiryDate());
        batch.setQuantityReceived(request.quantityReceived());
        batch.setQuantityRemaining(request.quantityReceived());
        batch.setUnitCost(request.unitCost());
        batch.setNotes(request.notes());

        StockBatch savedBatch = stockBatchRepository.save(batch);

        // Create Stock Transaction
        StockTransaction transaction = new StockTransaction();

        transaction.setStockBatch(savedBatch);
        transaction.setTransactionType("IN");
        transaction.setQuantity(request.quantityReceived());
        transaction.setReferenceNo(batchNo);
        transaction.setNotes(request.notes());

        stockTransactionRepository.save(transaction);

        return savedBatch;
    }

    private void validateRequest(StockInRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Stock In request is required."
            );
        }

        if (request.foodItemId() == null) {
            throw new IllegalArgumentException(
                    "Food item is required."
            );
        }

        if (request.batchNo() == null || request.batchNo().isBlank()) {
            throw new IllegalArgumentException(
                    "Batch number is required."
            );
        }

        if (request.batchNo().trim().length() > 50) {
            throw new IllegalArgumentException(
                    "Batch number cannot exceed 50 characters."
            );
        }

        if (request.quantityReceived() == null
                || request.quantityReceived() <= 0) {
            throw new IllegalArgumentException(
                    "Quantity received must be greater than zero."
            );
        }

        if (request.unitCost() == null
                || request.unitCost().compareTo(BigDecimal.ZERO) < 0
                || request.unitCost().scale() > 2) {
            throw new IllegalArgumentException(
                    "Unit cost must be zero or greater with up to 2 decimal places."
            );
        }

        LocalDate receivedDate = request.receivedDate() != null
                ? request.receivedDate()
                : LocalDate.now();

        if (receivedDate.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Received date cannot be in the future."
            );
        }

        if (request.expiryDate() != null
                && request.expiryDate().isBefore(receivedDate)) {
            throw new IllegalArgumentException(
                    "Expiry date cannot be earlier than received date."
            );
        }
    }
}