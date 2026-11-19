
package com.example.FoodStockManagement.repository.AI;

import java.math.BigDecimal;

public interface StockBalanceProjection {

    Integer getFoodItemId();

    String getFoodName();

    BigDecimal getCurrentStock();
}
