package com.example.FoodStockManagement.model.SalesOrder;

import com.example.FoodStockManagement.model.Food.FoodItem;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "SalesOrderDetail")
public class SalesOrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SalesOrderDetailID")
    private Integer salesOrderDetailId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "SalesOrderID", nullable = false)
    private SalesOrder salesOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "FoodItemID", nullable = false)
    private FoodItem foodItem;

    @Column(name = "Quantity", nullable = false)
    private Integer quantity;

    @Column(name = "UnitPrice", nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "Subtotal", nullable = false)
    private BigDecimal subtotal;

    public Integer getSalesOrderDetailId() { return salesOrderDetailId; }
    public SalesOrder getSalesOrder() { return salesOrder; }
    public FoodItem getFoodItem() { return foodItem; }
    public Integer getQuantity() { return quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public BigDecimal getSubtotal() { return subtotal; }

    public void setSalesOrder(SalesOrder value) { salesOrder = value; }
    public void setFoodItem(FoodItem value) { foodItem = value; }
    public void setQuantity(Integer value) { quantity = value; }
    public void setUnitPrice(BigDecimal value) { unitPrice = value; }
    public void setSubtotal(BigDecimal value) { subtotal = value; }
}