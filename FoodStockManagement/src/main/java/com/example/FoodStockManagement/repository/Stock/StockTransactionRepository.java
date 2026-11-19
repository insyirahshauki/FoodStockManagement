package com.example.FoodStockManagement.repository.Stock;

import com.example.FoodStockManagement.model.Stock.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockTransactionRepository
                extends JpaRepository<StockTransaction, Integer> {

        List<StockTransaction> findTop10ByOrderByTransactionDateDesc();

        List<StockTransaction> findAllByOrderByTransactionDateDesc();

        boolean existsByReferenceNoAndTransactionType(String referenceNo, String transactionType);
}