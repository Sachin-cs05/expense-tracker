import { SavingsGoal } from "../models/SavingsGoal.js";

export async function listSavingsGoals(ownerId) {
  const goals = await SavingsGoal.find({ ownerId }).sort({ targetDate: 1, createdAt: -1 });
  return goals.map((goal) => goal.toJSON());
}

export async function createSavingsGoal(goal) {
  const createdGoal = await SavingsGoal.create(goal);
  return createdGoal.toJSON();
}

export async function updateSavingsGoal(ownerId, id, updates) {
  const updatedGoal = await SavingsGoal.findOneAndUpdate({ _id: id, ownerId }, updates, { new: true });
  return updatedGoal?.toJSON() || null;
}

export async function deleteSavingsGoal(ownerId, id) {
  return SavingsGoal.findOneAndDelete({ _id: id, ownerId });
}
