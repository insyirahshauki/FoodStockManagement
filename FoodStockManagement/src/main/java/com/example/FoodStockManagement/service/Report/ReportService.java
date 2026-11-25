package com.example.FoodStockManagement.service.Report;

import com.example.FoodStockManagement.dto.Report.SalesReportResponse;
import com.example.FoodStockManagement.dto.Report.SalesReportSummaryResponse;
import com.example.FoodStockManagement.dto.Report.StockBalanceReportResponse;
import com.example.FoodStockManagement.dto.Report.StockExpiryReportResponse;
import com.example.FoodStockManagement.dto.Report.StockMovementReportResponse;
import com.example.FoodStockManagement.repository.Report.ReportRepository;
import com.example.FoodStockManagement.repository.SalesOrder.SalesOrderRepository;
import com.example.FoodStockManagement.repository.SalesOrder.SalesPaymentRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final SalesPaymentRepository salesPaymentRepository;
    private final SalesOrderRepository salesOrderRepository;

    public ReportService(ReportRepository reportRepository, SalesPaymentRepository salesPaymentRepository,
            SalesOrderRepository salesOrderRepository) {
        this.reportRepository = reportRepository;
        this.salesPaymentRepository = salesPaymentRepository;
        this.salesOrderRepository = salesOrderRepository;
    }

    @Transactional(readOnly = true)
    public List<StockBalanceReportResponse> getStockBalanceReport() {

        return reportRepository.getStockBalanceReport()
                .stream()
                .map(row -> {

                    Integer currentStock = ((Number) row[3]).intValue();

                    Integer minimumStock = ((Number) row[4]).intValue();

                    String status;

                    if (currentStock <= 0) {
                        status = "OUT OF STOCK";
                    } else if (currentStock <= minimumStock) {
                        status = "LOW STOCK";
                    } else {
                        status = "NORMAL";
                    }

                    return new StockBalanceReportResponse(
                            ((Number) row[0]).intValue(),
                            (String) row[1],
                            (String) row[2],
                            currentStock,
                            minimumStock,
                            status);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StockMovementReportResponse> getStockMovementReport() {

        return reportRepository.getStockMovementReport()
                .stream()
                .map(row -> new StockMovementReportResponse(
                        ((Number) row[0]).intValue(),
                        (LocalDateTime) row[1],
                        (String) row[2],
                        //(String) row[3],
                        (String) row[3],
                        (String) row[4],
                        (String) row[5],
                        ((Number) row[6]).intValue(),
                        (String) row[7],
                        (String) row[8]))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StockExpiryReportResponse> getStockExpiryReport() {

        LocalDate today = LocalDate.now();

        return reportRepository.getStockExpiryReport()
                .stream()
                .map(row -> {

                    LocalDate expiryDate = (LocalDate) row[6];

                    long daysRemaining = ChronoUnit.DAYS.between(today, expiryDate);

                    String expiryStatus;

                    if (daysRemaining < 0) {
                        expiryStatus = "EXPIRED";
                    } else if (daysRemaining <= 7) {
                        expiryStatus = "EXPIRING SOON";
                    } else if (daysRemaining <= 30) {
                        expiryStatus = "EXPIRING";
                    } else {
                        expiryStatus = "SAFE";
                    }

                    return new StockExpiryReportResponse(
                            ((Number) row[0]).intValue(),
                            ((Number) row[1]).intValue(),
                            (String) row[2],
                           // (String) row[3],
                            (String) row[3],
                            (String) row[4],
                            expiryDate,
                            ((Number) row[6]).intValue(),
                            expiryStatus,
                            daysRemaining);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SalesReportResponse> getSalesReport(
            LocalDateTime fromDate,
            LocalDateTime toDate,
            String orderStatus,
            String paymentStatus) {

        return reportRepository.getSalesReport(
                fromDate,
                toDate,
                orderStatus,
                paymentStatus)
                .stream()
                .map(row -> new SalesReportResponse(
                        ((Number) row[0]).intValue(),
                        (String) row[1],
                        (String) row[2],
                        (String) row[3],
                        (LocalDateTime) row[4],
                        (LocalDateTime) row[5],
                        (String) row[6],
                        (String) row[7],
                        row[8] == null
                                ? BigDecimal.ZERO
                                : (BigDecimal) row[8]))
                .toList();
    }

    @Transactional(readOnly = true)
    public SalesReportSummaryResponse getSalesReportSummary(
            LocalDateTime fromDate,
            LocalDateTime toDate,
            String orderStatus,
            String paymentStatus) {

        List<SalesReportResponse> sales = getSalesReport(
                fromDate,
                toDate,
                orderStatus,
                paymentStatus);

        int totalOrders = sales.size();

        int completedOrders = (int) sales.stream()
                .filter(x -> "COMPLETED".equals(x.orderStatus()))
                .count();

        // Exclude cancelled orders from financial calculations
        List<SalesReportResponse> validSales = sales.stream()
                .filter(x -> !"CANCELLED".equals(x.orderStatus()))
                .toList();

        BigDecimal totalSales = BigDecimal.ZERO;
        BigDecimal totalPaid = BigDecimal.ZERO;

        for (SalesReportResponse order : validSales) {

            BigDecimal orderTotal = order.totalAmount() == null
                    ? BigDecimal.ZERO
                    : order.totalAmount();

            BigDecimal deposit = salesOrderRepository.getDepositAmountById(
                    order.salesOrderId());

            if (deposit == null) {
                deposit = BigDecimal.ZERO;
            }

            BigDecimal additionalPayments = salesPaymentRepository.sumPaymentAmountBySalesOrderId(
                    order.salesOrderId());

            if (additionalPayments == null) {
                additionalPayments = BigDecimal.ZERO;
            }

            totalSales = totalSales.add(orderTotal);

            totalPaid = totalPaid
                    .add(deposit)
                    .add(additionalPayments);
        }

        BigDecimal totalOutstanding = totalSales.subtract(totalPaid);

        return new SalesReportSummaryResponse(
                totalOrders,
                completedOrders,
                totalSales,
                totalPaid,
                totalOutstanding);
    }

 

}