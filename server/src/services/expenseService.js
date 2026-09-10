import { format } from "date-fns";
import {
  createExpense,
  deleteExpense,
  findExpenseById,
  listExpenses,
  updateExpense
} from "../repositories/expenseRepository.js";
import { expenseSchema } from "../validation.js";

const categoryKeywords = {
  Food: ["restaurant", "cafe", "coffee", "swiggy", "zomato", "grocery", "groceries", "food", "dinner", "lunch", "breakfast"],
  Travel: ["uber", "ola", "taxi", "cab", "metro", "train", "flight", "fuel", "petrol", "diesel", "parking"],
  Shopping: ["amazon", "flipkart", "mall", "clothes", "clothing", "shoes", "shopping"],
  Bills: ["rent", "electricity", "water", "internet", "wifi", "mobile", "recharge", "insurance", "emi", "bill"],
  Entertainment: ["netflix", "spotify", "movie", "cinema", "game", "concert", "hotstar", "prime video"]
};

export async function getExpenses(ownerId, filters) {
  return listExpenses(ownerId, filters);
}

export function suggestExpenseCategory(description) {
  const text = description.trim().toLowerCase();
  if (!text) return null;

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return category;
    }
  }

  return null;
}

export async function addExpense(ownerId, payload) {
  const validated = expenseSchema.parse(payload);
  const timestamp = new Date().toISOString();

  return createExpense({
    ownerId,
    ...validated,
    date: format(new Date(validated.date), "yyyy-MM-dd"),
    createdAt: timestamp,
    updatedAt: timestamp
  });
}

export async function editExpense(ownerId, id, payload) {
  if (!(await findExpenseById(ownerId, id))) {
    return null;
  }

  const validated = expenseSchema.parse(payload);

  return updateExpense(ownerId, id, {
    ...validated,
    date: format(new Date(validated.date), "yyyy-MM-dd"),
    updatedAt: new Date().toISOString()
  });
}

export async function removeExpense(ownerId, id) {
  if (!(await findExpenseById(ownerId, id))) {
    return false;
  }

  await deleteExpense(ownerId, id);
  return true;
}

export async function importExpenses(ownerId, rows) {
  const results = { inserted: 0, failed: 0, errors: [] };

  for (let index = 0; index < rows.length; index += 1) {
    try {
      await addExpense(ownerId, rows[index]);
      results.inserted += 1;
    } catch (error) {
      results.failed += 1;
      results.errors.push({
        row: index + 1,
        message: error.issues ? error.issues.map((issue) => issue.message).join(", ") : error.message
      });
    }
  }

  return results;
}
