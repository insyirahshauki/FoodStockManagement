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

export const SalesService = {
    createSalesOrder: (data) =>
        request("/sales-orders", {
            method: "POST",
            body: JSON.stringify(data)
        }),

    getSalesOrders: () =>
        request("/sales-orders"),

    getSalesOrderById: (id) =>
        request(`/sales-orders/${id}`),

    getSalesPaymentHistory: (salesOrderId) =>
        request(`/sales-orders/${salesOrderId}/payments`),

    recordSalesPayment: (salesOrderId, paymentData) =>
        request(`/sales-orders/${salesOrderId}/payments`, {
            method: "POST",
            body: JSON.stringify(paymentData)
        }),

    updateSalesOrderStatus: (id, orderStatus) =>
        request(`/sales-orders/${id}/status`, {
            method: "PUT",
            body: JSON.stringify({ orderStatus })
        }),

};