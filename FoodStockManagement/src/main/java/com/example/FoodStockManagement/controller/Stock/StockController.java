// package com.example.FoodStockManagement.controller.Stock;

// import com.example.FoodStockManagement.dto.StockOutRequest;
// import com.example.FoodStockManagement.service.StockService;
// import org.springframework.web.bind.annotation.RestController;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.CrossOrigin;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestBody;

// @RestController
// @RequestMapping("/api/stock")
// @CrossOrigin(origins = "*")
// public class StockController {

//     private final StockService stockService;

//     public StockController(StockService stockService) {
//         this.stockService = stockService;
//     }

//     @PostMapping("/out/fifo")
//     public String stockOutFIFO(
//             @RequestBody StockOutRequest request) {
//         return stockService.stockOutFIFO(request);
//     }
// }
