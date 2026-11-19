package com.example.FoodStockManagement.service.AI;

import com.example.FoodStockManagement.dto.AI.AIBusinessAssistantRequest;
import com.example.FoodStockManagement.dto.AI.AIBusinessAssistantResponse;
import com.example.FoodStockManagement.dto.AI.AIStockPredictionDTO;
import com.example.FoodStockManagement.model.Food.FoodItem;
import com.example.FoodStockManagement.model.Food.FoodPrice;
import com.example.FoodStockManagement.repository.Food.FoodItemRepository;
import com.example.FoodStockManagement.repository.Food.FoodPriceRepository;
import com.example.FoodStockManagement.dto.AI.AISalesForecastDTO;
import com.example.FoodStockManagement.dto.AI.AIExpiryRiskDTO;
import com.example.FoodStockManagement.dto.AI.AIProductionPlanningDTO;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.function.Function;

@Service
public class AIBusinessAssistantService {

    private final AIStockPredictionService stockPredictionService;
    private final AISalesForecastService salesForecastService;
    private final AIExpiryRiskService expiryRiskService;
    private final AIProductionPlanningService productionPlanningService;
    private final OllamaService ollamaService;
    private final FoodItemRepository foodItemRepository;
    private final FoodPriceRepository foodPriceRepository;

    public AIBusinessAssistantService(
            AIStockPredictionService stockPredictionService,
            AISalesForecastService salesForecastService,
            AIExpiryRiskService expiryRiskService,
            AIProductionPlanningService productionPlanningService,
            OllamaService ollamaService,
            FoodItemRepository foodItemRepository,
            FoodPriceRepository foodPriceRepository) {

        this.stockPredictionService = stockPredictionService;
        this.salesForecastService = salesForecastService;
        this.expiryRiskService = expiryRiskService;
        this.productionPlanningService = productionPlanningService;
        this.ollamaService = ollamaService;
        this.foodItemRepository = foodItemRepository;
        this.foodPriceRepository = foodPriceRepository;

    }

    @Transactional(readOnly = true)
    public AIBusinessAssistantResponse askQuestion(
            AIBusinessAssistantRequest request) {

        if (request == null ||
                request.message() == null ||
                request.message().isBlank()) {

            return createResponse(
                    "",
                    "Please enter a question about your food stock business.",
                    "GENERAL");
        }

        String question = request.message().trim();

        String message = question.toLowerCase(Locale.ROOT);

        boolean malay = isMalayQuestion(message);

        // Detect the category of the current question.
        String category = detectCategory(message);

        // If this is a follow-up question, use the previous topic.
        if ("GENERAL".equals(category) &&
                isFollowUpQuestion(message)) {

            category = getPreviousCategory(request.history());
        }
        // Unknown product handling
        FoodItem mentionedProduct = findMentionedFoodItem(question);

        if (looksLikeSpecificProductQuestion(question)
                && mentionedProduct == null
                && !isGeneralProductQuestion(question)) {

            return createResponse(
                    question,
                    getUnknownProductResponse(malay),
                    category);
        }
        // Get fresh business information from Java services.
        String answer;

        switch (category) {

            case "STOCK" ->
                answer = analyseStock(malay, question);

            case "EXPIRY" ->
                answer = analyseExpiry(malay, question);

            case "SALES" ->
                answer = analyseSales(malay, question);

            case "PRODUCTION" ->
                answer = analyseProduction(malay, question);

            case "PRICE" ->
                answer = analysePrice(malay, question);
                
            case "PRODUCT_LIST" ->
                answer = analyseProductList(malay, question);

            default -> {
                category = "GENERAL";
                answer = getGeneralHelp(malay);
            }
        }

        // Let Ollama explain the current Java analysis naturally.
        String finalAnswer = answer;

        try {

            String aiAnswer = ollamaService.generateAnswer(
                    question,
                    answer,
                    request.history());

            if (aiAnswer != null && !aiAnswer.isBlank()) {
                finalAnswer = aiAnswer;
            }

        } catch (Exception e) {

            // Keep Java analysis if Ollama is unavailable.
            System.err.println(
                    "Ollama connection failed: " + e.getMessage());
        }

        return createResponse(
                question,
                finalAnswer,
                category);
    }

    private String detectCategory(String message) {

        // EXPIRY
        if (containsAny(message,
                "expir", "expired", "expiry", "expire",
                "expires", "batch expires", "expires first",
                "luput", "tamat tempoh", "tarikh luput",
                "hampir luput", "dah luput")) {

            return "EXPIRY";
        }

        // PRODUCTION
        if (containsAny(message,
                "production", "produce", "producing",
                "prepare", "preparing",
                "what should i make",
                "what should i produce",
                "what should i prepare",
                "how many should i produce",
                "this week", "this weekend", "next week",
                "preorder", "pre-order",
                "sediakan", "penyediaan", "buat", "masak",
                "tempahan", "pra-tempah",
                "minggu ini", "minggu depan",
                "hujung minggu", "perlu buat",
                "perlu sediakan", "nak buat")) {

            return "PRODUCTION";
        }

        // SALES
        if (containsAny(message,
                "sales", "selling", "sell", "sold",
                "trend", "popular", "demand", "forecast",
                "how are", "best selling",
                "jualan", "terjual", "laris",
                "paling laku", "jualan meningkat",
                "ramalan jualan", "permintaan",
                "prestasi jualan")) {

            return "SALES";
        }

        // STOCK
        if (containsAny(message,
                "stock",
                "inventory",
                "quantity",
                "available",
                "low stock",
                "remaining",
                "how many stock",
                "how much stock",
                "do i have",
                "left",
                "in stock",
                "stok",
                "baki",
                "tinggal",
                "rendah",
                "kurang",
                "habis",
                "inventori",
                "kuantiti",
                "stok semasa",
                "stok rendah")) {

            return "STOCK";
        }

        // Product list
        if (containsAny(message,
                "what products",
                "which products",
                "list products",
                "list all products",
                "show products",
                "show all products",
                "available products",
                "all products",
                "products do i have",
                "what food items",
                "listkan produk",
                "senaraikan produk",
                "senarai produk",
                "produk apa yang ada",
                "produk apa saya ada",
                "produk yang ada",
                "produk apa yang dijual",
                "semua produk",
                "senarai makanan")) {

            return "PRICE_LIST";
        }

        if (containsAny(message,
                "selling price",
                "sell price",
                "product price",
                "price of",
                "price for",
                "what is the price",
                "what's the price",
                "how much is",
                "how much does",
                "how much for",
                "harga jual",
                "harga produk",
                "berapa harga")) {

            return "PRICE";
        }
        return "GENERAL";
    }

    private boolean isFollowUpQuestion(String message) {

        return containsAny(message,

                // English
                "what should i do",
                "what can i do",
                "what do i recommend",
                "what do you recommend",
                "what about it",
                "what about this",
                "what about that",
                "how about it",
                "how about this",
                "how about that",
                "tell me more",
                "explain more",
                "explain this",
                "explain that",
                "why",
                "how so",
                "and then",
                "is that enough",
                "can you explain",
                "what next",
                "what should i prepare",
                "which one",
                "which product",
                "how much",
                "how many",
                "price",

                // Malay
                "apa perlu saya buat",
                "apa yang perlu saya buat",
                "apa patut saya buat",
                "apa cadangan",
                "apa yang dicadangkan",
                "bagaimana pula",
                "macam mana pula",
                "macam mana dengan",
                "bagaimana dengan",
                "kenapa",
                "boleh terangkan",
                "terangkan lagi",
                "jelaskan lagi",
                "apa seterusnya",
                "cukup tak",
                "cukup ke",
                "yang mana",
                "produk mana",
                "berapa banyak",
                "berapa",
                "what about ",
                "how about ",
                "and carrot cake",
                "and lasagna",
                "and popia",
                "what about carrot cake",
                "what about lasagna",
                "what about popia",
                "bagaimana dengan carrot cake",
                "bagaimana dengan lasagna",
                "bagaimana dengan popia",
                "harga");
    }

    private String getPreviousCategory(
            List<AIBusinessAssistantRequest.ChatMessage> history) {

        if (history == null || history.isEmpty()) {
            return "GENERAL";
        }

        // Search previous user questions, starting from the newest.
        for (int i = history.size() - 1; i >= 0; i--) {

            AIBusinessAssistantRequest.ChatMessage item = history.get(i);

            if (item == null ||
                    item.role() == null ||
                    item.content() == null) {
                continue;
            }

            if (!"user".equalsIgnoreCase(item.role())) {
                continue;
            }

            String previousMessage = item.content().toLowerCase(Locale.ROOT);

            String previousCategory = detectCategory(previousMessage);

            if (!"GENERAL".equals(previousCategory)) {
                return previousCategory;
            }
        }

        return "GENERAL";
    }

    /**
     * Detects whether the user is asking in Malay.
     * This is a simple keyword-based language detection method.
     */
    private boolean isMalayQuestion(String message) {

        return containsAny(message,
                "apa", "berapa", "mana", "bagaimana",
                "kenapa", "adakah", "saya", "produk",
                "stok", "jualan", "luput", "tempahan",
                "sediakan", "minggu ini", "minggu depan",
                "hujung minggu", "bisnes", "perniagaan",
                "baki", "terjual", "laris", "perlu",
                "hampir habis", "tamat tempoh", "harga");
    }

    private String analyseStock(boolean malay, String question) {

        List<AIStockPredictionDTO> predictions = stockPredictionService.getStockPredictions();

        if (predictions.isEmpty()) {
            return malay
                    ? "Tiada data ramalan stok tersedia buat masa ini."
                    : "There is no stock prediction data available.";
        }

        boolean productSpecific = findMentionedFoodItem(question) != null;

        predictions = filterByProduct(
                question,
                predictions,
                AIStockPredictionDTO::getFoodName);
        if (predictions.isEmpty() && productSpecific) {
            return malay
                    ? "Produk tersebut wujud tetapi tiada data ramalan stok tersedia buat masa ini."
                    : "This product exists, but no stock prediction data is available at the moment.";
        }
        StringBuilder result = new StringBuilder();

        result.append(malay
                ? "Analisis Stok\n\n"
                : "Stock Analysis\n\n");

        boolean found = false;

        for (AIStockPredictionDTO item : predictions) {

            if (productSpecific
                    || "LOW".equals(item.getStockStatus())
                    || "INSUFFICIENT_DATA".equals(item.getStockStatus())) {

                found = true;

                result.append("- ")
                        .append(item.getFoodName())
                        .append("\n")
                        .append(malay ? "Stok semasa: " : "Current stock: ")
                        .append(item.getCurrentStock())
                        .append("\n")
                        .append(malay ? "Status: " : "Status: ")
                        .append(getLocalizedStatus(
                                item.getStockStatus(), malay))
                        .append("\n")
                        .append(malay ? "Cadangan: " : "Recommendation: ")
                        .append(item.getRecommendation())
                        .append("\n\n");
            }
        }

        if (!found) {
            result.append(malay
                    ? "Tiada produk yang dikenal pasti mempunyai stok rendah. "
                            + "Stok semasa mencukupi berdasarkan ramalan yang tersedia."
                    : "No low-stock products were identified. "
                            + "Current stock is sufficient based on available predictions.");
        }

        return result.toString();
    }

    private String analyseExpiry(boolean malay, String question) {

        List<AIExpiryRiskDTO> risks = expiryRiskService.getExpiryRisks();

        if (risks.isEmpty()) {
            return malay
                    ? "Tiada batch stok tersedia untuk analisis tarikh luput."
                    : "There are no stock batches available for expiry analysis.";
        }
        boolean productSpecific = findMentionedFoodItem(question) != null;

        risks = filterByProduct(
                question,
                risks,
                AIExpiryRiskDTO::getFoodName);
        if (risks.isEmpty() && productSpecific) {
            return malay
                    ? "Produk tersebut wujud tetapi tiada batch yang tersedia untuk analisis tarikh luput."
                    : "This product exists, but no batches are available for expiry analysis.";
        }
        StringBuilder result = new StringBuilder();

        result.append(malay
                ? "Analisis Risiko Tarikh Luput\n\n"
                : "Expiry Risk Analysis\n\n");

        boolean found = false;

        for (AIExpiryRiskDTO item : risks) {

            if (productSpecific || !"SAFE".equals(item.getRiskLevel())) {

                found = true;

                result.append("- ")
                        .append(item.getFoodName())
                        .append(" (")
                        .append(malay ? "Batch: " : "Batch: ")
                        .append(item.getBatchNo())
                        .append(")\n")
                        .append(malay ? "Tarikh luput: " : "Expiry date: ")
                        .append(item.getExpiryDate())
                        .append("\n")
                        .append(malay ? "Baki kuantiti: " : "Remaining quantity: ")
                        .append(item.getQuantityRemaining())
                        .append("\n")
                        .append(malay ? "Risiko: " : "Risk: ")
                        .append(getLocalizedRisk(item.getRiskLevel(), malay))
                        .append("\n")
                        .append(malay ? "Cadangan: " : "Recommendation: ")
                        .append(item.getRecommendation())
                        .append("\n\n");
            }
        }

        if (!found) {
            result.append(malay
                    ? "Tiada stok luput atau risiko tarikh luput akan datang "
                            + "dikenal pasti dalam kategori analisis semasa."
                    : "No expired or upcoming expiry risks were identified "
                            + "within the current analysis categories.");
        }

        return result.toString();
    }

    private String analyseSales(boolean malay, String question) {

        List<AISalesForecastDTO> forecasts = salesForecastService.getSalesForecasts();
        forecasts = filterByProduct(
                question,
                forecasts,
                AISalesForecastDTO::getFoodName);
        if (forecasts.isEmpty()) {
            return malay
                    ? "Data jualan lengkap masih tidak mencukupi "
                            + "untuk memaparkan ramalan jualan."
                    : "There is not enough completed sales data "
                            + "to display a sales forecast.";
        }

        StringBuilder result = new StringBuilder();

        result.append(malay
                ? "Analisis Ramalan Jualan\n\n"
                : "Sales Forecast Analysis\n\n");

        for (AISalesForecastDTO item : forecasts) {

            result.append("- ")
                    .append(item.getFoodName())
                    .append("\n");

            if ("INSUFFICIENT_DATA".equals(item.getSalesTrend())) {

                result.append(malay
                        ? "Trend jualan: Data tidak mencukupi\n"
                        : "Sales trend: Insufficient data\n");

            } else {

                result.append(malay
                        ? "Purata jualan harian: "
                        : "Average daily sales: ")
                        .append(item.getAverageDailySales())
                        .append("\n")
                        .append(malay
                                ? "Ramalan permintaan 7 hari: "
                                : "Predicted 7-day demand: ")
                        .append(item.getPredictedDemand())
                        .append("\n")
                        .append(malay
                                ? "Trend jualan: "
                                : "Sales trend: ")
                        .append(getLocalizedTrend(
                                item.getSalesTrend(), malay))
                        .append("\n");
            }

            result.append(malay ? "Cadangan: " : "Recommendation: ")
                    .append(item.getRecommendation())
                    .append("\n\n");
        }

        return result.toString();
    }

    private String analyseProduction(boolean malay, String question) {

        List<AIProductionPlanningDTO> plans = productionPlanningService.getProductionPlans();
        plans = filterByProduct(
                question,
                plans,
                AIProductionPlanningDTO::getFoodName);
        if (plans.isEmpty()) {
            return malay
                    ? "Tiada produk makanan aktif untuk perancangan pengeluaran."
                    : "There are no active food items available for production planning.";
        }

        StringBuilder result = new StringBuilder();

        result.append(malay
                ? "Analisis Perancangan Pengeluaran\n\n"
                : "Production Planning Analysis\n\n");

        for (AIProductionPlanningDTO item : plans) {

            result.append("- ")
                    .append(item.getFoodName())
                    .append("\n")
                    .append(malay
                            ? "Kuantiti tempahan disahkan: "
                            : "Confirmed preorders: ")
                    .append(item.getConfirmedPreorderQuantity())
                    .append("\n")
                    .append(malay
                            ? "Stok tersedia: "
                            : "Available stock: ")
                    .append(item.getAvailableStock())
                    .append("\n");

            if (item.getHistoryDaysAvailable() < 7) {

                result.append(malay
                        ? "Ramalan jualan: Data tidak mencukupi\n"
                        : "Sales forecast: Insufficient data\n");

                result.append(malay
                        ? "Cadangan pengeluaran: Perlu semakan manual\n"
                        : "Recommended production: Review manually\n");

            } else {

                result.append(malay
                        ? "Ramalan permintaan 7 hari: "
                        : "7-day predicted demand: ")
                        .append(item.getPredictedDemand())
                        .append("\n")
                        .append(malay
                                ? "Cadangan kuantiti pengeluaran: "
                                : "Recommended production: ")
                        .append(item.getRecommendedProduction())
                        .append("\n")
                        .append(malay
                                ? "Keutamaan: "
                                : "Priority: ")
                        .append(getLocalizedPriority(
                                item.getProductionPriority(), malay))
                        .append("\n");
            }

            result.append(malay ? "Cadangan: " : "Recommendation: ")
                    .append(item.getRecommendation())
                    .append("\n\n");
        }

        return result.toString();
    }

    private String analysePrice(boolean malay, String question) {

        FoodItem mentionedProduct = findMentionedFoodItem(question);

        // Product-specific price question
        if (mentionedProduct != null) {

            Optional<FoodPrice> price = foodPriceRepository
                    .findFirstByFoodItemFoodItemIdAndEffectiveToIsNullOrderByEffectiveFromDesc(
                            mentionedProduct.getFoodItemId());

            if (price.isEmpty()) {

                if (malay) {
                    return "Tiada harga jual semasa untuk "
                            + mentionedProduct.getFoodName()
                            + ".";
                }

                return "There is no current selling price for "
                        + mentionedProduct.getFoodName()
                        + ".";
            }

            BigDecimal sellingPrice = price.get().getSellingPrice();

            if (malay) {
                return String.format(
                        "%s mempunyai harga jual semasa RM %.2f.",
                        mentionedProduct.getFoodName(),
                        sellingPrice);
            }

            return String.format(
                    "%s has a current selling price of RM %.2f.",
                    mentionedProduct.getFoodName(),
                    sellingPrice);
        }

        // General price question
        List<FoodItem> activeFoodItems = foodItemRepository.findByIsActiveTrue();

        if (activeFoodItems.isEmpty()) {

            if (malay) {
                return "Tiada produk aktif ditemui.";
            }

            return "No active products were found.";
        }

        StringBuilder result = new StringBuilder();

        if (malay) {
            result.append("Harga jual semasa produk:\n");
        } else {
            result.append("Current product selling prices:\n");
        }

        for (FoodItem foodItem : activeFoodItems) {

            Optional<FoodPrice> price = foodPriceRepository
                    .findFirstByFoodItemFoodItemIdAndEffectiveToIsNullOrderByEffectiveFromDesc(
                            foodItem.getFoodItemId());

            if (price.isPresent()) {

                result.append("- ")
                        .append(foodItem.getFoodName())
                        .append(": RM ")
                        .append(price.get().getSellingPrice())
                        .append("\n");
            }
        }

        return result.toString().trim();
    }

    private String analyseProductList(boolean malay, String question) {

        List<FoodItem> products = foodItemRepository.findByIsActiveTrue();

        if (products.isEmpty()) {
            return malay
                    ? "Tiada produk aktif ditemui dalam sistem Food Stock."
                    : "There are no active products in your Food Stock system.";
        }

        StringBuilder result = new StringBuilder();

        result.append(malay
                ? "Senarai Produk Aktif:\n\n"
                : "Your Active Product List:\n\n");

        int count = 1;

        for (FoodItem product : products) {

            result.append(count++)
                    .append(". ")
                    .append(product.getFoodName())
                    .append("\n");
        }

        result.append("\n");

        result.append(malay
                ? "Jumlah produk aktif: "
                : "Total active products: ");

        result.append(products.size());

        return result.toString();
    }

    private String getGeneralHelp(boolean malay) {

        if (malay) {
            return """
                    Hai! Saya Pembantu Perniagaan Food Stock anda.

                    Anda boleh bertanya tentang:

                    1. Stok
                       Contoh: Produk mana mempunyai stok rendah?

                    2. Tarikh Luput
                       Contoh: Batch mana hampir luput?

                    3. Jualan
                       Contoh: Produk apa paling laku?

                    4. Pengeluaran
                       Contoh: Apa yang perlu saya sediakan minggu ini?

                    Saya menggunakan maklumat daripada sistem Food Stock
                    anda untuk memberikan pandangan perniagaan.
                    """;
        }

        return """
                Hello! I am your Food Stock Business Assistant.

                You can ask me questions about:

                1. Stock
                   Example: Which products have low stock?

                2. Expiry
                   Example: Which batches are expiring soon?

                3. Sales
                   Example: Which products have increasing sales?

                4. Production
                   Example: What should I produce this week?

                I use information from your Food Stock Management System
                to provide business insights.
                """;
    }

    private String getLocalizedStatus(String status, boolean malay) {

        if (!malay) {
            return status;
        }

        return switch (status) {
            case "LOW" -> "Stok Rendah";
            case "INSUFFICIENT_DATA" -> "Data Tidak Mencukupi";
            case "SUFFICIENT" -> "Stok Mencukupi";
            default -> status;
        };
    }

    private String getLocalizedRisk(String risk, boolean malay) {

        if (!malay) {
            return risk;
        }

        return switch (risk) {
            case "EXPIRED" -> "Telah Luput";
            case "CRITICAL" -> "Kritikal";
            case "WARNING" -> "Amaran";
            case "UPCOMING" -> "Akan Luput";
            case "SAFE" -> "Selamat";
            default -> risk;
        };
    }

    private String getLocalizedTrend(String trend, boolean malay) {

        if (!malay) {
            return trend;
        }

        return switch (trend) {
            case "INCREASING" -> "Meningkat";
            case "DECREASING" -> "Menurun";
            case "STABLE" -> "Stabil";
            case "INSUFFICIENT_DATA" -> "Data Tidak Mencukupi";
            default -> trend;
        };
    }

    private String getLocalizedPriority(String priority, boolean malay) {

        if (!malay) {
            return priority;
        }

        return switch (priority) {
            case "HIGH" -> "Tinggi";
            case "MEDIUM" -> "Sederhana";
            case "LOW" -> "Rendah";
            case "REVIEW" -> "Perlu Semakan";
            default -> priority;
        };
    }

    private boolean containsAny(
            String message,
            String... keywords) {

        for (String keyword : keywords) {
            if (message.contains(keyword)) {
                return true;
            }
        }

        return false;
    }

    private AIBusinessAssistantResponse createResponse(
            String question,
            String answer,
            String category) {

        return new AIBusinessAssistantResponse(
                question,
                answer,
                category,
                LocalDateTime.now());
    }

    private String normalizeProductText(String value) {

        if (value == null) {
            return "";
        }

        return value.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]", "");
    }

    private FoodItem findMentionedFoodItem(String question) {

        if (question == null || question.isBlank()) {
            return null;
        }

        String normalizedQuestion = normalizeProductText(question);

        List<FoodItem> activeFoodItems = foodItemRepository.findByIsActiveTrue();

        return activeFoodItems.stream()
                .filter(item -> item.getFoodName() != null)
                .filter(item -> {
                    String normalizedName = normalizeProductText(item.getFoodName());

                    return !normalizedName.isEmpty()
                            && normalizedQuestion.contains(normalizedName);
                })
                .findFirst()
                .orElse(null);
    }

    private <T> boolean hasProductMention(
            String question,
            List<T> items,
            Function<T, String> nameExtractor) {

        if (items == null || items.isEmpty()) {
            return false;
        }

        String normalizedQuestion = normalizeProductText(question);

        return items.stream().anyMatch(item -> {

            String productName = nameExtractor.apply(item);

            return productName != null &&
                    !normalizeProductText(productName).isEmpty() &&
                    normalizedQuestion.contains(
                            normalizeProductText(productName));
        });
    }

    private <T> List<T> filterByProduct(
            String question,
            List<T> items,
            Function<T, String> nameExtractor) {

        if (items == null || items.isEmpty()) {
            return items;
        }

        // Find the product using the actual FoodItem database.
        FoodItem mentionedProduct = findMentionedFoodItem(question);

        // No recognised product mentioned: show all relevant results.
        if (mentionedProduct == null) {
            return items;
        }

        String selectedProduct = normalizeProductText(
                mentionedProduct.getFoodName());

        // Return only data belonging to the selected product.
        return items.stream()
                .filter(item -> {
                    String itemName = nameExtractor.apply(item);

                    return itemName != null
                            && normalizeProductText(itemName)
                                    .equals(selectedProduct);
                })
                .toList();
    }

    private boolean containsKnownProduct(String question) {

        if (question == null || question.isBlank()) {
            return false;
        }

        return findMentionedFoodItem(question) != null;
    }

    private boolean isProductSpecificQuestion(String message) {

        return containsAny(
                message,
                "stock",
                "inventory",
                "quantity",
                "available",
                "remaining",
                "in stock",
                "expiring",
                "expiry",
                "expire",
                "sales",
                "selling",
                "sold",
                "trend",
                "demand",
                "production",
                "produce",
                "prepare",
                "preorder",
                "pre-order",
                "stok",
                "baki",
                "tinggal",
                "luput",
                "jualan",
                "terjual",
                "laris",
                "sediakan",
                "buat",
                "masak",
                "tempahan");
    }

    private boolean looksLikeSpecificProductQuestion(String question) {

        String message = question.toLowerCase(Locale.ROOT).trim();

        return containsAny(
                message,
                "how much",
                "how many",
                "do i have",
                "is there",
                "what about",
                "how about",
                "tell me about",
                "what is the stock of",
                "stock of",
                "stock for",
                "expiry of",
                "expiry for",
                "sales of",
                "sales for",
                "production for",
                "berapa",
                "berapa banyak",
                "stok",
                "baki",
                "tinggal",
                "luput",
                "jualan",
                "sediakan");
    }

    private String getUnknownProductResponse(boolean malay) {

        return malay
                ? "Saya tidak menemui produk tersebut dalam senarai Food Stock yang aktif."
                : "I could not find that product in the active Food Stock product list.";
    }

    private boolean isGeneralProductQuestion(String question) {

        String message = question.toLowerCase(Locale.ROOT).trim();

        return containsAny(
                message,
                "which products",
                "what products",
                "which product",
                "what product",
                "produk mana",
                "produk apa",
                "produk yang",
                "all products",
                "semua produk");
    }
}