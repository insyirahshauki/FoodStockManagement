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

export const DashboardService = {

    getDashboard: () => request("/dashboard"),
   
};

