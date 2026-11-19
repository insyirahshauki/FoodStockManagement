package com.example.FoodStockManagement.model.SalesOrder;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "SalesPayment")
public class SalesPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SalesPaymentID")
    private Integer salesPaymentId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "SalesOrderID", nullable = false)
    private SalesOrder salesOrder;

    @Column(name = "PaymentAmount", nullable = false, precision = 12, scale = 2)
    private BigDecimal paymentAmount;

    @Column(name = "PaymentDate", insertable = false, updatable = false, nullable = false)
    private LocalDateTime paymentDate;

    @Column(name = "PaymentMethod", length = 30)
    private String paymentMethod;

    @Column(name = "ReferenceNo", length = 50)
    private String referenceNo;

    @Column(name = "Notes", length = 255)
    private String notes;

    @Column(name = "CreatedAt", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // Getters and Setters

    public Integer getSalesPaymentId() {
        return salesPaymentId;
    }

    public SalesOrder getSalesOrder() {
        return salesOrder;
    }

    public void setSalesOrder(SalesOrder salesOrder) {
        this.salesOrder = salesOrder;
    }

    public BigDecimal getPaymentAmount() {
        return paymentAmount;
    }

    public void setPaymentAmount(BigDecimal paymentAmount) {
        this.paymentAmount = paymentAmount;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getReferenceNo() {
        return referenceNo;
    }

    public void setReferenceNo(String referenceNo) {
        this.referenceNo = referenceNo;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }
}