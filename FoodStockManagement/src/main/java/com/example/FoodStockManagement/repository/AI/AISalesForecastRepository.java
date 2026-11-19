package com.example.FoodStockManagement.repository.AI;

import com.example.FoodStockManagement.model.SalesOrder.SalesOrderDetail;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AISalesForecastRepository
        extends JpaRepository<SalesOrderDetail, Integer> {

    @Query("""
        SELECT
            fi.foodItemId AS foodItemId,
            fi.foodName AS foodName,
            FUNCTION('YEAR', so.orderDate) AS salesYear,
            FUNCTION('MONTH', so.orderDate) AS salesMonth,
            FUNCTION('DAY', so.orderDate) AS salesDay,
            SUM(sod.quantity) AS quantitySold
        FROM SalesOrderDetail sod
        JOIN sod.salesOrder so
        JOIN sod.foodItem fi
        WHERE so.orderStatus = 'COMPLETED'
          AND so.orderDate >= :startDate
        GROUP BY
            fi.foodItemId,
            fi.foodName,
            FUNCTION('YEAR', so.orderDate),
            FUNCTION('MONTH', so.orderDate),
            FUNCTION('DAY', so.orderDate)
        """)
    List<DailySalesProjection> findDailySales(
            @Param("startDate") LocalDateTime startDate
    );
}