
package com.example.FoodStockManagement.repository.AI;

import com.example.FoodStockManagement.model.SalesOrder.SalesOrderDetail;
import com.example.FoodStockManagement.model.Stock.StockBatch;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface AIProductionPlanningRepository
        extends JpaRepository<SalesOrderDetail, Integer> {

    // Get confirmed preorder quantities for the next 7 days.
    @Query("""
            SELECT
                fi.foodItemId AS foodItemId,
                fi.foodName AS foodName,
                SUM(sod.quantity) AS preorderQuantity
            FROM SalesOrderDetail sod
            JOIN sod.salesOrder so
            JOIN sod.foodItem fi
            WHERE so.orderType = 'PRE_ORDER'
              AND so.orderStatus = 'CONFIRMED'
              AND so.collectionDate >= :startDate
              AND so.collectionDate < :endDate
              AND fi.isActive = true
            GROUP BY fi.foodItemId, fi.foodName
            """)
    List<AIProductionPreorderProjection> findConfirmedPreorders(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Get available non-expired stock.
    @Query("""
            SELECT
                fi.foodItemId AS foodItemId,
                fi.foodName AS foodName,
                SUM(b.quantityRemaining) AS availableStock
            FROM StockBatch b
            JOIN b.foodItem fi
            WHERE b.quantityRemaining > 0
              AND b.expiryDate IS NOT NULL
              AND b.expiryDate >= :today
              AND fi.isActive = true
            GROUP BY fi.foodItemId, fi.foodName
            """)
    List<AIProductionStockProjection> findAvailableNonExpiredStock(
            @Param("today") LocalDate today);

    @Query("""
            SELECT
                fi.foodItemId AS foodItemId,
                fi.foodName AS foodName
            FROM FoodItem fi
            WHERE fi.isActive = true
            ORDER BY fi.foodName ASC
            """)
    List<AIProductionFoodItemProjection> findActiveFoodItems();
}
