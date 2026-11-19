package com.example.FoodStockManagement.controller.Report;

import com.example.FoodStockManagement.dto.Report.SalesReportResponse;
import com.example.FoodStockManagement.dto.Report.SalesReportSummaryResponse;
import com.example.FoodStockManagement.dto.Report.StockBalanceReportResponse;
import com.example.FoodStockManagement.dto.Report.StockExpiryReportResponse;
import com.example.FoodStockManagement.dto.Report.StockMovementReportResponse;
import com.example.FoodStockManagement.service.Report.ReportService;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/stock-balance")
    public List<StockBalanceReportResponse> getStockBalanceReport() {
        return reportService.getStockBalanceReport();
    }

    @GetMapping("/stock-movement")
    public List<StockMovementReportResponse> getStockMovementReport() {
        return reportService.getStockMovementReport();
    }

    @GetMapping("/stock-expiry")
    public List<StockExpiryReportResponse> getStockExpiryReport() {
        return reportService.getStockExpiryReport();
    }

    @GetMapping("/sales")
    public List<SalesReportResponse> getSalesReport(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String orderStatus,
            @RequestParam(required = false) String paymentStatus) {

        LocalDateTime from = null;
        LocalDateTime to = null;

        if (fromDate != null && !fromDate.isBlank()) {
            from = LocalDateTime.parse(fromDate + "T00:00:00");
        }

        if (toDate != null && !toDate.isBlank()) {
            to = LocalDateTime.parse(toDate + "T23:59:59");
        }

        return reportService.getSalesReport(
                from,
                to,
                orderStatus,
                paymentStatus);
    }
    @GetMapping("/sales/summary")
public SalesReportSummaryResponse getSalesReportSummary(
        @RequestParam(required = false) String fromDate,
        @RequestParam(required = false) String toDate,
        @RequestParam(required = false) String orderStatus,
        @RequestParam(required = false) String paymentStatus
) {

    LocalDateTime from = null;
    LocalDateTime to = null;

    if (fromDate != null && !fromDate.isBlank()) {
        from = LocalDateTime.parse(fromDate + "T00:00:00");
    }

    if (toDate != null && !toDate.isBlank()) {
        to = LocalDateTime.parse(toDate + "T23:59:59");
    }

    return reportService.getSalesReportSummary(
            from,
            to,
            orderStatus,
            paymentStatus
    );
}
}