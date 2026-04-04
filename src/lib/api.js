let authToken = null;

function getHeaders(customHeaders = {}, hasBody = false) {
  const headers = { ...customHeaders };

  if (hasBody && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  return headers;
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: getHeaders(options.headers, Boolean(options.body))
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const error = new Error(errorPayload.message || "Request failed.");
    error.status = response.status;
    throw error;
  }

  return response.status === 204 ? null : response.json();
}

export const api = {
  setToken(token) {
    authToken = token;
  },
  clearToken() {
    authToken = null;
  },
  register: (payload) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  login: (payload) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getMe: () => request("/api/auth/me"),
  getCategories: () => request("/api/expenses/categories"),
  getExpenses: (query) => request(`/api/expenses${query ? `?${query}` : ""}`),
  getSummary: (query) => request(`/api/expenses/analytics/summary${query ? `?${query}` : ""}`),
  getCategoryData: (query) => request(`/api/expenses/analytics/category${query ? `?${query}` : ""}`),
  getMonthlyData: () => request("/api/expenses/analytics/monthly"),
  getDailyData: (query) => request(`/api/expenses/analytics/daily${query ? `?${query}` : ""}`),
  createExpense: (payload) =>
    request("/api/expenses", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  updateExpense: (id, payload) =>
    request(`/api/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    }),
  deleteExpense: (id) =>
    request(`/api/expenses/${id}`, {
      method: "DELETE"
    }),
  getBudget: (month) => request(`/api/budgets?month=${month}`),
  saveBudget: (payload) =>
    request("/api/budgets", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  async downloadReport(type, query) {
    const response = await fetch(`/api/reports/${type}${query ? `?${query}` : ""}`, {
      headers: getHeaders()
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const error = new Error(errorPayload.message || "Unable to export expenses.");
      error.status = response.status;
      throw error;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = type === "csv" ? "expenses.csv" : "expenses.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
};
