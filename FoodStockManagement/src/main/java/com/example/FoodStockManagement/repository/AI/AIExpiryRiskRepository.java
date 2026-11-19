package com.example.FoodStockManagement.repository.AI;

import com.example.FoodStockManagement.model.Stock.StockBatch;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIExpiryRiskRepository
        extends JpaRepository<StockBatch, Integer> {

    @Query("""
        SELECT sb
        FROM StockBatch sb
        JOIN FETCH sb.foodItem fi
        WHERE sb.quantityRemaining > 0
          AND sb.expiryDate IS NOT NULL
          AND fi.isActive = true
        ORDER BY sb.expiryDate ASC
        """)
    List<StockBatch> findBatchesForExpiryAnalysis();
}