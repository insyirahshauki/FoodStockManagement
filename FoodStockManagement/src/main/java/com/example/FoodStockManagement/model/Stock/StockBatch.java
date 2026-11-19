package com.example.FoodStockManagement.model.Stock;
import com.example.FoodStockManagement.model.Food.FoodItem;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "StockBatch")
public class StockBatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "StockBatchID")
    private Integer stockBatchId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "FoodItemID", nullable = false)
    private FoodItem foodItem;

    @Column(name = "BatchNo", nullable = false, length = 50)
    private String batchNo;

    @Column(name = "ReceivedDate", insertable = false, updatable = false)
    private LocalDateTime receivedDate;

    @Column(name = "ExpiryDate")
    private LocalDate expiryDate;

    @Column(name = "QuantityReceived", nullable = false)
    private Integer quantityReceived;

    @Column(name = "QuantityRemaining", nullable = false)
    private Integer quantityRemaining;

    @Column(name = "UnitCost", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitCost = BigDecimal.ZERO;
    @Column(name = "Notes", length = 255)
    private String notes;

    public Integer getStockBatchId() {
        return stockBatchId;
    }
    public FoodItem getFoodItem() {
        return foodItem;
    }
    public String getBatchNo() {
        return batchNo;
    }
    public LocalDateTime getReceivedDate() {
        return receivedDate;
    }
    public LocalDate getExpiryDate() {
        return expiryDate;
    }
    public Integer getQuantityReceived() {
        return quantityReceived;
    }
    public Integer getQuantityRemaining() {
        return quantityRemaining;
    }
    public void setFoodItem(FoodItem value) {
        foodItem = value;
    }
    public void setBatchNo(String value) {
        batchNo = value;
    }
    public void setQuantityReceived(Integer value) {
        quantityReceived = value;
    }
    public void setQuantityRemaining(Integer value) {
        quantityRemaining = value;
    }
    public void setExpiryDate(LocalDate value) {
        expiryDate = value;
    }
    public BigDecimal getUnitCost() {
        return unitCost;
    }
    public void setUnitCost(BigDecimal value) {
        unitCost = value;
    }
    public String getNotes() {
        return notes;
    }
    public void setNotes(String value) {
        notes = value;
    }
    public void setReceivedDate(LocalDate value) {
        receivedDate = value.atStartOfDay();
    }
}
    

 
