package com.example.FoodStockManagement.repository.SalesOrder;

import com.example.FoodStockManagement.model.SalesOrder.SalesOrder;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface SalesOrderRepository
                extends JpaRepository<SalesOrder, Integer> {

        boolean existsByOrderNo(String orderNo);

        List<SalesOrder> findAllByOrderByOrderDateDesc();

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("""
                        SELECT s FROM SalesOrder s
                        WHERE s.salesOrderId = :id
                        """)
        Optional<SalesOrder> findByIdForUpdate(@Param("id") Integer id);

        @Query("""
                        SELECT COALESCE(s.depositAmount, 0)
                        FROM SalesOrder s
                        WHERE s.salesOrderId = :salesOrderId
                        """)
        BigDecimal getDepositAmountById(
                        @Param("salesOrderId") Integer salesOrderId);
}