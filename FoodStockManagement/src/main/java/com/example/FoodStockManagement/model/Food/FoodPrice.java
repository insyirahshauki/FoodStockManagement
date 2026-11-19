package com.example.FoodStockManagement.model.Food;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "FoodPrice")
public class FoodPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FoodPriceID")
    private Integer foodPriceId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "FoodItemID", nullable = false)
    private FoodItem foodItem;

    @Column(name = "CostPrice", nullable = false, precision = 18, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "SellingPrice", nullable = false, precision = 18, scale = 2)
    private BigDecimal sellingPrice;

    @Column(name = "EffectiveFrom", nullable = false)
    private LocalDateTime effectiveFrom;

    @Column(name = "EffectiveTo")
    private LocalDateTime effectiveTo;

    @Column(name = "CreatedAt", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Integer getFoodPriceId() {
        return foodPriceId;
    }

    public FoodItem getFoodItem() {
        return foodItem;
    }

    public void setFoodItem(FoodItem foodItem) {
        this.foodItem = foodItem;
    }

    public BigDecimal getCostPrice() {
        return costPrice;
    }

    public void setCostPrice(BigDecimal costPrice) {
        this.costPrice = costPrice;
    }

    public BigDecimal getSellingPrice() {
        return sellingPrice;
    }

    public void setSellingPrice(BigDecimal sellingPrice) {
        this.sellingPrice = sellingPrice;
    }

    public LocalDateTime getEffectiveFrom() {
        return effectiveFrom;
    }

    public void setEffectiveFrom(LocalDateTime effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public LocalDateTime getEffectiveTo() {
        return effectiveTo;
    }

    public void setEffectiveTo(LocalDateTime effectiveTo) {
        this.effectiveTo = effectiveTo;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}