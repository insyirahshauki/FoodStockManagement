package com.example.FoodStockManagement.repository.SalesOrder;

import com.example.FoodStockManagement.model.SalesOrder.SalesPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface SalesPaymentRepository
        extends JpaRepository<SalesPayment, Integer> {

    List<SalesPayment>
    findBySalesOrderSalesOrderIdOrderByPaymentDateDesc(
        Integer salesOrderId
    );

    List<SalesPayment>
    findAllByOrderByPaymentDateDesc();

    @Query("""
        SELECT COALESCE(SUM(p.paymentAmount), 0)
        FROM SalesPayment p
        WHERE p.salesOrder.salesOrderId = :salesOrderId
        """)
    BigDecimal sumPaymentAmountBySalesOrderId(
            @Param("salesOrderId") Integer salesOrderId);
            
}