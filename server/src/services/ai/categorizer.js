import { generateJSON } from "./geminiClient.js";
import { isAiAvailable } from "./geminiClient.js";

// Existing keyword map (same as expenseService.js but extended)
const categoryKeywords = {
  Food: ["restaurant", "cafe", "coffee", "swiggy", "zomato", "grocery", "groceries", "food", "dinner", "lunch", "breakfast", "snack", "biryani", "pizza", "burger", "dominos", "mcdonalds", "kfc", "starbucks", "tea", "bakery", "reliance fresh", "dmart", "bigbasket", "blinkit", "zepto", "instamart"],
  Travel: ["uber", "ola", "taxi", "cab", "metro", "train", "flight", "fuel", "petrol", "diesel", "parking", "toll", "bus", "rapido", "irctc", "makemytrip", "goibibo", "cleartrip"],
  Shopping: ["amazon", "flipkart", "mall", "clothes", "clothing", "shoes", "shopping", "myntra", "ajio", "nykaa", "meesho", "snapdeal", "electronics"],
  Bills: ["rent", "electricity", "water", "internet", "wifi", "mobile", "recharge", "insurance", "emi", "bill", "jio", "airtel", "vodafone", "vi", "bsnl", "maintenance", "gas"],
  Entertainment: ["netflix", "spotify", "movie", "cinema", "game", "concert", "hotstar", "prime video", "youtube", "disney", "gym", "fitness", "subscription"]
};

/**
 * Suggest a category for a transaction description.
 * Uses keyword matching first, falls back to AI if configured.
 */
export async function suggestCategory(description, availableCategories = []) {
  const text = description.trim().toLowerCase();
  if (!text) return { category: null, confidence: 0, method: "none" };

  // Step 1: Keyword matching (fast, free, deterministic)
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return {
        category,
        confidence: 85,
        method: "keyword",
        message: `Matched by keyword in "${category}"`
      };
    }
  }

  // Step 2: AI fallback (only if API key is configured)
  if (!isAiAvailable()) {
    return { category: null, confidence: 0, method: "none", message: "No match found" };
  }

  try {
    const categories = availableCategories.length > 0
      ? availableCategories.join(", ")
      : Object.keys(categoryKeywords).join(", ");

    const result = await generateJSON(
      `You categorize expense transactions. Available categories: ${categories}. Return JSON: {"category": "exact category name", "confidence": 0-100}`,
      `Categorize this expense: "${description}"`
    );

    if (result?.category && typeof result.confidence === "number") {
      // Validate against available categories
      const match = availableCategories.find(
        c => c.toLowerCase() === result.category.toLowerCase()
      ) || Object.keys(categoryKeywords).find(
        c => c.toLowerCase() === result.category.toLowerCase()
      );

      return {
        category: match || result.category,
        confidence: Math.min(100, Math.max(0, result.confidence)),
        method: "ai",
        message: "AI-suggested category"
      };
    }
  } catch {
    // AI failed, return no suggestion
  }

  return { category: null, confidence: 0, method: "none", message: "Unable to determine category" };
}
