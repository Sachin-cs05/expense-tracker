import { Space } from "../models/Space.js";
import { Expense } from "../models/Expense.js";
import { Income } from "../models/Income.js";

export async function listSpaces(ownerId) {
  const spaces = await Space.find({ ownerId }).sort({ createdAt: 1 });
  return spaces.map((space) => space.toJSON());
}

export async function createSpace(space) {
  const created = await Space.create(space);
  return created.toJSON();
}

export async function findSpaceById(ownerId, id) {
  return Space.findOne({ _id: id, ownerId });
}

export async function updateSpace(ownerId, id, updates) {
  const updated = await Space.findOneAndUpdate({ _id: id, ownerId }, updates, {
    new: true,
    runValidators: true
  });
  return updated ? updated.toJSON() : null;
}

export async function deleteSpace(ownerId, id) {
  await Expense.updateMany({ ownerId, spaceId: id }, { spaceId: null });
  await Income.updateMany({ ownerId, spaceId: id }, { spaceId: null });
  return Space.findOneAndDelete({ _id: id, ownerId });
}

export async function getSpaceTotals(ownerId, spaceId) {
  const [expenses, incomes] = await Promise.all([
    Expense.find({ ownerId, spaceId }).lean(),
    Income.find({ ownerId, spaceId }).lean()
  ]);

  const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  return {
    totalSpending: Number(totalSpending.toFixed(2)),
    totalIncome: Number(totalIncome.toFixed(2)),
    transactionCount: expenses.length + incomes.length
  };
}
