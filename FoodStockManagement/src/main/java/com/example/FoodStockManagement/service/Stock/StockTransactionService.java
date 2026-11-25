package com.example.FoodStockManagement.service.Stock;

import com.example.FoodStockManagement.dto.Stock.StockTransactionResponse;
import com.example.FoodStockManagement.model.Stock.StockTransaction;
import com.example.FoodStockManagement.repository.Stock.StockTransactionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StockTransactionService {

    private final StockTransactionRepository stockTransactionRepository;

    public StockTransactionService(
            StockTransactionRepository stockTransactionRepository) {
        this.stockTransactionRepository = stockTransactionRepository;
    }

    @Transactional(readOnly = true)
    public List<StockTransactionResponse> getAllTransactions() {

        List<StockTransaction> transactions =
                stockTransactionRepository
                        .findAllByOrderByTransactionDateDesc();

        return transactions.stream()
                .map(this::mapToResponse)
                .toList();
    }

    private StockTransactionResponse mapToResponse(
            StockTransaction transaction) {

        var batch = transaction.getStockBatch();
        var foodItem = batch.getFoodItem();

        return new StockTransactionResponse(
                transaction.getStockTransactionId(),
                batch.getStockBatchId(),
                foodItem.getFoodItemId(),
                foodItem.getFoodName(),
                foodItem.getUnit(),
                batch.getBatchNo(),
                transaction.getTransactionType(),
                transaction.getQuantity(),
                transaction.getReferenceNo(),
                transaction.getTransactionDate(),
                transaction.getNotes()
        );
    }
}