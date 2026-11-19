async function request(url, options = {}) {

    const response = await fetch(
        `${process.env.REACT_APP_API_URL}${url}`,
        {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers
            }
        }
    );

    const text = await response.text();

    if (!response.ok) {
        throw new Error(text || `Request failed: ${response.status}`);
    }

    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

export const StockService = {

    getStockInItems: () => request("/food-items"),

    createStockIn: (data) =>
        request("/stock-in", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    getStockBalance: () => request("/stock-balance"),

    createStockOut: (data) =>
        request("/stock-out", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    getStockBalanceReport: () =>
        request("/reports/stock-balance"),


    getExpiryManagement: () => request("/expiry-management"),

    adjustExpiredStock: (data) =>
        request("/expired-stock-adjustment", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    getStockTransactions: () => request("/stock-transactions"),
};

