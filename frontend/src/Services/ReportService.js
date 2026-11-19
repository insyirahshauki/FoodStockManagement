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

export const ReportService = {
    // Sales Reports
    getSalesReport: (params = "") =>
        request(`/reports/sales${params}`),

    getSalesReportSummary: (params = "") =>
        request(`/reports/sales/summary${params}`),

    // Stock Balance Reports
    getStockBalanceReport: () =>
        request("/reports/stock-balance"),

    // Stock Expiry Reports 
    getStockExpiryReport: () =>
        request("/reports/stock-expiry"),

    // Stock Movement Reports
    getStockMovementReport: () =>
        request("/reports/stock-movement"),
};

