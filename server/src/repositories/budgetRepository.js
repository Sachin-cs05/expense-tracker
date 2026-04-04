import { Budget } from "../models/Budget.js";

export async function getBudgetByMonth(ownerId, month) {
  const budget = await Budget.findOne({ ownerId, month });
  return budget ? budget.toJSON() : null;
}

export async function upsertBudget({ ownerId, month, amount, createdAt, updatedAt }) {
  const budget = await Budget.findOneAndUpdate(
    { ownerId, month },
    {
      ownerId,
      month,
      amount,
      $setOnInsert: { createdAt },
      updatedAt
    },
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  );

  return budget.toJSON();
}
