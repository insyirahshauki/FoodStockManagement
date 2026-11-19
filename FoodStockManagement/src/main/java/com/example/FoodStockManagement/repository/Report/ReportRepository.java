package com.example.FoodStockManagement.repository.Report;

import com.example.FoodStockManagement.model.Stock.StockBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReportRepository extends JpaRepository<StockBatch, Integer> {

    @Query("""
            SELECT
                f.foodItemId,
                f.code,
                f.foodName,
                f.unit,
                COALESCE(SUM(b.quantityRemaining), 0),
                f.minimumStock
            FROM FoodItem f
            LEFT JOIN StockBatch b
                ON b.foodItem.foodItemId = f.foodItemId
            WHERE f.isActive = true
            GROUP BY
                f.foodItemId,
                f.code,
                f.foodName,
                f.unit,
                f.minimumStock
            ORDER BY f.foodName
            """)
    List<Object[]> getStockBalanceReport();

    @Query("""
            SELECT
                t.stockTransactionId,
                t.transactionDate,
                t.transactionType,
                f.code,
                f.foodName,
                f.unit,
                b.batchNo,
                t.quantity,
                t.referenceNo,
                t.notes
            FROM StockTransaction t
            JOIN t.stockBatch b
            JOIN b.foodItem f
            ORDER BY t.transactionDate DESC
            """)
    List<Object[]> getStockMovementReport();

    @Query("""
            SELECT
                b.stockBatchId,
                f.foodItemId,
                f.code,
                f.foodName,
                f.unit,
                b.batchNo,
                b.expiryDate,
                b.quantityRemaining
            FROM StockBatch b
            JOIN b.foodItem f
            WHERE f.isActive = true
              AND b.quantityRemaining > 0
              AND b.expiryDate IS NOT NULL
            ORDER BY b.expiryDate ASC
            """)
    List<Object[]> getStockExpiryReport();

    @Query("""
            SELECT
                s.salesOrderId,
                s.orderNo,
                s.orderType,
                s.customerName,
                s.orderDate,
                s.collectionDate,
                s.orderStatus,
                s.paymentStatus,
                s.totalAmount
            FROM SalesOrder s
            WHERE
                (:fromDate IS NULL OR s.orderDate >= :fromDate)
                AND
                (:toDate IS NULL OR s.orderDate <= :toDate)
                AND
                (:orderStatus IS NULL OR s.orderStatus = :orderStatus)
                AND
                (:paymentStatus IS NULL OR s.paymentStatus = :paymentStatus)
            ORDER BY s.orderDate DESC
            """)
    List<Object[]> getSalesReport(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("orderStatus") String orderStatus,
            @Param("paymentStatus") String paymentStatus);
}