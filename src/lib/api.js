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
    const errorMessage = errorPayload.message || `Request failed (${response.status})`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.issues = errorPayload.issues;
    throw error;
  }

  return response.status === 204 ? null : response.json();
}

function toQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, value);
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const api = {
  setToken(token) {
    authToken = token;
  },
  clearToken() {
    authToken = null;
  },

  // ---- Auth ----
  register: (payload) => request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  getMe: () => request("/api/auth/me"),
  updateProfile: (payload) => request("/api/auth/profile", { method: "PUT", body: JSON.stringify(payload) }),
  updatePreferences: (payload) => request("/api/auth/preferences", { method: "PUT", body: JSON.stringify(payload) }),
  changePassword: (payload) => request("/api/auth/change-password", { method: "POST", body: JSON.stringify(payload) }),
  deleteAccount: () => request("/api/auth/account", { method: "DELETE" }),

  // ---- Categories ----
  getCategories: (type) => request(`/api/categories${toQuery({ type })}`),
  createCategory: (payload) => request("/api/categories", { method: "POST", body: JSON.stringify(payload) }),
  deleteCategory: (id) => request(`/api/categories/${id}`, { method: "DELETE" }),
  getExpenseCategoryNames: () => request("/api/expenses/categories"),
  suggestCategory: (description) => request(`/api/expenses/suggest-category${toQuery({ description })}`),

  // ---- Expenses ----
  getExpenses: (params) => request(`/api/expenses${toQuery(params)}`),
  getSummary: (params) => request(`/api/expenses/analytics/summary${toQuery(params)}`),
  getCategoryData: (params) => request(`/api/expenses/analytics/category${toQuery(params)}`),
  getMonthlyData: () => request("/api/expenses/analytics/monthly"),
  getDailyData: (params) => request(`/api/expenses/analytics/daily${toQuery(params)}`),
  createExpense: (payload) => request("/api/expenses", { method: "POST", body: JSON.stringify(payload) }),
  updateExpense: (id, payload) => request(`/api/expenses/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteExpense: (id) => request(`/api/expenses/${id}`, { method: "DELETE" }),
  importExpenses: (rows) => request("/api/expenses/import", { method: "POST", body: JSON.stringify({ rows }) }),

  // ---- Income ----
  getIncomes: (params) => request(`/api/income${toQuery(params)}`),
  getIncomeSummary: (params) => request(`/api/income/summary${toQuery(params)}`),
  createIncome: (payload) => request("/api/income", { method: "POST", body: JSON.stringify(payload) }),
  updateIncome: (id, payload) => request(`/api/income/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteIncome: (id) => request(`/api/income/${id}`, { method: "DELETE" }),

  // ---- Budgets ----
  getBudget: (month) => request(`/api/budgets${toQuery({ month })}`),
  saveBudget: (payload) => request("/api/budgets", { method: "POST", body: JSON.stringify(payload) }),

  // ---- Savings Goals ----
  getSavingsGoals: () => request("/api/savings-goals"),
  createSavingsGoal: (payload) => request("/api/savings-goals", { method: "POST", body: JSON.stringify(payload) }),
  updateSavingsGoal: (id, payload) => request(`/api/savings-goals/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteSavingsGoal: (id) => request(`/api/savings-goals/${id}`, { method: "DELETE" }),

  // ---- Recurring payments ----
  getRecurringPayments: () => request("/api/recurring"),
  createRecurringPayment: (payload) => request("/api/recurring", { method: "POST", body: JSON.stringify(payload) }),
  updateRecurringPayment: (id, payload) => request(`/api/recurring/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  toggleRecurringPayment: (id) => request(`/api/recurring/${id}/toggle`, { method: "PATCH" }),
  deleteRecurringPayment: (id) => request(`/api/recurring/${id}`, { method: "DELETE" }),

  // ---- Spaces ----
  getSpaces: () => request("/api/spaces"),
  createSpace: (payload) => request("/api/spaces", { method: "POST", body: JSON.stringify(payload) }),
  updateSpace: (id, payload) => request(`/api/spaces/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteSpace: (id) => request(`/api/spaces/${id}`, { method: "DELETE" }),

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
  },

  // ---- AI ----
  aiStatus: () => request("/api/ai/status"),
  aiChat: (payload) => request("/api/ai/chat", { method: "POST", body: JSON.stringify(payload) }),
  aiInsights: () => request("/api/ai/insights"),
  aiPrediction: () => request("/api/ai/prediction"),
  aiAnomalies: () => request("/api/ai/anomalies"),
  aiBudget: () => request("/api/ai/budget"),
  aiHealth: () => request("/api/ai/health"),
  aiSearch: (payload) => request("/api/ai/search", { method: "POST", body: JSON.stringify(payload) }),
  aiCategorize: (description) => request("/api/ai/categorize", { method: "POST", body: JSON.stringify({ description }) }),
  parseVoiceExpense: (text) => request("/api/ai/parse-voice", { method: "POST", body: JSON.stringify({ text }) }),
  aiConversations: () => request("/api/ai/conversations"),

  async aiScanReceipt(file) {
    const formData = new FormData();
    formData.append("receipt", file);

    const response = await fetch("/api/ai/scan-receipt", {
      method: "POST",
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      body: formData
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      const error = new Error(errorPayload.message || "Receipt scanning failed.");
      error.status = response.status;
      throw error;
    }

    return response.json();
  }
};
