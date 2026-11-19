package com.example.FoodStockManagement.model.SalesOrder;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "SalesOrder")
public class SalesOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SalesOrderID")
    private Integer salesOrderId;

    @Column(name = "OrderNo")
    private String orderNo;

    @Column(name = "OrderType")
    private String orderType;

    @Column(name = "CustomerName")
    private String customerName;

    @Column(name = "CustomerPhone")
    private String customerPhone;

    @Column(name = "OrderDate")
    private LocalDateTime orderDate;

    @Column(name = "CollectionDate")
    private LocalDateTime collectionDate;

    @Column(name = "OrderStatus")
    private String orderStatus;

    @Column(name = "PaymentStatus")
    private String paymentStatus;

    @Column(name = "DepositAmount")
    private BigDecimal depositAmount;

    @Column(name = "TotalAmount")
    private BigDecimal totalAmount;

    @Column(name = "Notes")
    private String notes;

    @Column(name = "CreatedAt", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // Getters and setters

    public Integer getSalesOrderId() { return salesOrderId; }
    public String getOrderNo() { return orderNo; }
    public String getOrderType() { return orderType; }
    public String getCustomerName() { return customerName; }
    public String getCustomerPhone() { return customerPhone; }
    public LocalDateTime getOrderDate() { return orderDate; }
    public LocalDateTime getCollectionDate() { return collectionDate; }
    public String getOrderStatus() { return orderStatus; }
    public String getPaymentStatus() { return paymentStatus; }
    public BigDecimal getDepositAmount() { return depositAmount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public String getNotes() { return notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setOrderNo(String value) { orderNo = value; }
    public void setOrderType(String value) { orderType = value; }
    public void setCustomerName(String value) { customerName = value; }
    public void setCustomerPhone(String value) { customerPhone = value; }
    public void setOrderDate(LocalDateTime value) { orderDate = value; }
    public void setCollectionDate(LocalDateTime value) { collectionDate = value; }
    public void setOrderStatus(String value) { orderStatus = value; }
    public void setPaymentStatus(String value) { paymentStatus = value; }
    public void setDepositAmount(BigDecimal value) { depositAmount = value; }
    public void setTotalAmount(BigDecimal value) { totalAmount = value; }
    public void setNotes(String value) { notes = value; }
}