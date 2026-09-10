import { Expense } from "../models/Expense.js";

function serializeExpense(expense) {
  return {
    id: expense._id.toString(),
    ownerId: expense.ownerId.toString(),
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    description: expense.description,
    paymentMethod: expense.paymentMethod || "Other",
    notes: expense.notes || "",
    spaceId: expense.spaceId ? expense.spaceId.toString() : null,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt
  };
}

export async function listExpenses(ownerId, filters = {}) {
  const query = { ownerId };

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.spaceId) {
    query.spaceId = filters.spaceId;
  }

  if (filters.month) {
    query.date = { ...(query.date || {}), $regex: `^${filters.month}` };
  }

  if (filters.startDate) {
    query.date = { ...(query.date || {}), $gte: filters.startDate };
  }

  if (filters.endDate) {
    query.date = { ...(query.date || {}), $lte: filters.endDate };
  }

  if (filters.search) {
    query.description = { $regex: filters.search, $options: "i" };
  }

  const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 }).lean();
  return expenses.map(serializeExpense);
}

export async function createExpense(expense) {
  const createdExpense = await Expense.create(expense);
  return createdExpense.toJSON();
}

export async function updateExpense(ownerId, id, expense) {
  const updatedExpense = await Expense.findOneAndUpdate({ _id: id, ownerId }, expense, {
    new: true,
    runValidators: true
  });

  return updatedExpense ? updatedExpense.toJSON() : null;
}

export async function deleteExpense(ownerId, id) {
  return Expense.findOneAndDelete({ _id: id, ownerId });
}

export async function findExpenseById(ownerId, id) {
  const expense = await Expense.findOne({ _id: id, ownerId });
  return expense ? expense.toJSON() : null;
}
