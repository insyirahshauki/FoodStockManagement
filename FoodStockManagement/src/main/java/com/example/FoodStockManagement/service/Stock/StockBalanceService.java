
package com.example.FoodStockManagement.service.Stock;

import com.example.FoodStockManagement.dto.Stock.StockBalanceResponse;
import com.example.FoodStockManagement.model.Food.FoodItem;
import com.example.FoodStockManagement.model.Stock.StockBatch;
import com.example.FoodStockManagement.repository.Food.FoodItemRepository;
import com.example.FoodStockManagement.repository.Stock.StockBatchRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StockBalanceService {

    private final FoodItemRepository foodItemRepository;
    private final StockBatchRepository stockBatchRepository;

    public StockBalanceService(
            FoodItemRepository foodItemRepository,
            StockBatchRepository stockBatchRepository) {
        this.foodItemRepository = foodItemRepository;
        this.stockBatchRepository = stockBatchRepository;
    }

    public List<StockBalanceResponse> getStockBalance() {

        List<FoodItem> foodItems =
                foodItemRepository.findByIsActiveTrue();

        List<StockBatch> batches =
                stockBatchRepository
                    .findByQuantityRemainingGreaterThanOrderByExpiryDateAscReceivedDateAsc(0);

        Map<Integer, List<StockBatch>> batchesByFoodItem =
                batches.stream().collect(Collectors.groupingBy(
                    batch -> batch.getFoodItem().getFoodItemId()
                ));

        List<StockBalanceResponse> result = new ArrayList<>();

        for (FoodItem item : foodItems) {

            List<StockBatch> itemBatches =
                    batchesByFoodItem.getOrDefault(
                        item.getFoodItemId(),
                        new ArrayList<>()
                    );

            int totalQuantity = itemBatches.stream()
                    .mapToInt(StockBatch::getQuantityRemaining)
                    .sum();

            String stockStatus;

            if (totalQuantity == 0) {
                stockStatus = "OUT_OF_STOCK";
            } else if (totalQuantity <= item.getMinimumStock()) {
                stockStatus = "LOW_STOCK";
            } else {
                stockStatus = "IN_STOCK";
            }

            List<StockBalanceResponse.BatchBalanceResponse> batchResponses =
                    itemBatches.stream()
                        .map(batch ->
                            new StockBalanceResponse.BatchBalanceResponse(
                                batch.getStockBatchId(),
                                batch.getBatchNo(),
                                batch.getReceivedDate(),
                                batch.getExpiryDate(),
                                batch.getQuantityRemaining()
                            )
                        )
                        .toList();

            result.add(new StockBalanceResponse(
                item.getFoodItemId(),
                item.getFoodName(),
                item.getUnit(),
                item.getMinimumStock(),
                totalQuantity,
                stockStatus,
                batchResponses
            ));
        }

        return result;
    }
}
