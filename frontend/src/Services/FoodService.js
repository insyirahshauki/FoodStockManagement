
async function request(url, options = {}) {

    const isFormData = options.body instanceof FormData;

    const headers = {
        ...(isFormData ? {} : {
            "Content-Type": "application/json"
        }),
        ...options.headers
    };

    const response = await fetch(
        `${process.env.REACT_APP_API_URL}${url}`,
        {
            ...options,
            headers
        }
    );

    const text = await response.text();

    if (!response.ok) {
        let message = text || `Request failed: ${response.status}`;

        try {
            const errorData = JSON.parse(text);
            message = errorData.message || message;
        } catch {
            // Keep original error message
        }

        throw new Error(message);
    }

    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}


export const FoodService = {

    // Food Categories
    getFoodCategories: () => request("/food-categories"),
    updateFoodCategory: (id, data) =>
        request(`/food-categories/${id}`, {
            method: "PUT",
            body: JSON.stringify(data)
        }),
    createFoodCategory: (data) =>
        request("/food-categories", {
            method: "POST",
            body: JSON.stringify(data)
        }),
    deleteFoodCategory: (id) =>
        request(`/food-categories/${id}`, {
            method: "DELETE"
        }),
    // Food Items

    getFoodItems: () => request("/food-items"),

    updateFoodItem: (id, data) =>
        request(`/food-items/${id}`, {
            method: "PUT",
            body: JSON.stringify(data)
        }),

    createFoodItem: (data) =>
        request("/food-items", {
            method: "POST",
            body: JSON.stringify(data)
        }),
    deleteFoodItem: (id) =>
        request(`/food-items/${id}`, {
            method: "DELETE"
        }),


    uploadFoodItemImage: (id, file) => {

        const formData = new FormData();

        formData.append("file", file);

        return request(`/food-items/${id}/image`, {
            method: "POST",
            body: formData
        });
    },


};