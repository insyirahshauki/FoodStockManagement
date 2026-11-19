package com.example.FoodStockManagement.repository.Stock;

import com.example.FoodStockManagement.model.Stock.StockBatch;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StockBatchRepository
                extends JpaRepository<StockBatch, Integer> {
        boolean existsByFoodItemFoodItemIdAndBatchNo(
                        Integer foodItemId,
                        String batchNo);

        List<StockBatch> findByQuantityRemainingGreaterThanOrderByExpiryDateAscReceivedDateAsc(
                        Integer quantity);

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("""
                            SELECT b
                            FROM StockBatch b
                            WHERE b.foodItem.foodItemId = :foodItemId
                              AND b.quantityRemaining > 0
                            ORDER BY b.receivedDate ASC, b.stockBatchId ASC
                        """)
        List<StockBatch> findAvailableBatchesForUpdate(
                        @Param("foodItemId") Integer foodItemId);

        List<StockBatch> findAllByOrderByExpiryDateAscReceivedDateAsc();

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("""
                            SELECT b FROM StockBatch b
                            WHERE b.stockBatchId = :stockBatchId
                        """)
        Optional<StockBatch> findByIdForUpdate(
                        @Param("stockBatchId") Integer stockBatchId);

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("""
                        SELECT b FROM StockBatch b
                        WHERE b.foodItem.foodItemId = :foodItemId
                          AND b.quantityRemaining > 0
                          AND (b.expiryDate IS NULL OR b.expiryDate >= :today)
                        ORDER BY b.receivedDate ASC, b.stockBatchId ASC
                        """)
        List<StockBatch> findAvailableBatchesForUpdate(
                        @Param("foodItemId") Integer foodItemId,
                        @Param("today") LocalDate today);

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("""
                        SELECT b
                        FROM StockBatch b
                        WHERE b.foodItem.foodItemId = :foodItemId
                          AND b.quantityRemaining > 0
                          AND b.expiryDate IS NOT NULL
                          AND b.expiryDate >= :today
                        ORDER BY b.expiryDate ASC,
                                 b.receivedDate ASC,
                                 b.stockBatchId ASC
                        """)
        List<StockBatch> findAvailableBatchesForFEFOUpdate(
                        @Param("foodItemId") Integer foodItemId,
                        @Param("today") LocalDate today);

}
