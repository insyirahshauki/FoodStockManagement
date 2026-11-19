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

export const AIService = {

    getAIStockPredictions: () => request("/ai/stock-prediction"),
    getAISalesForecast: () => request("/ai/sales-forecast"),
    getAIExpiryRisks: () => request("/ai/expiry-risk"),
    getAIProductionPlanning: () => request("/ai/production-planning"),
    askAIBusinessAssistant: (message, history) =>
        request("/ai/business-assistant", {
            method: "POST",
            body: JSON.stringify({ message, history })
        }),
    getSmartAlerts : () => request("/ai/smart-alerts"),
};

