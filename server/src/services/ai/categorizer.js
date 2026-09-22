import { generateJSON } from "./geminiClient.js";
import { isAiAvailable } from "./geminiClient.js";
import { CategoryCorrection } from "../../models/CategoryCorrection.js";

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
 * Priority: 1) User's correction history, 2) Keyword matching, 3) AI fallback.
 */
export async function suggestCategory(description, availableCategories = [], ownerId = null) {
  const text = description.trim().toLowerCase();
  if (!text) return { category: null, confidence: 0, method: "none" };

  // Step 0: Check user's correction history (highest priority — personal learning)
  if (ownerId) {
    const correction = await findUserCorrection(ownerId, text);
    if (correction) {
      return {
        category: correction.correctedCategory,
        confidence: 92,
        method: "learned",
        message: `Based on your previous categorization of similar expenses`
      };
    }
  }

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

    // Include user's recent corrections as context for better per-user adaptation
    let correctionContext = "";
    if (ownerId) {
      const recentCorrections = await CategoryCorrection.find({ ownerId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      if (recentCorrections.length > 0) {
        correctionContext = "\n\nUser's categorization preferences (learn from these):\n" +
          recentCorrections.map(c => `"${c.description}" → ${c.correctedCategory}`).join("\n");
      }
    }

    const result = await generateJSON(
      `You categorize expense transactions. Available categories: ${categories}. Return JSON: {"category": "exact category name", "confidence": 0-100}${correctionContext}`,
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

/**
 * Record a category correction when the user overrides the suggestion.
 */
export async function recordCorrection(ownerId, description, suggestedCategory, correctedCategory) {
  if (!ownerId || !description || !correctedCategory) return;
  if (suggestedCategory === correctedCategory) return; // No correction needed

  try {
    // Upsert: if same user + description exists, update it
    await CategoryCorrection.findOneAndUpdate(
      {
        ownerId,
        descriptionLower: description.trim().toLowerCase()
      },
      {
        ownerId,
        description: description.trim(),
        descriptionLower: description.trim().toLowerCase(),
        suggestedCategory: suggestedCategory || "none",
        correctedCategory
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("[Categorizer] Failed to record correction:", error.message);
  }
}

/**
 * Find a user's previous correction for a similar description.
 * Uses substring matching for flexibility.
 */
async function findUserCorrection(ownerId, descriptionLower) {
  // Try exact match first
  const exact = await CategoryCorrection.findOne({
    ownerId,
    descriptionLower
  }).lean();

  if (exact) return exact;

  // Try partial match: find corrections where the stored description is a substring
  // of the current description, or vice versa (for merchant names like "Swiggy order #123")
  const candidates = await CategoryCorrection.find({ ownerId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  for (const candidate of candidates) {
    const storedDesc = candidate.descriptionLower;
    // Match if 60%+ of the stored description words are present
    const storedWords = storedDesc.split(/\s+/).filter(w => w.length > 2);
    if (storedWords.length === 0) continue;

    const matchCount = storedWords.filter(word => descriptionLower.includes(word)).length;
    const matchRatio = matchCount / storedWords.length;

    if (matchRatio >= 0.6) return candidate;
  }

  return null;
}
