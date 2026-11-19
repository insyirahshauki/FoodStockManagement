package com.example.FoodStockManagement.repository.SalesOrder;

import com.example.FoodStockManagement.model.SalesOrder.SalesOrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalesOrderDetailRepository
        extends JpaRepository<SalesOrderDetail, Integer> {

    List<SalesOrderDetail> findBySalesOrderSalesOrderId(
            Integer salesOrderId
    );
}