
package com.example.FoodStockManagement.repository.AI;

public interface DailySalesProjection {

    Integer getFoodItemId();

    String getFoodName();

    Integer getSalesYear();

    Integer getSalesMonth();

    Integer getSalesDay();

    Long getQuantitySold();
}
