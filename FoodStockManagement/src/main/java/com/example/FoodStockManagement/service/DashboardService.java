package com.example.FoodStockManagement.service;

import com.example.FoodStockManagement.dto.Dashboard.DashboardResponse;
import com.example.FoodStockManagement.model.Food.FoodItem;
import com.example.FoodStockManagement.model.Stock.StockTransaction;
import com.example.FoodStockManagement.model.Stock.StockBatch;
import com.example.FoodStockManagement.model.SalesOrder.SalesOrder;
import com.example.FoodStockManagement.model.SalesOrder.SalesOrderDetail;

import com.example.FoodStockManagement.repository.Food.FoodItemRepository;
import com.example.FoodStockManagement.repository.Stock.StockBatchRepository;
import com.example.FoodStockManagement.repository.Stock.StockTransactionRepository;
import com.example.FoodStockManagement.repository.SalesOrder.SalesOrderRepository;
import com.example.FoodStockManagement.repository.SalesOrder.SalesOrderDetailRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final FoodItemRepository foodItemRepository;
    private final StockBatchRepository stockBatchRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final SalesOrderDetailRepository salesOrderDetailRepository;

    public DashboardService(
            FoodItemRepository foodItemRepository,
            StockBatchRepository stockBatchRepository,
            StockTransactionRepository stockTransactionRepository,
            SalesOrderRepository salesOrderRepository,
            SalesOrderDetailRepository salesOrderDetailRepository) {

        this.foodItemRepository = foodItemRepository;
        this.stockBatchRepository = stockBatchRepository;
        this.stockTransactionRepository = stockTransactionRepository;
        this.salesOrderRepository = salesOrderRepository;
        this.salesOrderDetailRepository = salesOrderDetailRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {

        LocalDate today = LocalDate.now();
        LocalDateTime startToday = today.atStartOfDay();
        LocalDateTime startTomorrow = today.plusDays(1).atStartOfDay();
        LocalDateTime startMonth = today.withDayOfMonth(1).atStartOfDay();

        List<FoodItem> foodItems =
                foodItemRepository.findByIsActiveTrue();

        List<StockBatch> batches =
                stockBatchRepository.findAll();

        List<StockTransaction> transactions =
                stockTransactionRepository
                        .findTop10ByOrderByTransactionDateDesc();

        List<SalesOrder> allOrders =
                salesOrderRepository.findAll();

        List<SalesOrder> validOrders = allOrders.stream()
                .filter(this::isValidSalesOrder)
                .toList();

        List<SalesOrderDetail> orderDetails =
                salesOrderDetailRepository.findAll();

        Map<Integer, List<StockBatch>> batchesByFoodItem =
                batches.stream()
                        .filter(b -> b.getFoodItem() != null)
                        .collect(Collectors.groupingBy(
                                b -> b.getFoodItem().getFoodItemId()
                        ));

        Map<Integer, FoodItem> foodItemMap =
                foodItems.stream().collect(Collectors.toMap(
                        FoodItem::getFoodItemId,
                        Function.identity()
                ));

        // 1. Stock Summary
        long availableStock = 0;
        long lowStock = 0;
        long outOfStock = 0;

        for (FoodItem foodItem : foodItems) {

            List<StockBatch> itemBatches =
                    batchesByFoodItem.getOrDefault(
                            foodItem.getFoodItemId(),
                            Collections.emptyList()
                    );

            long remaining = itemBatches.stream()
                    .mapToLong(b -> safeQuantity(
                            b.getQuantityRemaining()))
                    .sum();

            availableStock += remaining;

            int minimumStock =
                    foodItem.getMinimumStock() == null
                            ? 0
                            : foodItem.getMinimumStock();

            if (remaining == 0) {
                outOfStock++;
            } else if (remaining <= minimumStock) {
                lowStock++;
            }
        }

        // 2. Expiry Summary
        List<StockBatch> activeProductBatches = batches.stream()
                .filter(b -> b.getFoodItem() != null)
                .filter(b -> foodItemMap.containsKey(
                        b.getFoodItem().getFoodItemId()))
                .filter(b -> safeQuantity(b.getQuantityRemaining()) > 0)
                .toList();

        List<DashboardResponse.ExpiryAlert> expiryAlerts =
                activeProductBatches.stream()
                        .filter(b -> b.getExpiryDate() != null)
                        .filter(b -> !b.getExpiryDate()
                                .isAfter(today.plusDays(7)))
                        .sorted(Comparator.comparing(
                                StockBatch::getExpiryDate))
                        .map(b -> new DashboardResponse.ExpiryAlert(
                                b.getStockBatchId(),
                                b.getBatchNo(),
                                b.getFoodItem().getFoodItemId(),
                                b.getFoodItem().getFoodName(),
                                b.getQuantityRemaining(),
                                b.getExpiryDate(),
                                getExpiryStatus(b.getExpiryDate(), today)
                        ))
                        .toList();

        long expiredBatches = activeProductBatches.stream()
                .filter(b -> b.getExpiryDate() != null)
                .filter(b -> b.getExpiryDate().isBefore(today))
                .count();

        long expiringSoonBatches = activeProductBatches.stream()
                .filter(b -> b.getExpiryDate() != null)
                .filter(b -> !b.getExpiryDate().isBefore(today))
                .filter(b -> !b.getExpiryDate()
                        .isAfter(today.plusDays(7)))
                .count();

        // 3. Sales Summary
        BigDecimal totalSales = BigDecimal.ZERO;
        BigDecimal todaySales = BigDecimal.ZERO;
        BigDecimal monthlySales = BigDecimal.ZERO;
        BigDecimal preOrderSales = BigDecimal.ZERO;
        BigDecimal readyStockSales = BigDecimal.ZERO;

        for (SalesOrder order : validOrders) {

            BigDecimal amount = safeAmount(order.getTotalAmount());

            totalSales = totalSales.add(amount);

            if (order.getOrderDate() != null) {

                LocalDateTime orderDate = order.getOrderDate();

                if (!orderDate.isBefore(startToday)
                        && orderDate.isBefore(startTomorrow)) {
                    todaySales = todaySales.add(amount);
                }

                if (!orderDate.isBefore(startMonth)
                        && orderDate.isBefore(startTomorrow)) {
                    monthlySales = monthlySales.add(amount);
                }
            }

            if ("PRE_ORDER".equalsIgnoreCase(order.getOrderType())) {
                preOrderSales = preOrderSales.add(amount);
            } else if ("READY_STOCK".equalsIgnoreCase(order.getOrderType())) {
                readyStockSales = readyStockSales.add(amount);
            }
        }

        // 4. Best Selling Products
        Set<Integer> validOrderIds = validOrders.stream()
                .map(SalesOrder::getSalesOrderId)
                .collect(Collectors.toSet());

        Map<Integer, ProductSalesAccumulator> productSales = new HashMap<>();

        for (SalesOrderDetail detail : orderDetails) {

            if (detail.getSalesOrder() == null
                    || !validOrderIds.contains(
                            detail.getSalesOrder().getSalesOrderId())) {
                continue;
            }

            if (detail.getFoodItem() == null) {
                continue;
            }

            Integer foodItemId =
                    detail.getFoodItem().getFoodItemId();

            if (!foodItemMap.containsKey(foodItemId)) {
                continue;
            }

            ProductSalesAccumulator accumulator =
                    productSales.computeIfAbsent(
                            foodItemId,
                            id -> new ProductSalesAccumulator()
                    );

            accumulator.quantity += safeQuantity(detail.getQuantity());
            accumulator.sales = accumulator.sales.add(
                    safeAmount(detail.getSubtotal())
            );
        }

        List<DashboardResponse.BestSellingProduct> bestSellingProducts =
                productSales.entrySet().stream()
                        .sorted((a, b) -> {
                            int compare = Long.compare(
                                    b.getValue().quantity,
                                    a.getValue().quantity
                            );

                            if (compare != 0) {
                                return compare;
                            }

                            return b.getValue().sales.compareTo(
                                    a.getValue().sales
                            );
                        })
                        .limit(5)
                        .map(entry -> {
                            FoodItem item = foodItemMap.get(entry.getKey());
                            ProductSalesAccumulator value = entry.getValue();

                            return new DashboardResponse.BestSellingProduct(
                                    item.getFoodItemId(),
                                    item.getFoodName(),
                                    value.quantity,
                                    value.sales
                            );
                        })
                        .toList();

        // 5. Recent Transactions
        List<DashboardResponse.RecentTransaction> recentTransactions =
                transactions.stream()
                        .filter(t -> t.getStockBatch() != null)
                        .map(t -> {
                            StockBatch batch = t.getStockBatch();

                            return new DashboardResponse.RecentTransaction(
                                    t.getStockTransactionId(),
                                    t.getTransactionType(),
                                    batch.getFoodItem().getFoodName(),
                                    batch.getBatchNo(),
                                    t.getQuantity(),
                                    t.getReferenceNo(),
                                    t.getTransactionDate()
                            );
                        })
                        .toList();

        DashboardResponse.Summary summary =
                new DashboardResponse.Summary(
                        (long) foodItems.size(),
                        availableStock,
                        lowStock,
                        outOfStock,
                        expiredBatches,
                        expiringSoonBatches
                );

        DashboardResponse.SalesSummary salesSummary =
                new DashboardResponse.SalesSummary(
                        totalSales,
                        todaySales,
                        monthlySales,
                        preOrderSales,
                        readyStockSales,
                        (long) validOrders.size()
                );

        return new DashboardResponse(
                summary,
                salesSummary,
                expiryAlerts,
                recentTransactions,
                bestSellingProducts
        );
    }

    private boolean isValidSalesOrder(SalesOrder order) {
        return order.getOrderStatus() != null
                && !"CANCELLED".equalsIgnoreCase(
                        order.getOrderStatus());
    }

    private long safeQuantity(Integer quantity) {
        return quantity == null ? 0 : quantity;
    }

    private BigDecimal safeAmount(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }

    private String getExpiryStatus(
            LocalDate expiryDate,
            LocalDate today) {

        if (expiryDate.isBefore(today)) {
            return "EXPIRED";
        }

        if (expiryDate.isEqual(today)) {
            return "EXPIRES_TODAY";
        }

        return "EXPIRING_SOON";
    }

    private static class ProductSalesAccumulator {
        private long quantity = 0;
        private BigDecimal sales = BigDecimal.ZERO;
    }
}