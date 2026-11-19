package com.example.FoodStockManagement.service.SalesOrder;

import com.example.FoodStockManagement.dto.SalesOrder.SalesOrderRequest;
import com.example.FoodStockManagement.dto.SalesOrder.SalesOrderResponse;
import com.example.FoodStockManagement.model.Food.FoodItem;
import com.example.FoodStockManagement.model.Food.FoodPrice;
import com.example.FoodStockManagement.model.SalesOrder.SalesOrder;
import com.example.FoodStockManagement.model.SalesOrder.SalesOrderDetail;
import com.example.FoodStockManagement.model.Stock.StockBatch;
import com.example.FoodStockManagement.model.Stock.StockTransaction;
import com.example.FoodStockManagement.repository.Food.FoodItemRepository;
import com.example.FoodStockManagement.repository.Food.FoodPriceRepository;
import com.example.FoodStockManagement.repository.SalesOrder.SalesOrderRepository;
import com.example.FoodStockManagement.repository.SalesOrder.SalesPaymentRepository;
import com.example.FoodStockManagement.repository.Stock.StockBatchRepository;
import com.example.FoodStockManagement.repository.Stock.StockTransactionRepository;
import com.example.FoodStockManagement.repository.SalesOrder.SalesOrderDetailRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class SalesOrderService {

    private final SalesOrderRepository salesOrderRepository;
    private final SalesOrderDetailRepository salesOrderDetailRepository;
    private final FoodItemRepository foodItemRepository;
    private final FoodPriceRepository foodPriceRepository;
    private final StockBatchRepository stockBatchRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final SalesPaymentService salesPaymentService;
    private final SalesPaymentRepository salesPaymentRepository;    

    public SalesOrderService(
            SalesOrderRepository salesOrderRepository,
            SalesOrderDetailRepository salesOrderDetailRepository,
            FoodItemRepository foodItemRepository,
            FoodPriceRepository foodPriceRepository,
            StockBatchRepository stockBatchRepository,
            StockTransactionRepository stockTransactionRepository,
            SalesPaymentService salesPaymentService,
            SalesPaymentRepository salesPaymentRepository) {

        this.salesOrderRepository = salesOrderRepository;
        this.salesOrderDetailRepository = salesOrderDetailRepository;
        this.foodItemRepository = foodItemRepository;
        this.foodPriceRepository = foodPriceRepository;
        this.stockBatchRepository = stockBatchRepository;
        this.stockTransactionRepository = stockTransactionRepository;
        this.salesPaymentService = salesPaymentService;
        this.salesPaymentRepository = salesPaymentRepository;
    }

    @Transactional
    public SalesOrderResponse createSalesOrder(SalesOrderRequest request) {

        validateRequest(request);

        LocalDateTime now = LocalDateTime.now();

        // Calculate order details using the current selling price.
        List<SalesOrderDetail> orderDetails = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        Set<Integer> foodItemIds = new HashSet<>();

        for (SalesOrderRequest.SalesOrderDetailRequest itemRequest : request.items()) {

            if (!foodItemIds.add(itemRequest.foodItemId())) {
                throw new IllegalArgumentException(
                        "Duplicate food item found: " + itemRequest.foodItemId());
            }

            FoodItem foodItem = foodItemRepository
                    .findByFoodItemIdAndIsActiveTrue(itemRequest.foodItemId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Food item not found or inactive: "
                                    + itemRequest.foodItemId()));

            FoodPrice foodPrice = foodPriceRepository
                    .findFirstByFoodItemFoodItemIdAndEffectiveToIsNullOrderByEffectiveFromDesc(
                            foodItem.getFoodItemId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Selling price not found for: " + foodItem.getFoodName()));

            BigDecimal unitPrice = foodPrice.getSellingPrice();

            BigDecimal subtotal = unitPrice.multiply(
                    BigDecimal.valueOf(itemRequest.quantity()));

            SalesOrderDetail detail = new SalesOrderDetail();
            detail.setFoodItem(foodItem);
            detail.setQuantity(itemRequest.quantity());
            detail.setUnitPrice(unitPrice);
            detail.setSubtotal(subtotal);

            orderDetails.add(detail);
            totalAmount = totalAmount.add(subtotal);
        }

        BigDecimal depositAmount = request.depositAmount() == null
                ? BigDecimal.ZERO
                : request.depositAmount();

        if (depositAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Deposit amount cannot be negative.");
        }

        if (depositAmount.compareTo(totalAmount) > 0) {
            throw new IllegalArgumentException(
                    "Deposit amount cannot exceed total amount.");
        }

        String paymentStatus;

        if (depositAmount.compareTo(BigDecimal.ZERO) == 0) {
            paymentStatus = "UNPAID";
        } else if (depositAmount.compareTo(totalAmount) == 0) {
            paymentStatus = "PAID";
        } else {
            paymentStatus = "PARTIAL";
        }

        // Create Sales Order.
        SalesOrder salesOrder = new SalesOrder();

        salesOrder.setOrderNo(generateOrderNo());
        salesOrder.setOrderType(request.orderType().toUpperCase());
        salesOrder.setCustomerName(request.customerName().trim());
        salesOrder.setCustomerPhone(request.customerPhone());
        salesOrder.setOrderDate(request.orderDate());
        salesOrder.setCollectionDate(request.collectionDate());
        salesOrder.setOrderStatus("PENDING");
        salesOrder.setPaymentStatus(paymentStatus);
        salesOrder.setDepositAmount(depositAmount);
        salesOrder.setTotalAmount(totalAmount);
        salesOrder.setNotes(request.notes());

        SalesOrder savedOrder = salesOrderRepository.saveAndFlush(salesOrder);

        // Link order details to the saved order.
        for (SalesOrderDetail detail : orderDetails) {
            detail.setSalesOrder(savedOrder);
        }

        List<SalesOrderDetail> savedDetails = salesOrderDetailRepository.saveAll(orderDetails);

        return mapToResponse(savedOrder, savedDetails);
    }

    private void validateRequest(SalesOrderRequest request) {

        if (request == null) {
            throw new IllegalArgumentException("Request is required.");
        }

        if (request.orderType() == null ||
                (!request.orderType().equalsIgnoreCase("READY_STOCK")
                        && !request.orderType().equalsIgnoreCase("PRE_ORDER"))) {
            throw new IllegalArgumentException(
                    "Order type must be READY_STOCK or PRE_ORDER.");
        }

        if (request.customerName() == null ||
                request.customerName().isBlank()) {
            throw new IllegalArgumentException(
                    "Customer name is required.");
        }

        if (request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException(
                    "At least one food item is required.");
        }

        for (SalesOrderRequest.SalesOrderDetailRequest item : request.items()) {

            if (item.foodItemId() == null || item.foodItemId() <= 0) {
                throw new IllegalArgumentException(
                        "Valid food item ID is required.");
            }

            if (item.quantity() == null || item.quantity() <= 0) {
                throw new IllegalArgumentException(
                        "Quantity must be greater than zero.");
            }
        }

        if (request.depositAmount() != null &&
                request.depositAmount().scale() > 2 &&
                request.depositAmount().stripTrailingZeros().scale() > 2) {
            throw new IllegalArgumentException(
                    "Deposit amount cannot have more than 2 decimal places.");
        }
    }

    private String generateOrderNo() {

        String datePart = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        String orderNo;

        do {
            orderNo = "SO-" + datePart + "-"
                    + UUID.randomUUID().toString()
                            .substring(0, 8).toUpperCase();
        } while (salesOrderRepository.existsByOrderNo(orderNo));

        return orderNo;
    }

    private SalesOrderResponse mapToResponse(
            SalesOrder order,
            List<SalesOrderDetail> details) {

        List<SalesOrderResponse.SalesOrderDetailResponse> itemResponses = details.stream()
                .map(detail -> new SalesOrderResponse.SalesOrderDetailResponse(
                        detail.getSalesOrderDetailId(),
                        detail.getFoodItem().getFoodItemId(),
                        detail.getFoodItem().getFoodName(),
                        detail.getQuantity(),
                        detail.getUnitPrice(),
                        detail.getSubtotal()))
                .toList();

        BigDecimal depositAmount = order.getDepositAmount() == null
                ? BigDecimal.ZERO
                : order.getDepositAmount();

        BigDecimal additionalPayments = salesPaymentRepository.sumPaymentAmountBySalesOrderId(
                order.getSalesOrderId());

        if (additionalPayments == null) {
            additionalPayments = BigDecimal.ZERO;
        }

        BigDecimal totalPaid = depositAmount.add(additionalPayments);

        BigDecimal balanceAmount = order.getTotalAmount()
                .subtract(totalPaid);

        return new SalesOrderResponse(
                order.getSalesOrderId(),
                order.getOrderNo(),
                order.getOrderType(),
                order.getCustomerName(),
                order.getCustomerPhone(),
                order.getOrderDate(),
                order.getCollectionDate(),
                order.getOrderStatus(),
                order.getPaymentStatus(),
                order.getDepositAmount(),
                order.getTotalAmount(),
                balanceAmount,
                order.getNotes(),
                order.getCreatedAt(),
                itemResponses);
    }

    @Transactional(readOnly = true)
    public List<SalesOrderResponse> getAllSalesOrders() {

        List<SalesOrder> orders = salesOrderRepository.findAllByOrderByOrderDateDesc();

        return orders.stream()
                .map(order -> {
                    List<SalesOrderDetail> details = salesOrderDetailRepository
                            .findBySalesOrderSalesOrderId(
                                    order.getSalesOrderId());

                    return mapToResponse(order, details);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public SalesOrderResponse getSalesOrderById(Integer salesOrderId) {

        SalesOrder order = salesOrderRepository.findById(salesOrderId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Sales order not found: " + salesOrderId));

        List<SalesOrderDetail> details = salesOrderDetailRepository
                .findBySalesOrderSalesOrderId(salesOrderId);

        return mapToResponse(order, details);
    }

    @Transactional
    public SalesOrderResponse updateOrderStatus(
            Integer salesOrderId,
            String newStatus) {

        SalesOrder order = salesOrderRepository.findById(salesOrderId)
                .orElseThrow(() -> new IllegalArgumentException("Sales order not found."));

        String currentStatus = order.getOrderStatus();
        String orderType = order.getOrderType();
        String targetStatus = newStatus.trim().toUpperCase();

        boolean shouldDeductStock = false;

        // READY_STOCK: deduct when PENDING -> CONFIRMED
        if ("READY_STOCK".equalsIgnoreCase(orderType)
                && "PENDING".equals(currentStatus)
                && "CONFIRMED".equals(targetStatus)) {

            shouldDeductStock = true;
        }

        // PRE_ORDER: deduct when CONFIRMED -> READY
        else if ("PRE_ORDER".equalsIgnoreCase(orderType)
                && "CONFIRMED".equals(currentStatus)
                && "READY".equals(targetStatus)) {

            shouldDeductStock = true;
        }

        // Other valid transitions without stock deduction
        else if ("PENDING".equals(currentStatus)
                && "CONFIRMED".equals(targetStatus)
                && "PRE_ORDER".equalsIgnoreCase(orderType)) {

            // Pre-order confirmation does not deduct stock.
        } else if ("CONFIRMED".equals(currentStatus)
                && "READY".equals(targetStatus)
                && "READY_STOCK".equalsIgnoreCase(orderType)) {

            // READY_STOCK stock was already deducted at confirmation.
        } else if ("READY".equals(currentStatus)
                && "COMPLETED".equals(targetStatus)) {

            // No additional stock deduction.
        } else if (("PENDING".equals(currentStatus)
                || ("CONFIRMED".equals(currentStatus)
                        && "PRE_ORDER".equalsIgnoreCase(orderType)))
                && "CANCELLED".equals(targetStatus)) {

            // Cancellation is allowed only before stock deduction.
        } else {
            throw new IllegalArgumentException(
                    "Invalid order status transition: "
                            + currentStatus + " -> " + targetStatus);
        }

        if (shouldDeductStock) {
            deductStockForSalesOrder(order);
        }

        order.setOrderStatus(targetStatus);
        SalesOrder savedOrder = salesOrderRepository.save(order);

        List<SalesOrderDetail> details = salesOrderDetailRepository.findBySalesOrderSalesOrderId(
                savedOrder.getSalesOrderId());

        return mapToResponse(savedOrder, details);
    }

    private void deductStockForSalesOrder(SalesOrder order) {

        String orderNo = order.getOrderNo();

        // Prevent duplicate deduction
        boolean alreadyDeducted = stockTransactionRepository
                .existsByReferenceNoAndTransactionType(orderNo, "OUT");

        if (alreadyDeducted) {
            throw new IllegalArgumentException(
                    "Stock has already been deducted for order " + orderNo);
        }

        List<SalesOrderDetail> details = salesOrderDetailRepository.findBySalesOrderSalesOrderId(
                order.getSalesOrderId());

        if (details == null || details.isEmpty()) {
            throw new IllegalArgumentException(
                    "Sales order has no items.");
        }

        LocalDate today = LocalDate.now();

        for (SalesOrderDetail detail : details) {

            Integer foodItemId = detail.getFoodItem().getFoodItemId();

            int requiredQuantity = detail.getQuantity();

            if (requiredQuantity <= 0) {
                throw new IllegalArgumentException(
                        "Invalid quantity for " +
                                detail.getFoodItem().getFoodName());
            }

            List<StockBatch> batches = stockBatchRepository.findAvailableBatchesForUpdate(
                    foodItemId, today);

            int availableQuantity = batches.stream()
                    .mapToInt(StockBatch::getQuantityRemaining)
                    .sum();

            if (availableQuantity < requiredQuantity) {
                throw new IllegalArgumentException(
                        "Insufficient stock for "
                                + detail.getFoodItem().getFoodName()
                                + ". Required: " + requiredQuantity
                                + ", Available: " + availableQuantity);
            }

            int remainingToDeduct = requiredQuantity;

            for (StockBatch batch : batches) {

                if (remainingToDeduct <= 0) {
                    break;
                }

                int batchAvailable = batch.getQuantityRemaining();

                int deductedQuantity = Math.min(batchAvailable, remainingToDeduct);

                batch.setQuantityRemaining(
                        batchAvailable - deductedQuantity);

                stockBatchRepository.save(batch);

                StockTransaction transaction = new StockTransaction();

                transaction.setStockBatch(batch);
                transaction.setTransactionType("OUT");
                transaction.setQuantity(deductedQuantity);
                transaction.setReferenceNo(orderNo);
                transaction.setNotes(
                        "Sales order stock deduction");

                stockTransactionRepository.save(transaction);

                remainingToDeduct -= deductedQuantity;
            }
        }
    }
}