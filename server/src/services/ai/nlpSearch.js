import { generateJSON } from "./geminiClient.js";

/**
 * Convert natural language search to structured, validated query filters.
 * The LLM NEVER generates MongoDB queries directly.
 */
export async function parseNaturalLanguageSearch(userQuery, availableCategories = []) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const systemPrompt = `You are a query parser for a personal expense tracking app.
Convert the user's natural language search into a structured filter object.

Available expense categories: ${availableCategories.join(", ")}

Return a JSON object with ONLY these allowed fields (omit fields not mentioned):
{
  "category": "exact category name from the list above or null",
  "search": "text to search in transaction descriptions or null",
  "minAmount": number or null,
  "maxAmount": number or null,
  "dateFrom": "YYYY-MM-DD format or null",
  "dateTo": "YYYY-MM-DD format or null",
  "month": "YYYY-MM format or null",
  "sortBy": "amount" or "date" or null,
  "sortOrder": "asc" or "desc" or null
}

Today's date: ${today.toISOString().slice(0, 10)}
Current year: ${currentYear}
Current month: ${currentMonth}

Rules:
- "last week" means the past 7 days
- "last month" means the previous calendar month
- "this month" means the current calendar month
- "this year" means January 1st to today
- Match category names case-insensitively to the available list
- If the user mentions "biggest" or "highest", set sortBy=amount, sortOrder=desc
- For "above ₹500" set minAmount=500
- For "below ₹1000" set maxAmount=1000
- Only return fields that the user explicitly or implicitly mentioned`;

  const result = await generateJSON(systemPrompt, userQuery);

  // Validate and sanitize the response
  return sanitizeSearchFilters(result, availableCategories);
}

function sanitizeSearchFilters(filters, availableCategories) {
  const sanitized = {};

  if (filters.category && typeof filters.category === "string") {
    // Match to available categories (case-insensitive)
    const match = availableCategories.find(
      c => c.toLowerCase() === filters.category.toLowerCase()
    );
    if (match) sanitized.category = match;
  }

  if (filters.search && typeof filters.search === "string") {
    // Limit search string length and remove dangerous characters
    sanitized.search = filters.search.slice(0, 100).replace(/[{}$]/g, "");
  }

  if (typeof filters.minAmount === "number" && filters.minAmount >= 0) {
    sanitized.minAmount = filters.minAmount;
  }

  if (typeof filters.maxAmount === "number" && filters.maxAmount > 0) {
    sanitized.maxAmount = filters.maxAmount;
  }

  if (filters.dateFrom && /^\d{4}-\d{2}-\d{2}$/.test(filters.dateFrom)) {
    sanitized.startDate = filters.dateFrom;
  }

  if (filters.dateTo && /^\d{4}-\d{2}-\d{2}$/.test(filters.dateTo)) {
    sanitized.endDate = filters.dateTo;
  }

  if (filters.month && /^\d{4}-\d{2}$/.test(filters.month)) {
    sanitized.month = filters.month;
  }

  return {
    filters: sanitized,
    parsed: true,
    originalQuery: undefined // Don't send back the original to the frontend
  };
}
