import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./components/dashboard/Dashboard";

import StockIn from "./Pages/Stock/StockIn";
import StockOut from "./Pages/Stock/StockOut";
import StockBalance from "./Pages/Stock/StockBalance";
import FoodCategory from "./Pages/Food/FoodCategory";
import FoodItem from "./Pages/Food/FoodItem";
import ExpiryManagement from "./Pages/Stock/ExpiryManagement";
import ExpiredStockAdjustment from "./Pages/Stock/ExpiredStockAdjustment";
import StockTransactionHistory from "./Pages/Stock/StockTransactionHistory";
import NewSales from "./Pages/Sales/NewSales";
import SalesHistory from "./Pages/Sales/SalesHistory";
import StockTransaction from "./Pages/Stock/StockTransaction";
import StockBalanceReport from "./Pages/Report/StockBalanceReport";
import StockMovementReport from "./Pages/Report/StockMovementReport";
import StockExpiryReport from "./Pages/Report/StockExpiryReport";
import SalesReport from "./Pages/Report/SalesReport";
import AIStockPrediction from "./Pages/AI/AIStockPrediction";
import AISalesForecast from "./Pages/AI/AISalesForecast";
import AIExpiryRisk from "./Pages/AI/AIExpiryRisk";
import AIProductionPlanning from "./Pages/AI/AIProductionPlanning";
import AIBusinessAssistant from "./Pages/AI/AIBusinessAssistant";
import AISmartAlerts from "./Pages/AI/AISmartAlerts";
import FoodBrochure from "./Pages/Food/FoodBrochure";
import FoodCatalog from "./Pages/Food/FoodCatalog";
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Dashboard />} />

                    <Route path="/stock-in" element={<StockIn />} />
                    <Route path="/stock-out" element={<StockOut />} />
                    <Route path="/stock-balance" element={<StockBalance />} />
                    <Route path="/categories" element={<FoodCategory />} />
                    <Route path="/food-items" element={<FoodItem />} />
                    <Route path="/expiry" element={<ExpiryManagement />} />
                    <Route path="/expired-stock-adjustment" element={<ExpiredStockAdjustment />} />
                    <Route path="/transaction-history" element={<StockTransactionHistory />} />
                    <Route path="/sales" element={<NewSales />} />
                    <Route path="/sales-history" element={<SalesHistory />} />
                    <Route path="/stock-transactions" element={<StockTransaction />} />
                    <Route path="/reports/stock-balance" element={<StockBalanceReport />} />
                    <Route path="/reports/stock-movement" element={<StockMovementReport />} />
                    <Route path="/reports/stock-expiry" element={<StockExpiryReport />} />
                    <Route path="/reports/sales" element={<SalesReport />} />
                    <Route path="/ai-stock-prediction" element={<AIStockPrediction />} />
                    <Route path="/ai-sales-forecast" element={<AISalesForecast />} />
                    <Route path="/ai-expiry-risk" element={<AIExpiryRisk />} />
                    <Route path="/ai-production-planning" element={<AIProductionPlanning />} />
                    <Route path="/ai-business-assistant" element={<AIBusinessAssistant />}/>
                    <Route path="/smart-alerts" element={<AISmartAlerts  />}/>
                    <Route path="/food-brochure" element={<FoodBrochure />}/>
                      <Route path="/food-catalog" element={<FoodCatalog />}/>
                    {/* Other pages will be added here */}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
