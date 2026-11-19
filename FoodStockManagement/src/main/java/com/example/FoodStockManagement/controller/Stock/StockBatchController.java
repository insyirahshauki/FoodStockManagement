// package com.example.FoodStockManagement.controller.Stock;

// import java.util.List;

// import org.springframework.web.bind.annotation.RestController;
// import org.springframework.web.bind.annotation.CrossOrigin;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RequestParam;

// import com.example.FoodStockManagement.dto.StockBatchResponse;
// import com.example.FoodStockManagement.model.Stock.StockBatch;
// import com.example.FoodStockManagement.repository.Stock.StockBatchRepository;

// @RestController
// @RequestMapping("/api/stock/batches")
// @CrossOrigin(origins = "*")
// public class StockBatchController {

//     private final StockBatchRepository stockBatchRepository;

//     public StockBatchController(
//             StockBatchRepository stockBatchRepository) {

//         this.stockBatchRepository = stockBatchRepository;
//     }

//     @GetMapping
//     public List<StockBatchResponse> getStockBatches(
//             @RequestParam(name = "foodItemId") Integer foodItemId) {

//         List<StockBatch> batches =
//                 stockBatchRepository
//                     .findByFoodItem_FoodItemIdOrderByReceivedDateAscStockBatchIdAsc(
//                         foodItemId
//                     );

//         return batches.stream()
//                 .map(StockBatchResponse::from)
//                 .toList();
//     }
// }
