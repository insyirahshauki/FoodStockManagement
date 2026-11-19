package com.example.FoodStockManagement.model.Stock;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "StockTransaction")
public class StockTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "StockTransactionID")
    private Integer stockTransactionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "StockBatchID", nullable = false)
    private StockBatch stockBatch;

    @Column(name = "TransactionType", nullable = false, length = 20)
    private String transactionType;

    @Column(name = "Quantity", nullable = false)
    private Integer quantity;

    @Column(name = "ReferenceNo", length = 50)
    private String referenceNo;

    @Column(name = "TransactionDate", insertable = false, updatable = false)
    private LocalDateTime transactionDate;

    @Column(name = "Notes", length = 255)
    private String notes;

    public void setStockBatch(StockBatch value) {
        stockBatch = value;
    }

    public void setTransactionType(String value) {
        transactionType = value;
    }

    public void setQuantity(Integer value) {
        quantity = value;
    }

    public void setReferenceNo(String value) {
        referenceNo = value;
    }

    public void setNotes(String value) {
        notes = value;
    }
    public void setTransactionDate(LocalDateTime value) {
        transactionDate = value;
    }

    public Integer getStockTransactionId() {
        return stockTransactionId;
    }

    public StockBatch getStockBatch() {
        return stockBatch;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public String getReferenceNo() {
        return referenceNo;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public String getNotes() {
        return notes;
    }
}
