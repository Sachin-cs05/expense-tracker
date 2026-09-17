import { format, subDays } from "date-fns";
import { generateJSON, isAiAvailable } from "./geminiClient.js";
import { getCategories } from "../categoryService.js";
import { getSpaces } from "../spaceService.js";

/**
 * Parse a natural language voice transcript into one or more structured expense items.
 * Supports English, Hindi, and Hinglish.
 */
export async function parseVoiceExpenses(ownerId, transcriptText) {
  const text = (transcriptText || "").trim();
  if (!text) {
    return {
      expenses: [],
      clarificationNeeded: "I couldn't hear any speech. Please try speaking again.",
      rawText: ""
    };
  }

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const yesterdayStr = format(subDays(new Date(), 1), "yyyy-MM-dd");

  const categories = await getCategories(ownerId, "expense");
  const spaces = await getSpaces(ownerId);

  const categoryList = categories.map((c) => ({ id: c.id, name: c.name }));
  const spaceList = spaces.map((s) => ({ id: s.id, name: s.name }));

  if (isAiAvailable()) {
    try {
      const systemPrompt = `You are a financial AI assistant parsing voice transcripts into structured expense data.
The user speaks in English, Hindi, or Hinglish (Hindi written in Roman script).

Context:
- Today's Date: ${todayStr}
- Yesterday's Date: ${yesterdayStr}
- Available Categories: ${JSON.stringify(categoryList.map((c) => c.name))}
- Available Spaces: ${JSON.stringify(spaceList.map((s) => s.name))}

Instructions:
1. Extract ALL expenses mentioned in the transcript. A single voice command can contain MULTIPLE expenses (e.g. "Aaj Swiggy pe 350, Uber pe 200 aur Amazon pe 1200 rupaye kharch hue" contains 3 expenses).
2. For each expense, identify:
   - "amount": positive number (extract numbers like 450, 350, 1.5k -> 1500, etc.)
   - "category": Match best category from Available Categories list. If no exact match, assign closest standard category (Food, Travel, Shopping, Bills, Entertainment, Health).
   - "description": Merchant or item name (e.g. "Swiggy", "Uber", "Amazon bag", "Groceries", "Shirt"). Format in Title Case.
   - "date": YYYY-MM-DD format. "today" / "aaj" -> ${todayStr}, "yesterday" / "kal" -> ${yesterdayStr}. Default to ${todayStr}.
   - "spaceName": Match from Available Spaces list if mentioned, otherwise null.
3. If an important field like "amount" is completely missing or impossible to determine (e.g., "I bought a shirt yesterday"), set "clarificationNeeded" to a friendly question asking the user for the missing amount (e.g., "What was the amount spent for the shirt?").
4. If valid amount(s) are found, set "clarificationNeeded" to null.

Output JSON structure strictly:
{
  "expenses": [
    {
      "amount": number,
      "category": string,
      "description": string,
      "date": "YYYY-MM-DD",
      "spaceName": string | null
    }
  ],
  "clarificationNeeded": string | null
}`;

      const aiResponse = await generateJSON(systemPrompt, `Parse this voice transcript: "${text}"`);

      if (aiResponse && Array.isArray(aiResponse.expenses)) {
        const validatedExpenses = aiResponse.expenses
          .filter((exp) => exp && typeof exp.amount === "number" && exp.amount > 0)
          .map((exp) => {
            const matchedCategory = categories.find(
              (c) => c.name.toLowerCase() === (exp.category || "").toLowerCase()
            );
            const matchedSpace = spaces.find(
              (s) => s.name.toLowerCase() === (exp.spaceName || "").toLowerCase()
            );

            return {
              amount: Number(exp.amount),
              category: matchedCategory ? matchedCategory.name : exp.category || categories[0]?.name || "Other",
              description: (exp.description || "Voice Expense").trim(),
              date: exp.date && /^\d{4}-\d{2}-\d{2}$/.test(exp.date) ? exp.date : todayStr,
              spaceId: matchedSpace ? matchedSpace.id : null,
              paymentMethod: "Cash"
            };
          });

        if (validatedExpenses.length > 0) {
          return {
            expenses: validatedExpenses,
            clarificationNeeded: aiResponse.clarificationNeeded || null,
            rawText: text
          };
        }
      }
    } catch (err) {
      console.warn("[VoiceParser AI Warning]", err.message);
    }
  }

  // Heuristic / Regex Fallback if AI is unavailable or fails
  return parseVoiceHeuristic(text, categories, spaces, todayStr, yesterdayStr);
}

function parseVoiceHeuristic(text, categories, spaces, todayStr, yesterdayStr) {
  const lower = text.toLowerCase();

  // Find all numbers in text
  const numberMatches = [...lower.matchAll(/(\d+(?:\.\d+)?)/g)];
  if (numberMatches.length === 0) {
    return {
      expenses: [],
      clarificationNeeded: "I couldn't detect an amount in your voice command. How much did you spend?",
      rawText: text
    };
  }

  const amount = parseFloat(numberMatches[0][1]);

  // Keyword category matching
  let categoryName = categories[0]?.name || "Food";
  if (/swiggy|zomato|food|dinner|lunch|groceries|grocery|restaurant|snack|chai|coffee|pizza|burger/i.test(lower)) {
    categoryName = categories.find((c) => /food/i.test(c.name))?.name || "Food";
  } else if (/uber|ola|cab|taxi|metro|petrol|diesel|fuel|travel|flight|rapido/i.test(lower)) {
    categoryName = categories.find((c) => /travel|transport/i.test(c.name))?.name || "Travel";
  } else if (/amazon|flipkart|shopping|clothes|shirt|shoes|myntra|mall/i.test(lower)) {
    categoryName = categories.find((c) => /shopping/i.test(c.name))?.name || "Shopping";
  } else if (/bill|rent|recharge|wifi|electricity|water|jio|airtel/i.test(lower)) {
    categoryName = categories.find((c) => /bills/i.test(c.name))?.name || "Bills";
  }

  // Date matching
  let expDate = todayStr;
  if (/yesterday|kal/i.test(lower)) {
    expDate = yesterdayStr;
  }

  // Description extraction
  let description = text.replace(/(\d+(?:\.\d+)?)/g, "").replace(/rupees|rs|rupaye|kharch|spent|for|on|in|aaj|kal|today|yesterday/gi, "").trim();
  if (!description || description.length < 2) {
    description = categoryName + " Expense";
  }
  description = description.charAt(0).toUpperCase() + description.slice(1);

  return {
    expenses: [
      {
        amount,
        category: categoryName,
        description,
        date: expDate,
        spaceId: null,
        paymentMethod: "Cash"
      }
    ],
    clarificationNeeded: null,
    rawText: text
  };
}
